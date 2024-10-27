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

export default class Invoices {

	query = "";

	table = new Table();

	pagination = new Pagination();

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

	render = async re => {
		return await re.match([this], async (_, o) => {
			await this.load();
			o.template = "Invoices";
		});
	}

	listen = () => {
		const e = document.querySelector(".Invoices");
		e.addEventListener("input", this.handleInput);
		e.addEventListener("submit", this.handleSubmit);
		e.addEventListener("pagechange", this.handlePagechange);
		this.pagination.listen();
	}

	load = async () => {
		const u = new URL("/api/invoices", location.href);
		if (this.query.length)
			u.searchParams.append("query", this.query);
		if (this.pagination.page !== 1)
			u.searchParams.append("page", this.pagination.page);
		const j = await (await fetch(u)).json();
		this.table.items = j.items;
		this.pagination.pageCount = Math.ceil(j.total / 6);
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
		await fetch(`/api/invoices/${new FormData(e.target).get("id")}`, { method: "DELETE" });
		await this.update();
	}

	handlePagechange = async () => {
		await this.update();
	}

	update = async () => {
		const u = new URL(location.href);
		this.query.length ? u.searchParams.set("query", this.query) : u.searchParams.delete("query");
		this.pagination.page !== 1 ? u.searchParams.set("page", this.pagination.page) : u.searchParams.delete("page");
		history.pushState({}, "", u.href);
		await this.load();
		await this.table.refresh();
		await this.pagination.refresh();
		history.replaceState(this.state, "", u.href);
	}
}

const foo = {
	"PAID": {
		className: "status-paid",
		icon: heroIcons["check"],
		text: "Paid"
	},
	"PENDING": {
		className: "status-pending",
		icon: heroIcons["clock"],
		text: "Pending"
	}
};

class Table {

	renderEngine;

	items;

	render = async re => {
		return await re.match([this], async (_, o) => {
			this.renderEngine = re.clone();
			o.template = "Invoices-Table";
		}) || await re.match([this.items, "number"], (_, o) => {
			o.template = "Invoices-TableRow";
		}) || await re.match(["status"], (_, o) => {
			o.value = foo[o.value];
			o.template = "Invoices-TableStatus";
		});
	}

	refresh = async () => {
		document.querySelector(".Invoices .Table").outerHTML = await this.renderEngine.render({ value: this });
	}
}

class Pagination {

	page = 1;

	pageCount;

	renderEngine;

	items;

	previousItem;

	nextItem;

	element;

	render = async re => {
		return await re.match([this], (_, o) => {
			this.renderEngine = re.clone();
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
			o.template = "Invoices-Pagination";
		}) || await re.match([this.items, "number"], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		}) || await re.match([this.previousItem], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		}) || await re.match([this.nextItem], (_, o) => {
			o.template = o.value.url ? "Invoices-PaginationLink" : "Invoices-PaginationItem";
		});
	}

	listen = () => {
		this.element = document.querySelector(".Invoices .Pagination");
		this.element.addEventListener("click", this.handleClick);
	}

	refresh = async () => {
		this.element.outerHTML = await this.renderEngine.render({ value: this });
		this.listen();
	}

	handleClick = async e => {
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
