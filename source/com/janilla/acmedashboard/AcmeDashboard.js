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
import Customers from "./Customers.js";
import Home from "./Home.js";
import Dashboard, { Layout } from "./Dashboard.js";
import Invoice from "./Invoice.js";
import Invoices from "./Invoices.js";
import Login from "./Login.js";
import RenderEngine from "./RenderEngine.js";
import heroIcons from "./heroIcons.js";

const pages1 = {
	"/": () => new Home(),
	"/dashboard": () => new Dashboard(),
	"/dashboard/customers": () => new Customers(),
	"/dashboard/invoices": () => new Invoices(),
	"/dashboard/invoices/create": () => new Invoice(),
	"/login": () => new Login(),
};

const pages2 = new Map();
pages2.set(new RegExp("^/dashboard/invoices/(\\d+)/edit$"), x => new Invoice(parseInt(x, 10)));

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD"
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	year: "numeric",
});

export default class AcmeDashboard {

	renderEngine;

	icons = heroIcons;

	logo = new Logo();

	page;

	layout = new Layout();

	get content() {
		return this.page instanceof Home || this.page instanceof Login ? this.page : this.layout;
	}

	run = async () => {
		const u = new URL(location.href);
		let p = u.pathname;
		if (p === "/")
			p = await (await fetch("/api/authentication")).json() ? "/dashboard" : "/";
		this.page = this.createPage(p);
		document.title = [this.page.title, document.title.split(" | ").at(-1)].filter(x => x).join(" | ");
		const re = new RenderEngine(document.body.querySelectorAll("template"));
		document.body.innerHTML = await re.render({ value: this });
		this.listen();
		history.replaceState(this.page.state, "", p + u.search);
		document.addEventListener("click", this.handleClick);
		addEventListener("urlchange", this.handleUrlchange);
		addEventListener("popstate", this.handlePopstate);
	}

	render = async re => {
		const o = re.stack.at(-1);
		if (o.key === "amount" || o.key?.endsWith("Amount")) {
			o.value = currencyFormatter.format(o.value);
			return true;
		}
		if (o.key === "date" || o.key?.endsWith("Date")) {
			o.value = dateFormatter.format(new Date(o.value));
			return true;
		}
		return await re.match([this], (_, o) => {
			this.renderEngine = re.clone();
			o.template = "AcmeDashboard";
		});
	}

	listen = () => {
		if (this.content === this.layout)
			this.layout.listen();
		this.page.listen();
	}

	refreshPage = async p => {
		const l = this.content === this.layout;
		this.page = p;
		document.title = [this.page.title, document.title.split(" | ").at(-1)].filter(x => x).join(" | ");
		if (l && this.content === this.layout) {
			document.querySelector("main").innerHTML = await this.renderEngine.render({ value: this.page });
			this.page.listen();
		} else {
			const re = new RenderEngine();
			re.templates = this.renderEngine.templates;
			document.body.innerHTML = await re.render({ value: this });
			this.listen();
		}
	}

	createPage = (path) => {
		const p = path.length > 1 && path.endsWith("/") ? path.substring(0, path.length - 1) : path;
		const q = pages1[p];
		if (q)
			return q();
		for (const [k, v] of pages2) {
			const m = p.match(k);
			if (m)
				return v(...m.slice(1));
		}
		throw new Error();
	}

	handleClick = async e => {
		const a = e.target.closest("a");
		if (!a)
			return;
		e.preventDefault();
		dispatchEvent(new CustomEvent("urlchange", { detail: { url: new URL(a.href) } }));
	}

	handleUrlchange = async e => {
		const u = e.detail.url;
		history.pushState({}, "", u.pathname + u.search);
		await this.refreshPage(this.createPage(u.pathname));
		history.replaceState(this.page.state, "", u.pathname + u.search);
		dispatchEvent(new Event("popstate"));
	}

	handlePopstate = async e => {
		if (!e.state)
			return;
		const p = this.createPage(document.location.pathname);
		p.state = e.state;
		await this.refreshPage(p);
	}
}

class Logo {

	render = async re => {
		return await re.match([this], (_, o) => {
			o.template = "AcmeDashboard-Logo";
		});
	}
}
