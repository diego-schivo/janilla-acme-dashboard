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
export default class DashboardPage extends HTMLElement {

	static get observedAttributes() {
		return ["slot"];
	}

	constructor() {
		super();
		const sr = this.attachShadow({ mode: "open" });
		const df = document.getElementById("dashboard-page-template").content.cloneNode(true);
		sr.appendChild(df);
	}

	attributeChangedCallback(name, _, newValue) {
		if (name === "slot" && newValue)
			this.update();
	}

	async update() {
		const d = await (await fetch("/api/dashboard")).json();
		this.shadowRoot.querySelector('dashboard-card[type="collected"]').textContent = d.paidAmount;
		this.shadowRoot.querySelector('dashboard-card[type="pending"]').textContent = d.pendingAmount;
		this.shadowRoot.querySelector('dashboard-card[type="invoices"]').textContent = d.invoiceCount;
		this.shadowRoot.querySelector('dashboard-card[type="customers"]').textContent = d.customerCount;
		const rc = this.shadowRoot.querySelector('revenue-chart');

		const k = Math.ceil(Math.max(...d.revenue.map(x => x.revenue)) / 1000);
		rc.setAttribute("k", k.toString());
		rc.innerHTML = "";
		rc.append(...d.revenue.flatMap(x => {
			const d = document.createElement("div");
			d.style.height = `${x.revenue / (1000 * k) * 100}%`;
			const p = document.createElement("p");
			p.textContent = x.month;
			return [d, p];
		}));

		this.shadowRoot.querySelector('invoice-list').data = d.invoices;
	}
}
