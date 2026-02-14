package com.janilla.acmedashboard.frontend;

import java.util.List;
import java.util.UUID;

public interface Fetcher {

	Object authentication();

	List<?> customers(String query);

	List<?> customerNames();

	Object dashboardCards();

	List<?> dashboardInvoices();

	List<?> dashboardRevenue();

	Object invoice(UUID id);

	Object invoices(String query, Integer page);
}
