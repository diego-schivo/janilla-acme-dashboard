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
				.map(x -> c.<Invoice>convert(x, Invoice.Default.class)).toList();
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
