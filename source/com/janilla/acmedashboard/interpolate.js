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
		if (target.includes("${"))
			target = target.replace(/\$\{(.*?)\}/g, (_, p) => {
				let o = data;
				for (const n of p.split("."))
					if (o !== undefined)
						o = o[n];
					else
						break;
				return o?.toString() ?? "";
			});
	} else if (target instanceof Text) {
		if (target.nodeValue.includes("${"))
			target.nodeValue = interpolate(target.nodeValue, data);
	} else {
		if (target instanceof Element && target.hasAttributes())
			for (const a of target.attributes)
				if (a.value.includes("${"))
					a.value = interpolate(a.value, data);
		if (target.hasChildNodes)
			for (const n of target.childNodes)
				interpolate(n, data);
	}
	return target;
}
