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
  var closeBtn = document.getElementById("chat-close");
  var home = document.getElementById("chat-home");
  var messages = document.getElementById("chat-messages");
  var askBtn = document.getElementById("chat-ask");
  var tabHome = document.getElementById("chat-tab-home");
  var tabMessages = document.getElementById("chat-tab-messages");
  if (!log || !form) return;

  var ticketId = "";
  var ticketOpen = false;
  var signedIn = "";
  var sawAccount = false;

  function idKey() {
    return signedIn ? "fp_ticket_id_" + signedIn : "fp_ticket_id";
  }

  function showTab(name) {
    var isHome = name === "home";
    if (home) home.hidden = !isHome;
    if (messages) messages.hidden = isHome;
    if (tabHome) tabHome.classList.toggle("on", isHome);
    if (tabMessages) tabMessages.classList.toggle("on", !isHome);
    if (!isHome) load();
  }

  function setOpen(open) {
    chatBox.classList.toggle("open", open);
    chatBtn.classList.toggle("open", open);
    chatBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) showTab("home");
  }

  function paint(tickets) {
    var ticket =
      tickets.find(function (item) {
        return item.id === ticketId;
      }) || tickets[0];
    if (!ticket) {
      log.innerHTML =
        '<p style="margin:0;padding:4px;color:#626773;font-size:13px;line-height:1.45">Send a message and our team will reply here.</p>';
      ticketId = "";
      ticketOpen = false;
      localStorage.removeItem(idKey());
      form.querySelector("[name=subject]").disabled = false;
      return;
    }
    ticketId = ticket.id;
    ticketOpen = ticket.status !== "closed";
    localStorage.setItem(idKey(), ticketId);
    log.innerHTML = "";
    (ticket.messages || []).forEach(function (message) {
      var item = document.createElement("div");
      item.className =
        message.author === "admin" ? "chat-msg chat-msg--admin" : "chat-msg chat-msg--user";
      item.textContent =
        (message.author === "admin" ? "Support: " : "") + message.body;
      log.appendChild(item);
    });
    if (ticket.status === "closed") {
      var closed = document.createElement("div");
      closed.className = "chat-msg";
      closed.textContent =
        "This chat is closed. Send a new message to open another ticket.";
      log.appendChild(closed);
    }
    log.scrollTop = log.scrollHeight;
    form.querySelector("[name=subject]").disabled =
      ticketOpen && (ticket.messages || []).length > 0;
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
          form.querySelector("[name=subject]").disabled = false;
        }
        sawAccount = true;
        signedIn = account;
        ticketId = localStorage.getItem(idKey()) || "";
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
      .catch(function () {});
  }

  chatBtn.addEventListener("click", function (event) {
    event.preventDefault();
    setOpen(!chatBox.classList.contains("open"));
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
  }
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var message = form.message.value.trim();
    if (!message) return;
    fetch("/api/tickets", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: key,
        ticketId: ticketOpen ? ticketId : "",
        name: form.name.value,
        subject: form.subject.value,
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
        }
        form.message.value = "";
        load();
      })
      .catch(function () {});
  });

  setInterval(function () {
    if (
      chatBox.classList.contains("open") &&
      messages &&
      !messages.hidden
    ) {
      load();
    }
  }, 5000);
})();
