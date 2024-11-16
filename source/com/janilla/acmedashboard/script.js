/*
 * MIT License
 *
 * Copyright (c) 2024 Diego Schivo
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
import AcmeDashboard from "./acme-dashboard.js";
import AcmeLogo from "./acme-logo.js";
import BreadcrumbNav from "./breadcrumb-nav.js";
import DashboardPage from "./dashboard-page.js";
import DashboardCard from "./dashboard-card.js";
import DashboardLayout from "./dashboard-layout.js";
import DashboardNav from "./dashboard-nav.js";
import DateFormat from "./date-format.js";
import HeroIcon from "./hero-icon.js";
import InvoiceList from "./invoice-list.js";
import InvoicePage from "./invoice-page.js";
import InvoiceStatus from "./invoice-status.js";
import InvoicesLayout from "./invoices-layout.js";
import InvoicesPage from "./invoices-page.js";
import LoginPage from "./login-page.js";
import PaginationNav from "./pagination-nav.js";
import RevenueChart from "./revenue-chart.js";
import AmountFormat from "./amount-format.js";
import WelcomePage from "./welcome-page.js";

customElements.define("acme-dashboard", AcmeDashboard);
customElements.define("acme-logo", AcmeLogo);
customElements.define("breadcrumb-nav", BreadcrumbNav);
customElements.define("dashboard-page", DashboardPage);
customElements.define("dashboard-card", DashboardCard);
customElements.define("dashboard-layout", DashboardLayout);
customElements.define("dashboard-nav", DashboardNav);
customElements.define("date-format", DateFormat);
customElements.define("hero-icon", HeroIcon);
customElements.define("invoice-list", InvoiceList);
customElements.define("invoice-page", InvoicePage);
customElements.define("invoice-status", InvoiceStatus);
customElements.define("invoices-layout", InvoicesLayout);
customElements.define("invoices-page", InvoicesPage);
customElements.define("login-page", LoginPage);
customElements.define("pagination-nav", PaginationNav);
customElements.define("revenue-chart", RevenueChart);
customElements.define("amount-format", AmountFormat);
customElements.define("welcome-page", WelcomePage);
