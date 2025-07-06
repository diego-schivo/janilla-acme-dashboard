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
package com.janilla.acmedashboard;

import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import javax.net.ssl.SSLContext;

import com.janilla.http.HttpHandler;
import com.janilla.http.HttpServer;
import com.janilla.json.Json;
import com.janilla.json.MapAndType;
import com.janilla.json.ReflectionJsonIterator;
import com.janilla.net.Net;
import com.janilla.persistence.ApplicationPersistenceBuilder;
import com.janilla.persistence.Persistence;
import com.janilla.reflect.Factory;
import com.janilla.reflect.Flatten;
import com.janilla.util.Util;
import com.janilla.web.ApplicationHandlerBuilder;
import com.janilla.web.Handle;
import com.janilla.web.Render;
import com.janilla.web.RenderableFactory;
import com.janilla.web.Renderer;

public class AcmeDashboard {

	public static final AtomicReference<AcmeDashboard> INSTANCE = new AtomicReference<>();

	public static void main(String[] args) {
		try {
			var pp = new Properties();
			try (var s1 = AcmeDashboard.class.getResourceAsStream("configuration.properties")) {
				pp.load(s1);
				if (args.length > 0) {
					var p = args[0];
					if (p.startsWith("~"))
						p = System.getProperty("user.home") + p.substring(1);
					try (var s2 = Files.newInputStream(Path.of(p))) {
						pp.load(s2);
					}
				}
			}
			var x = new AcmeDashboard(pp);

			HttpServer s;
			{
				SSLContext c;
				try (var is = Net.class.getResourceAsStream("testkeys")) {
					c = Net.getSSLContext("JKS", is, "passphrase".toCharArray());
				}
				s = x.factory.create(HttpServer.class, Map.of("sslContext", c, "handler", x.handler));
			}
			var p = Integer.parseInt(x.configuration.getProperty("acme-dashboard.server.port"));
			s.serve(new InetSocketAddress(p));
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	public Properties configuration;

	public Factory factory;

	public Persistence persistence;

	public RenderableFactory renderableFactory;

	public HttpHandler handler;

	public MapAndType.TypeResolver typeResolver;

	public Iterable<Class<?>> types;

	public AcmeDashboard(Properties configuration) {
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
		this.configuration = configuration;
		types = Util.getPackageClasses(getClass().getPackageName()).filter(x -> !x.getPackageName().endsWith(".test"))
				.toList();
		factory = new Factory(types, this);
		typeResolver = factory.create(MapAndType.DollarTypeResolver.class);
		{
			var p = configuration.getProperty("acme-dashboard.database.file");
			if (p.startsWith("~"))
				p = System.getProperty("user.home") + p.substring(1);
			var b = factory.create(ApplicationPersistenceBuilder.class, Map.of("databaseFile", Path.of(p)));
			persistence = b.build();
		}
		renderableFactory = new RenderableFactory();
		{
			var b = factory.create(ApplicationHandlerBuilder.class);
			handler = b.build();
		}
	}

	public AcmeDashboard application() {
		return this;
	}

	@Handle(method = "GET", path = "/")
	public Object root(CustomHttpExchange exchange) {
		return exchange.getSessionEmail() != null ? URI.create("/dashboard")
				: new Index(Collections.singletonMap("authentication", null));
	}

	@Handle(method = "GET", path = "/login")
	public Index login() {
		return new Index(Map.of());
	}

	@Handle(method = "GET", path = "/dashboard")
	public Index dashboard() {
		var x = DashboardApi.INSTANCE.get();
		return new Index(Map.of("cards", x.getCards(), "revenue", x.getRevenue(), "invoices", x.getInvoices()));
	}

	@Handle(method = "GET", path = "/dashboard/invoices")
	public Index invoices(String query, Integer page) {
		return new Index(Collections.singletonMap("invoices", InvoiceApi.INSTANCE.get().list(query, page)));
	}

	@Handle(method = "GET", path = "/dashboard/invoices/create")
	public Index createInvoice() {
		return new Index(Collections.singletonMap("invoice", new Invoice2(null, CustomerApi.INSTANCE.get().names())));
	}

	@Handle(method = "GET", path = "/dashboard/invoices/([^/]+)/edit")
	public Index editInvoice(UUID id) {
		return new Index(Collections.singletonMap("invoice",
				new Invoice2(InvoiceApi.INSTANCE.get().read(id), CustomerApi.INSTANCE.get().names())));
	}

	@Handle(method = "GET", path = "/dashboard/customers")
	public Index customers(String query) {
		return new Index(Collections.singletonMap("customers", CustomerApi.INSTANCE.get().list(query)));
	}

	@Render(template = "index.html")
	public record Index(@Render(renderer = StateRenderer.class) Map<String, Object> state) {
	}

	public static class StateRenderer<T> extends Renderer<T> {

		@Override
		public String apply(T value) {
			var x = INSTANCE.get().factory.create(ReflectionJsonIterator.class);
			x.setObject(value);
			return Json.format(x);
		}
	}

	public record Invoice2(@Flatten Invoice invoice, List<Map.Entry<String, String>> customers) {
	}
}
