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
import Dashboard from "./Dashboard.js";
import Invoice from "./Invoice.js";
import Invoices from "./Invoices.js";
import RenderEngine from "./RenderEngine.js";
import heroIcons from "./heroIcons.js";

const foo1 = {
	"/dashboard": () => new Dashboard(),
	"/dashboard/customers": () => new Customers(),
	"/dashboard/invoices": () => new Invoices(),
	"/dashboard/invoices/create": () => new Invoice(),
};

const foo2 = new Map();
foo2.set(new RegExp("^/dashboard/invoices/(\\d+)/edit$"), x => new Invoice(parseInt(x, 10)));

export default class AcmeDashboard {

	content = new Content();

	run = async () => {
		const u = new URL(location.href);
		const p = u.pathname;
		this.content.page = this.createPage(p);
		document.body.innerHTML = await new RenderEngine().render({ value: this.content });
		this.content.listen();
		history.replaceState(this.content.page.state, "", p + u.search);
		document.addEventListener("click", this.handleClick);
		addEventListener("urlchange", this.handleUrlchange);
		addEventListener("popstate", this.handlePopstate);
	}

	createPage = (path) => {
		const f = foo1[path];
		if (f)
			return f();
		for (const [k, v] of foo2) {
			const m = path.match(k);
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
		await this.content.refreshPage(this.createPage(u.pathname));
		history.replaceState(this.content.page.state, "", u.pathname + u.search);
		dispatchEvent(new Event("popstate"));
	}

	handlePopstate = async e => {
		if (!e.state)
			return;
		const p = this.createPage(document.location.pathname);
		p.state = e.state;
		await this.content.refreshPage(p);
	}
}

class Content {

	renderEngine;

	icons = heroIcons;

	nav = new Nav();

	logo = new Logo();

	page;

	currencyFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	});

	dateFormatter = new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	render = async re => {
		return await re.match([this], (_, o) => {
			this.renderEngine = re.clone();
			o.template = "AcmeDashboard-Content";
		}) || await re.match(["amount"], (_, o) => {
			o.value = this.currencyFormatter.format(o.value);
		}) || await re.match(["pendingAmount"], (_, o) => {
			o.value = this.currencyFormatter.format(o.value);
		}) || await re.match(["paidAmount"], (_, o) => {
			o.value = this.currencyFormatter.format(o.value);
		}) || await re.match(["date"], (_, o) => {
			o.value = this.dateFormatter.format(new Date(o.value));
		});
	}

	listen = () => {
		this.nav.listen();
		this.page.listen();
	}

	refreshPage = async p => {
		this.page = p;
		document.querySelector("main").innerHTML = await this.renderEngine.render({ value: this.page });
		this.page.listen();
	}
}

class Nav {

	links = [
		{ path: "/dashboard", text: "Home", icon: "home" },
		{ path: "/dashboard/invoices", text: "Invoices", icon: "document-duplicate" },
		{ path: "/dashboard/customers", text: "Customers", icon: "user-group" },
	];

	render = async re => {
		return await re.match([this], (_, o) => {
			o.template = "AcmeDashboard-Nav";
		}) || await re.match([this, "links", "number"], (_, o) => {
			o.template = "AcmeDashboard-NavLink";
		}) || await re.match([this, "links", "number", "icon"], (_, o) => {
			o.value = heroIcons[o.value];
		});
	}

	listen = () => {
		this.handlePopstate();
		addEventListener("popstate", this.handlePopstate);
	}

	handlePopstate = () => {
		document.querySelectorAll("#Nav a").forEach(x => x.parentElement.classList[x.getAttribute("href") === document.location.pathname ? "add" : "remove"]("active"));
	}
}

class Logo {

	render = async re => {
		return await re.match([this], (_, o) => {
			o.template = "AcmeDashboard-Logo";
		});
	}
}
