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
package com.janilla.acmedashboard.base;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.janilla.persistence.Entity;
import com.janilla.persistence.Index;
import com.janilla.persistence.Store;

@Store
@Index(sort = "-date")
public interface Invoice extends Entity<UUID> {

	@Index(sort = "-date")
	UUID customerId();

	BigDecimal amount();

	@Index(sort = "-date")
	Status status();

	LocalDate date();

	public enum Status {
		PAID, PENDING
	}

	public record Default(UUID id, UUID customerId, BigDecimal amount, Status status, LocalDate date, Customer customer)
			implements Invoice {

		public Default withDate(LocalDate date) {
			return new Default(id, customerId, amount, status, date, customer);
		}

		public Default withCustomer(Customer customer) {
			return new Default(id, customerId, amount, status, date, customer);
		}
	}

//	public record WithCustomer(@Flatten Invoice invoice, Customer customer) implements Invoice {
//
//		@Override
//		public UUID id() {
//			return invoice.id();
//		}
//
//		@Override
//		public UUID customerId() {
//			return invoice.customerId();
//		}
//
//		@Override
//		public BigDecimal amount() {
//			return invoice.amount();
//		}
//
//		@Override
//		public Status status() {
//			return invoice.status();
//		}
//
//		@Override
//		public LocalDate date() {
//			return invoice.date();
//		}
//	}
}
