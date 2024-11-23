/*
 * MIT License
 *
 * Copyright (c) 2024 Diego Schivo
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
import { loadTemplate } from "./utils.js";

export default class AcmeDashboard extends HTMLElement {

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		// console.log("AcmeDashboard.connectedCallback");

		const t = await loadTemplate("acme-dashboard");
		this.shadowRoot.appendChild(t.content.cloneNode(true));

		addEventListener("popstate", this.handlePopstate);
		this.addEventListener("click", this.handleClick);

		const p1 = location.pathname;
		const p2 = p1 === "/" ? (await (await fetch("/api/authentication")).json() ? "/dashboard" : "/") : p1;
		if (p2 !== p1) {
			history.pushState({}, "", p2);
			dispatchEvent(new CustomEvent("popstate"));
		} else
			this.updateContent();
	}

	disconnectedCallback() {
		// console.log("AcmeDashboard.disconnectedCallback");

		removeEventListener("popstate", this.handlePopstate);
	}

	updateContent(state) {
		console.log("AcmeDashboard.updateContent");

		const lp = location.pathname;
		updateElement(this.querySelector("welcome-page"), lp === "/");
		updateElement(this.querySelector("login-page"), lp === "/login");
		updateElement(this.querySelector("dashboard-layout"), lp === "/dashboard" || lp.startsWith("/dashboard/"));
		updateElement(this.querySelector("dashboard-page"), lp === "/dashboard", (el, a) => {
			if (a)
				el.state = state;
			else
				delete el.state;
		});
		updateElement(this.querySelector("invoices-layout"), lp === "/dashboard/invoices" || lp.startsWith("/dashboard/invoices/"));
		updateElement(this.querySelector("invoices-page"), lp === "/dashboard/invoices", (el, a) => {
			if (a) {
				el.state = state;
				const u = new URL(location.href);
				el.setAttribute("data-query", u.searchParams.get("query") ?? "");
				el.setAttribute("data-page", u.searchParams.get("page") ?? "");
			} else {
				delete el.state;
				el.removeAttribute("data-query");
				el.removeAttribute("data-page");
			}
		});
		const m = lp === "/dashboard/invoices/create" ? [] : lp.match(/\/dashboard\/invoices\/(\d+)\/edit/);
		updateElement(this.querySelector("invoice-page"), !!m, (el, a) => {
			if (a) {
				el.state = state;
				el.setAttribute("data-id", m[1] ?? "");
				el.setAttribute("data-title", m[1] ? "Edit Invoice" : "Create Invoice");
			} else {
				delete el.state;
				el.removeAttribute("data-id");
				el.removeAttribute("data-title");
			}
		});
		updateElement(this.querySelector("customers-page"), lp === "/dashboard/customers", (el, a) => {
		if (a) {
			el.state = state;
			const u = new URL(location.href);
			el.setAttribute("data-query", u.searchParams.get("query") ?? "");
		} else {
			delete el.state;
			el.removeAttribute("data-query");
		}
		});
	}

	handleClick = event => {
		console.log("AcmeDashboard.handleClick", event);

		const a = event.composedPath().find(x => x.tagName === "A");
		if (!a?.href)
			return;

		event.preventDefault();
		const u = new URL(a.href);
		history.pushState({}, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopstate = event => {
		console.log("AcmeDashboard.handlePopstate", event);

		this.updateContent(event.state);
	}
}

function updateElement(element, active, more) {
	if (active)
		element.setAttribute("slot", "content");
	else
		element.removeAttribute("slot");

	if (more)
		more(element, active);
}
