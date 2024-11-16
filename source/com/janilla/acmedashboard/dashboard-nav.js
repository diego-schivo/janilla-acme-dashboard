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
export default class DashboardNav extends HTMLElement {

	constructor() {
		super();
		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("dashboard-nav-template");
		sr.appendChild(t.content.cloneNode(true));
		this.updateActive();
		sr.addEventListener("submit", this.handleSubmit);
	}

	connectedCallback() {
		addEventListener("popstate", this.handlePopstate);
	}

	updateActive() {
		this.shadowRoot.querySelectorAll("a").forEach(x => {
			const a = x.getAttribute("href") === document.location.pathname;
			x.parentElement.classList[a ? "add" : "remove"]("active");
		});
	}

	handlePopstate = () => {
		console.log("DashboardNav.handlePopstate");
		this.updateActive();
	}

	handleSubmit = async event => {
		console.log("DashboardNav.handleSubmit", event);
		event.preventDefault();
		await fetch("/api/authentication", { method: "DELETE" });
		history.pushState({}, "", "/login");
		dispatchEvent(new CustomEvent("popstate"));
	}
}
