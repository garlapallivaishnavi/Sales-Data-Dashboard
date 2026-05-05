const salesData = [
  { product: "Nimbus CRM Suite", category: "Software", sales: 148, revenue: 44400, orders: 62, date: "2026-01-05" },
  { product: "Pulse Analytics Pro", category: "Software", sales: 122, revenue: 36600, orders: 54, date: "2026-01-18" },
  { product: "AeroDesk Standing Desk", category: "Furniture", sales: 81, revenue: 28350, orders: 49, date: "2026-02-02" },
  { product: "FocusFlow Headset", category: "Electronics", sales: 214, revenue: 32100, orders: 108, date: "2026-02-14" },
  { product: "Clarity 4K Monitor", category: "Electronics", sales: 96, revenue: 38400, orders: 61, date: "2026-03-06" },
  { product: "Sprint Onboarding Pack", category: "Services", sales: 54, revenue: 27000, orders: 28, date: "2026-03-19" },
  { product: "Vertex Collaboration Hub", category: "Software", sales: 138, revenue: 48300, orders: 73, date: "2026-04-03" },
  { product: "ErgoFlex Chair", category: "Furniture", sales: 117, revenue: 40950, orders: 64, date: "2026-04-17" },
  { product: "Beacon Security Audit", category: "Services", sales: 41, revenue: 32800, orders: 19, date: "2026-05-01" },
  { product: "SwiftPOS Terminal", category: "Hardware", sales: 89, revenue: 31150, orders: 42, date: "2026-05-13" },
  { product: "Nova Laptop Dock", category: "Hardware", sales: 166, revenue: 33200, orders: 91, date: "2026-06-04" },
  { product: "Signal Support Retainer", category: "Services", sales: 63, revenue: 37800, orders: 31, date: "2026-06-18" },
  { product: "Lumina Tablet Kit", category: "Electronics", sales: 142, revenue: 49700, orders: 76, date: "2026-07-07" },
  { product: "Orbit Inventory Cloud", category: "Software", sales: 131, revenue: 45850, orders: 68, date: "2026-07-22" },
  { product: "Atlas Conference Table", category: "Furniture", sales: 36, revenue: 21600, orders: 16, date: "2026-08-10" },
  { product: "Prime Implementation", category: "Services", sales: 49, revenue: 44100, orders: 23, date: "2026-08-25" },
  { product: "Edge Router Bundle", category: "Hardware", sales: 104, revenue: 26000, orders: 57, date: "2026-09-08" },
  { product: "Echo Wireless Speaker", category: "Electronics", sales: 188, revenue: 22560, orders: 97, date: "2026-09-21" },
  { product: "Summit BI Platform", category: "Software", sales: 115, revenue: 57500, orders: 52, date: "2026-10-06" },
  { product: "Lift Workspace Kit", category: "Furniture", sales: 75, revenue: 33750, orders: 43, date: "2026-10-23" },
  { product: "Secure Cloud Migration", category: "Services", sales: 58, revenue: 58000, orders: 24, date: "2026-11-09" },
  { product: "Catalyst POS Bundle", category: "Hardware", sales: 127, revenue: 44450, orders: 67, date: "2026-11-20" },
  { product: "Quantum Sales AI", category: "Software", sales: 152, revenue: 68400, orders: 79, date: "2026-12-04" },
  { product: "Vivid Studio Display", category: "Electronics", sales: 93, revenue: 46500, orders: 51, date: "2026-12-16" }
];

const state = {
  filteredData: [...salesData],
  charts: {}
};

const colors = {
  blue: "#3461ff",
  teal: "#11b8a8",
  amber: "#ffb547",
  rose: "#f75d8b",
  violet: "#7b61ff",
  sky: "#2db7ff",
  mint: "#38d996"
};

const categoryColors = {
  Software: colors.blue,
  Furniture: colors.amber,
  Electronics: colors.rose,
  Services: colors.teal,
  Hardware: colors.violet
};

const elements = {
  startDate: document.querySelector("#startDate"),
  endDate: document.querySelector("#endDate"),
  categoryFilter: document.querySelector("#categoryFilter"),
  searchInput: document.querySelector("#searchInput"),
  resetFilters: document.querySelector("#resetFilters"),
  exportCsv: document.querySelector("#exportCsv"),
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
  tableBody: document.querySelector("#salesTableBody"),
  tableSummary: document.querySelector("#tableSummary"),
  metricSales: document.querySelector('[data-metric="sales"]'),
  metricRevenue: document.querySelector('[data-metric="revenue"]'),
  metricOrders: document.querySelector('[data-metric="orders"]'),
  metricGrowth: document.querySelector('[data-metric="growth"]')
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function init() {
  hydrateFilterOptions();
  setupCharts();
  bindEvents();
  applyFilters();
}

function hydrateFilterOptions() {
  const categories = [...new Set(salesData.map((item) => item.category))].sort();
  const dates = salesData.map((item) => item.date).sort();

  elements.startDate.value = dates[0];
  elements.endDate.value = dates[dates.length - 1];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

function bindEvents() {
  [elements.startDate, elements.endDate, elements.categoryFilter].forEach((element) => {
    element.addEventListener("change", applyFilters);
  });

  elements.searchInput.addEventListener("input", applyFilters);
  elements.resetFilters.addEventListener("click", resetFilters);
  elements.exportCsv.addEventListener("click", exportCsv);
  elements.themeToggle.addEventListener("click", toggleTheme);
}

function applyFilters() {
  const startDate = elements.startDate.value;
  const endDate = elements.endDate.value;
  const category = elements.categoryFilter.value;
  const query = elements.searchInput.value.trim().toLowerCase();

  state.filteredData = salesData.filter((item) => {
    const matchesDate = item.date >= startDate && item.date <= endDate;
    const matchesCategory = category === "all" || item.category === category;
    const matchesQuery = item.product.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
    return matchesDate && matchesCategory && matchesQuery;
  });

  updateMetrics(state.filteredData);
  updateCharts(state.filteredData);
  renderTable(state.filteredData);
}

function resetFilters() {
  const dates = salesData.map((item) => item.date).sort();
  elements.startDate.value = dates[0];
  elements.endDate.value = dates[dates.length - 1];
  elements.categoryFilter.value = "all";
  elements.searchInput.value = "";
  applyFilters();
}

function updateMetrics(data) {
  const totals = data.reduce((acc, item) => {
    acc.sales += item.sales;
    acc.revenue += item.revenue;
    acc.orders += item.orders;
    return acc;
  }, { sales: 0, revenue: 0, orders: 0 });

  const growth = calculateGrowth(data);

  animateCounter(elements.metricSales, totals.sales, numberFormatter.format);
  animateCounter(elements.metricRevenue, totals.revenue, (value) => currencyFormatter.format(value));
  animateCounter(elements.metricOrders, totals.orders, numberFormatter.format);
  animateCounter(elements.metricGrowth, growth, (value) => `${value.toFixed(1)}%`);
}

function calculateGrowth(data) {
  if (data.length < 2) return 0;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const midpoint = Math.ceil(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);
  const firstRevenue = sumBy(firstHalf, "revenue");
  const secondRevenue = sumBy(secondHalf, "revenue");

  if (!firstRevenue || !secondRevenue) return 0;
  return ((secondRevenue - firstRevenue) / firstRevenue) * 100;
}

function animateCounter(element, target, formatter) {
  const start = Number(element.dataset.value || 0);
  const duration = 650;
  const startTime = performance.now();

  element.dataset.value = target;

  function tick(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (target - start) * eased;
    element.textContent = formatter(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function setupCharts() {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = getComputedStyle(document.body).getPropertyValue("--muted").trim();
  Chart.defaults.plugins.legend.labels.usePointStyle = true;

  state.charts.line = new Chart(document.querySelector("#salesLineChart"), {
    type: "line",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 550, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: { padding: 12, backgroundColor: "rgba(23, 32, 51, 0.92)" }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "rgba(125, 142, 176, 0.16)" } }
      }
    }
  });

  state.charts.bar = new Chart(document.querySelector("#revenueBarChart"), {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 550, easing: "easeOutQuart" },
      borderRadius: 8,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 12,
          callbacks: {
            label: (context) => `Revenue: ${currencyFormatter.format(context.raw)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(125, 142, 176, 0.16)" },
          ticks: { callback: (value) => `$${value / 1000}k` }
        }
      }
    }
  });

  state.charts.pie = new Chart(document.querySelector("#categoryPieChart"), {
    type: "doughnut",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      animation: { animateRotate: true, duration: 650 },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          padding: 12,
          callbacks: {
            label: (context) => `${context.label}: ${currencyFormatter.format(context.raw)}`
          }
        }
      }
    }
  });
}

function updateCharts(data) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const dailyLabels = sorted.map((item) => formatShortDate(item.date));
  const dailySales = sorted.map((item) => item.sales);

  state.charts.line.data.labels = dailyLabels;
  state.charts.line.data.datasets = [{
    label: "Sales",
    data: dailySales,
    borderColor: colors.blue,
    backgroundColor: createGradient(state.charts.line.ctx, colors.blue),
    borderWidth: 3,
    pointRadius: 4,
    pointHoverRadius: 7,
    fill: true,
    tension: 0.38
  }];
  state.charts.line.update();

  const monthlyRevenue = groupByMonth(data);
  state.charts.bar.data.labels = Object.keys(monthlyRevenue);
  state.charts.bar.data.datasets = [{
    label: "Revenue",
    data: Object.values(monthlyRevenue),
    backgroundColor: [colors.blue, colors.teal, colors.amber, colors.rose, colors.violet, colors.sky, colors.mint],
    borderSkipped: false
  }];
  state.charts.bar.update();

  const categoryRevenue = groupBy(data, "category", "revenue");
  state.charts.pie.data.labels = Object.keys(categoryRevenue);
  state.charts.pie.data.datasets = [{
    label: "Revenue",
    data: Object.values(categoryRevenue),
    backgroundColor: Object.keys(categoryRevenue).map((category) => categoryColors[category] || colors.sky),
    borderColor: getComputedStyle(document.body).getPropertyValue("--surface-solid").trim(),
    borderWidth: 4
  }];
  state.charts.pie.update();
}

function renderTable(data) {
  elements.tableBody.innerHTML = "";
  elements.tableBody.classList.remove("fade-in");
  void elements.tableBody.offsetWidth;
  elements.tableBody.classList.add("fade-in");

  elements.tableSummary.textContent = `${data.length} product ${data.length === 1 ? "record" : "records"} in view`;

  if (!data.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="empty-state" colspan="6">No sales records match the current filters.</td>`;
    elements.tableBody.appendChild(row);
    return;
  }

  data
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <span class="product-cell">
            <span class="product-dot" style="background:${categoryColors[item.category] || colors.sky}"></span>
            ${item.product}
          </span>
        </td>
        <td>${item.category}</td>
        <td>${numberFormatter.format(item.sales)}</td>
        <td>${currencyFormatter.format(item.revenue)}</td>
        <td>${numberFormatter.format(item.orders)}</td>
        <td>${dateFormatter.format(new Date(`${item.date}T00:00:00`))}</td>
      `;
      elements.tableBody.appendChild(row);
    });
}

function groupByMonth(data) {
  return data
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce((acc, item) => {
      const label = new Date(`${item.date}T00:00:00`).toLocaleString("en-US", { month: "short" });
      acc[label] = (acc[label] || 0) + item.revenue;
      return acc;
    }, {});
}

function groupBy(data, key, valueKey) {
  return data.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + item[valueKey];
    return acc;
  }, {});
}

function sumBy(data, key) {
  return data.reduce((sum, item) => sum + item[key], 0);
}

function formatShortDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 420);
  gradient.addColorStop(0, `${color}55`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
}

function exportCsv() {
  const header = ["Product name", "Category", "Sales", "Revenue", "Orders", "Date"];
  const rows = state.filteredData.map((item) => [
    item.product,
    item.category,
    item.sales,
    item.revenue,
    item.orders,
    item.date
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sales-dashboard-export.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  elements.themeIcon.textContent = isDark ? "L" : "D";
  Chart.defaults.color = getComputedStyle(document.body).getPropertyValue("--muted").trim();
  updateCharts(state.filteredData);
}

init();
