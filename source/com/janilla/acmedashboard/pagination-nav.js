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

		removeAllChildren(this);

		const pc = this.dataset.pageCount ? parseInt(this.dataset.pageCount, 10) : 0;
		if (pc <= 1)
			return;

		const t = await loadTemplate("pagination-nav");
		const u = new URL(this.dataset.href, location.href);
		const p = this.dataset.page ? parseInt(this.dataset.page, 10) : 1;
		const tt = t.content.querySelectorAll("template");
		this.appendChild(interpolate(t.content.cloneNode(true), {
			prevLink: (() => {
				u.searchParams.set("page", p - 1);
				return interpolate(tt[0].content.cloneNode(true), {
					href: p > 1 ? u.pathname + u.search : undefined,
					content: interpolate(tt[1].content.cloneNode(true), "arrow-left")
				});
			})(),
			links: Array.from({ length: pc }, (_, i) => i + 1)
				.map(x => {
					u.searchParams.set("page", x);
					const c = interpolate(tt[0].content.cloneNode(true), {
						href: u.pathname + u.search,
						content: x
					});
					if (x === p)
						c.querySelector("a").classList.add("active");
					return c;
				}),
			nextLink: (() => {
				u.searchParams.set("page", p + 1);
				return interpolate(tt[0].content.cloneNode(true), {
					href: p < pc ? u.pathname + u.search : undefined,
					content: interpolate(tt[1].content.cloneNode(true), "arrow-right")
				});
			})(),
		}));
	}
}
