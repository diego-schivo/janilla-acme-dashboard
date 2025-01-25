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
import { FlexibleElement } from "./flexible-element.js";

export default class RevenueChart extends FlexibleElement {

	static get templateName() {
		return "revenue-chart";
	}

	constructor() {
		super();
	}

	get state() {
		return this.closest("dashboard-page").state?.revenue;
	}

	set state(x) {
		this.closest("dashboard-page").state.revenue = x;
	}

	async updateDisplay() {
		// console.log("RevenueChart.updateDisplay");
		const s = this.state;
		var k = !s ? 0 : Math.ceil(Math.max(...s.map(x => x.revenue)) / 1000);
		this.appendChild(this.interpolateDom({
			$template: "",
			y: !s ? null : Array.from({ length: k + 1 }, (_, i) => ({
				$template: "y",
				y: `$${i}K`
			})),
			x: !s ? null : s.map(x => ({
				$template: "x",
				...x,
				style: `height: ${x.revenue / (1000 * k) * 100}%`
			}))
		}));
		if (this.closest("dashboard-page").slot && !this.state) {
			this.state = await (await fetch("/api/dashboard/revenue")).json();
			history.replaceState(this.closest("root-layout").state, "");
			this.requestUpdate();
		}
	}
}
