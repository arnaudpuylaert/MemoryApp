const STATS_KEY = "memoryapp_stats";

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function dateKeyOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dateKeyOffset(0);
}

// Registreert één beantwoorde vraag (of één opgeloste puzzel-poging) voor vandaag.
function recordAttempt(isCorrect) {
  const stats = loadStats();
  const key = todayKey();
  if (!stats[key]) stats[key] = { correct: 0, total: 0 };
  stats[key].total++;
  if (isCorrect) stats[key].correct++;
  saveStats(stats);
}

function getTodayStats() {
  const stats = loadStats();
  return stats[todayKey()] || { correct: 0, total: 0 };
}

// Aantal opeenvolgende dagen (tot en met vandaag of gisteren) met minstens 1 oefening.
function getStreak() {
  const stats = loadStats();
  let offset = stats[todayKey()] ? 0 : 1;
  let streak = 0;
  while (stats[dateKeyOffset(offset)]) {
    streak++;
    offset++;
  }
  return streak;
}

function getTotalPracticed() {
  const stats = loadStats();
  return Object.values(stats).reduce((sum, day) => sum + day.total, 0);
}

function getAveragePct(days) {
  const stats = loadStats();
  let correct = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const day = stats[dateKeyOffset(i)];
    if (day) {
      correct += day.correct;
      total += day.total;
    }
  }
  return total === 0 ? null : Math.round((correct / total) * 100);
}

// Reeks van {key, pct, total} van oud naar nieuw, voor het tekenen van een grafiekje.
function getDailySeries(days) {
  const stats = loadStats();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKeyOffset(i);
    const day = stats[key];
    series.push({
      key,
      pct: day && day.total > 0 ? Math.round((day.correct / day.total) * 100) : null,
      total: day ? day.total : 0,
    });
  }
  return series;
}
