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

export default class Invoices extends Component {

	title = "Invoices";

	query = "";

	table = new Table();

	pagination = new Pagination();

	constructor() {
		super("Invoices");
	}

	get state() {
		return {
			query: this.query,
			items: this.table.items,
			page: this.pagination.page,
			pageCount: this.pagination.pageCount
		};
	}

	set state(x) {
		this.query = x.query;
		this.table.items = x.items;
		this.pagination.page = x.page;
		this.pagination.pageCount = x.pageCount;
	}

	listen() {
		if (!this.table.items)
			this.load().then(() => {
				this.table.refresh();
				this.pagination.refresh();
			});
		this.element.addEventListener("input", this.handleInput);
		this.element.addEventListener("submit", this.handleSubmit);
		this.element.addEventListener("pagechange", this.handlePagechange);
		this.pagination.listen();
	}

	async load() {
		const u = new URL("/api/invoices", location.href);
		if (this.query.length)
			u.searchParams.append("query", this.query);
		if (this.pagination.page !== 1)
			u.searchParams.append("page", this.pagination.page);
		const j = await (await fetch(u)).json();
		this.table.items = j.items;
		this.pagination.pageCount = Math.ceil(j.total / 6);
		history.replaceState(this.state, "");
	}

	async update() {
		const u = new URL(location.href);
		this.query.length ? u.searchParams.set("query", this.query) : u.searchParams.delete("query");
		this.pagination.page !== 1 ? u.searchParams.set("page", this.pagination.page) : u.searchParams.delete("page");
		history.pushState({}, "", u.href);
		await this.load();
		this.table.refresh();
		this.pagination.refresh();
	}

	handleInput = e => {
		if (typeof this.timeoutID === "number")
			clearTimeout(this.timeoutID);
		const q = e.target.value;
		this.timeoutID = setTimeout(async () => {
			this.timeoutID = undefined;
			this.query = q;
			this.pagination.page = 1;
			await this.update();
		}, 2000);
	}

	handleSubmit = async e => {
		e.preventDefault();
		const r = await fetch(`/api/invoices/${new FormData(e.target).get("id")}`, { method: "DELETE" });
		if (r.ok)
			await this.update();
		else {
			const t = await r.text();
			alert(t);
		}
	}

	handlePagechange = async () => {
		await this.update();
	}
}

const statuses = {
	"PAID": {
		className: "paid-status",
		icon: heroIcons["check"],
		text: "Paid"
	},
	"PENDING": {
		className: "pending-status",
		icon: heroIcons["clock"],
		text: "Pending"
	}
};

class Table extends Component {

	items;

	constructor() {
		super("Invoices");
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.items, '[type="number"]'], (_, o) => {
			o.template = "Invoices-TableRow";
		}) || re.match(['[key="status"]'], (_, o) => {
			o.value = statuses[o.value];
			o.template = "Invoices-TableStatus";
		});
	}
}

class Pagination extends Component {

	page = 1;

	pageCount;

	items;

	previousItem;

	nextItem;

	constructor() {
		super("Invoices");
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.previousItem], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		}) || re.match([this.items, '[type="number"]'], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		}) || re.match([this.nextItem], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		});
	}

	initRender() {
		const u = new URL(location.href);
		this.items = Array.from({ length: this.pageCount }, (_, i) => {
			const p = 1 + i;
			u.searchParams.set("page", p);
			return {
				content: p,
				url: p !== this.page ? u.pathname + u.search : undefined,
				active: p === this.page ? "active" : undefined
			};
		});
		u.searchParams.set("page", this.page - 1);
		this.previousItem = {
			content: heroIcons["arrow-left"],
			url: this.page !== 1 ? u.pathname + u.search : undefined
		};
		u.searchParams.set("page", this.page + 1);
		this.nextItem = {
			content: heroIcons["arrow-right"],
			url: this.page !== this.pageCount ? u.pathname + u.search : undefined
		};
	}

	listen() {
		this.element.addEventListener("click", this.handleClick);
	}

	handleClick = e => {
		const a = e.target.closest("a");
		if (!a)
			return;
		e.preventDefault();
		e.stopPropagation();
		const u = new URL(a.href);
		this.page = parseInt(u.searchParams.get("page"), 10);
		this.element.dispatchEvent(new CustomEvent("pagechange", { bubbles: true }));
	}
}
