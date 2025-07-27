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

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import com.janilla.acmedashboard.base.Customer;
import com.janilla.acmedashboard.base.Invoice;
import com.janilla.persistence.Crud;
import com.janilla.persistence.Persistence;
import com.janilla.reflect.Flatten;
import com.janilla.reflect.Reflection;
import com.janilla.web.Bind;
import com.janilla.web.Handle;

@Handle(path = "/api/invoices")
public class InvoiceApi {

	public static final AtomicReference<InvoiceApi> INSTANCE = new AtomicReference<>();

	protected final Persistence persistence;

	public InvoiceApi(Persistence persistence) {
		this.persistence = persistence;
		if (!INSTANCE.compareAndSet(null, this))
			throw new IllegalStateException();
	}

	@Handle(method = "GET")
	public IdPage2 list(@Bind("query") String query, @Bind("page") Integer page) {
		var p = page != null ? page.intValue() : 1;
		var c = persistence.crud(Invoice.class);
		var s = (p - 1) * 6;
		var q = query == null || query.isEmpty() ? c.list(s, 6)
				: c.filter("customerId", s, 6, persistence.crud(Customer.class)
						.filter("name", x -> ((String) x).toLowerCase().contains(query.toLowerCase())).toArray());
		return new IdPage2(q, c.read(q.ids()).stream().map(InvoiceApi::invoiceWithCustomer).toList());
	}

	@Handle(method = "POST")
	public Invoice create(Invoice.Default invoice) {
		return persistence.crud(Invoice.class).create(invoice.withDate(LocalDate.now()));
	}

	@Handle(method = "GET", path = "([^/]+)")
	public Invoice read(UUID id) {
		return persistence.crud(Invoice.class).read(id);
	}

	@Handle(method = "PUT", path = "([^/]+)")
	public Invoice update(UUID id, Invoice.Default invoice) {
		return persistence.crud(Invoice.class).update(id,
				x -> Reflection.copy(invoice, x, y -> !Set.of("id", "date").contains(y)));
	}

	@Handle(method = "DELETE", path = "([^/]+)")
	public Invoice delete(UUID id) {
		return persistence.crud(Invoice.class).delete(id);
	}

//	public static Invoice.WithCustomer invoiceAndCustomer(Invoice invoice) {
//		return invoice != null
//				? new Invoice.WithCustomer(invoice,
//						InvoiceApi.INSTANCE.get().persistence.crud(Customer.class).read(invoice.customerId()))
//				: null;
//	}

	public static Invoice invoiceWithCustomer(Invoice invoice) {
		return invoice != null
				? ((Invoice.Default) invoice)
						.withCustomer(INSTANCE.get().persistence.crud(Customer.class).read(invoice.customerId()))
				: null;
	}

	public record IdPage2(@Flatten Crud.IdPage<UUID> page, List<Invoice> items) {
	}
}
