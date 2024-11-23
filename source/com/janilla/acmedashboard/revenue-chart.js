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
import { loadTemplate, removeAllChildren } from "./utils.js";

export default class RevenueChart extends HTMLElement {

	static get observedAttributes() {
		return ["data-k"];
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		// console.log("RevenueChart.connectedCallback");

		const t = await loadTemplate("revenue-chart");
		this.shadowRoot.appendChild(t.content.cloneNode(true));

		this.requestUpdate();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log("RevenueChart.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue === oldValue)
			return;

		this.requestUpdate();
	}

	requestUpdate() {
		// console.log("RevenueChart.requestUpdate");

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);

		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("RevenueChart.update");

		const y = this.shadowRoot.querySelector(".y");
		if (!y)
			return;

		removeAllChildren(y);
		y.append(...Array.from({ length: parseInt(this.dataset.k, 10) + 1 }, (_, i) => {
			const p = document.createElement("p");
			p.textContent = `$${i}K`;
			return p;
		}));
	}
}
