/*
 * MIT License
 *
 * Copyright (c) 2024 Diego Schivo
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

import com.janilla.acmedashboard.InvoiceApi.Invoice2;
import com.janilla.persistence.Persistence;
import com.janilla.web.Handle;

public class DashboardApi {

	public Persistence persistence;

	@Handle(method = "GET", path = "/api/dashboard")
	public Data get() {
		var ic = persistence.crud(Invoice.class);
		var rc = persistence.crud(Revenue.class);
		return new Data(
				ic.read(ic.filter("status", Invoice.Status.PAID)).map(Invoice::amount).reduce(BigDecimal.ZERO,
						BigDecimal::add),
				ic.read(ic.filter("status", Invoice.Status.PENDING)).map(Invoice::amount).reduce(BigDecimal.ZERO,
						BigDecimal::add),
				ic.count(), persistence.crud(Customer.class).count(), rc.read(rc.list()).toList(),
				ic.read(ic.list(0, 5).ids()).map(x -> Invoice2.of(x, persistence)).toList());
	}

	public record Data(BigDecimal paidAmount, BigDecimal pendingAmount, long invoiceCount, long customerCount,
			List<Revenue> revenues, List<Invoice2> invoices) {
	}
}
