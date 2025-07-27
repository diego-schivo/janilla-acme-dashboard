package com.janilla.acmedashboard.base;

import java.util.List;
import java.util.UUID;

public interface DataFetching {

	List<?> customers(String query);

	List<?> customerNames();

	Cards dashboardCards();

	List<Invoice> dashboardInvoices();

	List<Revenue> dashboardRevenue();

	Object invoice(UUID id);

	Object invoices(String query, Integer page);
}
