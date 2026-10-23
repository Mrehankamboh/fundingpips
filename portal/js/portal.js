(function () {
  const SUN =
    '<path d="M11.998 3.291V1.768M5.84 18.159 4.763 19.236M11.998 22.233V20.709M19.233 4.765 18.156 5.842M20.707 12H22.23M18.156 18.159l1.077 1.077M1.766 12H3.289M4.763 4.765l1.077 1.077M15.71 8.288c2.05 2.05 2.05 5.374 0 7.424s-5.374 2.051-7.424 0-2.051-5.374 0-7.424 5.374-2.05 7.424 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
  const MOON =
    '<path d="M21.248 11.811A6.5 6.5 0 0 1 12.189 2.752 9.25 9.25 0 1 0 21.25 12c0-.063 0-.126-.002-.189Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  function applyTheme(mode) {
    const dark = mode === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    document.querySelectorAll(".auth-theme-toggle svg").forEach((svg) => {
      svg.innerHTML = dark ? SUN : MOON;
    });
    if (window.FPShell && typeof FPShell.applyTheme === "function") {
      const pill = document.querySelector(".user-menu-pill");
      const icon = document.querySelector(".user-menu-mode svg");
      if (pill) pill.textContent = dark ? "Dark" : "Light";
      if (icon) icon.innerHTML = dark ? FPShell.icons.moon : FPShell.icons.sun;
    }
  }

  if (localStorage.getItem("fp-theme") === "dark") applyTheme("dark");
  else applyTheme("light");

  function boot() {
  const path = location.pathname.replace(/\\/g, "/");
  const file = (path.split("/").pop() || "dashboard").replace(/\.html$/, "") || "dashboard";
  const navFile = file === "competition" ? "competitions" : file;

  document.querySelectorAll(".app-nav a[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\.html$/, "");
    if (href === navFile) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll(".app-nav-group > button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
      btn.setAttribute(
        "aria-expanded",
        btn.parentElement.classList.contains("open") ? "true" : "false"
      );
    });
  });

  const utilities = document.querySelector(".app-nav-group[data-group='utilities']");
  if (utilities) {
    const utilPages = ["tools", "trade-copier", "economic-calendar"];
    if (utilPages.includes(file)) utilities.classList.add("open");
  }

  document.querySelectorAll("form.auth-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      location.href = "dashboard.html";
    });
  });

  (function fillAuthGeo() {
    const geo = window.FPAuthGeo;
    if (!geo) return;
    const title = document.getElementById("title");
    const country = document.getElementById("country");
    const dial = document.getElementById("phone_country");
    const phone = document.getElementById("phone_number");
    if (title && title.options.length <= 1) {
      geo.titles.forEach((t) => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        title.appendChild(o);
      });
    }
    if (country && country.options.length <= 1) {
      geo.countries.forEach((name) => {
        const o = document.createElement("option");
        o.value = name;
        o.textContent = name;
        country.appendChild(o);
      });
    }
    if (dial && dial.options.length <= 1) {
      geo.dials.forEach((row) => {
        const o = document.createElement("option");
        o.value = row.code;
        o.textContent = row.label;
        o.dataset.name = row.name;
        dial.appendChild(o);
      });
    }
    const unlockPhone = () => {
      if (!phone || !dial) return;
      const hasDial = !!dial.value;
      phone.disabled = !hasDial;
      phone.readOnly = !hasDial;
      if (!hasDial) phone.placeholder = "Select a country first";
      else if (phone.placeholder === "Select a country first") phone.placeholder = "";
    };
    if (country && dial) {
      country.addEventListener("change", () => {
        const match = geo.dials.find((row) => row.name === country.value);
        if (match) dial.value = match.code;
        unlockPhone();
      });
    }
    if (dial) dial.addEventListener("change", unlockPhone);
    unlockPhone();
  })();

  document.querySelectorAll(".auth-theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      localStorage.setItem("fp-theme", next);
      applyTheme(next);
    });
  });
  }
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);

  if (!document.getElementById("ze-snippet")) {
    const ze = document.createElement("script");
    ze.id = "ze-snippet";
    ze.src = "https://static.zdassets.com/ekr/snippet.js?key=d202d111-fc9c-4047-8d94-973d2984cee3";
    document.body.appendChild(ze);
  }
})();
