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
package com.janilla.acmedashboard.frontend;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.AbstractMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.UUID;

import javax.net.ssl.SSLContext;

import com.janilla.acmedashboard.base.Cards;
import com.janilla.acmedashboard.base.DataFetching;
import com.janilla.acmedashboard.base.Invoice;
import com.janilla.acmedashboard.base.Revenue;
import com.janilla.http.HttpClient;
import com.janilla.http.HttpServer;
import com.janilla.json.Converter;
import com.janilla.net.Net;

public class CustomDataFetching implements DataFetching {

	protected final Properties configuration;

	protected final HttpClient httpClient;

	public CustomDataFetching(Properties configuration) {
		this.configuration = configuration;

		{
			SSLContext c;
			try (var x = Net.class.getResourceAsStream("testkeys")) {
				c = Net.getSSLContext(Map.entry("JKS", x), "passphrase".toCharArray());
			} catch (IOException e) {
				throw new UncheckedIOException(e);
			}
			httpClient = new HttpClient(c);
		}
	}

	@Override
	public List<?> customers(String query) {
		return (List<?>) httpClient.getJson(
				Net.uriString(baseUrl() + "/customers", new AbstractMap.SimpleImmutableEntry<>("query", query)),
				cookie());
	}

	@Override
	public List<?> customerNames() {
		return (List<?>) httpClient.getJson(baseUrl() + "/customers/names", cookie());
	}

	@Override
	public Cards dashboardCards() {
		return new Converter(null).convert(httpClient.getJson(baseUrl() + "/dashboard/cards", cookie()), Cards.class);
	}

	@Override
	public List<Invoice> dashboardInvoices() {
		var c = new Converter(null);
		return ((List<?>) httpClient.getJson(baseUrl() + "/dashboard/invoices", cookie())).stream()
				.map(x -> c.<Invoice>convert(x, Invoice.class)).toList();
	}

	@Override
	public List<Revenue> dashboardRevenue() {
		var c = new Converter(null);
		return ((List<?>) httpClient.getJson(baseUrl() + "/dashboard/revenue", cookie())).stream()
				.map(x -> c.<Revenue>convert(x, Revenue.class)).toList();
	}

	@Override
	public Object invoice(UUID id) {
		return httpClient.getJson(baseUrl() + "/invoices/" + id.toString(), cookie());
	}

	@Override
	public Object invoices(String query, Integer page) {
		return httpClient
				.getJson(
						Net.uriString(baseUrl() + "/invoices", new AbstractMap.SimpleImmutableEntry<>("query", query),
								new AbstractMap.SimpleImmutableEntry<>("page", Objects.toString(page, null))),
						cookie());
	}

	protected String cookie() {
		return HttpServer.HTTP_EXCHANGE.get().request().getHeaderValues("cookie").filter(x -> x.startsWith("session="))
				.findFirst().get();
	}

	protected String baseUrl() {
		return configuration.getProperty("acme-dashboard.api.url");
	}
}
