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
import heroIcons from "./heroIcons.js";

export default class Dashboard {

	data;

	cards;

	revenueChart;

	invoices;

	get state() {
		return this.data;
	}

	set state(x) {
		this.data = x;
	}

	render = async re => {
		return await re.match([this], async (_, o) => {
			o.template = "Dashboard";
			if (!this.data)
				this.data = await (await fetch("/api/dashboard")).json();
			if (!this.cards)
				this.cards = [
					new Card("collected", "Collected", this.data.paidAmount),
					new Card("pending", "Pending", this.data.pendingAmount),
					new Card("invoices", "Total Invoices", this.data.invoiceCount),
					new Card("customers", "Total Customers", this.data.customerCount)
				];
			if (!this.revenueChart)
				this.revenueChart = new Chart(this.data.revenues.map(x => ({ label: x.month, value: x.revenue })));
			if (!this.invoices)
				this.invoices = this.data.invoices;
		}) || await re.match([this, "invoices", "number"], (_, o) => {
			o.template = "Dashboard-Invoice";
		});
	}

	listen = () => {
	}
}

class Card {

	type;

	title;

	value;

	constructor(type, title, value) {
		this.type = type;
		this.title = title;
		this.value = value;
	}

	render = async re => {
		return await re.match([this], (_, o) => {
			o.template = "Dashboard-Card";
		}) || await re.match([this, "icon"], (_, o) => {
			o.value = heroIcons[{
				collected: "banknotes",
				pending: "clock",
				invoices: "inbox",
				customers: "user-group"
			}[this.type]];
		});
	}
}

class Chart {

	yLabels;

	bars;

	constructor(items) {
		var k = Math.ceil(Math.max(...items.map(x => x.value)) / 1000);
		this.yLabels = Array.from({ length: 1 + k }, (_, i) => `$${i}K`).reverse();
		this.bars = items.map(x => ({ percentage: x.value / (1000 * k) * 100, xLabel: x.label }));
	}

	render = async re => {
		return await re.match([this], (_, o) => {
			o.template = "Dashboard-Chart";
		}) || await re.match([this, "yLabels", "number"], (_, o) => {
			o.template = "Dashboard-ChartYLabel";
		}) || await re.match([this, "bars", "number"], (_, o) => {
			o.template = "Dashboard-ChartBar";
		});
	}
}
