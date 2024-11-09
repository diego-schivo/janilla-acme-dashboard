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

export default class Customers extends Component {

	title = "Customers";

	query = "";

	table = new Table();

	constructor() {
		super("Customers");
	}

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

	listen() {
		if (!this.table.items)
			this.load().then(() => this.table.refresh());
		this.element.addEventListener("input", this.handleInput);
	}

	async load() {
		const u = new URL("/api/customers", location.href);
		if (this.query.length)
			u.searchParams.append("query", this.query);
		this.table.items = await (await fetch(u)).json();
		history.replaceState(this.state, "");
	}

	async update() {
		const u = new URL(location.href);
		this.query.length ? u.searchParams.set("query", this.query) : u.searchParams.delete("query");
		history.pushState({}, "", u.href);
		await this.load();
		this.table.refresh();
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
}

class Table extends Component {

	items;

	constructor() {
		super("Customers");
	}

	tryRender(re) {
		return super.tryRender(re) || re.match([this.items, '[type="number"]'], (_, o) => {
			o.template = "Customers-TableRow";
		});
	}
}
