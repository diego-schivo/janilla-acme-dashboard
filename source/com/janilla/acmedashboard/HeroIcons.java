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
package com.janilla.acmedashboard;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.Map;

import com.janilla.io.IO;
import com.janilla.json.Json;
import com.janilla.web.Handle;
import com.janilla.web.Render;

public class HeroIcons {

	private static Map<String, String> map;

	static {
		var l = Thread.currentThread().getContextClassLoader();
		URI u;
		try {
			u = l.getResource(HeroIcons.class.getPackageName().replace('.', '/') + "/images.zip").toURI();
		} catch (URISyntaxException g) {
			throw new RuntimeException(g);
		}
		var v = u.toString();
		if (!v.startsWith("jar:"))
			u = URI.create("jar:" + v);
		try {
			var t = IO.zipFileSystem(u);
			map = new HashMap<>();
			Files.walkFileTree(t.getPath("/heroicons"), new SimpleFileVisitor<>() {

				@Override
				public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
					var n = file.getFileName().toString();
					if (n.endsWith(".svg"))
						map.put(n.substring(0, n.length() - ".svg".length()),
								Files.readString(file).replace("#0F172A", "currentColor"));
					return FileVisitResult.CONTINUE;
				}
			});
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}

	@Handle(method = "GET", path = "/heroIcons.js")
	public Script getScript() {
		return new Script(Json.format(map));
	}

	@Render("""
			export default ${json};
			""")
	public record Script(String json) {
	}
}
