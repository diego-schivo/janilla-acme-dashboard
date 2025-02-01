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
import { UpdatableHTMLElement } from "./updatable-html-element.js";

export default class LatestInvoices extends UpdatableHTMLElement {

	static get templateName() {
		return "latest-invoices";
	}

	constructor() {
		super();
	}

	get historyState() {
		const s = this.state;
		return {
			...history.state,
			"latest-invoices": Object.fromEntries(["invoices"].map(x => [x, s[x]]))
		};
	}

	async updateDisplay() {
		// console.log("LatestInvoices.updateDisplay");
		const s = this.state;
		this.appendChild(this.interpolateDom({
			$template: "",
			articles: s.invoices ? s.invoices.map(x => ({
				$template: "article",
				...x
			})) : Array.from({ length: 6 }).map(() => ({ $template: "article-skeleton" }))
		}));
		if (this.closest("dashboard-page").slot && !s.invoices) {
			s.invoices = await (await fetch("/api/dashboard/invoices")).json();
			history.replaceState(this.historyState, "");
			this.requestUpdate();
		}
	}
}
