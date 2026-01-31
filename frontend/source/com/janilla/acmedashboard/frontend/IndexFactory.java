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

public class IndexFactory {

	protected final Properties configuration;

	protected final DataFetching dataFetching;

	public IndexFactory(Properties configuration, DataFetching dataFetching) {
		this.configuration = configuration;
		this.dataFetching = dataFetching;
	}

	public Index index(FrontendExchange exchange) {
		return new Index(
//				imports(), 
				configuration.getProperty("acme-dashboard.api.url"), state(exchange));
	}

	protected Map<String, Object> state(FrontendExchange exchange) {
		var x = new LinkedHashMap<String, Object>();
//		x.put("user", exchange.sessionUser());
		return x;
	}

//	protected Map<String, String> imports() {
//		var m = new LinkedHashMap<String, String>();
	////		ImportMaps.putImports(m);
//		Stream.of("acme-logo", "breadcrumb-nav", "card-wrapper", "customers-page", "dashboard-page", "dashboard-layout",
//				"dashboard-nav", "hero-icon", "intl-format", "invoice-page", "invoice-status", "invoices-layout",
//				"invoices-page", "latest-invoices", "login-page", "pagination-nav", "revenue-chart", "root-layout",
//				"single-card", "welcome-page").forEach(x -> m.put(x, "/" + x + ".js"));
//		return m;
//	}
}
