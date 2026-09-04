const STATS_KEY = "memoryapp_stats";
const ALL_GAMES = "all";

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

// Registreert één beantwoorde vraag (of één opgeloste puzzel-poging) voor vandaag, voor één specifiek spel.
function recordAttempt(gameId, isCorrect) {
  const stats = loadStats();
  if (!stats[gameId]) stats[gameId] = {};

  const key = todayKey();
  if (!stats[gameId][key]) stats[gameId][key] = { correct: 0, total: 0 };

  stats[gameId][key].total++;
  if (isCorrect) stats[gameId][key].correct++;

  saveStats(stats);
}

// {correct, total} voor één dag. Zonder gameId (of "all") worden alle spellen samengeteld.
function getDayTotals(gameId, key) {
  const stats = loadStats();

  if (gameId && gameId !== ALL_GAMES) {
    return stats[gameId]?.[key] || { correct: 0, total: 0 };
  }

  let correct = 0;
  let total = 0;
  for (const game of Object.values(stats)) {
    const day = game[key];
    if (day) {
      correct += day.correct;
      total += day.total;
    }
  }
  return { correct, total };
}

function getTodayStats(gameId) {
  return getDayTotals(gameId, todayKey());
}

// Aantal opeenvolgende dagen (tot en met vandaag of gisteren) met minstens 1 oefening.
function getStreak(gameId) {
  let offset = getDayTotals(gameId, todayKey()).total > 0 ? 0 : 1;
  let streak = 0;
  while (getDayTotals(gameId, dateKeyOffset(offset)).total > 0) {
    streak++;
    offset++;
  }
  return streak;
}

function getTotalPracticed(gameId) {
  const stats = loadStats();

  if (gameId && gameId !== ALL_GAMES) {
    const game = stats[gameId] || {};
    return Object.values(game).reduce((sum, day) => sum + day.total, 0);
  }

  let total = 0;
  for (const game of Object.values(stats)) {
    total += Object.values(game).reduce((sum, day) => sum + day.total, 0);
  }
  return total;
}

function getAveragePct(gameId, days) {
  let correct = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const day = getDayTotals(gameId, dateKeyOffset(i));
    correct += day.correct;
    total += day.total;
  }
  return total === 0 ? null : Math.round((correct / total) * 100);
}

// Reeks van {key, pct, total} van oud naar nieuw, voor het tekenen van een grafiekje.
function getDailySeries(gameId, days) {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKeyOffset(i);
    const day = getDayTotals(gameId, key);
    series.push({
      key,
      pct: day.total > 0 ? Math.round((day.correct / day.total) * 100) : null,
      total: day.total,
    });
  }
  return series;
}
