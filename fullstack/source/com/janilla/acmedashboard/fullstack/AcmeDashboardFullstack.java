/*
 * MIT License
 *
 * Copyright (c) 2024 Vercel, Inc.
 * Copyright (c) 2024-2026 Diego Schivo
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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Stream;

import javax.net.ssl.SSLContext;

import com.janilla.acmedashboard.backend.AcmeDashboardBackend;
import com.janilla.acmedashboard.backend.BackendExchange;
import com.janilla.acmedashboard.frontend.AcmeDashboardFrontend;
import com.janilla.http.HttpHandler;
import com.janilla.http.HttpServer;
import com.janilla.ioc.DiFactory;
import com.janilla.java.Java;

public class AcmeDashboardFullstack {

	public static final ScopedValue<AcmeDashboardFullstack> INSTANCE = ScopedValue.newInstance();

	public static void main(String[] args) {
		IO.println(ProcessHandle.current().pid());
		var f = new DiFactory(Java.getPackageClasses(AcmeDashboardFullstack.class.getPackageName(), false),
				"fullstack");
		serve(f, args.length > 0 ? args[0] : null);
	}

	protected static void serve(DiFactory diFactory, String configurationPath) {
		AcmeDashboardFullstack a;
		{
			a = diFactory.create(AcmeDashboardFullstack.class,
					Java.hashMap("diFactory", diFactory, "configurationFile",
							configurationPath != null ? Path.of(configurationPath.startsWith("~")
									? System.getProperty("user.home") + configurationPath.substring(1)
									: configurationPath) : null));
		}

		SSLContext c;
		{
			var p = a.configuration.getProperty("acme-dashboard.fullstack.server.keystore.path");
			var w = a.configuration.getProperty("acme-dashboard.fullstack.server.keystore.password");
			if (p.startsWith("~"))
				p = System.getProperty("user.home") + p.substring(1);
			var f = Path.of(p);
			if (!Files.exists(f))
				Java.generateKeyPair(f, w);
			try (var s = Files.newInputStream(f)) {
				c = Java.sslContext(s, w.toCharArray());
			} catch (IOException e) {
				throw new UncheckedIOException(e);
			}
		}

		HttpServer s;
		{
			var p = Integer.parseInt(a.configuration.getProperty("acme-dashboard.fullstack.server.port"));
			s = a.diFactory.create(HttpServer.class,
					Map.of("sslContext", c, "endpoint", new InetSocketAddress(p), "handler", a.handler));
		}
		s.serve();
	}

	protected final AcmeDashboardBackend backend;

	protected final Properties configuration;

	protected final DiFactory diFactory;

	protected final AcmeDashboardFrontend frontend;

	protected final HttpHandler handler;

	public AcmeDashboardFullstack(DiFactory diFactory, Path configurationFile) {
		this.diFactory = diFactory;
		diFactory.context(this);
		configuration = diFactory.create(Properties.class, Collections.singletonMap("file", configurationFile));

		var cf = Optional.ofNullable(configurationFile).orElseGet(() -> {
			try {
				return Path.of(AcmeDashboardFullstack.class.getResource("configuration.properties").toURI());
			} catch (URISyntaxException e) {
				throw new RuntimeException(e);
			}
		});
		backend = ScopedValue.where(INSTANCE, this)
				.call(() -> diFactory.create(AcmeDashboardBackend.class,
						Java.hashMap("diFactory",
								new DiFactory(Stream
										.concat(Stream.of("com.janilla.web"),
												Stream.of("backend", "fullstack")
														.map(x -> AcmeDashboardBackend.class.getPackageName()
																.replace(".backend", "." + x)))
										.flatMap(x -> Java.getPackageClasses(x, true).stream()).toList(), "backend"),
								"configurationFile", cf)));
		frontend = ScopedValue.where(INSTANCE, this)
				.call(() -> diFactory.create(AcmeDashboardFrontend.class,
						Java.hashMap("diFactory",
								new DiFactory(Stream
										.concat(Stream.of("com.janilla.web"),
												Stream.of("frontend", "fullstack")
														.map(x -> AcmeDashboardFrontend.class.getPackageName()
																.replace(".frontend", "." + x)))
										.flatMap(x -> Java.getPackageClasses(x, true).stream()).toList(), "frontend"),
								"configurationFile", cf)));

		handler = x -> {
			var h = x instanceof BackendExchange ? backend.handler() : frontend.handler();
			return h.handle(x);
		};
	}

	public AcmeDashboardBackend backend() {
		return backend;
	}

	public Properties configuration() {
		return configuration;
	}

	public DiFactory diFactory() {
		return diFactory;
	}

	public AcmeDashboardFrontend frontend() {
		return frontend;
	}

	public HttpHandler handler() {
		return handler;
	}
}
