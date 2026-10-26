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

  function authErrorText(value, fallback) {
    if (value == null || value === "") return fallback || "Request failed";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value === "object") {
      if (typeof value.message === "string" && value.message) return value.message;
      if (typeof value.error === "string" && value.error) return value.error;
      if (value.error && value.error !== value) return authErrorText(value.error, fallback);
      if (typeof value.detail === "string" && value.detail) return value.detail;
      try {
        return JSON.stringify(value);
      } catch (_) {
        return fallback || "Request failed";
      }
    }
    return fallback || "Request failed";
  }

  function apiUrl(path) {
    return new URL(path, location.origin).pathname;
  }

  function portalUrl(file) {
    return "/portal/" + String(file || "dashboard.html").replace(/^\//, "");
  }

  async function apiFetch(path, options) {
    const opts = options || {};
    const res = await fetch(apiUrl(path), {
      method: opts.method || "GET",
      headers: Object.assign(
        { Accept: "application/json" },
        opts.body ? { "Content-Type": "application/json" } : {},
        opts.headers || {}
      ),
      credentials: "same-origin",
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    });
    let data = {};
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      data = { error: text && text.slice(0, 160) };
    }
    if (!res.ok || data.ok === false) {
      let msg = authErrorText(
        data.error != null ? data.error : data.message || data,
        "Request failed (" + res.status + ")"
      );
      if (res.status === 404) {
        msg =
          "API not found. Run npm start (not npx serve), or open https://fundingpips-xi.vercel.app/portal/register.html";
      }
      throw new Error(msg);
    }
    return data;
  }

  async function postAuth(url, payload) {
    return apiFetch(url, { method: "POST", body: payload });
  }

  function formToObject(form) {
    const fd = new FormData(form);
    const out = {};
    fd.forEach((value, key) => {
      if (out[key] !== undefined) return;
      out[key] = typeof value === "string" ? value : String(value);
    });
    form.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      out[el.name] = el.checked;
    });
    return out;
  }

  function showAuthError(form, message) {
    let el = form.querySelector(".auth-form-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "auth-form-error";
      el.setAttribute("role", "alert");
      form.prepend(el);
    }
    el.textContent = message;
  }

  document.querySelectorAll("form.auth-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const page = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
      const isRegister = page === "register" || !!form.querySelector("#first_name");
      const isLogin = page === "login" || (!isRegister && !!form.querySelector("#password"));
      if (!isRegister && !isLogin) {
        location.href = portalUrl("dashboard.html");
        return;
      }
      if (btn) btn.disabled = true;
      try {
        const payload = formToObject(form);
        const data = isRegister
          ? await postAuth("/api/auth/register", payload)
          : await postAuth("/api/auth/login", {
              email: payload.email,
              password: payload.password,
            });
        location.href = data.redirect || portalUrl("dashboard.html");
      } catch (err) {
        showAuthError(form, authErrorText(err && err.message, "Something went wrong"));
        if (btn) btn.disabled = false;
      }
    });
  });

  const forgotForm = document.querySelector(".forgot-page form, form.forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = forgotForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const email = String(new FormData(forgotForm).get("email") || "").trim();
        const data = await postAuth("/api/auth/forgot", { email });
        showAuthError(
          forgotForm,
          data.message || "If that email exists, a reset link has been sent."
        );
        const box = forgotForm.querySelector(".auth-form-error");
        if (box) {
          box.style.background = "#ecfdf3";
          box.style.color = "#027a48";
        }
        if (btn) btn.disabled = false;
      } catch (err) {
        showAuthError(forgotForm, authErrorText(err && err.message, "Could not send reset"));
        if (btn) btn.disabled = false;
      }
    });
  }

  function showAuthSuccess(form, message) {
    let el = form.querySelector(".auth-form-error, .auth-form-success");
    if (!el) {
      el = document.createElement("p");
      el.setAttribute("role", "status");
      form.prepend(el);
    }
    el.className = "auth-form-success";
    el.textContent = message;
  }

  const resetForm = document.querySelector("form.reset-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = resetForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const payload = formToObject(resetForm);
        const token = new URLSearchParams(location.search).get("token") || payload.token;
        const data = await postAuth("/api/auth/reset", {
          token,
          password: payload.password,
          password_confirmation: payload.password_confirmation || payload.password,
        });
        const msg =
          data.message || "Your password was updated. Sign in with your new password.";
        showAuthSuccess(resetForm, msg);
        setTimeout(() => {
          location.href = data.redirect || portalUrl("login.html?reset=1");
        }, 900);
      } catch (err) {
        showAuthError(resetForm, authErrorText(err && err.message, "Reset failed"));
        if (btn) btn.disabled = false;
      }
    });
  }

  const authNote = document.querySelector(".auth-note");
  if (authNote) {
    const params = new URLSearchParams(location.search);
    if (params.get("reset") === "1") {
      authNote.textContent = "Your password was updated. Sign in with your new password.";
      authNote.hidden = false;
    } else if (params.get("google") === "denied") {
      authNote.textContent = "Google sign-in was cancelled.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    } else if (params.get("google") === "config") {
      authNote.textContent =
        "Google login is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart the server.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    } else if (params.get("google") === "invalid") {
      authNote.textContent =
        "Google sign-in expired or origin mismatch. Open http://127.0.0.1:3021 (not localhost) and try again.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    } else if (params.get("google") === "secret") {
      authNote.textContent =
        "Google Client Secret is invalid. Reset the secret in Google Cloud and paste the new value here.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    } else if (params.get("google") === "redirect") {
      authNote.textContent =
        "Google redirect URI mismatch. Add this site callback URL in the OAuth client settings.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    } else if (params.get("google")) {
      authNote.textContent =
        "Google sign-in failed. Add your Gmail as a Test user in Google Cloud, then try again.";
      authNote.hidden = false;
      authNote.classList.add("auth-note--error");
    }
  }

  document.querySelectorAll(".btn-google").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.href = apiUrl("/api/auth/google");
    });
  });

  const publicAuthPages = new Set([
    "login",
    "register",
    "forgot-password",
    "reset-password",
  ]);
  const onPortalApp =
    document.getElementById("app-rail") || document.getElementById("app-topbar");
  if (onPortalApp && !publicAuthPages.has(file)) {
    apiFetch("/api/auth/me")
      .then((data) => {
        window.FPUser = data.user;
        document.dispatchEvent(new CustomEvent("fp:user", { detail: data.user }));
        if (window.FPShell && typeof FPShell.applyUser === "function") {
          FPShell.applyUser(data.user);
        }
      })
      .catch(() => {
        location.href = portalUrl("login.html");
      });
  }

  if (file === "accounts") {
    const empty = document.querySelector(".accounts-empty");
    const list = document.querySelector(".accounts-list");
    const greetName = document.querySelector(".greet-card h2");

    document.addEventListener("fp:user", (ev) => {
      const u = ev.detail || {};
      if (greetName) {
        greetName.textContent = "Hey, " + (u.first_name || u.firstName || "Trader");
      }
    });

    function formatSize(n) {
      const num = Number(n);
      if (!Number.isFinite(num) || num <= 0) return "—";
      if (num >= 1000) return "$" + Math.round(num / 1000) + "k";
      return "$" + num;
    }

    apiFetch("/api/challenges")
      .then((data) => {
        const rows = (data && data.challenges) || [];
        if (!list) return;
        if (!rows.length) {
          if (empty) empty.hidden = false;
          return;
        }
        if (empty) empty.hidden = true;
        const host = document.createElement("div");
        host.className = "accounts-challenge-list";
        host.innerHTML = rows
          .map((c) => {
            const title =
              formatSize(c.accountSize) +
              " · " +
              (c.evaluationType || "Challenge") +
              (c.plan ? " · " + c.plan : "");
            return (
              '<article class="account-card" data-id="' +
              String(c.id) +
              '">' +
              "<strong>" +
              title +
              "</strong>" +
              "<span>" +
              (c.platform || "MetaTrader 5") +
              " · " +
              (c.status || "active") +
              "</span>" +
              "<span>$" +
              Number(c.fee || 0).toFixed(2) +
              " · qty " +
              Number(c.quantity || 1) +
              "</span>" +
              "</article>"
            );
          })
          .join("");
        if (empty && empty.parentNode) empty.parentNode.insertBefore(host, empty);
        else list.appendChild(host);
      })
      .catch(() => {
        if (empty) {
          empty.hidden = false;
          const strong = empty.querySelector("strong");
          if (strong) strong.textContent = "Could not load accounts";
        }
      });
  }

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

    const CHEVRON =
      '<svg class="auth-combo-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 8.99985L11.2929 5.70696C11.6834 5.31643 12.3166 5.31643 12.7071 5.70696L16 8.99985" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 15L12.7071 18.2929C12.3166 18.6834 11.6834 18.6834 11.2929 18.2929L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function closeAllCombos(except) {
      document.querySelectorAll(".auth-combo.is-open").forEach((wrap) => {
        if (wrap === except) return;
        wrap.classList.remove("is-open");
        const btn = wrap.querySelector(".auth-combo-trigger");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    function enhanceAuthCombo(select, opts) {
      if (!select || select.dataset.comboReady) return null;
      select.dataset.comboReady = "1";
      select.classList.add("auth-combo-native");
      select.tabIndex = -1;

      const wrap = document.createElement("div");
      wrap.className = "auth-combo" + (opts.compact ? " auth-combo--compact" : "");
      select.parentNode.insertBefore(wrap, select);
      wrap.appendChild(select);

      const placeholder =
        opts.placeholder ||
        (select.options[0] && !select.options[0].value
          ? select.options[0].textContent
          : "Select");

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "auth-combo-trigger is-placeholder";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      if (select.id) trigger.id = select.id + "_trigger";
      trigger.innerHTML =
        '<span class="auth-combo-trigger-label"></span>' + CHEVRON;
      const labelEl = trigger.querySelector(".auth-combo-trigger-label");
      wrap.appendChild(trigger);

      const panel = document.createElement("div");
      panel.className = "auth-combo-panel";
      panel.setAttribute("role", "dialog");

      let searchInput = null;
      if (opts.searchable !== false) {
        const searchRow = document.createElement("div");
        searchRow.className = "auth-combo-search";
        searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.setAttribute("role", "combobox");
        searchInput.setAttribute("aria-autocomplete", "list");
        searchInput.placeholder = opts.searchPlaceholder || "Search...";
        searchInput.autocomplete = "off";
        searchRow.appendChild(searchInput);
        panel.appendChild(searchRow);
      }

      const list = document.createElement("ul");
      list.className = "auth-combo-list";
      list.setAttribute("role", "listbox");
      panel.appendChild(list);
      wrap.appendChild(panel);

      let activeIndex = -1;

      function optionRows() {
        return Array.from(select.options).filter((o) => o.value !== "");
      }

      function syncTrigger() {
        const opt = select.selectedOptions[0];
        const has = !!(opt && opt.value);
        labelEl.textContent = has ? opt.textContent : placeholder;
        trigger.classList.toggle("is-placeholder", !has);
      }

      function renderList(filter) {
        const q = (filter || "").trim().toLowerCase();
        list.innerHTML = "";
        const rows = optionRows().filter((o) =>
          !q || o.textContent.toLowerCase().includes(q)
        );
        if (!rows.length) {
          const empty = document.createElement("li");
          empty.className = "auth-combo-empty";
          empty.textContent = "No results.";
          list.appendChild(empty);
          activeIndex = -1;
          return;
        }
        rows.forEach((o, i) => {
          const li = document.createElement("li");
          li.setAttribute("role", "none");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "auth-combo-option";
          btn.setAttribute("role", "option");
          btn.dataset.value = o.value;
          btn.textContent = o.textContent;
          if (o.value === select.value) btn.classList.add("is-selected");
          btn.addEventListener("mouseenter", () => setActive(i));
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            pick(o.value);
          });
          li.appendChild(btn);
          list.appendChild(li);
        });
        activeIndex = -1;
        const selectedBtn = list.querySelector(".auth-combo-option.is-selected");
        if (selectedBtn) {
          const idx = Array.from(list.querySelectorAll(".auth-combo-option")).indexOf(
            selectedBtn
          );
          setActive(idx);
          selectedBtn.scrollIntoView({ block: "nearest" });
        }
      }

      function optionButtons() {
        return Array.from(list.querySelectorAll(".auth-combo-option"));
      }

      function setActive(i) {
        const buttons = optionButtons();
        buttons.forEach((b) => b.classList.remove("is-active"));
        activeIndex = i;
        if (i >= 0 && buttons[i]) {
          buttons[i].classList.add("is-active");
          buttons[i].scrollIntoView({ block: "nearest" });
        }
      }

      function open() {
        closeAllCombos(wrap);
        wrap.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        if (searchInput) searchInput.value = "";
        renderList("");
        if (searchInput) {
          requestAnimationFrame(() => searchInput.focus());
        }
      }

      function close() {
        wrap.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }

      function pick(value) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        syncTrigger();
        close();
        trigger.focus();
      }

      trigger.addEventListener("click", () => {
        if (wrap.classList.contains("is-open")) close();
        else open();
      });

      if (searchInput) {
        searchInput.addEventListener("input", () => renderList(searchInput.value));
        searchInput.addEventListener("keydown", (e) => {
          const buttons = optionButtons();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, buttons.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && buttons[activeIndex]) {
              pick(buttons[activeIndex].dataset.value);
            }
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
            trigger.focus();
          }
        });
      }

      select.addEventListener("change", syncTrigger);
      syncTrigger();

      return {
        wrap,
        syncTrigger,
        setValue(value) {
          select.value = value;
          syncTrigger();
        },
      };
    }

    const titleCombo = enhanceAuthCombo(title, {
      searchable: false,
      placeholder: "Select title",
    });
    const countryCombo = enhanceAuthCombo(country, {
      searchable: true,
      searchPlaceholder: "Search countries...",
      placeholder: "Select a country",
    });
    const dialCombo = enhanceAuthCombo(dial, {
      searchable: true,
      searchPlaceholder: "Search countries...",
      placeholder: "Select country",
      compact: true,
    });

    document.addEventListener("mousedown", (e) => {
      if (!e.target.closest(".auth-combo")) closeAllCombos();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllCombos();
    });

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
        if (match) {
          dial.value = match.code;
          if (dialCombo) dialCombo.syncTrigger();
        }
        unlockPhone();
      });
    }
    if (dial) dial.addEventListener("change", unlockPhone);
    unlockPhone();
    void titleCombo;
    void countryCombo;
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
