//package com.janilla.acmedashboard.base;
//
//import java.io.IO;
//
//import com.janilla.json.Converter;
//import com.janilla.json.Json;
//
//public class Foo {
//
//	public static void main(String[] args) {
////		var p = Reflection.property(Invoice.class, "id");
////		IO.println(p.type());
//		var s = """
//				{"customer":{"id":"76d65c26-f784-44a2-ac19-586678f7c2f2","name":"Michael Novotny","email":"michael@novotny.com","imageUrl":"/images/customers/michael-novotny.webp"},"date":"2023-09-10","amount":448,"customerId":"76d65c26-f784-44a2-ac19-586678f7c2f2","id":"c821e67d-ab1e-4726-8c81-8a6d8ce3871a","status":{"name":"PAID"}}""";
//		var m = Json.parse(s);
//		var x = new Converter(null).<Invoice.WithCustomer>convert(m, Invoice.WithCustomer.class);
//		IO.println(x);
//	}
//}
