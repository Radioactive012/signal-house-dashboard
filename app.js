(() => {
  const { projects, fundamentals, valueAreas } = window.MASTERY_DATA;
  const STORAGE_KEY = "signal-house-mastery-v2";
  const blankState = () => ({ drills: {}, tests: {}, passed: {} });

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...blankState(), ...(stored || {}) };
    } catch { return blankState(); }
  }

  let state = loadState();
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const currentIndex = () => Math.max(0, projects.findIndex((project) => !state.passed[project.id]));
  const currentProject = () => projects[currentIndex()] || projects.at(-1);
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const allTestsDone = (project) => project.tests.every((_, index) => state.tests[`${project.id}:t${index}`]);
  const projectDone = (project) => Boolean(state.passed[project.id]);
  const checkbox = (kind, project, index, label, enabled) => {
    const key = `${project.id}:${kind[0]}${index}`;
    const checked = Boolean(state[kind][key]);
    return `<label class="check-row ${!enabled ? "is-locked" : ""}"><input type="checkbox" data-kind="${kind}" data-project="${project.id}" data-index="${index}" ${checked ? "checked" : ""} ${enabled ? "" : "disabled"}/><span class="box" aria-hidden="true"></span><span>${esc(label)}</span></label>`;
  };

  function renderMission() {
    const project = currentProject();
    const isFinal = projects.every(projectDone);
    const active = !isFinal;
    const drillsDone = project.drills.filter((_, i) => state.drills[`${project.id}:d${i}`]).length;
    const testsDone = project.tests.filter((_, i) => state.tests[`${project.id}:t${i}`]).length;
    $("#missionContent").innerHTML = `
      <div class="mission-shell ${isFinal ? "mission-complete" : ""}">
        <div class="mission-title"><p class="project-index">${isFinal ? "FIELD COMPLETE" : project.id}</p><h2>${isFinal ? "You have cleared every gate." : esc(project.title)}</h2><p>${isFinal ? "Keep operating, breaking, and improving real systems. That is where mastery compounds." : esc(project.build)}</p></div>
        <aside class="mission-side"><span>Business value</span><strong>${isFinal ? "Operate real systems" : esc(project.value)}</strong><span>Content milestone</span><strong>${isFinal ? "Publish case studies" : esc(project.content)}</strong></aside>
        ${active ? `<div class="work-block"><div class="block-head"><p>Today’s 10-hour operating block</p><span>${drillsDone}/${project.drills.length} drills · ${testsDone}/${project.tests.length} tests</span></div><div class="hourline"><span>06h <b>build</b></span><span>02h <b>break</b></span><span>01h <b>repair</b></span><span>01h <b>record</b></span></div></div>` : ""}
        ${active ? `<div class="mission-columns"><section><div class="list-head"><span>A</span><h3>Daily micro-builds</h3></div><div class="check-list">${project.drills.map((item, i) => checkbox("drills", project, i, item, true)).join("")}</div></section><section><div class="list-head"><span>B</span><h3>Required failure tests</h3></div><div class="check-list test-list">${project.tests.map((item, i) => checkbox("tests", project, i, item, true)).join("")}</div></section></div>
        <div class="gate"><div><p>Mastery gate</p><strong>${esc(project.gate)}</strong></div><button class="gate-button" data-pass="${project.id}" type="button" ${allTestsDone(project) ? "" : "disabled"}>${allTestsDone(project) ? "Pass gate →" : `${project.tests.length - testsDone} test${project.tests.length - testsDone === 1 ? "" : "s"} remaining`}</button></div>` : ""}
      </div>`;
  }

  function renderRoadmap() {
    const activeIndex = currentIndex();
    $("#projectMap").innerHTML = projects.map((project, index) => {
      const status = projectDone(project) ? "complete" : index === activeIndex ? "active" : "upcoming";
      const open = status === "active" ? "open" : "";
      return `<details class="project-card ${status}" id="${project.slug}" ${open}><summary><span class="project-pin">${project.id}</span><span class="project-title"><b>${esc(project.title)}</b><small>${esc(project.value)}</small></span><span class="project-status">${status === "complete" ? "gate passed" : status === "active" ? "in progress" : "upcoming"}</span><span class="chevron">+</span></summary><div class="project-detail"><div><p class="detail-label">Build</p><p>${esc(project.build)}</p></div><div><p class="detail-label">n8n patterns</p><div class="tag-list">${project.patterns.map((item) => `<span>${esc(item)}</span>`).join("")}</div></div><div><p class="detail-label">Learn while building</p><div class="tag-list subdued">${project.fundamentals.map((item) => `<span>${esc(item)}</span>`).join("")}</div></div><div><p class="detail-label">Failure tests</p><ul>${project.tests.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div><div class="gate-preview"><p class="detail-label">Definition of done</p><strong>${esc(project.gate)}</strong></div></div></details>`;
    }).join("");
  }

  function renderFoundation() {
    $("#foundationGrid").innerHTML = fundamentals.map((item, index) => `<a class="foundation-card" href="#${item.anchor}"><span>0${index + 1}</span><h3>${esc(item.name)}</h3><p>${esc(item.detail)}</p><small>First demanded in ${item.first} <b>→</b></small></a>`).join("");
  }

  function renderValue() {
    $("#valueGrid").innerHTML = valueAreas.map((item, index) => `<a class="value-card" href="#${projects.find((project) => project.id === item.project).slug}"><span>${String(index + 1).padStart(2, "0")}</span><p class="value-signal">${esc(item.signal)}</p><h3>${esc(item.label)}</h3><p>${esc(item.note)}</p><small>Build in ${item.project} →</small></a>`).join("");
  }

  function renderStatus() {
    const active = currentProject();
    const allItems = projects.reduce((total, project) => total + project.drills.length + project.tests.length + 1, 0);
    const doneItems = projects.reduce((total, project) => total + project.drills.filter((_, i) => state.drills[`${project.id}:d${i}`]).length + project.tests.filter((_, i) => state.tests[`${project.id}:t${i}`]).length + (projectDone(project) ? 1 : 0), 0);
    const percent = Math.round((doneItems / allItems) * 100);
    const completed = projects.filter(projectDone).length;
    $("#currentNumber").textContent = completed === projects.length ? "09" : active.id.slice(1);
    $("#currentLabel").textContent = completed === projects.length ? "All field gates cleared" : active.title;
    $("#progressNumber").textContent = `${percent}%`;
    $("#progressMeter").style.width = `${percent}%`;
    const signals = ["Setup", "Content-ready", "Portfolio proof", "Client-ready", "High-value operator", "Systems builder", "AI safety", "Infrastructure", "Product layer", "Field mastery"];
    const signalIndex = completed === projects.length ? signals.length - 1 : Math.min(completed, signals.length - 2);
    $("#portfolioSignal").textContent = signals[signalIndex];
    $("#portfolioDetail").textContent = completed === 0 ? "First working demo unlocks content" : completed < 3 ? "Record a credible system demo" : completed < 6 ? "You can sell scoped automation work" : "Operate and improve real systems";
  }

  function render() { renderStatus(); renderMission(); renderRoadmap(); renderFoundation(); renderValue(); bindActions(); }

  function bindActions() {
    document.querySelectorAll("[data-kind]").forEach((input) => input.addEventListener("change", (event) => {
      const { kind, project, index } = event.currentTarget.dataset;
      state[kind][`${project}:${kind[0]}${index}`] = event.currentTarget.checked;
      save(); render();
    }));
    document.querySelectorAll("[data-pass]").forEach((button) => button.addEventListener("click", () => {
      const project = projects.find((item) => item.id === button.dataset.pass);
      if (!allTestsDone(project)) return;
      state.passed[project.id] = true;
      save(); render();
      $("#mission").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  $("#resetButton").addEventListener("click", () => $("#resetDialog").showModal());
  $("#resetDialog").addEventListener("close", () => {
    if ($("#resetDialog").returnValue === "confirm") { state = blankState(); save(); render(); }
  });
  render();
})();
