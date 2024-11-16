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

export default class InvoicePage extends HTMLElement {

	static get observedAttributes() {
		return ["data-id", "slot"];
	}
	
	invoice;

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("invoice-page-template");
		sr.appendChild(t.content.cloneNode(true));
	}

	async attributeChangedCallback(name, oldValue, newValue) {
		console.log("InvoicePage.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);
		
		if (newValue === oldValue)
			return;

		if (name === "data-id" ? newValue != this.invoice?.id : true)
			await this.update();
	}

	async update() {
		console.log("InvoicePage.update");

		if (this.slot !== "content")
			return;

		const nn = await (await fetch("/api/customers/names")).json();
		const t = this.shadowRoot.querySelector("template");
		this.shadowRoot.querySelector('[name="customerId"]').append(...nn.map(x => interpolate(t.content.cloneNode(true), x)));

		this.invoice = this.dataset.id ? await (await fetch(`/api/invoices/${this.dataset.id}`)).json() : {};
		const f = this.shadowRoot.querySelector("form");
		[...new Set(Array.from(f.elements).filter(x => x.matches("input, select")).map(x => x.name))]
			.forEach(x => f[x].value = this.invoice[x]?.toString() ?? "");
	}
}
