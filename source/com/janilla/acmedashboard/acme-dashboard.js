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
import InvoicesPage from "./invoices-page.js";

const childTagNames = {
	"": "WELCOME-PAGE",
	"login": "LOGIN-PAGE",
	"dashboard": "DASHBOARD-LAYOUT"
};

export default class AcmeDashboard extends HTMLElement {

	constructor() {
		super();

		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("acme-dashboard-template");
		sr.appendChild(t.content.cloneNode(true));

		addEventListener("click", this.handleClick);
		addEventListener("popstate", this.handlePopstate);
	}

	async connectedCallback() {
		const p1 = location.pathname;
		const p2 = p1 === "/" ? (await (await fetch("/api/authentication")).json() ? "/dashboard" : "/") : p1;
		if (p2 !== p1) {
			history.pushState({}, "", p2);
			dispatchEvent(new CustomEvent("popstate"));
		} else
			this.update();
	}

	update() {
		const nn = location.pathname.split("/").filter(x => x.length);
		const tn = childTagNames[nn[0] ?? ""];
		[...this.children].forEach(x => {
			x.tagName === tn ? x.setAttribute("slot", "content") : x.removeAttribute("slot");
			if (x.tagName === "DASHBOARD-LAYOUT")
				x.tagName === tn ? x.setAttribute("content", nn[1] ?? "") : x.removeAttribute("content");
		});

		const p = [...this.querySelectorAll('[slot="content"]')].at(-1);
		if (p instanceof InvoicesPage) {
			const u = new URL(location.href);
			const q = u.searchParams.get("query");
			q ? p.setAttribute("query", q) : p.removeAttribute("query");
		}
	}

	handleClick = event => {
		console.log("AcmeDashboard.handleClick", event);
		const a = event.composedPath()[0].closest("a");
		if (!a)
			return;
		event.preventDefault();
		const u = new URL(a.href);
		history.pushState({}, "", u.pathname + u.search);
		dispatchEvent(new CustomEvent("popstate"));
	}

	handlePopstate = event => {
		console.log("AcmeDashboard.handlePopstate", event);
		this.update();
	}
}
