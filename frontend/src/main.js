import "./style.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const form = document.getElementById("journal-form");
const moodInput = document.getElementById("mood-input");
const submitBtn = document.getElementById("submit-btn");
const aiResponseText = document.getElementById("ai-response-text");
const historyList = document.getElementById("history-list");

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

function renderEmptyState() {
  historyList.innerHTML = `
    <div class="empty-state">
      No journal entries yet.
    </div>
  `;
}

function createEntryHtml(entry) {
  return `
    <div class="history-item">
      <p class="entry-date">${formatDate(entry.createdAt)}</p>
      <p class="entry-mood">${entry.mood}</p>
      <p class="entry-response">${entry.aiResponse}</p>
    </div>
  `;
}

function renderEntries(entries) {
  if (!entries || entries.length === 0) {
    renderEmptyState();
    return;
  }

  historyList.innerHTML = entries.map(createEntryHtml).join("");
}

function prependEntry(entry) {
  const emptyState = historyList.querySelector(".empty-state");

  if (emptyState) {
    historyList.innerHTML = createEntryHtml(entry);
    return;
  }

  historyList.insertAdjacentHTML("afterbegin", createEntryHtml(entry));
}

async function loadEntryHistory() {
  try {
    const response = await fetch(`${API_BASE}/entries`);

    if (!response.ok) {
      throw new Error("Failed to load entries");
    }

    const entries = await response.json();
    
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderEntries(entries);
  } catch (error) {
    console.error("Error loading history:", error);

    historyList.innerHTML = `
      <div class="empty-state">
        Failed to load journal history.
      </div>
    `;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = moodInput.value.trim();

  if (!text) {
    aiResponseText.textContent = "Please write something first.";
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Thinking...";
    aiResponseText.textContent = "Generating response...";

    const response = await fetch(`${API_BASE}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mood: text }),
    });

    const newEntry = await response.json();

    if (!response.ok) {
      throw new Error(newEntry.error || "Something went wrong. Try again.");
    }

    aiResponseText.textContent = newEntry.aiResponse;
    prependEntry(newEntry);
    moodInput.value = "";
  } catch (error) {
    console.error("Error creating entry:", error);
    aiResponseText.textContent =
      error.message || "Something went wrong. Try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send";
  }
});

loadEntryHistory();