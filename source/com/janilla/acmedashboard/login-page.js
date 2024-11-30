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
import { buildInterpolator } from "./dom.js";
import { SlottableElement } from "./web-components.js";
import { loadTemplate } from "./utils.js";

export default class LoginPage extends SlottableElement {

	static get observedAttributes() {
		return ["slot"];
	}

	constructor() {
		super();
	}

	async connectedCallback() {
		// console.log("LoginPage.connectedCallback");
		super.connectedCallback();

		this.addEventListener("submit", this.handleSubmit);
	}

	async render() {
		console.log("LoginPage.render");

		this.interpolator ??= loadTemplate("login-page").then(t => {
			const c = t.content.cloneNode(true);
			return buildInterpolator(c);
		});
		const i = await this.interpolator;

		this.appendChild(i(this));
	}

	handleSubmit = async event => {
		console.log("LoginPage.handleSubmit", event);
		event.preventDefault();

		if (event.submitter.getAttribute("aria-disabled") === "true")
			return;
		event.submitter.setAttribute("aria-disabled", "true");

		try {
			const fd = new FormData(event.target);
			const u = await (await fetch("/api/authentication", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.fromEntries(fd))
			})).json();
			this.querySelector(".error").innerHTML = u ? "" : "Invalid credentials.";

			if (u) {
				history.pushState({}, "", "/dashboard");
				dispatchEvent(new CustomEvent("popstate"));
			}
		} finally {
			event.submitter.setAttribute("aria-disabled", "false");
		}
	}
}
