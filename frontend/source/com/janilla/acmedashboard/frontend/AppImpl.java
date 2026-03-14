package com.janilla.acmedashboard.frontend;

import java.util.Map;

import com.janilla.frontend.App;

record AppImpl(String apiUrl, Map<String, Object> state) implements App {
}
