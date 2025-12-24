/*
 * MIT License
 *
 * Copyright (c) 2024 Vercel, Inc.
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
package com.janilla.acmedashboard.frontend;

import java.net.URI;
import java.util.UUID;

import com.janilla.web.Handle;

public class WebHandling {

	protected final DataFetching dataFetching;

	protected final IndexFactory indexFactory;

	public WebHandling(DataFetching dataFetching, IndexFactory indexFactory) {
		this.dataFetching = dataFetching;
		this.indexFactory = indexFactory;
	}

	@Handle(method = "GET", path = "/")
	public Object root(FrontendExchange exchange) {
		if (exchange.getSessionEmail() != null)
			return URI.create("/dashboard");
		var i = indexFactory.index(exchange);
		i.state().put("authentication", null);
		return i;
	}

	@Handle(method = "GET", path = "/login")
	public Object login() {
		return indexFactory.index(null);
	}

	@Handle(method = "GET", path = "/dashboard")
	public Object dashboard() {
		var i = indexFactory.index(null);
		i.state().put("cards", dataFetching.dashboardCards());
		i.state().put("revenue", dataFetching.dashboardRevenue());
		i.state().put("invoices", dataFetching.dashboardInvoices());
		return i;
	}

	@Handle(method = "GET", path = "/dashboard/invoices")
	public Object invoices(String query, Integer page) {
		var i = indexFactory.index(null);
		i.state().put("invoices", dataFetching.invoices(query, page));
		return i;
	}

	@Handle(method = "GET", path = "/dashboard/invoices/create")
	public Object createInvoice() {
		var i = indexFactory.index(null);
		i.state().put("invoice", new Invoice2(null, dataFetching.customerNames()));
		return i;
	}

	@Handle(method = "GET", path = "/dashboard/invoices/([^/]+)/edit")
	public Object editInvoice(UUID id) {
		var i = indexFactory.index(null);
		i.state().put("invoice", new Invoice2(dataFetching.invoice(id), dataFetching.customerNames()));
		return i;
	}

	@Handle(method = "GET", path = "/dashboard/customers")
	public Object customers(String query) {
		var i = indexFactory.index(null);
		i.state().put("customers", dataFetching.customers(query));
		return i;
	}
}
