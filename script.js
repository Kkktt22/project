import { verbs } from "./data/verbs.js";
import { cinema, fill } from "./data/questions.js";

const app = document.querySelector("#app");
const nav = document.querySelector("#nav");
const menuBtn = document.querySelector("#menuBtn");
const KEY = "lingua_v2";
const today = new Date().toISOString().slice(0, 10);

const defaultState = () => ({
  answered: 0,
  correct: 0,
  learned: [],
  missed: [],
  streak: 0,
  dailyDone: null,
  history: [],
  achievements: []
});

let state;
try {
  state = JSON.parse(localStorage.getItem(KEY) || "null") || defaultState();
} catch {
  state = defaultState();
}

let page = "home";
let learnIndex = 0;
let session = null;
let sessionSource = null;
let answeredCurrent = false;

const $ = (selector) => document.querySelector(selector);

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function accuracy() {
  return state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
}

function recordAnswer(ok, verb) {
  state.answered += 1;
  if (ok) {
    state.correct += 1;
    if (verb && !state.learned.includes(verb)) state.learned.push(verb);
    state.streak += 1;
  } else {
    if (verb && !state.missed.includes(verb)) state.missed.push(verb);
    state.streak = 0;
  }
  state.history.push({ date: today, verb, ok });
  checkAchievements();
  save();
}

function checkAchievements() {
  const a = state.achievements;
  if (state.learned.length >= 1 && !a.includes("first")) a.push("first");
  if (state.learned.length >= 10 && !a.includes("ten")) a.push("ten");
  if (state.learned.length >= 25 && !a.includes("twentyfive")) a.push("twentyfive");
  if (state.streak >= 5 && !a.includes("streak")) a.push("streak");
}

function go(nextPage) {
  page = ["home", "learn", "practice", "library", "progress"].includes(nextPage) ? nextPage : "home";
  session = null;
  sessionSource = null;
  answeredCurrent = false;
  nav?.querySelectorAll(".nav").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  nav?.classList.remove("open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  const views = { home, learn, practice, library, progress };
  app.innerHTML = `<section class="page">${views[page] ? views[page]() : home()}</section>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function home() {
  const completed = state.dailyDone === today;
  return `
    <div class="hero">
      <span class="eyebrow">Interactive English learning</span>
      <h1>Lingua</h1>
      <p>Learn phrasal verbs through context, then train until you can use them yourself.</p>
      <div class="actions center">
        <button class="btn primary" data-action="go" data-page="learn">Start learning</button>
        <button class="btn secondary" data-action="go" data-page="practice">Practice</button>
      </div>
    </div>
    <div class="section"><h2>Today</h2><p>Your short daily learning session.</p></div>
    <div class="card daily">
      <div>
        <span class="pill">Daily challenge</span>
        <h3>${completed ? "Completed 🎉" : "5 minutes of practice"}</h3>
        <p class="muted">${completed ? "Today's challenge is complete. You can practice again whenever you want." : "Complete a short mixed session to finish today's challenge."}</p>
      </div>
      <button class="btn primary" data-action="daily">${completed ? "Practice again" : "Start daily"}</button>
    </div>
    <div class="section"><h2>Your dashboard</h2></div>
    <div class="grid g3">
      <div class="card stat"><strong>${state.learned.length}</strong>learned</div>
      <div class="card stat"><strong>${accuracy()}%</strong>accuracy</div>
      <div class="card stat"><strong>${state.streak}</strong>correct streak</div>
    </div>
    <div class="section"><h2>Learning cycle</h2></div>
    <div class="grid g3">
      <div class="card"><div class="icon">🎬</div><h3>Context</h3><p class="muted">See a phrase in a meaningful situation.</p></div>
      <div class="card"><div class="icon">🧩</div><h3>Practice</h3><p class="muted">Recall, recognize and use the expression.</p></div>
      <div class="card"><div class="icon">🔁</div><h3>Review</h3><p class="muted">Return to expressions that need more practice.</p></div>
    </div>`;
}

function learn() {
  const v = verbs[learnIndex];
  return `<div class="lesson"><div class="card">
    <span class="pill">${esc(v.level)} · ${esc(v.category)}</span>
    <h1 class="verb">${esc(v.verb)}</h1>
    <div class="meaning">${esc(v.meaning)}</div>
    <div class="example">“${esc(v.example)}”</div>
    <div class="context"><strong>Why this context?</strong><br>${esc(v.context)}</div>
    <div class="toolbar" style="margin-top:15px">
      <button class="btn secondary" data-action="practice-verb">Practice this</button>
      <button class="btn primary" data-action="mark-learned">${state.learned.includes(v.verb) ? "Learned ✓" : "Mark as learned"}</button>
    </div>
    <hr style="border:0;border-top:1px solid var(--line);margin:24px 0">
    <div class="toolbar">
      <button class="btn secondary" data-action="prev">← Previous</button>
      <button class="btn primary" data-action="next">Next →</button>
    </div>
    <p class="muted">Card ${learnIndex + 1} of ${verbs.length}</p>
  </div></div>`;
}

function practice() {
  if (!session) {
    const modes = [
      ["🎯", "Choose", "Choose the phrasal verb that fits.", "choose"],
      ["✍️", "Fill the gap", "Recall the expression without options.", "fill"],
      ["🧠", "Meaning", "Identify what a phrase means in context.", "meaning"],
      ["🎭", "Context", "Infer the correct expression from a situation.", "context"],
      ["🔄", "Review", "Practice expressions you missed.", "review"],
      ["🎲", "Mixed", "A balanced mix of exercise types.", "mixed"]
    ];
    return `<div class="section"><h1>Practice</h1><p>Choose how you want to train.</p></div>
      <div class="grid g3">${modes.map(([icon,title,text,mode]) => `
        <div class="card"><div class="icon">${icon}</div><h3>${title}</h3><p class="muted">${text}</p>
        <button class="btn primary" data-action="start" data-mode="${mode}">Start</button></div>`).join("")}</div>`;
  }
  if (session.done) return result();

  const q = session.items[session.i];
  const pct = Math.round((session.i / session.items.length) * 100);

  if (q.type === "fill") {
    return quiz(`<h1>Fill in the gap</h1><div class="example">${esc(q.sentence)}</div>
      <input class="input" id="answer" autocomplete="off" placeholder="Type the phrasal verb">
      <div id="feedback"></div><button class="btn primary" data-action="check-fill">Check</button>`, pct);
  }
  if (q.type === "meaning") {
    const options = shuffle([q.meaning, ...q.meaningDistractors]);
    return quiz(`<h1>What does it mean?</h1><div class="example"><strong>${esc(q.verb)}</strong></div>
      <div id="options">${options.map((o) => `<button class="option" data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="feedback"></div>`, pct);
  }
  if (q.type === "context") {
    return quiz(`<h1>Which expression fits?</h1><div class="context">${esc(q.context)}</div>
      <div class="example">${esc(q.sentence)}</div><div id="options">${shuffle(q.options).map((o) => `<button class="option" data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="feedback"></div>`, pct);
  }
  return quiz(`<h1>Choose the phrasal verb</h1><p class="muted">🎬 ${esc(q.source)}</p>
    <div class="example">${esc(q.sentence)}</div><div id="options">${shuffle(q.options).map((o) => `<button class="option" data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="feedback"></div>`, pct);
}

function quiz(content, pct) {
  return `<div class="lesson"><div class="card"><span class="pill">Question ${session.i + 1} of ${session.items.length}</span>
    <div class="progressline" style="margin:14px 0 22px"><span style="width:${pct}%"></span></div>${content}
    <br><button class="btn secondary" data-action="exit">Exit</button></div></div>`;
}

function result() {
  const percent = Math.round((session.score / session.items.length) * 100);
  const dailySession = sessionSource === "daily";
  return `<div class="result card"><span class="pill">Session complete</span><div class="score">${session.score}/${session.items.length}</div>
    <h2>${percent}% correct</h2><p class="muted">${percent >= 80 ? "Great work — keep using these expressions in new contexts." : "Good practice. Review your missed expressions and try again."}</p>
    ${dailySession && state.dailyDone === today ? `<p class="success-message">🎉 Today's challenge is complete.</p>` : ""}
    <div class="actions center"><button class="btn primary" data-action="again">Try again</button><button class="btn secondary" data-action="go" data-page="practice">Practice menu</button><button class="btn secondary" data-action="go" data-page="progress">Progress</button></div></div>`;
}

function library() {
  return `<div class="section"><h1>📚 Phrasal Verb Library</h1><p>Browse by level, category or search.</p></div>
    <div class="toolbar"><input class="input search" id="search" placeholder="Search..."><div class="filters">
    <button class="filter active" data-filter="all">All</button><button class="filter" data-filter="A2">A2</button><button class="filter" data-filter="B1">B1</button><button class="filter" data-filter="B2">B2</button></div></div>
    <div class="grid g3" id="cards">${verbs.map(libraryCard).join("")}</div>`;
}

function libraryCard(v) {
  const learned = state.learned.includes(v.verb);
  const missed = state.missed.includes(v.verb);
  return `<article class="card library"><span class="pill">${esc(v.level)}</span><span class="status">${learned ? "🟢" : missed ? "🟡" : "⚪"}</span>
    <h3>${esc(v.verb)}</h3><p><strong>${esc(v.meaning)}</strong></p><p class="muted">${esc(v.context)}</p><p class="tag">${esc(v.category)}</p></article>`;
}

function card(v) {
  const learned = state.learned.includes(v.verb);
  const missed = state.missed.includes(v.verb);
  return `<article class="card library"><span class="pill">${esc(v.level)}</span><span class="status">${learned ? "🟢" : missed ? "🟡" : "⚪"}</span>
    <h3>${esc(v.verb)}</h3><p><strong>${esc(v.meaning)}</strong></p><p class="muted">${esc(v.context)}</p><p class="tag">${esc(v.category)}</p>
    <button class="btn secondary" data-action="library-practice" data-verb="${esc(v.verb)}">Practice</button></article>`;
}

function progress() {
  const achievements = [
    ["first", "🌱", "First step", "Learn your first phrasal verb."],
    ["ten", "📚", "10 verbs", "Learn ten expressions."],
    ["twentyfive", "🚀", "25 verbs", "Learn twenty-five expressions."],
    ["streak", "🔥", "5 streak", "Get five correct answers in a row."]
  ];
  const review = [...new Set(state.missed)].slice(-8).map((verb) => verbs.find((v) => v.verb === verb)).filter(Boolean);
  return `<div class="section"><h1>📈 Progress</h1><p>Your learning data is stored locally on this device.</p></div>
    <div class="grid g3"><div class="card stat"><strong>${state.learned.length}</strong>learned</div><div class="card stat"><strong>${accuracy()}%</strong>accuracy</div><div class="card stat"><strong>${state.answered}</strong>answers</div></div>
    <div class="section"><h2>Library progress</h2></div><div class="card"><div class="bar"><span style="width:${Math.min(100,(state.learned.length/verbs.length)*100)}%"></span></div><p>${state.learned.length} / ${verbs.length} expressions learned.</p></div>
    <div class="section"><h2>Achievements</h2></div><div class="grid g2">${achievements.map(([id,icon,title,text]) => `<div class="card achievement"><div class="badge">${icon}</div><div><strong>${title}</strong><div class="muted">${text}</div>${state.achievements.includes(id) ? "<span class='check'>Unlocked ✓</span>" : "<span class='tag'>Locked</span>"}</div></div>`).join("")}</div>
    <div class="section"><h2>Needs review</h2></div>${review.length ? `<div class="grid g3">${review.map(card).join("")}</div>` : `<div class="card"><p class="muted">Nothing here yet. Great start!</p></div>`}
    <div class="section"><button class="btn danger" data-action="reset">Reset all progress</button></div>`;
}

function normalizeCinema(q) { return { ...q, type: "choose", options: q.options || [q.answer] }; }
function normalizeFill(q) { return { ...q, type: "fill" }; }
function makeMeaningQuestion(q) {
  const correct = verbs.find((v) => v.verb === q.verb)?.meaning || "";
  const distractors = shuffle(verbs.filter((v) => v.verb !== q.verb).map((v) => v.meaning)).slice(0, 3);
  return { ...q, type: "meaning", meaning: correct, meaningDistractors: distractors };
}
function makeContextQuestion(q) {
  const v = verbs.find((item) => item.verb === q.verb);
  return { ...q, type: "context", context: v?.context || q.explanation || "Choose the expression that best fits the situation." };
}

function start(mode, source = null) {
  let items = [];
  if (mode === "choose") items = shuffle(cinema).slice(0, 8).map(normalizeCinema);
  else if (mode === "fill") items = shuffle(fill).slice(0, 8).map(normalizeFill);
  else if (mode === "meaning") items = shuffle(cinema).slice(0, 8).map(makeMeaningQuestion);
  else if (mode === "context") items = shuffle(cinema).slice(0, 8).map(makeContextQuestion);
  else if (mode === "review") {
    const missed = [...new Set(state.missed)];
    items = shuffle(cinema.filter((q) => missed.includes(q.verb))).slice(0, 8).map(normalizeCinema);
    if (!items.length) items = shuffle(cinema).slice(0, 5).map(normalizeCinema);
  } else if (mode === "mixed") {
    const choose = shuffle(cinema).slice(0, 3).map(normalizeCinema);
    const fills = shuffle(fill).slice(0, 3).map(normalizeFill);
    const meanings = shuffle(cinema).slice(3, 6).map(makeMeaningQuestion);
    const contexts = shuffle(cinema).slice(6, 9).map(makeContextQuestion);
    items = shuffle([...choose, ...fills, ...meanings, ...contexts]).slice(0, 10);
  }
  if (!items.length) return;
  session = { mode, items, i: 0, score: 0, done: false };
  sessionSource = source;
  answeredCurrent = false;
  page = "practice";
  nav?.querySelectorAll(".nav").forEach((button) => button.classList.toggle("active", button.dataset.page === "practice"));
  render();
}

function startForVerb(verb) {
  const v = verbs.find((item) => item.verb === verb);
  if (!v) return;

  const cinemaQuestion = cinema.find((item) => item.verb === verb);
  let q;

  if (cinemaQuestion) {
    q = normalizeCinema(cinemaQuestion);
  } else {
    const distractors = shuffle(verbs.filter((item) => item.verb !== verb))
      .slice(0, 3)
      .map((item) => item.verb);
    q = {
      type: "choose",
      verb: v.verb,
      answer: v.verb,
      options: shuffle([v.verb, ...distractors]),
      sentence: v.example,
      source: "Lingua Library",
      explanation: v.context
    };
  }

  session = { mode: "choose", items: [q], i: 0, score: 0, done: false };
  sessionSource = "verb";
  answeredCurrent = false;
  page = "practice";
  nav?.querySelectorAll(".nav").forEach((button) => button.classList.toggle("active", button.dataset.page === "practice"));
  render();
}

function finishQuestion() {
  if (!session || !answeredCurrent) return;
  session.i += 1;
  answeredCurrent = false;
  if (session.i >= session.items.length) {
    session.done = true;
    if (sessionSource === "daily") {
      state.dailyDone = today;
      save();
    }
  }
  render();
}

function answerChoice(selected) {
  if (!session || answeredCurrent) return;
  const q = session.items[session.i];
  const correct = q.type === "meaning" ? q.meaning : q.answer;
  const ok = selected === correct;
  answeredCurrent = true;
  if (ok) session.score += 1;
  recordAnswer(ok, q.verb);
  document.querySelectorAll(".option").forEach((button) => {
    button.disabled = true;
    if (button.dataset.answer === correct) button.classList.add("correct");
    if (button.dataset.answer === selected && !ok) button.classList.add("wrong");
  });
  $("#feedback").innerHTML = `<div class="feedback"><strong>${ok ? "Correct! ✓" : "Not quite."}</strong><p>${esc(q.explanation || "Review the expression in context.")}</p>${!ok ? `<p><strong>Answer:</strong> ${esc(correct)}</p>` : ""}<button class="btn primary" data-action="next-question">${session.i + 1 >= session.items.length ? "Finish" : "Next"}</button></div>`;
}

function checkFill() {
  if (!session || answeredCurrent) return;
  const input = $("#answer");
  if (!input) return;
  const q = session.items[session.i];
  const userAnswer = input.value.trim().toLowerCase().replace(/\s+/g, " ");
  const correct = q.answer.trim().toLowerCase();
  if (!userAnswer) {
    $("#feedback").innerHTML = `<div class="feedback"><strong>Type an answer first.</strong></div>`;
    return;
  }
  answeredCurrent = true;
  const ok = userAnswer === correct;
  if (ok) session.score += 1;
  recordAnswer(ok, q.verb);
  input.disabled = true;
  $("[data-action='check-fill']")?.setAttribute("disabled", "true");
  $("#feedback").innerHTML = `<div class="feedback"><strong>${ok ? "Correct! ✓" : "Not quite."}</strong><p>${esc(q.explanation || "Review this expression.")}</p>${!ok ? `<p><strong>Answer:</strong> ${esc(q.answer)}</p>` : ""}<button class="btn primary" data-action="next-question">${session.i + 1 >= session.items.length ? "Finish" : "Next"}</button></div>`;
}

function filterLibrary() {
  const term = ($("#search")?.value || "").toLowerCase();
  const filter = document.querySelector(".filter.active")?.dataset.filter || "all";
  const results = verbs.filter((v) => {
    const levelOk = filter === "all" || v.level.includes(filter);
    const textOk = [v.verb,v.meaning,v.category,v.context].join(" ").toLowerCase().includes(term);
    return levelOk && textOk;
  });
  $("#cards").innerHTML = results.length ? results.map(libraryCard).join("") : `<div class="card"><p class="muted">Nothing found.</p></div>`;
}

// One delegated click handler keeps every dynamically-rendered control working.
app.addEventListener("click", (event) => {
  const option = event.target.closest(".option");
  if (option) {
    answerChoice(option.dataset.answer);
    return;
  }

  const filterButton = event.target.closest(".filter");
  if (filterButton) {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    filterButton.classList.add("active");
    filterLibrary();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  if (!action) return;

  if (action === "go") go(button.dataset.page);
  else if (action === "start") start(button.dataset.mode);
  else if (action === "daily") start("mixed", "daily");
  else if (action === "library-practice") startForVerb(button.dataset.verb);
  else if (action === "practice-verb") startForVerb(verbs[learnIndex].verb);
  else if (action === "mark-learned") {
    const verb = verbs[learnIndex].verb;
    if (!state.learned.includes(verb)) state.learned.push(verb);
    checkAchievements();
    save();
    render();
  } else if (action === "next") {
    learnIndex = (learnIndex + 1) % verbs.length;
    render();
  } else if (action === "prev") {
    learnIndex = (learnIndex - 1 + verbs.length) % verbs.length;
    render();
  } else if (action === "next-question") finishQuestion();
  else if (action === "exit") {
    session = null;
    sessionSource = null;
    answeredCurrent = false;
    render();
  } else if (action === "check-fill") checkFill();
  else if (action === "again") start(session.mode, sessionSource);
  else if (action === "reset") {
    if (confirm("Reset all progress?")) {
      state = defaultState();
      save();
      session = null;
      sessionSource = null;
      answeredCurrent = false;
      render();
    }
  }
});

app.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.id === "answer") checkFill();
});

app.addEventListener("input", (event) => {
  if (event.target.id === "search") filterLibrary();
});

menuBtn?.addEventListener("click", () => nav?.classList.toggle("open"));
nav?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (button) go(button.dataset.page);
});

render();
