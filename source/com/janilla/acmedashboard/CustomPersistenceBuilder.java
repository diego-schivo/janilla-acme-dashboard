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

import java.nio.file.Files;
import java.nio.file.Path;

import com.janilla.database.BTree;
import com.janilla.database.BTreeMemory;
import com.janilla.database.IdAndReference;
import com.janilla.database.KeyAndData;
import com.janilla.database.Store;
import com.janilla.io.ByteConverter;
import com.janilla.io.TransactionalByteChannel;
import com.janilla.persistence.ApplicationPersistenceBuilder;
import com.janilla.persistence.Persistence;
import com.janilla.reflect.Factory;

public class CustomPersistenceBuilder extends ApplicationPersistenceBuilder {

	public CustomPersistenceBuilder(Path databaseFile, Factory factory) {
		super(databaseFile, factory);
	}

	@Override
	public Persistence build() {
		var fe = Files.exists(databaseFile);
		var p = super.build();
		if (!fe) {
			var d = PlaceholderData.read();
			d.customers().forEach(p.crud(Customer.class)::create);
			d.invoices().forEach(p.crud(Invoice.class)::create);
			d.revenue().forEach(p.crud(Revenue.class)::create);
			d.users().forEach(p.crud(User.class)::create);
		}
		return p;
	}

	@Override
	protected <ID extends Comparable<ID>> Store<ID, String> newStore(int bTreeOrder, TransactionalByteChannel channel,
			BTreeMemory memory, KeyAndData<String> keyAndData) {
		if (keyAndData.key().equals("Revenue")) {
			@SuppressWarnings("unchecked")
			var x = (Store<ID, String>) new Store<>(new BTree<>(bTreeOrder, channel, memory,
					IdAndReference.byteConverter(ByteConverter.STRING), keyAndData.bTree()), ByteConverter.STRING);
			return x;
		} else {
			@SuppressWarnings("unchecked")
			var x = (Store<ID, String>) new Store<>(new BTree<>(bTreeOrder, channel, memory,
					IdAndReference.byteConverter(ByteConverter.UUID1), keyAndData.bTree()), ByteConverter.STRING);
			return x;
		}
	}
}
