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
import { FlexibleElement } from "./flexible-element.js";

export default class DashboardLayout extends FlexibleElement {

	static get observedAttributes() {
		return ["data-uri", "slot"];
	}

	static get templateName() {
		return "dashboard-layout";
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	async updateDisplay() {
		// console.log("DashboardLayout.updateDisplay");
		this.shadowRoot.appendChild(this.interpolateDom({ $template: "shadow" }));
		const p = location.pathname;
		const pp = new URLSearchParams(location.search);
		this.appendChild(this.interpolateDom({
			$template: "",
			dashboardPage: {
				$template: "dashboard-page",
				slot: p === "/dashboard" ? "content" : null
			},
			invoicesLayout: (() => {
				const a = p === "/dashboard/invoices" || p?.startsWith("/dashboard/invoices/");
				return {
					$template: "invoices-layout",
					slot: a ? "content" : null,
					uri: a ? p + location.search : null
				};
			})(),
			customersPage: {
				$template: "customers-page",
				slot: p === "/dashboard/customers" ? "content" : null,
				query: pp.get("query")
			}
		}));
	}
}
