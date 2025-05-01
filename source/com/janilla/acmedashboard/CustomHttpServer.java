package com.janilla.acmedashboard;

import javax.net.ssl.SSLContext;

import com.janilla.http.HttpExchange;
import com.janilla.http.HttpHandler;
import com.janilla.http.HttpRequest;
import com.janilla.http.HttpServer;
import com.janilla.reflect.Factory;

public class CustomHttpServer extends HttpServer {

	public Factory factory;

	public CustomHttpServer(SSLContext sslContext, HttpHandler handler) {
		super(sslContext, handler);
	}

	@Override
	protected HttpExchange createExchange(HttpRequest request) {
		return factory.create(HttpExchange.class);
	}
}
