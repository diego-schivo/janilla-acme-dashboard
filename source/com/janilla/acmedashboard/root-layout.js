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
import { FlexibleElement } from "./flexible-element.js";

export default class RootLayout extends FlexibleElement {

	static get templateName() {
		return "root-layout";
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	get state() {
		return this.janillas.state;
	}

	set state(x) {
		this.janillas.state = x;
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
		this.state = {};
		history.pushState(this.state, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopState = event => {
		// console.log("RootLayout.handlePopState", event);
		this.state = event.state ?? {};
		this.requestUpdate();
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
		this.shadowRoot.appendChild(this.interpolateDom({ $template: "shadow" }));
		this.appendChild(this.interpolateDom({
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
		}));
	}
}
