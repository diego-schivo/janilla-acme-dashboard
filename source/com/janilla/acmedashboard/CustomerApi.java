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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.janilla.persistence.Persistence;
import com.janilla.reflect.Flatten;
import com.janilla.web.Bind;
import com.janilla.web.Handle;

public class CustomerApi {

	public Persistence persistence;

	@Handle(method = "GET", path = "/api/customers/names")
	public Stream<Map.Entry<String, String>> names() {
		var cc = persistence.crud(Customer.class);
		return cc.read(cc.list())
				.collect(Collectors.toMap(x -> x.id().toString(), Customer::name, (v, w) -> v, LinkedHashMap::new))
				.entrySet().stream();
	}

	@Handle(method = "GET", path = "/api/customers")
	public Stream<Customer2> list(@Bind("query") String query) {
//		try {
//			Thread.sleep(2000);
//		} catch (InterruptedException e) {
//			e.printStackTrace();
//		}
		var cc = persistence.crud(Customer.class);
		return cc
				.read(query == null || query.isEmpty() ? cc.list()
						: cc.filter("name", x -> ((String) x).toLowerCase().contains(query.toLowerCase())))
				.map(x -> Customer2.of(x, persistence));
	}

	public record Customer2(@Flatten Customer customer, long invoiceCount, BigDecimal pendingAmount,
			BigDecimal paidAmount) {

		public static Customer2 of(Customer customer, Persistence persistence) {
			var ic = persistence.crud(Invoice.class);
			var ii = ic.read(ic.filter("customerId", customer.id())).toList();
			return new Customer2(customer, ii.size(),
					ii.stream().filter(x -> x.status() == Invoice.Status.PENDING).map(x -> x.amount())
							.reduce(BigDecimal.ZERO, BigDecimal::add),
					ii.stream().filter(x -> x.status() == Invoice.Status.PAID).map(x -> x.amount())
							.reduce(BigDecimal.ZERO, BigDecimal::add));
		}
	}
}
