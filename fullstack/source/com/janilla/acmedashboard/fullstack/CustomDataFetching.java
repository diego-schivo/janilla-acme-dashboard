package com.janilla.acmedashboard.fullstack;

import java.util.List;
import java.util.UUID;

import com.janilla.acmedashboard.backend.CustomerApi;
import com.janilla.acmedashboard.backend.DashboardApi;
import com.janilla.acmedashboard.backend.InvoiceApi;
import com.janilla.acmedashboard.base.Cards;
import com.janilla.acmedashboard.base.DataFetching;
import com.janilla.acmedashboard.base.Invoice;
import com.janilla.acmedashboard.base.Revenue;

public class CustomDataFetching implements DataFetching {

	@Override
	public List<?> customers(String query) {
		return CustomerApi.INSTANCE.get().list(query);
	}

	@Override
	public List<?> customerNames() {
		return CustomerApi.INSTANCE.get().names();
	}

	@Override
	public Cards dashboardCards() {
		return DashboardApi.INSTANCE.get().getCards();
	}

	@Override
	public List<Invoice> dashboardInvoices() {
		return DashboardApi.INSTANCE.get().getInvoices();
	}

	@Override
	public List<Revenue> dashboardRevenue() {
		return DashboardApi.INSTANCE.get().getRevenue();
	}

	@Override
	public Object invoice(UUID id) {
		return InvoiceApi.INSTANCE.get().read(id);
	}

	@Override
	public Object invoices(String query, Integer page) {
		return InvoiceApi.INSTANCE.get().list(query, page);
	}
}
