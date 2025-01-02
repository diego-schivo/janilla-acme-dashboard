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
import { SlottableElement } from "./slottable-element.js";

export default class InvoicesPage extends SlottableElement {

	static get observedAttributes() {
		return ["data-page", "data-query", "slot"];
	}

	static get templateName() {
		return "invoices-page";
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("InvoicesPage.connectedCallback");
		super.connectedCallback();
		this.addEventListener("input", this.handleInput);
		this.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		// console.log("InvoicesPage.disconnectedCallback");
		this.removeEventListener("input", this.handleInput);
		this.removeEventListener("submit", this.handleSubmit);
	}

	handleInput = event => {
		// console.log("InvoicesPage.handleInput", event);
		if (typeof this.inputTimeout === "number")
			clearTimeout(this.inputTimeout);
		const q = event.target.value;
		this.inputTimeout = setTimeout(() => {
			this.inputTimeout = undefined;
			const u = new URL("/dashboard/invoices", location.href);
			if (q)
				u.searchParams.append("query", q);
			history.pushState({}, "", u.pathname + u.search);
			dispatchEvent(new CustomEvent("popstate"));
		}, 1000);
	}

	handleSubmit = async event => {
		// console.log("InvoicesPage.handleSubmit", event);
		event.preventDefault();
		if (event.submitter.getAttribute("aria-disabled") === "true")
			return;
		event.submitter.setAttribute("aria-disabled", "true");
		try {
			const fd = new FormData(event.target);
			const r = await fetch(`/api/invoices/${fd.get("id")}`, { method: "DELETE" });
			if (r.ok)
				await this.updateDisplay();
			else {
				const t = await r.text();
				alert(t);
			}
		} finally {
			event.submitter.setAttribute("aria-disabled", "false");
		}
	}

	async computeState() {
		// console.log("InvoicesPage.computeState");
		const u = new URL("/api/invoices", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		const p = this.dataset.page;
		if (p)
			u.searchParams.append("page", p);
		this.janillas.state = await (await fetch(u)).json();
		history.replaceState(this.janillas.state, "");
	}

	renderState() {
		// console.log("InvoicesPage.renderState");
		const u = new URL("/dashboard/invoices", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		const p = this.dataset.page;
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			articles: this.janillas.state ? this.janillas.state.items.map(x => ({
				$template: "article",
				...x,
				href: `/dashboard/invoices/${x.id}/edit`
			})) : Array.from({ length: 6 }).map(() => ({ $template: "article-skeleton" })),
			rows: this.janillas.state ? this.janillas.state.items.map(x => ({
				$template: "row",
				...x,
				href: `/dashboard/invoices/${x.id}/edit`
			})) : Array.from({ length: 6 }).map(() => ({ $template: "row-skeleton" })),
			pagination: {
				href: u.pathname + u.search,
				page: p ?? 1,
				pageCount: this.janillas.state ? Math.ceil(this.janillas.state.total / 6) : undefined
			}
		}));
	}
}
