const GATE_KEY = "memoryapp_unlocked";

// Genereer je eigen code via set-password.html en plak die hier tussen de aanhalingstekens.
const GATE_PASSWORD_HASH = "e7218f7bd0d3eb3bfe1629e4e9550edbc25df49096c86c8345451dd88e9f30e4";

async function sha256(text) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function unlockApp() {
  localStorage.setItem(GATE_KEY, "1");
  document.getElementById("gate").hidden = true;
  document.getElementById("app-content").hidden = false;
}

if (localStorage.getItem(GATE_KEY) === "1") {
  unlockApp();
} else {
  document.getElementById("gate-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("gate-password");
    const error = document.getElementById("gate-error");
    const hash = await sha256(input.value);

    if (hash === GATE_PASSWORD_HASH) {
      unlockApp();
    } else {
      error.textContent = "Onjuist wachtwoord.";
      input.value = "";
      input.focus();
    }
  });
}
