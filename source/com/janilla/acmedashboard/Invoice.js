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
export default class Invoice {

	id;

	invoice;

	customers;

	constructor(id) {
		this.id = id;
	}

	get title() {
		return `${this.id ? "Edit" : "Create"} Invoice`;
	}

	get state() {
		return Object.fromEntries(["id", "invoice", "customers"].map(x => [x, this[x]]));
	}

	set state(x) {
		Object.entries(x).forEach(([k, v]) => this[k] = v);
	}

	render = async re => {
		return await re.match([this], async (_, o) => {
			if (!this.invoice)
				this.invoice = this.id ? await (await fetch(`/api/invoices/${this.id}`)).json() : {};
			this.customers = await (await fetch("/api/customers/names")).json();
			o.template = "Invoice";
		}) || await re.match([this.customers, "number"], async (_, o) => {
			o.template = "Invoice-customer";
		});
	}

	listen = () => {
		const e = document.querySelector(".Invoice");
		const f = e.querySelector("form");
		[...new Set(Array.from(f.elements).filter(x => x.matches("input, select")).map(x => x.name))].forEach(x => f[x].value = this.invoice[x]?.toString() ?? "");
		e.addEventListener("submit", this.handleSubmit);
	}

	handleSubmit = async e => {
		e.preventDefault();
		await fetch(this.id ? `/api/invoices/${this.id}` : "/api/invoices", {
			method: this.id ? "PUT" : "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
		});
		dispatchEvent(new CustomEvent("urlchange", { detail: { url: new URL("/dashboard/invoices", location.href) } }));
	}
}
