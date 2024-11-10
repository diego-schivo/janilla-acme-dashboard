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
export default class RevenueChart extends HTMLElement {

	static get observedAttributes() {
		return ["k"];
	}

	constructor() {
		super();
		const sr = this.attachShadow({ mode: "open" });
		const df = document.getElementById("revenue-chart-template").content.cloneNode(true);
		sr.appendChild(df);
	}

	attributeChangedCallback(name, _, newValue) {
		if (name === "k") {
			const y = this.shadowRoot.querySelector(".y");
			y.innerHTML = "";
			y.append(...Array.from({ length: parseInt(newValue, 10) + 1 }, (_, i) => {
				const p = document.createElement("p");
				p.textContent = `$${i}K`;
				return p;
			}));
		}
	}
}
