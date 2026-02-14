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
package com.janilla.acmedashboard.frontend;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Stream;

public class IndexFactory {

	protected final Properties configuration;

	protected final ClientFetcher dataFetching;

	protected Map<String, String> imports;

	public IndexFactory(Properties configuration, ClientFetcher dataFetching) {
		this.configuration = configuration;
		this.dataFetching = dataFetching;
	}

	public Index index(FrontendExchange exchange) {
		return new Index(imports(), configuration.getProperty("acme-dashboard.api.url"), state(exchange));
	}

	protected Map<String, String> imports() {
		if (imports == null)
			synchronized (this) {
				if (imports == null) {
					imports = new LinkedHashMap<String, String>();
					putImports(imports);
				}
			}
		return imports;
	}

	protected void putImports(Map<String, String> map) {
		Stream.of("app", "intl-format", "web-component").map(this::baseImportKey)
				.forEach(x -> map.put(x, "/" + x + ".js"));
		Stream.of("acme-logo", "app", "breadcrumb-nav", "card-wrapper", "customers-page", "dashboard-page",
				"dashboard-layout", "dashboard-nav", "hero-icon", "invoice-page", "invoice-status", "invoices-layout",
				"invoices-page", "latest-invoices", "login-page", "pagination-nav", "revenue-chart", "single-card",
				"welcome-page").map(this::acmeImportKey).forEach(x -> map.put(x, "/" + x + ".js"));
	}

	protected String baseImportKey(String name) {
		return "base/" + name;
	}

	protected String acmeImportKey(String name) {
		return name;
	}

	protected Map<String, Object> state(FrontendExchange exchange) {
		var x = new LinkedHashMap<String, Object>();
		x.put("user", exchange.getSessionUser());
		return x;
	}
}
