import { createClient } from '@supabase/supabase-js';

(async () => {
  const { projects } = window.MASTERY_DATA;
  const STORAGE_KEY = "signal-house-mastery-v2";
  const blankState = () => ({ tasks: {}, passed: {} });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const useSupabase = supabaseUrl && supabaseKey && supabaseUrl !== "YOUR_SUPABASE_URL_HERE";
  const supabase = useSupabase ? createClient(supabaseUrl, supabaseKey) : null;
  let session = null;

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    session = data.session;
    if (!session) {
      document.body.innerHTML = `
        <div class="login-overlay">
          <div class="login-card">
            <div class="login-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <h1>Signal House</h1>
            <p>Access your private mastery dashboard.</p>
            <button id="google-login-btn" class="google-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      `;
      document.getElementById('google-login-btn').addEventListener('click', () => {
         supabase.auth.signInWithOAuth({ provider: 'google' });
      });
      return; // Stop execution, wait for login
    }
  }

  async function loadState() {
    if (supabase && session) {
      const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', session.user.id).single();
      if (data) return { tasks: data.tasks || {}, passed: data.passed || {} };
      if (error && error.code === 'PGRST116') {
         await supabase.from('user_progress').insert({ user_id: session.user.id, tasks: {}, passed: {} });
         return blankState();
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const migrated = { ...blankState(), ...(stored || {}) };
      if (!migrated.tasks) migrated.tasks = {};
      return migrated;
    } catch { return blankState(); }
  }

  let state = await loadState();
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  const currentIndex = () => Math.max(0, projects.findIndex((project) => !state.passed[project.id]));
  const currentProject = () => projects[currentIndex()] || projects.at(-1);
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (supabase && session) {
      supabase.from('user_progress').update({ tasks: state.tasks, passed: state.passed, updated_at: new Date().toISOString() }).eq('user_id', session.user.id).then();
    }
  };
  
  const allTasksDone = (project) => project.subprojects.every((sp, spIdx) => 
    sp.buildTasks.every((_, tIdx) => state.tasks[`${project.id}:sp${spIdx}:b${tIdx}`]) &&
    sp.failureTests.every((_, tIdx) => state.tasks[`${project.id}:sp${spIdx}:f${tIdx}`])
  );
  
  const projectDone = (project) => Boolean(state.passed[project.id]);
  
  const checkbox = (project, spIdx, prefix, tIdx, label, enabled, isTest) => {
    const key = `${project.id}:sp${spIdx}:${prefix}${tIdx}`;
    const checked = Boolean(state.tasks[key]);
    const testClass = isTest ? "test-row" : "";
    const doneClass = checked ? "task-done" : "";
    return `<label class="check-row ${testClass} ${doneClass} ${!enabled ? "is-locked" : ""}"><input type="checkbox" data-project="${project.id}" data-sp="${spIdx}" data-prefix="${prefix}" data-index="${tIdx}" ${checked ? "checked" : ""} ${enabled ? "" : "disabled"}/><span class="box" aria-hidden="true"></span><span>${esc(label)}</span></label>`;
  };

  function renderMission() {
    const project = currentProject();
    const isFinal = projects.every(projectDone);
    const active = !isFinal;
    
    let totalTasks = 0;
    let doneTasks = 0;
    let activeSpIdx = -1; // The first subproject that is incomplete

    project.subprojects.forEach((sp, spIdx) => {
      let isSpDone = true;
      sp.buildTasks.forEach((_, tIdx) => {
        totalTasks++;
        if (state.tasks[`${project.id}:sp${spIdx}:b${tIdx}`]) {
          doneTasks++;
        } else {
          isSpDone = false;
        }
      });
      sp.failureTests.forEach((_, tIdx) => {
        totalTasks++;
        if (state.tasks[`${project.id}:sp${spIdx}:f${tIdx}`]) {
          doneTasks++;
        } else {
          isSpDone = false;
        }
      });
      if (!isSpDone && activeSpIdx === -1) {
        activeSpIdx = spIdx;
      }
    });

    // If all subprojects are done but gate isn't passed, show the last one
    if (activeSpIdx === -1) activeSpIdx = project.subprojects.length - 1;

    // We only render the active subproject to minimize cognitive overload (ADHD Focus Mode)
    const sp = project.subprojects[activeSpIdx];
    
    let subprojectTotal = sp.buildTasks.length + sp.failureTests.length;
    let subprojectDone = 0;
    sp.buildTasks.forEach((_, tIdx) => { if (state.tasks[`${project.id}:sp${activeSpIdx}:b${tIdx}`]) subprojectDone++; });
    sp.failureTests.forEach((_, tIdx) => { if (state.tasks[`${project.id}:sp${activeSpIdx}:f${tIdx}`]) subprojectDone++; });

    const subprojectHTML = `
      <section style="margin-bottom: 30px;">
        <div class="list-head" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>${activeSpIdx + 1}</span><h3>${esc(sp.title)}</h3>
          </div>
          <div style="font-size: 11px; font-weight: 600; color: var(--orange); background: #fff7ee; padding: 4px 8px; border-radius: 4px;">
            ${subprojectDone}/${subprojectTotal} Tasks
          </div>
        </div>
        <p style="margin: 8px 0 12px; color: var(--muted); font-size: 12px; line-height: 1.5;">${esc(sp.description)}</p>
        <div class="tag-list" style="margin-bottom: 15px;">${sp.skills.map((skill) => `<span>${esc(skill)}</span>`).join("")}</div>
        
        <h4 style="font-family: var(--mono); font-size: 10px; text-transform: uppercase; margin: 0 0 10px; color: var(--muted);">Build Steps</h4>
        <div class="check-list" style="margin-bottom: 16px;">${sp.buildTasks.map((item, i) => checkbox(project, activeSpIdx, "b", i, item, true, false)).join("")}</div>
        
        <h4 style="font-family: var(--mono); font-size: 10px; text-transform: uppercase; margin: 0 0 10px; color: var(--orange);">Failure Tests</h4>
        <div class="check-list test-list">${sp.failureTests.map((item, i) => checkbox(project, activeSpIdx, "f", i, item, true, true)).join("")}</div>
        
        ${activeSpIdx < project.subprojects.length - 1 ? `
          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px dashed var(--line); text-align: center; color: var(--muted); font-size: 11px;">
            Finish this component to unlock <b>${esc(project.subprojects[activeSpIdx + 1].title)}</b>
          </div>
        ` : ""}
      </section>
    `;

    $("#missionContent").innerHTML = `
      <div class="mission-shell ${isFinal ? "mission-complete" : ""}">
        <div class="mission-title">
          <p class="project-index">${isFinal ? "FIELD COMPLETE" : project.id}</p>
          <h2>${isFinal ? "You have cleared every gate." : esc(project.title)}</h2>
          <p>${isFinal ? "Keep operating, breaking, and improving real systems. That is where mastery compounds." : esc(project.what)}</p>
        </div>
        <aside class="mission-side">
          <span>Business value / Why</span><strong>${isFinal ? "Operate real systems" : esc(project.why)}</strong>
          <span>Content milestone</span><strong>${isFinal ? "Publish case studies" : esc(project.content)}</strong>
        </aside>
        ${active ? `
        <div class="work-block">
          <div class="block-head"><p>Focus Mode</p><span>Project Progress: ${doneTasks}/${totalTasks}</span></div>
        </div>
        ` : ""}
        ${active ? `
        <div class="mission-columns" style="display: block; padding: 25px 30px 10px;">
          ${subprojectHTML}
        </div>
        <div class="gate">
          <div><p>Mastery gate</p><strong>${esc(project.gate)}</strong></div>
          <button class="gate-button" data-pass="${project.id}" type="button" ${allTasksDone(project) ? "" : "disabled"}>
            ${allTasksDone(project) ? "Pass gate →" : `${totalTasks - doneTasks} task${totalTasks - doneTasks === 1 ? "" : "s"} remaining`}
          </button>
        </div>` : ""}
      </div>`;
  }

  function renderRoadmap() {
    const activeIndex = currentIndex();
    const existingOpen = new Set(
      Array.from(document.querySelectorAll(".project-card[open]")).map((el) => el.id)
    );
    $("#projectMap").innerHTML = projects.map((project, index) => {
      const status = projectDone(project) ? "complete" : index === activeIndex ? "active" : "upcoming";
      const open = existingOpen.size > 0 ? (existingOpen.has(project.slug) ? "open" : "") : (status === "active" ? "open" : "");
      
      const subprojectList = project.subprojects.map((sp) => `
        <div style="margin-bottom: 12px;">
          <p style="color: var(--ink); font-weight: 600; font-size: 11px; margin: 0 0 4px;">${esc(sp.title)}</p>
          <div class="tag-list subdued">${sp.skills.map((skill) => `<span>${esc(skill)}</span>`).join("")}</div>
        </div>
      `).join("");

      return `<details class="project-card ${status}" id="${project.slug}" ${open}>
        <summary>
          <span class="project-pin">${project.id}</span>
          <span class="project-title"><b>${esc(project.title)}</b><small>${esc(project.why)}</small></span>
          <span class="project-status">${status === "complete" ? "gate passed" : status === "active" ? "in progress" : "upcoming"}</span>
          <span class="chevron">+</span>
        </summary>
        <div class="project-detail">
          <div>
            <p class="detail-label">What we are building</p>
            <p>${esc(project.what)}</p>
          </div>
          <div style="grid-column: span 2;">
            <p class="detail-label">Components & Skills</p>
            <div style="margin-top: 10px;">${subprojectList}</div>
          </div>
          <div class="gate-preview">
            <p class="detail-label">Definition of done</p>
            <strong>${esc(project.gate)}</strong>
          </div>
        </div>
      </details>`;
    }).join("");
  }

  function renderStatus() {
    const active = currentProject();
    let totalItems = 0;
    let doneItems = 0;
    
    projects.forEach((project) => {
      totalItems += 1;
      if (projectDone(project)) doneItems += 1;
      
      project.subprojects.forEach((sp, spIdx) => {
        sp.buildTasks.forEach((_, tIdx) => {
          totalItems += 1;
          if (state.tasks[`${project.id}:sp${spIdx}:b${tIdx}`]) doneItems += 1;
        });
        sp.failureTests.forEach((_, tIdx) => {
          totalItems += 1;
          if (state.tasks[`${project.id}:sp${spIdx}:f${tIdx}`]) doneItems += 1;
        });
      });
    });

    const percent = Math.round((doneItems / Math.max(1, totalItems)) * 100);
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

  function openTargetDetails() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target && target.tagName === "DETAILS") {
      target.open = true;
    }
  }

  function render() { renderStatus(); renderMission(); renderRoadmap(); bindActions(); }

  function bindActions() {
    document.querySelectorAll("[data-project][data-sp]").forEach((input) => input.addEventListener("change", (event) => {
      const { project, sp, prefix, index } = event.currentTarget.dataset;
      state.tasks[`${project}:sp${sp}:${prefix}${index}`] = event.currentTarget.checked;
      save(); render();
    }));
    document.querySelectorAll("[data-pass]").forEach((button) => button.addEventListener("click", () => {
      const project = projects.find((item) => item.id === button.dataset.pass);
      if (!allTasksDone(project)) return;
      state.passed[project.id] = true;
      save(); render();
      $("#mission").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    document.querySelectorAll('a[href^="#p"]').forEach((link) => link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target && target.tagName === "DETAILS") {
        target.open = true;
      }
    }));
  }

  $("#resetButton").addEventListener("click", () => $("#resetDialog").showModal());
  $("#resetDialog").addEventListener("close", () => {
    if ($("#resetDialog").returnValue === "confirm") { state = blankState(); save(); render(); }
  });
  
  // Theme toggle logic
  const themeToggle = $("#themeToggle");
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☼";
  }
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "☾";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☼";
    }
  });
  
  window.addEventListener("hashchange", openTargetDetails);
  render();
  openTargetDetails();
})();
