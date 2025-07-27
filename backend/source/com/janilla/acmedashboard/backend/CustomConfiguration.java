package com.janilla.acmedashboard.backend;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

import com.janilla.acmedashboard.base.Configuration;

public class CustomConfiguration extends Properties implements Configuration {

	private static final long serialVersionUID = -5374801142499744359L;

	public CustomConfiguration(String file) {
		try {
			try (var x = AcmeDashboardBackend.class.getResourceAsStream("configuration.properties")) {
				load(x);
			}
			if (file != null) {
				var f = file.startsWith("~") ? System.getProperty("user.home") + file.substring(1) : file;
				try (var x = Files.newInputStream(Path.of(f))) {
					load(x);
				}
			}
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}
}
