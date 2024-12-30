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
import { SlottableElement } from "./slottable-element.js";

export default class CustomersPage extends SlottableElement {

	static get observedAttributes() {
		return ["data-query", "slot"];
	}

	static get templateName() {
		return "customers-page";
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("CustomersPage.connectedCallback");
		super.connectedCallback();
		this.addEventListener("input", this.handleInput);
	}

	disconnectedCallback() {
		// console.log("CustomersPage.disconnectedCallback");
		this.removeEventListener("input", this.handleInput);
	}

	handleInput = event => {
		// console.log("CustomersPage.handleInput", event);
		if (typeof this.inputTimeout === "number")
			clearTimeout(this.inputTimeout);
		const q = event.target.value;
		this.inputTimeout = setTimeout(() => {
			this.inputTimeout = undefined;
			const u = new URL("/dashboard/customers", location.href);
			if (q)
				u.searchParams.append("query", q);
			history.pushState({}, "", u.pathname + u.search);
			dispatchEvent(new CustomEvent("popstate"));
		}, 1000);
	}

	async computeState() {
		// console.log("CustomersPage.computeState");
		const u = new URL("/api/customers", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		this.janillas.state = await (await fetch(u)).json();
		history.replaceState(this.janillas.state, "");
	}

	renderState() {
		// console.log("CustomersPage.renderState");
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			articles: this.janillas.state ? this.janillas.state.map(x => ({
				$template: "article",
				...x
			})) : Array.from({ length: 6 }).map(() => ({ $template: "article-skeleton" })),
			rows: this.janillas.state ? this.janillas.state.map(x => ({
				$template: "row",
				...x
			})) : Array.from({ length: 6 }).map(() => ({ $template: "row-skeleton" }))
		}));
	}
}
