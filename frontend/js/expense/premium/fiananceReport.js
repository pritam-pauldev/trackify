let currentAnalyticsPage = 1;

// ── Download PDF ────────────────────────────────────────────────
document.addEventListener("click", async (e) => {
  if (!e.target.closest("#downloadReportBtn")) return;

  const { jsPDF } = window.jspdf;
  const element = document.getElementById("analyticsCard");

  const emojiSpans = element.querySelectorAll(".expense-icon");
  emojiSpans.forEach((el) => (el.style.visibility = "hidden"));

  const prevOverflow = element.style.overflow;
  element.style.overflow = "visible";
  const tableWrap = element.querySelector(".analytics-table-wrap");
  const prevTableOverflow = tableWrap ? tableWrap.style.overflow : "";
  if (tableWrap) tableWrap.style.overflow = "visible";

  await new Promise((r) => setTimeout(r, 200));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    width: element.offsetWidth,
    height: element.scrollHeight,
    ignoreElements: (el) =>
      el.classList.contains("expense-icon") || el.tagName === "BUTTON",
  });

  emojiSpans.forEach((el) => (el.style.visibility = "visible"));
  element.style.overflow = prevOverflow;
  if (tableWrap) tableWrap.style.overflow = prevTableOverflow;

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const ratio = contentWidth / canvas.width;
  const totalHeightMM = canvas.height * ratio;
  const pageContentH = pageHeight - margin * 2;
  const totalPages = Math.ceil(totalHeightMM / pageContentH);

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();
    const srcY = (i * pageContentH) / ratio;
    const srcH = Math.min(pageContentH / ratio, canvas.height - srcY);
    const drawH = srcH * ratio;
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(srcH);
    const ctx = slice.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      srcY,
      canvas.width,
      srcH,
      0,
      0,
      canvas.width,
      srcH,
    );
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      contentWidth,
      drawH,
    );
  }

  pdf.save("financial-report.pdf");
});

// ── Inject analytics card ───────────────────────────────────────
function injectAnalyticsCard() {
  if (document.getElementById("analyticsCard")) return;

  const analyticsCard = document.createElement("section");
  analyticsCard.id = "analyticsCard";
  analyticsCard.className = "card";
  analyticsCard.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">📊 Financial Report</h2>
      <div class="analytics-filter" id="analyticsFilter">
        <button class="filter-btn active" data-range="monthly">Monthly</button>
        <button class="filter-btn" data-range="weekly">Weekly</button>
        <button class="filter-btn" data-range="daily">Daily</button>
      </div>
      <button class="download-btn" id="downloadReportBtn">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PDF
      </button>
    </div>
    <div id="analyticsContent">
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
      <div class="skeleton-row"></div>
    </div>`;

  const anchor =
    document.getElementById("leaderboardCard") ||
    document.querySelectorAll(".card")[1];
  anchor.insertAdjacentElement("afterend", analyticsCard);

  document.getElementById("analyticsFilter").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentAnalyticsPage = 1;
    renderAnalytics(btn.dataset.range);
  });
}

// ── Fetch & render ──────────────────────────────────────────────
function renderAnalytics(range = "monthly") {
  const token = localStorage.getItem("token");
  const user = parseJwt(token);
  if (!user?.isPremium) return;

  const container = document.getElementById("analyticsContent");
  if (!container) return;

  Promise.all([
    axios.get(
      `${api}/expense/report?page=${currentAnalyticsPage}&range=${range}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
    axios.get(`${api}/expense/report?page=1&limit=9999&range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])
    .then(([pagedRes, allRes]) => {
      const raw = pagedRes.data.expenses || [];
      const totalPages = pagedRes.data.totalPages;
      const totalCount = pagedRes.data.totalCount;
      const yearlyData = allRes.data.expenses || [];
      renderAnalyticsTable(
        container,
        raw,
        yearlyData,
        range,
        totalPages,
        totalCount,
      );
    })
    .catch(() => {
      container.innerHTML = `<p style="font-size:13px;color:#dc2626;padding:10px 0">Failed to load analytics.</p>`;
    });
}

function renderAnalyticsTable(
  container,
  rows,
  yearlyRows,
  range,
  totalPages,
  totalCount,
) {
  const now = new Date();
  const isIncome = (e) =>
    (e.type || "").toLowerCase() === "income" ||
    (e.category || "").toLowerCase() === "salary";

  let grandIncome = 0,
    grandExpense = 0;
  yearlyRows.forEach((e) => {
    const amt = parseFloat(e.amount || 0);
    if (isIncome(e)) grandIncome += amt;
    else grandExpense += amt;
  });
  const grandSavings = grandIncome - grandExpense;
  const grandSavingsClass = grandSavings >= 0 ? "val-income" : "val-expense";

  let pageIncome = 0,
    pageExpense = 0;
  const rowsHtml = rows
    .map((e, i) => {
      const income = isIncome(e);
      const amt = parseFloat(e.amount || 0);
      if (income) pageIncome += amt;
      else pageExpense += amt;

      const cat = (e.category || "other").toLowerCase();
      const meta = categoryMeta[cat] || categoryMeta.other;

      return `
    <tr class="analytics-row" style="animation-delay:${i * 0.03}s">
      <td class="col-date">${formatDate(e.createdAt || e.date)}</td>
      <td class="col-desc">
        <span class="expense-icon cat-${cat}" style="width:26px;height:26px;font-size:12px;display:inline-flex;margin-right:8px;vertical-align:middle;">${meta.icon}</span>
        ${e.description || "—"}
      </td>
      <td class="col-cat"><span class="cat-pill cat-${cat}">${meta.label}</span></td>
      <td class="col-income ${income ? "val-income" : "val-empty"}">${income ? formatCurrency(amt) : "—"}</td>
      <td class="col-expense ${!income ? "val-expense" : "val-empty"}">${!income ? formatCurrency(amt) : "—"}</td>
    </tr>`;
    })
    .join("");

  const pageSavings = pageIncome - pageExpense;
  const pageSavingsClass = pageSavings >= 0 ? "val-income" : "val-expense";

  let yIncome = 0,
    yExpense = 0;
  yearlyRows.forEach((e) => {
    const amt = parseFloat(e.amount || 0);
    if (isIncome(e)) yIncome += amt;
    else yExpense += amt;
  });
  const ySavings = yIncome - yExpense;
  const ySavingsClass = ySavings >= 0 ? "val-income" : "val-expense";

  const rangeLabel =
    range === "daily"
      ? "Today"
      : range === "weekly"
        ? "This Week"
        : "This Month";
  const activeRange =
    document.querySelector(".filter-btn.active")?.dataset.range || "monthly";

  // ── pagination ──
  let paginationHtml = "";
  if (totalPages > 1) {
    const prevDisabled = currentAnalyticsPage === 1 ? "disabled" : "";
    const nextDisabled = currentAnalyticsPage === totalPages ? "disabled" : "";

    let pageButtons = "";
    const pages = new Set([1, totalPages]);
    for (
      let p = Math.max(2, currentAnalyticsPage - 1);
      p <= Math.min(totalPages - 1, currentAnalyticsPage + 1);
      p++
    ) {
      pages.add(p);
    }
    [...pages]
      .sort((a, b) => a - b)
      .forEach((p, i, arr) => {
        if (i > 0 && p - arr[i - 1] > 1)
          pageButtons += `<span class="page-ellipsis">…</span>`;
        pageButtons += `<button class="page-btn ${p === currentAnalyticsPage ? "active" : ""}" data-page="${p}">${p}</button>`;
      });

    paginationHtml = `
      <div class="pagination-bar">
        <button class="page-nav" data-page="${currentAnalyticsPage - 1}" ${prevDisabled}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        ${pageButtons}
        <button class="page-nav" data-page="${currentAnalyticsPage + 1}" ${nextDisabled}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
  }

  container.innerHTML = `
    <div class="analytics-period-label">${rangeLabel}</div>
    ${
      rows.length === 0
        ? `<div class="empty-state" style="padding:30px 0">
          <p class="empty-title">No transactions in this period</p>
          <p class="empty-sub">Try switching to a wider range.</p>
         </div>`
        : `<div class="analytics-table-wrap">
          <table class="analytics-table">
            <thead>
              <tr>
                <th class="col-date">Date</th>
                <th class="col-desc">Description</th>
                <th class="col-cat">Category</th>
                <th class="col-income">Income</th>
                <th class="col-expense">Expense</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
              <tr class="analytics-total-row">
                <td colspan="3" class="total-label">Page Total <span style="font-size:11px;font-weight:400;color:var(--text-muted)">(${totalCount} total entries)</span></td>
                <td class="val-income">${formatCurrency(pageIncome)}</td>
                <td class="val-expense">${formatCurrency(pageExpense)}</td>
              </tr>
              <tr class="analytics-savings-row">
                <td colspan="3" class="total-label"><span class="savings-badge">Page Savings</span> <span style="font-size:11px;color:var(--text-muted);font-weight:400">(Income − Expense)</span></td>
                <td colspan="2" class="savings-val ${pageSavingsClass}">${formatCurrency(pageSavings)}</td>
              </tr>
              <tr class="analytics-total-row" style="border-top:2px solid var(--border)">
                <td colspan="3" class="total-label">Grand Total (All ${totalCount} entries)</td>
                <td class="val-income">${formatCurrency(grandIncome)}</td>
                <td class="val-expense">${formatCurrency(grandExpense)}</td>
              </tr>
              <tr class="analytics-savings-row">
                <td colspan="3" class="total-label"><span class="savings-badge">Overall Savings</span> <span style="font-size:11px;color:var(--text-muted);font-weight:400">(Income − Expense)</span></td>
                <td colspan="2" class="savings-val ${grandSavingsClass}">${formatCurrency(grandSavings)}</td>
              </tr>
            </tfoot>
          </table>
         </div>
         ${paginationHtml}`
    }
    <div class="analytics-yearly-block">
      <div class="analytics-period-label yearly-label">${now.getFullYear()} — Year at a Glance</div>
      <div class="yearly-summary-grid">
        <div class="yearly-tile yearly-income">
          <span class="yearly-tile-label">Total Income</span>
          <span class="yearly-tile-value">${formatCurrency(yIncome)}</span>
        </div>
        <div class="yearly-tile yearly-expense">
          <span class="yearly-tile-label">Total Expense</span>
          <span class="yearly-tile-value">${formatCurrency(yExpense)}</span>
        </div>
        <div class="yearly-tile yearly-savings">
          <span class="yearly-tile-label">Net Savings</span>
          <span class="yearly-tile-value ${ySavingsClass}">${formatCurrency(ySavings)}</span>
        </div>
      </div>
    </div>`;

  container.querySelectorAll(".page-btn, .page-nav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.dataset.page);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        currentAnalyticsPage = p;
        renderAnalytics(activeRange);
      }
    });
  });
}
