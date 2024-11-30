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
import { loadTemplate } from "./utils.js";

export default class RevenueChart extends HTMLElement {

	constructor() {
		super();
	}

	get state() {
		return this.dashboardPage.state?.revenue;
	}

	set state(x) {
		if (x != null && !this.dashboardPage.state)
			this.dashboardPage.state = {};
		if (x != null || this.dashboardPage.state)
			this.dashboardPage.state.revenue = x;
	}

	connectedCallback() {
		// console.log("RevenueChart.connectedCallback");

		this.dashboardPage = this.closest("dashboard-page");
	}

	async update() {
		console.log("RevenueChart.update");

		if (!this.dashboardPage.slot)
			this.state = undefined;
		await this.render();
		if (!this.dashboardPage.slot || this.state)
			return;

		this.state = await (await fetch("/api/dashboard/revenue")).json();
		await this.render();
	}

	async render() {
		console.log("RevenueChart.render");

		this.interpolators ??= loadTemplate("revenue-chart").then(t => {
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			return [buildInterpolator(c), ...cc.map(x => buildInterpolator(x))];
		});
		const ii = await this.interpolators;

		const k = this.state?.length ? Math.ceil(Math.max(...this.state.map(x => x.revenue)) / 1000) : undefined;
		this.appendChild(ii[0]({
			y: Array.from({ length: k + 1 }, (_, i) => ii[1](`$${i}K`).cloneNode(true)),
			x: this.state?.flatMap(x => ii[2]({
				...x,
				style: `height: ${x.revenue / (1000 * k) * 100}%`,
			}).cloneNode(true))
		}));
	}
}
