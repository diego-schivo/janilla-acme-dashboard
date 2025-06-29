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

	static get templateNames() {
		return ["root-layout"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		const el = this.children.length === 1 ? this.firstElementChild : null;
		if (el.matches('[type="application/json"]')) {
			el.remove();
			history.replaceState(JSON.parse(el.text), "");
		}
		addEventListener("popstate", this.handlePopState);
		this.addEventListener("click", this.handleClick);
		dispatchEvent(new CustomEvent("popstate"));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		removeEventListener("popstate", this.handlePopState);
		this.removeEventListener("click", this.handleClick);
	}

	handleClick = event => {
		const a = event.composedPath().find(x => x.tagName?.toLowerCase() === "a");
		if (!a?.href)
			return;
		event.preventDefault();
		const u = new URL(a.href);
		history.pushState(undefined, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopState = _ => {
		this.requestDisplay();
	}

	async updateDisplay() {
		const p = location.pathname;
		if (p === "/") {
			if (!history.state) {
				const x = await (await fetch("/api/authentication")).json();
				history.replaceState({
					...history.state,
					authentication: x
				}, "");
			}
			if (history.state.authentication) {
				history.pushState(undefined, "", "/dashboard");
				dispatchEvent(new CustomEvent("popstate"));
				return;
			}
		}
		const f = this.interpolateDom({
			$template: "",
			welcome: {
				$template: "welcome",
				slot: p === "/" ? "content" : null
			},
			login: {
				$template: "login",
				slot: p === "/login" ? "content" : null
			},
			dashboard: (() => {
				const a = p.split("/")[1] === "dashboard";
				return {
					$template: "dashboard",
					slot: a ? "content" : null,
					uri: a ? p + location.search : null
				};
			})()
		});
		this.shadowRoot.append(...f.querySelectorAll("slot"));
		this.appendChild(f);
	}
}
