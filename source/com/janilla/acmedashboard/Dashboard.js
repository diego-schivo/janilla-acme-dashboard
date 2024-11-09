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
import Component from "./Component.js";
import heroIcons from "./heroIcons.js";

export class Layout extends Component {

	nav = new Nav();

	constructor() {
		super("Dashboard");
	}

	listen() {
		this.nav.listen();
	}
}

class Nav extends Component {

	links = [
		{ path: "/dashboard", text: "Home", icon: "home" },
		{ path: "/dashboard/invoices", text: "Invoices", icon: "document-duplicate" },
		{ path: "/dashboard/customers", text: "Customers", icon: "user-group" },
	];

	constructor() {
		super("Dashboard");
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.links, '[type="number"]'], (_, o) => {
			o.template = "Dashboard-NavLink";
		});
	}

	listen() {
		this.handlePopstate();
		addEventListener("popstate", this.handlePopstate);
		this.element.addEventListener("submit", this.handleSubmit);
	}

	handlePopstate = () => {
		this.element.querySelectorAll("a").forEach(x => {
			const a = x.getAttribute("href") === document.location.pathname;
			x.parentElement.classList[a ? "add" : "remove"]("active");
		});
	}

	handleSubmit = async e => {
		e.preventDefault();
		await fetch("/api/authentication", { method: "DELETE" });
		dispatchEvent(new CustomEvent("urlchange", { detail: { url: new URL("/login", location.href) } }));
	}
}

export default class Dashboard extends Component {

	data;

	cards;

	revenueChart;

	invoices;

	constructor() {
		super("Dashboard");
	}

	get state() {
		return this.data;
	}

	set state(x) {
		this.data = x;
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.invoices, '[type="number"]'], (_, o) => {
			o.template = "Dashboard-Invoice";
		});
	}

	initRender() {
		if (this.data) {
			this.cards = [
				new Card("collected", "Collected", this.data.paidAmount),
				new Card("pending", "Pending", this.data.pendingAmount),
				new Card("invoices", "Total Invoices", this.data.invoiceCount),
				new Card("customers", "Total Customers", this.data.customerCount)
			];
			this.revenueChart = new Chart(this.data.revenue.map(x => ({ label: x.month, value: x.revenue })));
			this.invoices = this.data.invoices;
		}
	}

	listen() {
		if (!this.data)
			this.load().then(() => this.refresh());
		else if (!this.cards)
			this.refresh();
	}

	async load() {
		this.data = await (await fetch("/api/dashboard")).json();
		history.replaceState(this.state, "");
	}
}

class Card extends Component {

	type;

	title;

	value;

	constructor(type, title, value) {
		super("Dashboard");
		this.type = type;
		this.title = title;
		this.value = value;
	}

	tryRender(re) {
		return super.tryRender(re) || re.match(['[key="icon"]'], (_, o) => {
			o.value = heroIcons[{
				collected: "banknotes",
				pending: "clock",
				invoices: "inbox",
				customers: "user-group"
			}[this.type]];
		});
	}
}

class Chart extends Component {

	yLabels;

	bars;

	constructor(items) {
		super("Dashboard");
		var k = Math.ceil(Math.max(...items.map(x => x.value)) / 1000);
		this.yLabels = Array.from({ length: 1 + k }, (_, i) => `$${i}K`).reverse();
		this.bars = items.map(x => ({ height100: x.value / (1000 * k) * 100, xLabel: x.label }));
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.yLabels, '[type="number"]'], (_, o) => {
			o.template = "Dashboard-ChartYLabel";
		}) || re.match([this.bars, '[type="number"]'], (_, o) => {
			o.template = "Dashboard-ChartBar";
		});
	}
}
