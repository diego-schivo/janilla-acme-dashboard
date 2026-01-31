/*
 * MIT License
 *
 * Copyright (c) 2024 Vercel, Inc.
 * Copyright (c) 2024-2026 Diego Schivo
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

export default class RevenueChart extends WebComponent {

	static get templateNames() {
		return ["revenue-chart"];
	}

	constructor() {
		super();
	}

	async updateDisplay() {
		const d = this.closest("dashboard-page");
		const s = history.state;
		var k = d.slot && s.revenue ? Math.ceil(Math.max(...s.revenue.map(x => x.revenue)) / 1000) : 0;
		this.appendChild(this.interpolateDom({
			$template: "",
			y: d.slot && s.revenue ? Array.from({ length: k + 1 }, (_, i) => ({
				$template: "y",
				y: `$${i}K`
			})) : null,
			x: d.slot && s.revenue ? s.revenue.map(x => ({
				$template: "x",
				...x,
				style: `height: ${x.revenue / (1000 * k) * 100}%`
			})) : null
		}));
		if (d.slot && !s.revenue) {
			const a = this.closest("root-layout");
			fetch(`${a.dataset.apiUrl}/dashboard/revenue`, { credentials: "include" }).then(x => x.json()).then(x => {
				history.replaceState({
					...history.state,
					revenue: x
				}, "");
				this.requestDisplay();
			});
		}
	}
}
