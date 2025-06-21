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
import WebComponent from "./web-component.js";

export default class InvoicesLayout extends WebComponent {

	static get observedAttributes() {
		return ["data-uri", "slot"];
	}

	static get templateNames() {
		return ["invoices-layout"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	async updateDisplay() {
		const p = location.pathname;
		const pp = new URLSearchParams(location.search);
		const df = this.interpolateDom({
			$template: "",
			breadcrumbItems: (() => {
				const nn = [];
				for (let n = this.querySelector("[slot]"); n; n = n.previousElementSibling)
					nn.push(n);
				nn.reverse();
				return nn.map((x, i) => ({
					$template: i < nn.length - 1 ? "breadcrumb-link" : "breadcrumb-heading",
					...x.dataset,
					slot: `item-${i}`
				}));
			})(),
			invoices: {
				$template: "invoices",
				slot: p === "/dashboard/invoices" ? "content" : null,
				query: pp.get("query"),
				page: pp.get("page")
			},
			invoice: (() => {
				const m = p === "/dashboard/invoices/create" ? [] : p?.match(/\/dashboard\/invoices\/([^/]+)\/edit/);
				return {
					$template: "invoice",
					slot: m ? "content" : null,
					title: m ? (m[1] ? "Edit Invoice" : "Create Invoice") : null,
					id: m?.[1]
				};
			})()
		});
		this.shadowRoot.append(...df.querySelectorAll("link, breadcrumb-nav, slot"));
		this.shadowRoot.querySelector("breadcrumb-nav").requestDisplay();
		this.appendChild(df);
	}
}
