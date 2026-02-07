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

import java.net.URI;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import com.janilla.http.HttpClient;
import com.janilla.http.HttpServer;
import com.janilla.java.UriQueryBuilder;

public class DataFetching {

	protected final Properties configuration;

	protected final HttpClient httpClient;

	public DataFetching(Properties configuration, HttpClient httpClient) {
		this.configuration = configuration;
		this.httpClient = httpClient;
	}

	public List<?> customers(String query) {
		return (List<?>) httpClient.getJson(URI.create(configuration.getProperty("acme-dashboard.api.url")
				+ "/customers?" + new UriQueryBuilder().append("query", query)), cookie());
	}

	public List<?> customerNames() {
		return (List<?>) httpClient.getJson(
				URI.create(configuration.getProperty("acme-dashboard.api.url") + "/customers/names"), cookie());
	}

	public Object dashboardCards() {
		return httpClient.getJson(URI.create(configuration.getProperty("acme-dashboard.api.url") + "/dashboard/cards"),
				cookie());
	}

	public List<?> dashboardInvoices() {
		return (List<?>) httpClient.getJson(
				URI.create(configuration.getProperty("acme-dashboard.api.url") + "/dashboard/invoices"), cookie());
	}

	public List<?> dashboardRevenue() {
		return (List<?>) httpClient.getJson(
				URI.create(configuration.getProperty("acme-dashboard.api.url") + "/dashboard/revenue"), cookie());
	}

	public Object invoice(UUID id) {
		return httpClient.getJson(URI.create(configuration.getProperty("acme-dashboard.api.url") + "/invoices/" + id),
				cookie());
	}

	public Object invoices(String query, Integer page) {
		return httpClient.getJson(URI.create(configuration.getProperty("acme-dashboard.api.url") + "/invoices?"
				+ new UriQueryBuilder().append("query", query).append("page", page != null ? page.toString() : null)),
				cookie());
	}

	protected String cookie() {
		return HttpServer.HTTP_EXCHANGE.get().request().getHeaderValues("cookie").filter(x -> x.startsWith("session="))
				.findFirst().orElse(null);
	}
}
