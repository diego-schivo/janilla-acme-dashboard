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
import { compileNode, loadTemplate } from "./utils.js";

export default class BreadcrumbNav extends HTMLElement {

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	async connectedCallback() {
		// console.log("BreadcrumbNav.connectedCallback");

		const t = await loadTemplate("breadcrumb-nav");
		const c = t.content.cloneNode(true);
		const cc = [...c.querySelectorAll("template")].map(x => x.content);
		this.interpolate = [compileNode(cc[0]), compileNode(cc[1]), compileNode(cc[2])];

		this.shadowRoot.appendChild(c);

		if (!this.hasChildNodes())
			return;

		const dd = [...this.children];
		this.appendChild(this.interpolate[0](dd.map((x, i) => this.interpolate[i === dd.length - 1 ? 2 : 1](x).cloneNode(true))));
	}
}
