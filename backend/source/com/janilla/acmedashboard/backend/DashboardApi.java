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
package com.janilla.acmedashboard.backend;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import com.janilla.acmedashboard.base.Cards;
import com.janilla.acmedashboard.base.Customer;
import com.janilla.acmedashboard.base.Invoice;
import com.janilla.acmedashboard.base.Revenue;
import com.janilla.persistence.Persistence;
import com.janilla.web.Handle;

@Handle(path = "/api/dashboard")
public class DashboardApi {

	public static final AtomicReference<DashboardApi> INSTANCE = new AtomicReference<>();

	protected final Persistence persistence;

	public DashboardApi(Persistence persistence) {
		this.persistence = persistence;
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
	}

	@Handle(method = "GET", path = "cards")
	public Cards getCards() {
		var x = (InvoiceCrud) persistence.crud(Invoice.class);
		return new Cards(x.getAmount(Invoice.Status.PAID), x.getAmount(Invoice.Status.PENDING), x.count(),
				persistence.crud(Customer.class).count());
	}

	@Handle(method = "GET", path = "revenue")
	public List<Revenue> getRevenue() {
		var x = persistence.crud(Revenue.class);
		return x.read(x.list());
	}

	@Handle(method = "GET", path = "invoices")
	public List<Invoice> getInvoices() {
		var x = persistence.crud(Invoice.class);
		return x.read(x.list(0, 5).ids()).stream().map(InvoiceApi::invoiceWithCustomer).toList();
	}
}
