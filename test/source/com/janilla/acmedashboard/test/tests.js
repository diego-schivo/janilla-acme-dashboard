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
import { matchNode } from "./dom-utils.js";

const delay = () => new Promise(x => setTimeout(x, 10));

const untilFormControl = placeholder => async context => await matchNode(`//*[contains(@placeholder,"${placeholder}")]`, context, false);

const untilElement = (tag, text) => async context => await matchNode(`//text()[contains(.,"${text}")]/ancestor::${tag}`, context, false);

const whileElement = (tag, text) => async context => await matchNode(`//text()[contains(.,"${text}")]/ancestor::${tag}`, context, true);

const login = (email, password) => {
	return async content => {
		const b = content.body;
		(await untilElement("a", "Log in")(b)).click();
		await delay();
		(await untilFormControl("email")(b)).value = email;
		await delay();
		(await untilFormControl("password")(b)).value = password;
		await delay();
		(await untilElement("button", "Log in")(b)).click();
	};
}

const loginUser = async content => {
	await login("user@nextmail.com", "123456")(content);
	await delay();
	await untilElement("button", "Sign Out")(content.body);
}

export default {
	"Login user": loginUser
};
