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

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import com.janilla.acmedashboard.base.Customer;
import com.janilla.acmedashboard.base.Invoice;
import com.janilla.acmedashboard.base.Revenue;
import com.janilla.acmedashboard.base.User;
import com.janilla.database.Database;
import com.janilla.json.TypeResolver;
import com.janilla.persistence.Crud;
import com.janilla.persistence.Entity;
import com.janilla.persistence.Persistence;

public class CustomPersistence extends Persistence {

	public CustomPersistence(Database database, Collection<Class<? extends Entity<?>>> types,
			TypeResolver typeResolver) {
		super(database, types, typeResolver);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected <E extends Entity<?>> Crud<?, E> newCrud(Class<E> type) {
		return type == Invoice.class ? (Crud<?, E>) new InvoiceCrud(this) : super.newCrud(type);
	}

	@Override
	protected <ID extends Comparable<ID>> Function<Map<String, Object>, ID> nextId(Class<?> type) {
		return Set.of(Customer.class, Revenue.class, User.class).contains(type) ? null : super.nextId(type);
	}
}
