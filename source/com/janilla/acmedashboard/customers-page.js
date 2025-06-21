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
import WebComponent from "./web-component.js";

export default class CustomersPage extends WebComponent {

	static get observedAttributes() {
		return ["data-query", "slot"];
	}

	static get templateNames() {
		return ["customers-page"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("input", this.handleInput);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("input", this.handleInput);
	}

	handleInput = event => {
		if (typeof this.inputTimeout === "number")
			clearTimeout(this.inputTimeout);
		const q = event.target.value;
		this.inputTimeout = setTimeout(() => {
			this.inputTimeout = undefined;
			const u = new URL(location.href);
			const q0 = u.searchParams.get("query");
			if (q)
				u.searchParams.set("query", q);
			else
				u.searchParams.delete("query");
			if (q0)
				history.replaceState(undefined, "", u.pathname + u.search);
			else
				history.pushState(undefined, "", u.pathname + u.search);
			dispatchEvent(new CustomEvent("popstate"));
		}, 1000);
	}

	async updateDisplay() {
		const s = history.state;
		this.appendChild(this.interpolateDom({
			$template: "",
			...this.dataset,
			articles: this.slot && s ? s.map(x => ({
				$template: "article",
				...x
			})) : Array.from({ length: 6 }).map(() => ({ $template: "article-skeleton" })),
			rows: this.slot && s ? s.map(x => ({
				$template: "row",
				...x
			})) : Array.from({ length: 6 }).map(() => ({ $template: "row-skeleton" }))
		}));
		if (this.slot && !s) {
			const u = new URL("/api/customers", location.href);
			if (this.dataset.query)
				u.searchParams.append("query", this.dataset.query);
			fetch(u.pathname + u.search).then(x => x.json()).then(x => {
				history.replaceState(x, "");
				this.requestDisplay();
			});
		}
	}
}
