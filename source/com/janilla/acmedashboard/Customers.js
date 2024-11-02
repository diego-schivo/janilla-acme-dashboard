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
export default class Customers {

	title = "Customers";

	query = "";

	table = new Table();

	get state() {
		return {
			query: this.query,
			items: this.table.items
		};
	}

	set state(x) {
		this.query = x.query;
		this.table.items = x.items;
	}

	render = async re => {
		return await re.match([this], async (_, o) => {
			await this.load();
			o.template = "Customers";
		});
	}

	listen = () => {
		const e = document.querySelector(".Customers");
		e.addEventListener("input", this.handleInput);
	}

	load = async () => {
		const u = new URL("/api/customers", location.href);
		if (this.query.length)
			u.searchParams.append("query", this.query);
		this.table.items = await (await fetch(u)).json();
	}

	handleInput = e => {
		if (typeof this.timeoutID === "number")
			clearTimeout(this.timeoutID);
		const q = e.target.value;
		this.timeoutID = setTimeout(async () => {
			this.timeoutID = undefined;
			this.query = q;
			await this.update();
		}, 2000);
	}

	update = async () => {
		const u = new URL(location.href);
		this.query.length ? u.searchParams.set("query", this.query) : u.searchParams.delete("query");
		history.pushState({}, "", u.href);
		await this.load();
		await this.table.refresh();
		history.replaceState(this.state, "", u.href);
	}
}

class Table {

	renderEngine;

	items;

	render = async re => {
		return await re.match([this], async (_, o) => {
			this.renderEngine = re.clone();
			o.template = "Customers-Table";
		}) || await re.match([this.items, "number"], (_, o) => {
			o.template = "Customers-TableRow";
		});
	}

	refresh = async () => {
		document.querySelector(".Customers .Table").outerHTML = await this.renderEngine.render({ value: this });
	}
}
