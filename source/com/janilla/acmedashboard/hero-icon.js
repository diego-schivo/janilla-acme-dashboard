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
import { removeAllChildren } from "./dom-utils.js";

const documents = {};
const parser = new DOMParser();

export default class HeroIcon extends WebComponent {

	static get observedAttributes() {
		return ["data-name"];
	}

	constructor() {
		super();
	}

	async updateDisplay() {
		// console.log("HeroIcon.updateDisplay");
		if (this.dataset.name === this.name)
			return;
		this.name = this.dataset.name;
		removeAllChildren(this);
		if (!this.name)
			return;
		documents[this.name] ??= fetch(`/images/heroicons/${this.name}.svg`).then(x => x.text()).then(x => {
			x = x.replace("#0F172A", "currentColor");
			return parser.parseFromString(x, "image/svg+xml");
		});
		const d = await documents[this.name];
		this.appendChild(d.firstChild.cloneNode(true));
	}
}
