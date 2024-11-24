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
import { loadTemplate } from "./utils.js";

export default class CustomersPage extends HTMLElement {

	static get observedAttributes() {
		return ["data-query", "slot"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("CustomersPage.connectedCallback");

		this.addEventListener("input", this.handleInput);
		this.requestUpdate();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log("CustomersPage.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue !== oldValue)
			this.requestUpdate();
	}

	requestUpdate() {
		// console.log("CustomersPage.requestUpdate");

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);

		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("CustomersPage.update");

		if (!this.slot)
			delete this.state;
		await this.render();
		if (!this.slot || this.state)
			return;

		const u = new URL("/api/customers", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		this.state = await (await fetch(u)).json();
		history.replaceState(this.state, "");
		await this.render();
	}

	async render() {
		console.log("CustomersPage.render");

		if (!this.interpolate) {
			const t = await loadTemplate("customers-page");
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			this.interpolate = [buildInterpolator(c), buildInterpolator(cc[0]), buildInterpolator(cc[1])];
		}

		this.appendChild(this.interpolate[0]({
			rows: !this.state
				? Array.from({ length: 6 }).map(_ => this.interpolate[1]().cloneNode(true))
				: this.state.map(x => this.interpolate[2](x).cloneNode(true))
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
