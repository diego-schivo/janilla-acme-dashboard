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
