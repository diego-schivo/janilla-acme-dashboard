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

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.janilla.http.HeaderField;
import com.janilla.http.Http;
import com.janilla.http.HttpCookie;
import com.janilla.http.HttpExchange;
import com.janilla.json.Jwt;
import com.janilla.persistence.Persistence;
import com.janilla.web.UnauthorizedException;

public class CustomHttpExchange extends HttpExchange {

	public Properties configuration;

	public Persistence persistence;

	private Map<String, Object> session = new HashMap<>();

	protected Supplier<String> sessionEmail = () -> {
		if (!session.containsKey("email")) {
			var hh = getRequest().getHeaders();
			var h = hh != null ? hh.stream().filter(x -> x.name().equals("cookie")).map(HeaderField::value)
					.collect(Collectors.joining("; ")) : null;
			var cc = h != null ? Http.parseCookieHeader(h) : null;
			var t = cc != null ? cc.get("session") : null;
			Map<String, ?> p;
			try {
				p = t != null ? Jwt.verifyToken(t, configuration.getProperty("acme-dashboard.jwt.key")) : null;
			} catch (IllegalArgumentException e) {
				p = null;
			}
			session.put("email", p != null ? p.get("loggedInAs") : null);
		}
		return (String) session.get("email");
	};

	private Supplier<User> sessionUser = () -> {
		if (!session.containsKey("user")) {
			var c = persistence.crud(User.class);
			var e = getSessionEmail();
			var i = e != null ? c.find("email", e) : null;
			session.put("user", i != null ? c.read(i) : null);
		}
		return (User) session.get("user");
	};

	public String getSessionEmail() {
		return sessionEmail.get();
	}

	public User getSessionUser() {
		return sessionUser.get();
	}

	public void requireSessionEmail() {
		var x = getSessionEmail();
		if (x == null)
			throw new UnauthorizedException();
	}

	public void setSessionCookie(String value) {
		var x = HttpCookie.of("session", value).withPath("/").withSameSite("Lax");
		if (value != null && value.length() > 0)
			x = x.withExpires(ZonedDateTime.now(ZoneOffset.UTC).plusDays(30));
		else
			x = x.withMaxAge(0);
		getResponse().getHeaders().add(new HeaderField("set-cookie", x.format()));
	}
}
