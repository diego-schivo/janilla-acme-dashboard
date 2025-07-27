package com.janilla.acmedashboard.base;

import java.math.BigDecimal;

public record Cards(BigDecimal paidAmount, BigDecimal pendingAmount, long invoiceCount, long customerCount) {
}
