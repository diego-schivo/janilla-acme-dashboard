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
package com.janilla.acmedashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import com.janilla.acmedashboard.InvoiceApi.Invoice2;
import com.janilla.persistence.Persistence;
import com.janilla.web.Handle;

public class DashboardApi {

	public static final AtomicReference<DashboardApi> INSTANCE = new AtomicReference<>();

	public Persistence persistence;

	public DashboardApi() {
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
	}

	@Handle(method = "GET", path = "/api/dashboard/cards")
	public Cards getCards() {
		var x = (InvoiceCrud) persistence.crud(Invoice.class);
		return new Cards(x.getAmount(Invoice.Status.PAID), x.getAmount(Invoice.Status.PENDING), x.count(),
				persistence.crud(Customer.class).count());
	}

	public record Cards(BigDecimal paidAmount, BigDecimal pendingAmount, long invoiceCount, long customerCount) {
	}

	@Handle(method = "GET", path = "/api/dashboard/revenue")
	public List<Revenue> getRevenue() {
		var x = persistence.crud(Revenue.class);
		return x.read(x.list());
	}

	@Handle(method = "GET", path = "/api/dashboard/invoices")
	public List<Invoice2> getInvoices() {
		var x = persistence.crud(Invoice.class);
		return x.read(x.list(0, 5).ids()).stream().map(y -> Invoice2.of(y, persistence)).toList();
	}
}
