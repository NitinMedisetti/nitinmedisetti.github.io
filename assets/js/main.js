(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Hero title reveal once the page is ready.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
  });

  // Images: each .media box shows its placeholder until the photo at
  // data-src exists. Drop a file at that path and it appears automatically.
  function loadMedia(scope) {
    scope.querySelectorAll(".media[data-src]").forEach(function (box) {
      var img = new Image();
      img.alt = box.getAttribute("data-alt") || "";
      img.decoding = "async";
      img.onload = function () {
        box.appendChild(img);
        box.classList.add("has-image");
      };
      img.src = box.getAttribute("data-src");
    });
  }
  loadMedia(document);

  // Reveal sections as they scroll into view.
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Nav: solid background once the page has scrolled.
  var nav = document.getElementById("nav");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu.
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navLinks");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Phones: swipe left to open the menu, swipe right to close it.
  var mobile = window.matchMedia("(max-width: 900px)");
  var touchX = null, touchY = 0;
  document.addEventListener("touchstart", function (e) {
    var dlg = document.querySelector("dialog.pm");
    if (!mobile.matches || e.touches.length !== 1 || (dlg && dlg.open)) { touchX = null; return; }
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return; // mostly horizontal swipes only
    var open = toggle.getAttribute("aria-expanded") === "true";
    if (dx < 0 && !open) setMenu(true);
    else if (dx > 0 && open) setMenu(false);
  }, { passive: true });

  // Click-to-copy (the email on the Contact page), with a short pop-up.
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-shown"); }, 1800);
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) {}
    document.body.removeChild(ta);
    return ok ? Promise.resolve() : Promise.reject();
  }
  document.querySelectorAll("[data-copy]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var text = el.getAttribute("data-copy");
      var copy = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); })
        : fallbackCopy(text);
      copy.then(function () { showToast("Copied to clipboard"); },
                function () { location.href = el.href; }); // copying blocked: open the mail app instead
    });
  });

  // Page transitions: close the shutter, then navigate.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (url.pathname === location.pathname) return; // same page, e.g. "Back to top"
    e.preventDefault();
    if (reduceMotion) { location.href = url.href; return; }
    root.classList.add("is-leaving");
    setTimeout(function () { location.href = url.href; }, 320);
  });
  // Coming back with the browser's Back button can restore the covered page.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) root.classList.remove("is-leaving");
  });

  // Project pop-ups: each card's <template class="project__details"> is
  // shown in a dialog when the card is clicked.
  var cards = document.querySelectorAll(".project");
  if (cards.length && window.HTMLDialogElement) {
    var dialog = document.createElement("dialog");
    dialog.className = "pm";
    dialog.setAttribute("aria-labelledby", "pmTitle");
    dialog.innerHTML = '<button class="pm__close" type="button" aria-label="Close">&times;</button><div class="pm__body"></div>';
    document.body.appendChild(dialog);
    var pmBody = dialog.querySelector(".pm__body");
    var opener = null;

    function openProject(card) {
      var tpl = card.querySelector("template.project__details");
      if (!tpl) return;
      pmBody.innerHTML = "";
      pmBody.appendChild(tpl.content.cloneNode(true));
      var title = pmBody.querySelector("h2");
      if (title) title.id = "pmTitle";
      loadMedia(pmBody);
      opener = card;
      document.body.style.overflow = "hidden";
      dialog.classList.remove("is-closing");
      dialog.showModal();
      pmBody.scrollTop = 0;
      dialog.querySelector(".pm__close").focus();
    }
    function closeProject() {
      if (!dialog.open || dialog.classList.contains("is-closing")) return;
      var finish = function () {
        dialog.classList.remove("is-closing");
        dialog.close();
        document.body.style.overflow = "";
        if (opener) opener.focus();
      };
      if (reduceMotion) { finish(); return; }
      dialog.classList.add("is-closing");
      setTimeout(finish, 220);
    }

    cards.forEach(function (card) {
      if (!card.querySelector("template.project__details")) return;
      var name = card.querySelector("h3");
      card.classList.add("has-details");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");
      if (name) card.setAttribute("aria-label", name.textContent + ", show details");
      card.addEventListener("click", function () { openProject(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(card); }
      });
    });
    dialog.querySelector(".pm__close").addEventListener("click", closeProject);
    dialog.addEventListener("cancel", function (e) { e.preventDefault(); closeProject(); }); // Esc
    dialog.addEventListener("click", function (e) { if (e.target === dialog) closeProject(); }); // backdrop
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
