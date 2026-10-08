(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Hero title reveal once the page is ready.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
  });

  // Images: each .media box shows its placeholder until the photo at
  // data-src exists. Drop a file at that path and it appears automatically.
  document.querySelectorAll(".media[data-src]").forEach(function (box) {
    var img = new Image();
    img.alt = box.getAttribute("data-alt") || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onload = function () {
      box.appendChild(img);
      box.classList.add("has-image");
    };
    img.src = box.getAttribute("data-src");
  });

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

  // Nav: background once scrolled, highlight the current section.
  var nav = document.getElementById("nav");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
  }
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

  document.getElementById("year").textContent = new Date().getFullYear();
})();
