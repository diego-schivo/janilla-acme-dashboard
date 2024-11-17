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

const cardPropertyByType = {
	collected: "paidAmount",
	pending: "pendingAmount",
	invoices: "invoiceCount",
	customers: "customerCount"
};

export default class DashboardPage extends HTMLElement {

	static get observedAttributes() {
		return ["slot"];
	}

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("dashboard-page-template");
		sr.appendChild(t.content.cloneNode(true));
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log("DashboardPage.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue === oldValue)
			return;

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);
		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("DashboardPage.update", "this.slot", this.slot);

		if (!this.slot)
			return;

		this.foo();
		const d = await (await fetch("/api/dashboard")).json();
		this.foo(d);
	}

	foo(d) {
		console.log("DashboardPage.foo", "d", d);

		Object.entries(cardPropertyByType).forEach(([k, v]) => {
			const dc = this.shadowRoot.querySelector(`dashboard-card[data-type="${k}"]`);
			const af = dc.querySelector("amount-format");
			if (af)
				af.setAttribute("data-value", d?.[v] ?? "");
			else
				dc.textContent = d?.[v] ?? "";
		});

		const rc = this.shadowRoot.querySelector("revenue-chart");
		rc.innerHTML = "";
		if (d?.revenue?.length) {
			const k = Math.ceil(Math.max(...d.revenue.map(x => x.revenue)) / 1000);
			rc.setAttribute("k", k.toString());
			rc.append(...d.revenue.flatMap(x => {
				const d = document.createElement("div");
				d.style.height = `${x.revenue / (1000 * k) * 100}%`;
				const p = document.createElement("p");
				p.textContent = x.month;
				return [d, p];
			}));
		}

		const il = this.shadowRoot.querySelector(".invoice-list");
		il.innerHTML = "";
		if (d?.invoices?.length) {
			const t = il.nextElementSibling;
			il.append(...d.invoices.map(x => interpolate(t.content.cloneNode(true), x)));
		}
	}
}
