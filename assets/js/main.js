// Willian Bocalon Advocacia — comportamento compartilhado
(function () {
  var PHONE = "5554996767153";

  function whatsUrl(msg) {
    return "https://wa.me/" + PHONE + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  // Dispara conversão nos pixels que estiverem instalados (Meta / Google Ads / GA4)
  function track(label) {
    try { if (window.fbq) window.fbq("track", "Contact", { content_name: label }); } catch (e) {}
    try { if (window.gtag) window.gtag("event", "whatsapp_click", { event_label: label }); } catch (e) {}
    try { if (window.dataLayer) window.dataLayer.push({ event: "whatsapp_click", label: label }); } catch (e) {}
  }

  // Todos os links com data-whats viram links de WhatsApp com mensagem pronta
  var pageMsg = document.body.getAttribute("data-whats-msg") || "Olá, Dr. Willian! Vim pelo site e gostaria de uma orientação.";
  document.querySelectorAll("[data-whats]").forEach(function (a) {
    var msg = a.getAttribute("data-whats") || pageMsg;
    a.href = whatsUrl(msg);
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () { track(a.getAttribute("data-track") || document.title); });
  });

  // Cartão de perguntas rápidas: monta a mensagem com as respostas
  document.querySelectorAll("form.qcard").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var intro = form.getAttribute("data-intro") || pageMsg;
      var lines = [intro];
      form.querySelectorAll("fieldset").forEach(function (fs) {
        var checked = fs.querySelector("input:checked");
        var q = fs.getAttribute("data-q");
        if (checked && q) lines.push("• " + q + ": " + checked.value);
      });
      track(form.getAttribute("data-track") || "qcard");
      window.open(whatsUrl(lines.join("\n")), "_blank", "noopener");
    });
  });

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }

  // Revelar seções ao rolar
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
