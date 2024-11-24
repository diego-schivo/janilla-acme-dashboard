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
import { buildInterpolator } from "./dom.js";
import { SlottableElement } from "./web-components.js";
import { loadTemplate } from "./utils.js";

export default class InvoicesPage extends SlottableElement {

	static get observedAttributes() {
		return ["data-page", "data-query", "slot"];
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

	async computeState() {
		console.log("InvoicesPage.computeState");

		const u = new URL("/api/invoices", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		const p = this.dataset.page;
		if (p)
			u.searchParams.append("page", p);
		this.state = await (await fetch(u)).json();
		history.replaceState(this.state, "");
	}

	async render() {
		console.log("InvoicesPage.render");

		this.interpolators ??= loadTemplate("invoices-page").then(t => {
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			return [buildInterpolator(c), buildInterpolator(cc[0]), buildInterpolator(cc[1])];
		});
		const ii = await this.interpolators;

		const u = new URL("/dashboard/invoices", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		const p = this.dataset.page;
		this.appendChild(ii[0]({
			rows: !this.state
				? Array.from({ length: 6 }).map(_ => ii[1]().cloneNode(true))
				: this.state.items.map(x => ii[2]({
					...x,
					href: `/dashboard/invoices/${x.id}/edit`
				}).cloneNode(true)),
			pagination: {
				href: u.pathname + u.search,
				page: p ?? 1,
				pageCount: this.state ? Math.ceil(this.state.total / 6) : undefined
			}
		}));

		if (q)
			this.querySelector('[type="text"]').value = q;
	}

	handleInput = event => {
		console.log("InvoicesPage.handleInput", event);

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
		console.log("InvoicesPage.handleSubmit", event);

		event.preventDefault();
		const fd = new FormData(event.target);
		const r = await fetch(`/api/invoices/${fd.get("id")}`, { method: "DELETE" });
		if (r.ok)
			await this.update();
		else {
			const t = await r.text();
			alert(t);
		}
	}
}
