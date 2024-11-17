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
export default function interpolate(target, data) {
	if (typeof target === "string") {
		if (target.includes("${")) {
			const re = /\$\{(.*?)\}/g;
			let a, i = 0, t = [];
			while ((a = re.exec(target)) !== null) {
				if (a.index > i)
					t.push(target.substring(i, a.index));
				let o = data;
				for (const n of a[1].split("."))
					if (o != null && n)
						o = o[n];
					else
						break;
				if (o != null)
					t.push(o);
				i = re.lastIndex;
			}
			if (i < target.length)
				t.push(target.substring(i));
			target = !t.length ? undefined : t.every(x => typeof x === "string") ? t.join("") : t;
		}
	} else if (target instanceof Text) {
		if (target.nodeValue.includes("${")) {
			const r = interpolate(target.nodeValue, data);
			if (typeof r === "string")
				target.nodeValue = r;
			else {
				const t = r.map(x => typeof x === "string" ? new Text(x) : x);
				target.replaceWith(...t);
				target = t;
			}
		}
	} else if (target instanceof Comment) {
		// Array.isArray(data) ? target.replaceWith(...data) : target.replaceWith(data);
		if (target.nodeValue.includes("${")) {
			const r = interpolate(target.nodeValue, data);
			if (typeof r === "string")
				target.nodeValue = r;
			else {
				const t = r.map(x => typeof x === "string" ? new Comment(x) : x);
				target.replaceWith(...t);
				target = t;
			}
		}
	} else {
		if (target instanceof Element && target.hasAttributes())
			for (const a of target.attributes)
				if (a.value.includes("${")) {
					const r = interpolate(a.value, data);
					if (typeof r !== "undefined")
						a.value = r;
					else
						target.removeAttribute(a.name);
				}
		if (target.hasChildNodes())
			for (const n of target.childNodes)
				interpolate(n, data);
	}
	return target;
}
