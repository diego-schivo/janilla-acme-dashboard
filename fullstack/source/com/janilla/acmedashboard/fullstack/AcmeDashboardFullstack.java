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
package com.janilla.acmedashboard.fullstack;

import java.net.InetSocketAddress;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Stream;

import javax.net.ssl.SSLContext;

import com.janilla.acmedashboard.backend.AcmeDashboardBackend;
import com.janilla.acmedashboard.base.Configuration;
import com.janilla.acmedashboard.frontend.AcmeDashboardFrontend;
import com.janilla.http.HttpHandler;
import com.janilla.http.HttpRequest;
import com.janilla.http.HttpServer;
import com.janilla.java.Java;
import com.janilla.net.Net;
import com.janilla.reflect.Factory;

public class AcmeDashboardFullstack {

	public static final AtomicReference<AcmeDashboardFullstack> INSTANCE = new AtomicReference<>();

	public static void main(String[] args) {
		try {
			AcmeDashboardFullstack a;
			{
				var f = new Factory(Java.getPackageClasses("com.janilla.acmedashboard.fullstack"),
						AcmeDashboardFullstack.INSTANCE::get);
				a = f.create(AcmeDashboardFullstack.class,
						Java.hashMap("factory", f, "configurationFile", args.length > 0 ? args[0] : null));
			}

			HttpServer s;
			{
				SSLContext c;
				try (var x = Net.class.getResourceAsStream("testkeys")) {
					c = Net.getSSLContext(Map.entry("JKS", x), "passphrase".toCharArray());
				}
				var p = Integer.parseInt(a.configuration.getProperty("acme-dashboard.fullstack.server.port"));
				s = a.factory.create(HttpServer.class,
						Map.of("sslContext", c, "endpoint", new InetSocketAddress(p), "handler", a.handler));
			}
			s.serve();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	protected final AcmeDashboardBackend backend;

	protected final Configuration configuration;

	protected final Factory factory;

	protected final AcmeDashboardFrontend frontend;

	protected final HttpHandler handler;

	public AcmeDashboardFullstack(Factory factory, String configurationFile) {
		this.factory = factory;
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
		configuration = factory.create(Configuration.class, Collections.singletonMap("file", configurationFile));
		backend = factory.create(AcmeDashboardBackend.class, Map.of("factory",
				new Factory(Stream.of("fullstack", "backend", "base")
						.flatMap(x -> Java.getPackageClasses("com.janilla.acmedashboard." + x).stream()).toList(),
						AcmeDashboardBackend.INSTANCE::get)));
		frontend = factory.create(AcmeDashboardFrontend.class, Map.of("factory",
				new Factory(Stream.of("fullstack", "frontend")
						.flatMap(x -> Java.getPackageClasses("com.janilla.acmedashboard." + x).stream()).toList(),
						AcmeDashboardFrontend.INSTANCE::get)));
		handler = x -> {
//			IO.println("AcmeDashboardFullstack, " + x.request().getPath());
			var h = switch (Objects.requireNonNullElse(x.exception(), x.request())) {
			case HttpRequest y -> y.getPath().startsWith("/api/") ? backend.handler() : frontend.handler();
			case Exception _ -> backend.handler();
			default -> null;
			};
			return h.handle(x);
		};
	}

	public AcmeDashboardBackend backend() {
		return backend;
	}

	public Configuration configuration() {
		return configuration;
	}

	public Factory factory() {
		return factory;
	}

	public AcmeDashboardFrontend frontend() {
		return frontend;
	}

	public HttpHandler handler() {
		return handler;
	}

//	public Collection<Class<?>> types() {
//		return factory.types();
//	}
}
