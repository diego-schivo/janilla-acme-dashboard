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

import java.util.Properties;
import java.util.Set;

import com.janilla.http.HttpExchange;
import com.janilla.web.HandleException;
import com.janilla.web.MethodHandlerFactory;

public class CustomMethodHandlerFactory extends MethodHandlerFactory {

	public Properties configuration;

	@Override
	protected void handle(Invocation invocation, HttpExchange exchange) {
		var ex = (CustomHttpExchange) exchange;
		var rq = ex.getRequest();
		var rs = ex.getResponse();

		if (Boolean.parseBoolean(configuration.getProperty("acme-dashboard.live-demo")))
			if (rq.getMethod().equals("GET") || rq.getPath().equals("/api/authentication"))
				;
			else
				throw new HandleException(new MethodBlockedException());

		if (rq.getPath().contains("."))
			;
		else if (rq.getPath().startsWith("/api/")) {
			if (rq.getPath().equals("/api/authentication"))
				;
			else
				ex.requireSessionEmail();
		} else {
			if (Set.of("/", "/login").contains(rq.getPath()))
				;
			else if (ex.getSessionEmail() == null) {
				rs.setStatus(302);
				rs.setHeaderValue("cache-control", "no-cache");
				rs.setHeaderValue("location", "/login");
			}
		}

		if (rq.getPath().startsWith("/api/"))
			try {
				Thread.sleep(500);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}

		super.handle(invocation, exchange);
	}
}
