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
import Component from "./Component.js";

export default class Invoice extends Component {

	id;

	invoice;

	customers;

	constructor(id) {
		super("Invoice");
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

	tryRender(re) {
		return super.tryRender(re) || re.match([this.customers, '[type="number"]'], (_, o) => {
			o.template = "Invoice-customer";
		});
	}

	listen() {
		if (!this.invoice)
			this.load().then(() => this.refresh());
		this.element.addEventListener("submit", this.handleSubmit);
	}

	async load() {
		this.invoice = this.id ? await (await fetch(`/api/invoices/${this.id}`)).json() : {};
		this.customers = await (await fetch("/api/customers/names")).json();
	}

	refresh() {
		super.refresh();
		const f = this.element.querySelector("form");
		[...new Set(Array.from(f.elements).filter(x => x.matches("input, select")).map(x => x.name))].forEach(x => f[x].value = this.invoice[x]?.toString() ?? "");
	}

	handleSubmit = async e => {
		e.preventDefault();
		const i = Object.fromEntries(new FormData(e.target));
		const mm = {
			customerId: i.customerId ? "" : "Please select a customer.",
			amount: i.amount ? "" : "Please enter an amount greater than $0.",
			status: i.status ? "" : "Please select an invoice status."
		};
		Object.entries(mm).forEach(([k, v]) => this.element.querySelector(`.${k}-error`).innerHTML = v.length ? `<p>${v}</p>` : "");
		const v = Object.values(mm).every(x => !x.length);
		this.element.querySelector(".error").innerHTML = v ? "" : `<p>Missing Fields. Failed to ${this.title}.</p>`;
		if (!v)
			return;
		const r = await fetch(this.id ? `/api/invoices/${this.id}` : "/api/invoices", {
			method: this.id ? "PUT" : "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(i)
		});
		if (r.ok)
			dispatchEvent(new CustomEvent("urlchange", { detail: { url: new URL("/dashboard/invoices", location.href) } }));
		else {
			const t = await r.text();
			this.element.querySelector(".error").innerHTML = `<p>${t}</p>`;
		}
	}
}
