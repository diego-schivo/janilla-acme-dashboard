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

export default class InvoicesPage extends WebComponent {

	static get observedAttributes() {
		return ["data-page", "data-query", "slot"];
	}

	static get templateNames() {
		return ["invoices-page"];
	}

	constructor() {
		super();
	}

	get historyState() {
		const s = this.state;
		return {
			...history.state,
			"invoices-page": Object.fromEntries(["items", "total"].map(x => [x, s[x]]))
		};
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
			const u = new URL(location.href);
			const q0 = u.searchParams.get("query");
			if (q)
				u.searchParams.set("query", q);
			else
				u.searchParams.delete("query");
			if (!q0)
				history.pushState(undefined, "", u.pathname + u.search);
			else
				history.replaceState(undefined, "", u.pathname + u.search);
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

	async updateDisplay() {
		// console.log("InvoicesPage.updateDisplay");
		if (this.state.items && !history.state)
			this.state = {};
		if (!this.state.items && this.slot) {
			const u = new URL("/api/invoices", location.href);
			const q = this.dataset.query;
			if (q)
				u.searchParams.append("query", q);
			const p = this.dataset.page;
			if (p)
				u.searchParams.append("page", p);
			Object.assign(this.state, await (await fetch(u)).json());
			history.replaceState(this.historyState, "");
		}
		const s = this.state;
		const u = new URL("/dashboard/invoices", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		const p = this.dataset.page;
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			articles: s.items ? s.items.map(x => ({
				$template: "article",
				...x,
				href: `/dashboard/invoices/${x.id}/edit`
			})) : Array.from({ length: 6 }).map(() => ({ $template: "article-skeleton" })),
			rows: s.items ? s.items.map(x => ({
				$template: "row",
				...x,
				href: `/dashboard/invoices/${x.id}/edit`
			})) : Array.from({ length: 6 }).map(() => ({ $template: "row-skeleton" })),
			pagination: {
				href: u.pathname + u.search,
				page: p ?? 1,
				pageCount: s.total ? Math.ceil(s.total / 6) : 0
			}
		}));
	}
}
