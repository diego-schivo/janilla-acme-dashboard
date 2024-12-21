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
import { FlexibleElement } from "./flexible-element.js";

export default class PaginationNav extends FlexibleElement {

	static get observedAttributes() {
		return ["data-href", "data-page", "data-page-count"];
	}

	static get templateName() {
		return "pagination-nav";
	}

	constructor() {
		super();
	}

	async updateDisplay() {
		// console.log("PaginationNav.updateDisplay");
		await super.updateDisplay();
		this.interpolate ??= this.createInterpolateDom();
		const pc = this.dataset.pageCount ? parseInt(this.dataset.pageCount) : 0;
		if (this.links?.length !== pc + 2) {
			this.links = pc > 1 ? Array.from({ length: pc + 2 }, () => this.createInterpolateDom("link")) : undefined;
			this.linkContents = this.links?.map((_, i) => this.createInterpolateDom(i > 0 && i < pc + 1 ? "text" : "icon"));
		}
		const u = new URL(this.dataset.href, location.href);
		const p = this.dataset.page ? parseInt(this.dataset.page) : 1;
		this.appendChild(this.interpolate({
			links: this.links ? [(() => {
				u.searchParams.set("page", p - 1);
				return {
					href: p > 1 ? u.pathname + u.search : undefined,
					content: this.linkContents[0]("arrow-left")
				};
			})(), ...Array.from({ length: pc }, (_, i) => i + 1)
				.map((x, i) => {
					u.searchParams.set("page", x);
					return {
						href: u.pathname + u.search,
						class: x === p ? "active" : "",
						content: this.linkContents[i + 1](x)
					};
				}), (() => {
					u.searchParams.set("page", p + 1);
					return {
						href: p < pc ? u.pathname + u.search : undefined,
						content: this.linkContents[pc + 1]("arrow-right")
					};
				})()].map((x, i) => this.links[i](x)) : undefined
		}));
	}
}
