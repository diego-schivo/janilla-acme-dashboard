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
import { loadTemplate, removeAllChildren } from "./utils.js";

export default class PaginationNav extends HTMLElement {

	static get observedAttributes() {
		return ["data-href", "data-page", "data-page-count", "slot"];
	}

	connectedCallback() {
		// console.log("PaginationNav.connectedCallback");

		this.requestUpdate();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log("PaginationNav.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue === oldValue)
			return;

		this.requestUpdate();
	}

	requestUpdate() {
		// console.log("PaginationNav.requestUpdate");

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);

		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("PaginationNav.update");

		const pc = this.dataset.pageCount ? parseInt(this.dataset.pageCount, 10) : 0;
		if (pc <= 1)
			return;

		this.interpolators ??= loadTemplate("pagination-nav").then(t => {
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			return [buildInterpolator(c), buildInterpolator(cc[0]), buildInterpolator(cc[1]), buildInterpolator(cc[2])];
		});
		const ii = await this.interpolators;

		const u = new URL(this.dataset.href, location.href);
		const p = this.dataset.page ? parseInt(this.dataset.page, 10) : 1;
		this.appendChild(ii[0]({
			prevLink: (() => {
				u.searchParams.set("page", p - 1);
				return ii[1]({
					href: p > 1 ? u.pathname + u.search : undefined,
					content: ii[3]("arrow-left").cloneNode(true)
				}).cloneNode(true);
			})(),
			links: Array.from({ length: pc }, (_, i) => i + 1)
				.map(x => {
					u.searchParams.set("page", x);
					const c = ii[1]({
						href: u.pathname + u.search,
						content: ii[2](x).cloneNode(true)
					}).cloneNode(true);
					if (x === p)
						c.querySelector("a").classList.add("active");
					return c;
				}),
			nextLink: (() => {
				u.searchParams.set("page", p + 1);
				return ii[1]({
					href: p < pc ? u.pathname + u.search : undefined,
					content: ii[3]("arrow-right").cloneNode(true)
				}).cloneNode(true);
			})(),
		}));
	}
}
