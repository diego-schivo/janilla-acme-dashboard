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
package com.janilla.acmedashboard.testing;

import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;

import javax.net.ssl.SSLContext;

import com.janilla.acmedashboard.fullstack.AcmeDashboardFullstack;
import com.janilla.http.HttpExchange;
import com.janilla.http.HttpHandler;
import com.janilla.http.HttpServer;
import com.janilla.java.Java;
import com.janilla.net.Net;
import com.janilla.reflect.ClassAndMethod;
import com.janilla.reflect.Factory;
import com.janilla.web.ApplicationHandlerFactory;
import com.janilla.web.Handle;
import com.janilla.web.NotFoundException;
import com.janilla.web.Render;

public class AcmeDashboardTesting {

	public static final AtomicReference<AcmeDashboardTesting> INSTANCE = new AtomicReference<>();

	public static void main(String[] args) {
		try {
			AcmeDashboardTesting a;
			{
				var f = new Factory(Java.getPackageClasses("com.janilla.acmedashboard.testing"),
						AcmeDashboardTesting.INSTANCE::get);
				a = f.create(AcmeDashboardTesting.class,
						Java.hashMap("factory", f, "configurationFile", args.length > 0 ? args[0] : null));
			}

			HttpServer s;
			{
				SSLContext c;
				try (var x = Net.class.getResourceAsStream("testkeys")) {
					c = Net.getSSLContext(Map.entry("JKS", x), "passphrase".toCharArray());
				}
				var p = Integer.parseInt(a.configuration.getProperty("acme-dashboard.server.port"));
				s = a.factory.create(HttpServer.class,
						Map.of("sslContext", c, "endpoint", new InetSocketAddress(p), "handler", a.handler));
			}
			s.serve();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	protected final Properties configuration;

	protected final Factory factory;

	protected final AcmeDashboardFullstack fullstack;

	protected final HttpHandler handler;

	public AcmeDashboardTesting(Factory factory, String configurationFile) {
		this.factory = factory;
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
		configuration = factory.create(Properties.class, Collections.singletonMap("file", configurationFile));
		fullstack = factory.create(AcmeDashboardFullstack.class,
				Map.of("factory", new Factory(Java.getPackageClasses("com.janilla.acmedashboard.fullstack"),
						AcmeDashboardFullstack.INSTANCE::get)));

		{
			var f = factory.create(ApplicationHandlerFactory.class, Map.of("methods",
					types().stream().flatMap(x -> Arrays.stream(x.getMethods()).map(y -> new ClassAndMethod(x, y)))
							.toList(),
					"files", Stream.of("com.janilla.frontend", AcmeDashboardTesting.class.getPackageName())
							.flatMap(x -> Java.getPackagePaths(x).stream().filter(Files::isRegularFile)).toList()));
			handler = x -> {
				var ex = (HttpExchange) x;
//				IO.println(
//						"AcmeDashboardTest, " + ex.request().getPath() + ", Test.ongoing=" + Test.ongoing.get());
				var h2 = Test.ONGOING.get() && !ex.request().getPath().startsWith("/test/") ? fullstack.handler()
						: (HttpHandler) y -> {
							var h = f.createHandler(Objects.requireNonNullElse(y.exception(), y.request()));
							if (h == null)
								throw new NotFoundException(y.request().getMethod() + " " + y.request().getTarget());
							return h.handle(y);
						};
				return h2.handle(ex);
			};
		}
	}

	@Handle(method = "GET", path = "/")
	public Index root() {
		return new Index();
	}

	public Properties configuration() {
		return configuration;
	}

	public Factory factory() {
		return factory;
	}

	public AcmeDashboardFullstack fullstack() {
		return fullstack;
	}

	public HttpHandler handler() {
		return handler;
	}

	public Collection<Class<?>> types() {
		return factory.types();
	}

	@Render(template = "index.html")
	public record Index() {
	}
}
