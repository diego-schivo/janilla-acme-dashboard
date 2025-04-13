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
import { WebComponent } from "./web-component.js";

export default class InvoicePage extends WebComponent {

	static get observedAttributes() {
		return ["data-id", "slot"];
	}

	static get templateName() {
		return "invoice-page";
	}

	constructor() {
		super();
	}

	get historyState() {
		const s = this.state;
		return {
			...history.state,
			"invoice-page": Object.assign({}, s)
		};
	}

	connectedCallback() {
		// console.log("InvoicePage.connectedCallback");
		super.connectedCallback();
		this.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		// console.log("InvoicePage.disconnectedCallback");
		this.removeEventListener("submit", this.handleSubmit);
	}

	handleSubmit = async event => {
		// console.log("InvoicePage.handleSubmit", event);
		event.preventDefault();

		if (event.submitter.getAttribute("aria-disabled") === "true")
			return;
		event.submitter.setAttribute("aria-disabled", "true");

		try {
			const d = Object.fromEntries(new FormData(event.target));
			const mm = {
				customerId: d.customerId ? "" : "Please select a customer.",
				amount: d.amount ? "" : "Please enter an amount greater than $0.",
				status: d.status ? "" : "Please select an invoice status."
			};
			Object.entries(mm).forEach(([k, v]) => this.querySelector(`.${k}-error`).innerHTML = v.length ? `<p>${v}</p>` : "");
			const v = Object.values(mm).every(x => !x.length);
			this.querySelector(".error").innerHTML = v ? "" : `<p>Missing Fields. Failed to ${this.dataset.title}.</p>`;
			if (!v)
				return;

			const r = await fetch(this.dataset.id ? `/api/invoices/${this.dataset.id}` : "/api/invoices", {
				method: this.dataset.id ? "PUT" : "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(d)
			});

			if (r.ok) {
				history.pushState(undefined, "", "/dashboard/invoices");
				dispatchEvent(new CustomEvent("popstate"));
			} else {
				const t = await r.text();
				this.querySelector(".error").innerHTML = `<p>${t}</p>`;
			}
		} finally {
			event.submitter.setAttribute("aria-disabled", "false");
		}
	}

	async updateDisplay() {
		// console.log("InvoicePage.updateDisplay");
		if (this.state.customers && !history.state)
			this.state = {};
		if (!this.state.customers && this.slot) {
			const [nn, i] = await Promise.all([
				fetch("/api/customers/names").then(x => x.json()),
				this.dataset.id ? fetch(`/api/invoices/${this.dataset.id}`).then(x => x.json()) : undefined
			]);
			Object.assign(this.state, {
				customers: nn,
				...i
			});
			history.replaceState(this.historyState, "");
		}
		const s = this.state;
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			...s,
			customerOptions: s.customers?.map(x => ({
				$template: "customer-option",
				...x,
				selected: x.key == s.customerId
			})),
			statusItems: ["PENDING", "PAID"].map(x => ({
				$template: "status-item",
				value: x,
				checked: x === s.status
			}))
		}));
	}
}
