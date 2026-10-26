// Willian Bocalon Advocacia — comportamento compartilhado
(function () {
  var PHONE = "5554920039612";

  function whatsUrl(msg) {
    return "https://wa.me/" + PHONE + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  // Dispara conversão nos pixels que estiverem instalados (Meta / Google Ads / GA4)
  function track(label) {
    try { if (window.fbq) window.fbq("track", "Contact", { content_name: label }); } catch (e) {}
    try { if (window.gtag) window.gtag("event", "whatsapp_click", { event_label: label }); } catch (e) {}
    try { if (window.dataLayer) window.dataLayer.push({ event: "whatsapp_click", label: label }); } catch (e) {}
  }

  // Avanço de etapa da pré-análise: só o número da etapa, nunca as respostas
  function trackStep(label, step) {
    try { if (window.fbq) window.fbq("trackCustom", "PreAnaliseEtapa", { origem: label, etapa: step }); } catch (e) {}
    try { if (window.gtag) window.gtag("event", "pre_analise_etapa", { event_label: label, value: step }); } catch (e) {}
  }
  window.WB = { whatsUrl: whatsUrl, track: track, trackStep: trackStep };

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

  // Calculadora de atrasados do auxílio-acidente: 50% do salário mínimo por mês, até 5 anos
  document.querySelectorAll("form[data-calc='atrasados']").forEach(function (form) {
    var box = form.parentNode;
    var out = box.querySelector(".calc__out");
    var placeholder = box.querySelector(".calc__placeholder");
    var err = form.querySelector(".calc__error");
    var brl = function (v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
    var parseBRL = function (s) { return parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")); };
    var toISO = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    var fmt = function (iso) { return iso.split("-").reverse().join("/"); };

    form.hoje.value = toISO(new Date());
    form.hoje.max = form.acidente.max = toISO(new Date());

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      err.hidden = true;
      var a = form.acidente.value, h = form.hoje.value, sal = parseBRL(form.salario.value);
      var fail = function (msg) { err.textContent = msg; err.hidden = false; };
      if (!a) return fail("Informe a data do acidente.");
      if (!h) return fail("Informe a data de hoje.");
      if (!(sal > 0)) return fail("Informe o valor do salário mínimo.");
      var da = new Date(a + "T12:00:00"), dh = new Date(h + "T12:00:00");
      if (da >= dh) return fail("A data do acidente precisa ser anterior à data de hoje.");

      var meses = (dh.getFullYear() - da.getFullYear()) * 12 + (dh.getMonth() - da.getMonth());
      if (dh.getDate() < da.getDate()) meses--;
      meses = Math.max(meses, 0);
      var limitado = meses > 60;
      if (limitado) meses = 60;
      var mensal = sal * 0.5, total = mensal * meses;

      box.querySelector(".calc__total").textContent = brl(total);
      box.querySelector("[data-out='meses']").textContent = meses;
      box.querySelector("[data-out='mensal']").textContent = brl(mensal);
      box.querySelector("[data-out='limite']").hidden = !limitado;
      var tot = box.querySelector(".calc__total");
      tot.classList.remove("pop"); void tot.offsetWidth; tot.classList.add("pop");
      out.hidden = false;
      if (placeholder) placeholder.hidden = true;
      var res = box.querySelector(".calc__result");
      if (res.getBoundingClientRect().top > window.innerHeight * 0.6) res.scrollIntoView({ behavior: "smooth", block: "start" });

      var wa = box.querySelector("[data-calc-whats]");
      var msg = "Olá, Dr. Willian! Fiz a simulação de atrasados do auxílio-acidente no site.\n" +
        "• Data do acidente: " + fmt(a) + "\n" +
        "• Estimativa: " + brl(total) + " (" + meses + " meses)\n" +
        "Gostaria que o senhor analisasse o meu caso.";
      wa.href = whatsUrl(msg);
      wa.target = "_blank";
      wa.rel = "noopener";
      track("calc-resultado");
    });

    box.querySelector("[data-calc-whats]").addEventListener("click", function () { track("calc-acidente"); });
  });

  // Submenu do menu principal (toque abre/fecha; no computador também abre ao passar o mouse)
  document.querySelectorAll(".nav__drop").forEach(function (b) {
    b.addEventListener("click", function () {
      var g = b.closest(".nav__group");
      var open = g.classList.toggle("open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (ev) {
    document.querySelectorAll(".nav__group.open").forEach(function (g) { if (!g.contains(ev.target)) { g.classList.remove("open"); g.querySelector(".nav__drop").setAttribute("aria-expanded", "false"); } });
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

  // Cabeçalho fica sólido depois de rolar
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Títulos com [data-split] entram palavra por palavra
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.textContent = part;
            inner.style.transitionDelay = (0.15 + i++ * 0.07) + "s";
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); });
  });

  // Itens irmãos dentro de [data-stagger] entram em sequência
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(":scope > .reveal"), function (el, idx) {
      el.style.transitionDelay = (idx * 0.09) + "s";
    });
  });

  // Painéis de áreas: expande o painel em foco
  document.querySelectorAll(".areas").forEach(function (wrap) {
    var panels = wrap.querySelectorAll(".area");
    function activate(p) { panels.forEach(function (x) { x.classList.toggle("active", x === p); x.setAttribute("aria-expanded", x === p ? "true" : "false"); }); }
    panels.forEach(function (p) {
      p.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) activate(p); });
      p.addEventListener("focusin", function () { activate(p); });
      p.addEventListener("click", function () { activate(p); });
    });
  });

  // Revelar seções ao rolar
  var items = document.querySelectorAll(".reveal, .steps-line");
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
