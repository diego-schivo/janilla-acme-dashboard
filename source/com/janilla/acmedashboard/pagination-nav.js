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
		return ["data-href", "data-page", "data-page-count", "slot"];
	}

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("pagination-nav-template");
		sr.appendChild(t.content.cloneNode(true));
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log("PaginationNav.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue === oldValue)
			return;

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);
		this.updateTimeout = setTimeout(() => {
			this.updateTimeout = undefined;
			this.update();
		}, 1);
	}

	update() {
		console.log("PaginationNav.update");

		const n = this.shadowRoot.querySelector("nav");
		n.innerHTML = "";

		const pc = this.dataset.pageCount ? parseInt(this.dataset.pageCount, 10) : 0;
		if (pc <= 1)
			return;

		const u = new URL(this.dataset.href, location.href);
		const tt = this.shadowRoot.querySelectorAll("template");
		n.append(...Array.from({ length: pc }, (_, i) => i + 1)
			.map(x => {
				u.searchParams.set("page", x);
				return {
					href: u.pathname + u.search,
					content: x
				};
			})
			.map(x => interpolate(tt[0].content.cloneNode(true), x)));
		const p = this.dataset.page ? parseInt(this.dataset.page, 10) : 1;
		n.children[p - 1].classList.add("active");

		u.searchParams.set("page", p - 1);
		n.prepend(interpolate(tt[0].content.cloneNode(true), {
			href: p > 1 ? u.pathname + u.search : undefined,
			content: interpolate(tt[1].content.cloneNode(true), "arrow-left")
		}));
		u.searchParams.set("page", p + 1);
		n.append(interpolate(tt[0].content.cloneNode(true), {
			href: p < pc ? u.pathname + u.search : undefined,
			content: interpolate(tt[1].content.cloneNode(true), "arrow-right")
		}));
	}
}
