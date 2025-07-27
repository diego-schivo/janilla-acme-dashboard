//package com.janilla.acmedashboard.base;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.UUID;
//
//import com.janilla.reflect.Flatten;
//
//public record InvoiceWithCustomer(@Flatten Invoice invoice, Customer customer) implements Invoice {
//
//	@Override
//	public UUID id() {
//		return invoice.id();
//	}
//
//	@Override
//	public UUID customerId() {
//		return invoice.customerId();
//	}
//
//	@Override
//	public BigDecimal amount() {
//		return invoice.amount();
//	}
//
//	@Override
//	public Status status() {
//		return invoice.status();
//	}
//
//	@Override
//	public LocalDate date() {
//		return invoice.date();
//	}
//}