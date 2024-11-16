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
export default class AcmeDashboard extends HTMLElement {

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("acme-dashboard-template");
		sr.appendChild(t.content.cloneNode(true));

		addEventListener("click", this.handleClick);
		addEventListener("popstate", this.handlePopstate);
	}

	async connectedCallback() {
		const p1 = location.pathname;
		const p2 = p1 === "/" ? (await (await fetch("/api/authentication")).json() ? "/dashboard" : "/") : p1;
		if (p2 !== p1) {
			history.pushState({}, "", p2);
			dispatchEvent(new CustomEvent("popstate"));
		} else
			this.update();
	}

	update() {
		const lp = location.pathname;
		{
			const el = this.querySelector("welcome-page");
			lp === "/"
				? el.setAttribute("slot", "content")
				: el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("login-page");
			lp === "/login"
				? el.setAttribute("slot", "content")
				: el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("dashboard-layout");
			lp === "/dashboard" || lp.startsWith("/dashboard/")
				? el.setAttribute("slot", "content")
				: el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("dashboard-page");
			lp === "/dashboard"
				? el.setAttribute("slot", "content")
				: el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("invoices-layout");
			lp === "/dashboard/invoices" || lp.startsWith("/dashboard/invoices/")
				? el.setAttribute("slot", "content")
				: el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("invoices-page");
			if (lp === "/dashboard/invoices") {
				el.setAttribute("slot", "content")
				const u = new URL(location.href);
				el.setAttribute("data-query", u.searchParams.get("query") ?? "");
				el.setAttribute("data-page", u.searchParams.get("page") ?? "");
			} else
				el.removeAttribute("slot");
		}
		{
			const el = this.querySelector("invoice-page");
			const m = lp === "/dashboard/invoices/create" ? [] : lp.match(/\/dashboard\/invoices\/(\d+)\/edit/);
			if (m) {
				el.setAttribute("slot", "content");
				el.setAttribute("data-id", m[1] ?? "");
				el.setAttribute("data-title", m[1] ? "Edit Invoice" : "Create Invoice");
			} else
				el.removeAttribute("slot");
		}
	}

	handleClick = event => {
		console.log("AcmeDashboard.handleClick", event);
		const a = event.composedPath().find(x => x.tagName === "A");
		if (!a)
			return;
		event.preventDefault();
		const u = new URL(a.href);
		history.pushState({}, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopstate = event => {
		console.log("AcmeDashboard.handlePopstate", event);
		this.update();
	}
}
