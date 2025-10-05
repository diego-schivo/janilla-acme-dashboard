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

import java.math.BigDecimal;
import java.util.UUID;

import com.janilla.acmedashboard.base.Invoice;
import com.janilla.persistence.Crud;
import com.janilla.persistence.Persistence;

public class InvoiceCrud extends Crud<UUID, Invoice> {

	public InvoiceCrud(Persistence persistence) {
		super(Invoice.class, _ -> UUID.randomUUID(), persistence);
	}

	public BigDecimal getAmount(Invoice.Status status) {
//		var a = persistence.database().perform((_, ii) -> ii.perform("Invoice.status", i -> i.apply(status, (aa, _) -> {
//			var d = (Double) aa.get("amount");
//			return d != null ? BigDecimal.valueOf(d) : null;
//		}, false)), false);
//		return a != null ? a : BigDecimal.ZERO;
		return BigDecimal.ZERO;
	}

	public BigDecimal getAmount(UUID customerId, Invoice.Status status) {
//		var a = persistence.database()
//				.perform((_, ii) -> ii.perform("Invoice.customerId", i -> i.apply(customerId, (aa, _) -> {
//					@SuppressWarnings("unchecked")
//					var m = (Map<String, Double>) aa.get("amount");
//					var d = m != null ? m.get(status.name()) : null;
//					return d != null ? BigDecimal.valueOf(d) : null;
//				}, false)), false);
//		return a != null ? a : BigDecimal.ZERO;
		return BigDecimal.ZERO;
	}

	@Override
	protected void updateIndexes(Invoice entity1, Invoice entity2, UUID id) {
		super.updateIndexes(entity1, entity2, id);

//		if (entity1 != null) {
//			var x = entity1.amount();
//			if (entity2 != null && entity1.status().equals(entity2.status()))
//				x = x.subtract(entity2.amount());
//			if (x.compareTo(BigDecimal.ZERO) > 0) {
//				var y = x;
//				persistence.database()
//						.perform(
//								(_, ii) -> ii.perform("Invoice.status",
//										i -> i.apply(entity1.status(),
//												(aa, _) -> aa.compute("amount",
//														(_, v) -> BigDecimal.valueOf((double) v).subtract(y)),
//												false)),
//								true);
//			}
//		}
//
//		if (entity2 != null) {
//			var x = entity2.amount();
//			if (entity1 != null && entity2.status().equals(entity1.status()))
//				x = x.subtract(entity1.amount());
//			if (x.compareTo(BigDecimal.ZERO) > 0) {
//				var y = x;
//				persistence.database().perform(
//						(_, ii) -> ii.perform("Invoice.status", i -> i.apply(entity2.status(),
//								(aa, _) -> aa.compute("amount",
//										(_, v) -> v != null ? BigDecimal.valueOf((double) v).add(y) : y),
//								false)),
//						true);
//			}
//		}
//
//		if (entity1 != null) {
//			var x = entity1.amount();
//			if (entity2 != null && entity1.customerId().equals(entity2.customerId())
//					&& entity1.status().equals(entity2.status()))
//				x = x.subtract(entity2.amount());
//			if (x.compareTo(BigDecimal.ZERO) > 0) {
//				var y = x;
//				persistence.database().perform(
//						(_, ii) -> ii.perform("Invoice.customerId", i -> i.apply(entity1.customerId(), (aa, _) -> {
//							@SuppressWarnings("unchecked")
//							var m = (Map<String, Double>) aa.get("amount");
//							m.compute(entity1.status().name(), (_, v) -> v - y.doubleValue());
//							return null;
//						}, false)), true);
//			}
//		}
//
//		if (entity2 != null) {
//			var x = entity2.amount();
//			if (entity1 != null && entity2.customerId().equals(entity1.customerId())
//					&& entity2.status().equals(entity1.status()))
//				x = x.subtract(entity1.amount());
//			if (x.compareTo(BigDecimal.ZERO) > 0) {
//				var y = x;
//				persistence.database().perform(
//						(_, ii) -> ii.perform("Invoice.customerId", i -> i.apply(entity2.customerId(), (aa, _) -> {
//							@SuppressWarnings("unchecked")
//							var m = (Map<String, Double>) aa.computeIfAbsent("amount", _ -> new LinkedHashMap<>());
//							m.compute(entity2.status().name(),
//									(_, v) -> v != null ? v + y.doubleValue() : y.doubleValue());
//							return null;
//						}, false)), true);
//			}
//		}
	}
}
