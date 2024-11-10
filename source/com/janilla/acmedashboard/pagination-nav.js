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

export default class PaginationNav extends HTMLElement {

	static get observedAttributes() {
		return ["href", "page-count"];
	}

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("pagination-nav-template");
		sr.appendChild(t.content.cloneNode(true));
	}

	async attributeChangedCallback(name, oldValue, newValue) {
		console.log("PaginationNav.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue !== oldValue)
			await this.update();
	}

	async update() {
		const n = this.shadowRoot.querySelector("nav");
		n.innerHTML = "";

		const pc = parseInt(this.getAttribute("page-count"), 10);
		if (pc > 1) {
			const u = new URL(this.getAttribute("href"), location.href);
			const t = this.shadowRoot.querySelector("template");
			n.append(...Array.from({ length: pc }, (_, i) => i + 1)
				.map(x => {
					u.searchParams.set("page", x);
					return {
						page: x,
						href: u.pathname + u.search
					};
				})
				.map(x => interpolate(t.content.cloneNode(true), x)));
		}
	}
}
