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
import { loadTemplate, removeAllChildren } from "./utils.js";

export default class InvoicesLayout extends HTMLElement {

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		// console.log("InvoicesLayout.connectedCallback");

		const c = (await loadTemplate("invoices-layout")).content.cloneNode(true);
		const cc = [...c.querySelectorAll("template")].map(x => x.content);
		this.interpolate = [buildInterpolator(cc[0]), buildInterpolator(cc[1])];

		this.shadowRoot.appendChild(c);
		this.shadowRoot.querySelector("slot").addEventListener("slotchange", this.handleSlotchange);
	}

	handleSlotchange = event => {
		console.log("InvoicesLayout.handleSlotchange", event);

		const bn = this.shadowRoot.querySelector("breadcrumb-nav");
		removeAllChildren(bn);
		const n0 = event.target.assignedNodes()[0];
		for (let n = n0; n; n = n.previousElementSibling)
			bn.prepend(this.interpolate[n === n0 ? 1 : 0](n.dataset).cloneNode(true));
		bn.connectedCallback();
	}
}
