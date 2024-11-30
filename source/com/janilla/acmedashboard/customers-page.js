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
import { SlottableElement } from "./web-components.js";
import { loadTemplate } from "./utils.js";

export default class CustomersPage extends SlottableElement {

	static get observedAttributes() {
		return ["data-query", "slot"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("CustomersPage.connectedCallback");
		super.connectedCallback();

		this.addEventListener("input", this.handleInput);
	}

	async computeState() {
		console.log("CustomersPage.computeState");

		const u = new URL("/api/customers", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		this.state = await (await fetch(u)).json();
		history.replaceState(this.state, "");
	}

	async render() {
		console.log("CustomersPage.render");

		this.interpolators ??= loadTemplate("customers-page").then(t => {
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			return [buildInterpolator(c), ...cc.map(x => buildInterpolator(x))];
		});
		const ii = await this.interpolators;

		this.appendChild(ii[0]({
			articles: this.state
				? this.state.map(x => ii[1](x).cloneNode(true))
				: Array.from({ length: 6 }).map(_ => ii[2]().cloneNode(true)),
			rows: this.state
				? this.state.map(x => ii[3](x).cloneNode(true))
				: Array.from({ length: 6 }).map(_ => ii[4]().cloneNode(true))
		}));

		const q = this.dataset.query;
		if (q)
			this.querySelector('[type="text"]').value = q;
	}

	handleInput = event => {
		console.log("CustomersPage.handleInput", event);

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
}
