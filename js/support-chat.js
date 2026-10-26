(function () {
  var keyName = "fp_ticket_key";
  var key = localStorage.getItem(keyName);
  if (!key) {
    key =
      (crypto.randomUUID && crypto.randomUUID()) ||
      String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem(keyName, key);
  }

  var chatBtn = document.getElementById("chat");
  var chatBox = document.getElementById("chat-box");
  if (!chatBtn || !chatBox) return;

  var log = document.getElementById("chat-log");
  var form = document.getElementById("chat-form");
  var home = document.getElementById("chat-home");
  var messages = document.getElementById("chat-messages");
  var askBtn = document.getElementById("chat-ask");
  var tabHome = document.getElementById("chat-tab-home");
  var tabMessages = document.getElementById("chat-tab-messages");
  var backBtn = document.getElementById("chat-back");
  var moreBtn = document.getElementById("chat-more");
  var moreMenu = document.getElementById("chat-more-menu");
  var expandBtn = document.getElementById("chat-expand");
  var sendBtn = form && form.querySelector(".chat-composer-send");
  var input = form && form.querySelector("[name=message]");
  if (!log || !form) return;

  var ticketId = "";
  var ticketOpen = false;
  var signedIn = "";
  var sawAccount = false;
  var expanded = false;

  function idKey() {
    return signedIn ? "fp_ticket_id_" + signedIn : "fp_ticket_id";
  }

  function syncSend() {
    if (!sendBtn || !input) return;
    sendBtn.classList.toggle("is-ready", !!input.value.trim());
  }

  function showTab(name) {
    var isHome = name === "home";
    if (home) home.hidden = !isHome;
    if (messages) messages.hidden = isHome;
    if (tabHome) tabHome.classList.toggle("on", isHome);
    if (tabMessages) tabMessages.classList.toggle("on", !isHome);
    if (!isHome) load();
  }

  function setMoreMenu(open) {
    if (!moreMenu || !moreBtn) return;
    moreMenu.hidden = !open;
    moreMenu.classList.toggle("open", open);
    moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setExpanded(on) {
    expanded = !!on;
    chatBox.classList.toggle("is-expanded", expanded);
    if (expandBtn) {
      var label = expandBtn.querySelector("span");
      if (label) label.textContent = expanded ? "Collapse window" : "Expand window";
    }
    setMoreMenu(false);
  }

  function setOpen(open) {
    chatBox.classList.toggle("open", open);
    chatBtn.classList.toggle("open", open);
    chatBtn.setAttribute("aria-expanded", open ? "true" : "false");
    setMoreMenu(false);
    if (!open) setExpanded(false);
    if (open) showTab("home");
  }

  function welcomeBubble() {
    return (
      '<div class="chat-hint">Ask us anything, or share your feedback.</div>' +
      '<div class="chat-msg chat-msg--admin">' +
      "<strong>Hi Trader, and welcome to FundingPips support! How can I help you today?</strong>" +
      "<em>This is an AI assistant. Responses may be inaccurate — please verify important information.</em>" +
      "</div>" +
      '<div class="chat-msg-meta">Alice · AI Agent · Just now</div>'
    );
  }

  function paint(tickets) {
    var ticket =
      tickets.find(function (item) {
        return item.id === ticketId;
      }) || tickets[0];

    log.innerHTML = welcomeBubble();

    if (!ticket) {
      ticketId = "";
      ticketOpen = false;
      localStorage.removeItem(idKey());
      return;
    }

    ticketId = ticket.id;
    ticketOpen = ticket.status !== "closed";
    localStorage.setItem(idKey(), ticketId);

    (ticket.messages || []).forEach(function (message) {
      var item = document.createElement("div");
      item.className =
        message.author === "admin" ? "chat-msg chat-msg--admin" : "chat-msg chat-msg--user";
      item.textContent = message.body;
      log.appendChild(item);
      if (message.author === "admin") {
        var meta = document.createElement("div");
        meta.className = "chat-msg-meta";
        meta.textContent = "Support · Agent";
        log.appendChild(meta);
      }
    });

    if (ticket.status === "closed") {
      var closed = document.createElement("div");
      closed.className = "chat-hint";
      closed.textContent =
        "This chat is closed. Send a new message to open another ticket.";
      log.appendChild(closed);
    }
    log.scrollTop = log.scrollHeight;
  }

  function load() {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        });
      })
      .then(function (who) {
        var account =
          who && who.user && who.user.id ? String(who.user.id) : "";
        if (sawAccount && account !== signedIn) {
          ticketId = "";
          ticketOpen = false;
        }
        sawAccount = true;
        signedIn = account;
        ticketId = localStorage.getItem(idKey()) || "";
        if (who && who.user) {
          var nm = ((who.user.first_name || "") + " " + (who.user.last_name || "")).trim();
          if (nm && form.name) form.name.value = nm;
        }
        return fetch("/api/tickets?key=" + encodeURIComponent(key), {
          credentials: "same-origin",
        });
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        paint((data && data.tickets) || []);
      })
      .catch(function () {
        paint([]);
      });
  }

  chatBtn.addEventListener("click", function (event) {
    event.preventDefault();
    setOpen(!chatBox.classList.contains("open"));
  });

  chatBox.querySelectorAll("[data-chat-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setOpen(false);
    });
  });

  if (askBtn) {
    askBtn.addEventListener("click", function () {
      showTab("messages");
    });
  }
  if (tabHome) {
    tabHome.addEventListener("click", function () {
      showTab("home");
    });
  }
  if (tabMessages) {
    tabMessages.addEventListener("click", function () {
      showTab("messages");
    });
  }
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      setMoreMenu(false);
      showTab("home");
    });
  }
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      setMoreMenu(moreMenu.hidden);
    });
  }
  if (expandBtn) {
    expandBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      setExpanded(!expanded);
    });
  }
  document.addEventListener("click", function (event) {
    if (!moreMenu || moreMenu.hidden) return;
    if (moreMenu.contains(event.target) || (moreBtn && moreBtn.contains(event.target))) return;
    setMoreMenu(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMoreMenu(false);
  });
  if (input) {
    input.addEventListener("input", syncSend);
    syncSend();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var message = (input && input.value.trim()) || "";
    if (!message) return;
    fetch("/api/tickets", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key,
        ticketId: ticketOpen ? ticketId : "",
        name: form.name ? form.name.value : "",
        subject: form.subject ? form.subject.value : "Support request",
        message: message,
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.id) {
          ticketId = data.id;
          localStorage.setItem(idKey(), ticketId);
          ticketOpen = true;
        }
        if (input) input.value = "";
        syncSend();
        load();
      })
      .catch(function () {});
  });

  setInterval(function () {
    if (chatBox.classList.contains("open") && messages && !messages.hidden) {
      load();
    }
  }, 5000);
})();
