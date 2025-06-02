/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import WebComponent from "./web-component.js";

export default class RootLayout extends WebComponent {

	static get templateName() {
		return "root-layout";
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		// console.log("RootLayout.connectedCallback");
		addEventListener("popstate", this.handlePopState);
		this.addEventListener("click", this.handleClick);
		dispatchEvent(new CustomEvent("popstate"));
	}

	disconnectedCallback() {
		// console.log("RootLayout.disconnectedCallback");
		removeEventListener("popstate", this.handlePopState);
		this.removeEventListener("click", this.handleClick);
	}

	handleClick = event => {
		// console.log("RootLayout.handleClick", event);
		const a = event.composedPath().find(x => x.tagName?.toLowerCase() === "a");
		if (!a?.href)
			return;
		event.preventDefault();
		const u = new URL(a.href);
		history.pushState(undefined, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopState = event => {
		// console.log("RootLayout.handlePopState", event);
		if (event instanceof PopStateEvent) {
			this.state = event.state;
			for (const [k, v] of Object.entries(event.state))
				if (k.includes("-")) {
					const el = this.querySelector(k);
					if (el) {
						el.state = v;
						el.requestDisplay();
					}
				}
		}
		this.requestDisplay();
	}

	async updateDisplay() {
		// console.log("RootLayout.updateDisplay");
		const p = location.pathname;
		if (p === "/") {
			const j = await (await fetch("/api/authentication")).json();
			if (j) {
				history.pushState({}, "", "/dashboard");
				dispatchEvent(new CustomEvent("popstate"));
				return;
			}
		}
		const df = this.interpolateDom({
			$template: "",
			welcomePage: {
				$template: "welcome-page",
				slot: p === "/" ? "content" : null
			},
			loginPage: {
				$template: "login-page",
				slot: p === "/login" ? "content" : null
			},
			dashboardLayout: (() => {
				const a = p === "/dashboard" || p.startsWith("/dashboard/");
				return {
					$template: "dashboard-layout",
					slot: a ? "content" : null,
					uri: a ? p + location.search : null
				};
			})()
		});
		this.shadowRoot.append(...df.querySelectorAll("slot"));
		this.appendChild(df);
	}
}
