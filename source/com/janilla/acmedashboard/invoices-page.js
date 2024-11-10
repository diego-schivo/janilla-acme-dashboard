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
import interpolate from "./interpolate.js";

export default class InvoicesPage extends HTMLElement {

	static get observedAttributes() {
		return ["query", "slot"];
	}

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("invoices-page-template");
		sr.appendChild(t.content.cloneNode(true));

		this.addEventListener("input", this.handleInput);
	}

	async attributeChangedCallback(name, oldValue, newValue) {
		console.log("InvoicesPage.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue !== oldValue)
			await this.update();
	}

	async update() {
		const tb = this.shadowRoot.querySelector(".table tbody");
		tb.innerHTML = "";

		const u = new URL("/api/invoices", location.href);
		const q = this.getAttribute("query");
		if (q)
			u.searchParams.append("query", q);
		/*
		if (this.pagination.page !== 1)
			u.searchParams.append("page", this.pagination.page);
		*/
		const j = await (await fetch(u)).json();
		/*
		this.table.items = j.items;
		this.pagination.pageCount = Math.ceil(j.total / 6);
		*/
		const t = this.shadowRoot.querySelector(".table template");
		tb.append(...j.items.map(x => interpolate(t.content.cloneNode(true), x)));

		const pn = this.shadowRoot.querySelector("pagination-nav");
		const v = new URL("/dashboard/invoices", location.href);
		if (q)
			v.searchParams.append("query", q);
		pn.setAttribute("href", v.pathname + v.search);
		pn.setAttribute("page-count", Math.ceil(j.total / 6).toString());
	}

	handleInput = event => {
		if (typeof this.timeoutID === "number")
			clearTimeout(this.timeoutID);
		const q = event.composedPath()[0].value;
		this.timeoutID = setTimeout(() => {
			this.timeoutID = undefined;

			const u = new URL("/dashboard/invoices", location.href);
			if (q)
				u.searchParams.append("query", q);
			history.pushState({}, "", u.pathname + u.search);
			dispatchEvent(new CustomEvent("popstate"));
		}, 1000);
	}
}
