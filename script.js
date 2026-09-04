const WEEKDAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function renderKpis() {
  const streak = getStreak();
  const today = getTodayStats();
  const total = getTotalPracticed();

  document.getElementById("kpi-streak").textContent = streak;
  document.getElementById("kpi-today").textContent =
    today.total > 0 ? `${today.correct}/${today.total}` : "–";
  document.getElementById("kpi-total").textContent = total;
}

function renderChartHeadline(days) {
  const avg = getAveragePct(days);
  const headline = document.getElementById("chart-avg");

  if (avg === null) {
    headline.textContent = "Nog geen data — begin met oefenen";
  } else {
    headline.textContent = `Gemiddelde score: ${avg}% (${rangeLabel(days)})`;
  }
}

function renderChart(days) {
  const series = getDailySeries(days);
  const width = 400;
  const height = 160;
  const padLeft = 30;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 24;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  const baseline = padTop + innerHeight;

  const xFor = (i) =>
    series.length === 1 ? padLeft + innerWidth / 2 : padLeft + (i / (series.length - 1)) * innerWidth;
  const yFor = (pct) => baseline - ((pct ?? 0) / 100) * innerHeight;

  const linePoints = series.map((d, i) => `${xFor(i)},${yFor(d.pct)}`).join(" L ");
  const areaPath = `M ${xFor(0)},${baseline} L ${linePoints} L ${xFor(series.length - 1)},${baseline} Z`;

  const gridLines = [0, 50, 100]
    .map((pct) => {
      const y = yFor(pct);
      return `
        <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="var(--rule)" stroke-width="1"></line>
        <text x="4" y="${y + 3}" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--muted)">${pct}%</text>
      `;
    })
    .join("");

  const showLabel = (i) => (days === 7 ? true : i % 5 === 0 || i === series.length - 1);

  const xLabels = series
    .map((d, i) => {
      if (!showLabel(i)) return "";
      const date = parseDateKey(d.key);
      const dayLabel = days === 7 ? WEEKDAYS[date.getDay()] : String(date.getDate());
      return `<text x="${xFor(i)}" y="${height - 6}" font-family="IBM Plex Mono, monospace" font-size="9" fill="var(--muted)" text-anchor="middle">${dayLabel}</text>`;
    })
    .join("");

  const points = series
    .map((d, i) => {
      const isToday = i === series.length - 1;
      const hasData = d.total > 0;
      const r = isToday ? 4.5 : 3;
      const fill = hasData ? "var(--accent)" : "#fff";
      return `<circle cx="${xFor(i)}" cy="${yFor(d.pct)}" r="${r}" fill="${fill}" stroke="var(--accent)" stroke-width="1.5"></circle>`;
    })
    .join("");

  document.getElementById("chart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Score per dag, ${rangeLabel(days)}">
      ${gridLines}
      <path d="${areaPath}" fill="var(--accent-soft)"></path>
      <path d="M ${linePoints}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
      ${points}
      ${xLabels}
    </svg>
  `;
}

function rangeLabel(days) {
  return days === 7 ? "laatste 7 dagen" : "laatste 30 dagen";
}

function setActiveRange(days) {
  document.querySelectorAll(".range-btn").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.range) === days);
  });
  renderChartHeadline(days);
  renderChart(days);
}

document.querySelectorAll(".range-btn").forEach((btn) => {
  btn.addEventListener("click", () => setActiveRange(Number(btn.dataset.range)));
});

renderKpis();
setActiveRange(7);
