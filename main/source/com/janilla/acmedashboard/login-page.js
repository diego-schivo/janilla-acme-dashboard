/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
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
import WebComponent from "./web-component.js";

export default class LoginPage extends WebComponent {

	static get observedAttributes() {
		return ["slot"];
	}

	static get templateNames() {
		return ["login-page"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener("submit", this.handleSubmit);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener("submit", this.handleSubmit);
	}

	handleSubmit = async event => {
		event.preventDefault();
		if (event.submitter.getAttribute("aria-disabled") === "true")
			return;
		event.submitter.setAttribute("aria-disabled", "true");
		try {
			const d = new FormData(event.target);
			const u = await (await fetch("/api/authentication", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.fromEntries(d))
			})).json();
			this.querySelector(".error").innerHTML = u ? "" : "Invalid credentials.";
			if (u) {
				history.pushState(this.closest("root-layout").state, "", "/dashboard");
				dispatchEvent(new CustomEvent("popstate"));
			}
		} finally {
			event.submitter.setAttribute("aria-disabled", "false");
		}
	}
}
