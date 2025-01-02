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

const updateElement = (element, active, more) => {
	if (active) {
		// console.log("updateElement", element);
		element.setAttribute("slot", "content");
	}

	if (more)
		more(element, active);
}

export default class AcmeDashboard extends FlexibleElement {

	static get templateName() {
		return "acme-dashboard";
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		// console.log("AcmeDashboard.connectedCallback");
		super.connectedCallback();
		addEventListener("popstate", this.handlePopState);
		this.addEventListener("click", this.handleClick);
	}

	disconnectedCallback() {
		// console.log("AcmeDashboard.disconnectedCallback");
		removeEventListener("popstate", this.handlePopState);
		this.removeEventListener("click", this.handleClick);
	}

	handleClick = event => {
		// console.log("AcmeDashboard.handleClick", event);

		const a = event.composedPath().find(x => x.tagName?.toLowerCase() === "a");
		if (!a?.href)
			return;

		event.preventDefault();
		const u = new URL(a.href);
		history.pushState({}, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopState = event => {
		// console.log("AcmeDashboard.handlePopState", event);

		this.updateContent(event.state);
	}

	async updateDisplay() {
		// console.log("AcmeDashboard.updateDisplay");
		this.shadowRoot.appendChild(this.interpolateDom());
		const p1 = location.pathname;
		const p2 = p1 === "/" ? (await (await fetch("/api/authentication")).json() ? "/dashboard" : "/") : p1;
		if (p2 !== p1) {
			history.pushState({}, "", p2);
			dispatchEvent(new CustomEvent("popstate"));
		} else
			this.updateContent();
	}

	updateContent(state) {
		// console.log("AcmeDashboard.updateContent", state);
		Array.prototype.forEach.call(this.querySelectorAll("*"), x => x.removeAttribute("slot"));

		const lp = location.pathname;
		updateElement(this.querySelector("welcome-page"), lp === "/");
		updateElement(this.querySelector("login-page"), lp === "/login");
		updateElement(this.querySelector("dashboard-layout"), lp === "/dashboard" || lp.startsWith("/dashboard/"));
		updateElement(this.querySelector("dashboard-page"), lp === "/dashboard", (el, a) => {
			el.janillas.state = a ? state : undefined;
		});
		updateElement(this.querySelector("invoices-layout"), lp === "/dashboard/invoices" || lp.startsWith("/dashboard/invoices/"));
		updateElement(this.querySelector("invoices-page"), lp === "/dashboard/invoices", (el, a) => {
			el.janillas.state = a ? state : undefined;
			if (a) {
				const u = new URL(location.href);
				el.setAttribute("data-query", u.searchParams.get("query") ?? "");
				el.setAttribute("data-page", u.searchParams.get("page") ?? "");
			} else {
				el.removeAttribute("data-query");
				el.removeAttribute("data-page");
			}
		});
		const m = lp === "/dashboard/invoices/create" ? [] : lp.match(/\/dashboard\/invoices\/(\d+)\/edit/);
		updateElement(this.querySelector("invoice-page"), !!m, (el, a) => {
			el.janillas.state = a ? state : undefined;
			if (a) {
				el.setAttribute("data-title", m[1] ? "Edit Invoice" : "Create Invoice");
				el.setAttribute("data-id", m[1] ?? "");
			} else {
				el.removeAttribute("data-title");
				el.removeAttribute("data-id");
			}
		});
		updateElement(this.querySelector("customers-page"), lp === "/dashboard/customers", (el, a) => {
			el.janillas.state = a ? state : undefined;
			if (a) {
				const u = new URL(location.href);
				el.setAttribute("data-query", u.searchParams.get("query") ?? "");
			} else {
				el.removeAttribute("data-query");
			}
		});

		document.title = [this.querySelector("[slot][data-title]"), this].filter(x => x).map(x => x.dataset.title).join(" | ");
	}
}
