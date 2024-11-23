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

export default class DashboardInvoices extends HTMLElement {

	constructor() {
		super();
	}

	get state() {
		return this.dashboardPage.state?.invoices;
	}

	set state(x) {
		if (x != null && !this.dashboardPage.state)
			this.dashboardPage.state = {};
		if (x != null || this.dashboardPage.state)
			this.dashboardPage.state.invoices = x;
	}

	connectedCallback() {
		// console.log("DashboardInvoices.connectedCallback");

		this.dashboardPage = this.closest("dashboard-page");
	}

	async update() {
		console.log("DashboardInvoices.update");

		if (!this.dashboardPage.slot)
			this.state = undefined;
		await this.render();
		if (!this.dashboardPage.slot || this.state)
			return;

		this.state = await (await fetch("/api/dashboard/invoices")).json();
		await this.render();
	}

	async render() {
		console.log("DashboardInvoices.render");

		if (!this.interpolate) {
			const c = (await loadTemplate("dashboard-invoices")).content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			this.interpolate = [compileNode(c), compileNode(cc[0]), compileNode(cc[1])];
		}

		this.appendChild(this.interpolate[0]({
			content: !this.state
				? Array.from({ length: 6 }).map(_ => this.interpolate[1]().cloneNode(true))
				: this.state.map(x => this.interpolate[2](x).cloneNode(true))
		}));
	}
}
