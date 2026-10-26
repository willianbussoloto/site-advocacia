// Motor dos formulários em etapas (pré-análises). Cada página passa uma configuração
// para WBWizard.mount(). Nada é enviado a servidor nem guardado no site: as respostas
// só vão no texto da mensagem que a própria pessoa envia pelo WhatsApp.
(function () {
  var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  var UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  var ANO = new Date().getFullYear();
  var ICON_WHATS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>';

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.className = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function vazio(v) { return v == null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && !v.length); }
  function abre(campo, v) { var a = campo.abreCom; return a != null && (Array.isArray(a) ? a.indexOf(v) >= 0 : a === v); }

  function mount(root, cfg) {
    if (!root || !window.WB) return null;
    var STORE = "wb-wiz-" + cfg.id;
    var steps = cfg.steps.concat([{ id: "_final", tipo: "final" }]);
    var TOTAL = steps.length;
    var r = {}, atual = 0;
    try { var s = JSON.parse(sessionStorage.getItem(STORE) || "null"); if (s) { r = s.r || {}; atual = Math.min(s.atual || 0, TOTAL - 1); } } catch (e) {}
    function salvar() { try { sessionStorage.setItem(STORE, JSON.stringify({ r: r, atual: atual })); } catch (e) {} }

    // ---------- valores em texto ----------
    function valorTexto(c) {
      var v = r[c.id];
      if (c.tipo === "data") {
        if (!v || !v.dia || !v.mes || !v.ano) return "";
        var hoje = new Date(), id = hoje.getFullYear() - v.ano;
        if (hoje.getMonth() + 1 < v.mes || (hoje.getMonth() + 1 === Number(v.mes) && hoje.getDate() < v.dia)) id--;
        return pad(Number(v.dia)) + "/" + pad(Number(v.mes)) + "/" + v.ano + " (" + id + " anos)";
      }
      if (c.tipo === "mesano") return v && v.ano ? (v.mes ? MESES[v.mes - 1] + " de " : "") + v.ano : "";
      if (c.tipo === "multi") return Array.isArray(v) ? v.join(", ") : "";
      if (vazio(v)) return "";
      v = String(v).trim();
      if (c.sufixoMsg) v += " " + c.sufixoMsg;
      return v;
    }

    function linhas() {
      var out = [];
      function campo(c, sub) {
        if (c.tipo === "dados") {
          if (!vazio(r.nome)) out.push([c.rotuloNome || "Nome", r.nome.trim(), sub]);
          if (c.telefone && !vazio(r.telefone)) out.push(["Telefone/WhatsApp", r.telefone.trim(), sub]);
          out.push([c.rotuloCidade || "Cidade", (r.cidade || "").trim() + (r.uf ? "/" + r.uf : ""), sub]);
          return;
        }
        var t = valorTexto(c);
        if (t) out.push([c.rotulo, t, sub]);
        if (c.extras && abre(c, r[c.id])) c.extras.forEach(function (x) { if (visivel(x)) campo(x, true); });
      }
      var ordem = cfg.ordem || steps.map(function (s) { return s.id; });
      ordem.forEach(function (id) { var s = steps.filter(function (x) { return x.id === id; })[0]; if (s && s.tipo !== "final") campo(s, false); });
      return out;
    }

    function mensagem() {
      var txt = cfg.intro + "\n(" + cfg.origemTexto + ")\n\n";
      linhas().forEach(function (l) { txt += l[2] ? "   • " + l[0] + ": " + l[1] + "\n" : "*" + l[0] + ":* " + l[1] + "\n"; });
      if (cfg.docsMsg && Array.isArray(r[cfg.docsMsg]) && r[cfg.docsMsg].length && r[cfg.docsMsg].indexOf("Ainda não tenho documentos") < 0)
        txt += "\nVou enviar os documentos aqui na conversa em seguida.";
      return txt.trim();
    }

    // ---------- controles ----------
    function escolhas(c, colunas, aoEscolher) {
      var box = el("div", { class: "wiz-opts" + (colunas === 2 ? " wiz-opts--2" : ""), role: "radiogroup", "aria-label": c.pergunta });
      c.opcoes.forEach(function (op) {
        box.appendChild(el("button", { type: "button", class: "wiz-opt", role: "radio", "aria-checked": r[c.id] === op ? "true" : "false", text: op,
          onclick: function () { r[c.id] = op; salvar(); aoEscolher(op); } }));
      });
      return box;
    }
    function multi(c, mudou) {
      var sel = Array.isArray(r[c.id]) ? r[c.id] : (r[c.id] = []);
      var box = el("div", { class: "wiz-opts wiz-opts--multi", role: "group", "aria-label": c.pergunta });
      c.opcoes.forEach(function (op) {
        var b = el("button", { type: "button", class: "wiz-opt wiz-opt--check", role: "checkbox", "aria-checked": sel.indexOf(op) >= 0 ? "true" : "false", text: op,
          onclick: function () {
            var i = sel.indexOf(op);
            if (i >= 0) sel.splice(i, 1); else {
              if (c.exclusivo && op === c.exclusivo) sel.length = 0;
              else if (c.exclusivo) { var j = sel.indexOf(c.exclusivo); if (j >= 0) sel.splice(j, 1); }
              sel.push(op);
            }
            salvar(); mudou();
          } });
        box.appendChild(b);
      });
      return box;
    }
    function entrada(c, tipo, mudou) {
      var attrs = { id: "wiz-" + cfg.id + "-" + c.id, class: "wiz-input" + (tipo === "number" ? " wiz-input--num" : ""), maxlength: c.max || (tipo === "textarea" ? 600 : 120), placeholder: c.exemplo || (c.opcional ? "Opcional" : ""), autocomplete: c.autocomplete || "off" };
      if (tipo === "number") { attrs.type = "number"; attrs.inputmode = "numeric"; attrs.min = c.min; attrs.max = c.maxNum; delete attrs.maxlength; }
      else if (tipo === "tel") { attrs.type = "tel"; attrs.inputmode = "tel"; }
      else if (tipo !== "textarea") attrs.type = "text";
      if (tipo === "textarea") attrs.rows = 4;
      var inp = el(tipo === "textarea" ? "textarea" : "input", attrs);
      if (!vazio(r[c.id])) inp.value = r[c.id];
      inp.addEventListener("input", function () { r[c.id] = inp.value; salvar(); if (mudou) mudou(); });
      return inp;
    }
    function select(id, rotulo, opcoes, valor) {
      var s = el("select", { id: id, class: "wiz-input", "aria-label": rotulo });
      s.appendChild(el("option", { value: "", text: rotulo }));
      opcoes.forEach(function (o) { var op = el("option", { value: o.v, text: o.t }); if (String(o.v) === String(valor)) op.selected = true; s.appendChild(op); });
      return s;
    }
    function mesAno(c, mudou) {
      var v = r[c.id] || (r[c.id] = {});
      var anos = []; for (var a = ANO + (c.futuro ? 5 : 0); a >= (c.desde || 1990); a--) anos.push({ v: a, t: String(a) });
      var sm = select("wiz-" + cfg.id + "-" + c.id + "-mes", "Mês", MESES.map(function (m, k) { return { v: k + 1, t: m }; }), v.mes);
      var sa = select("wiz-" + cfg.id + "-" + c.id + "-ano", "Ano", anos, v.ano);
      sm.addEventListener("change", function () { v.mes = sm.value ? Number(sm.value) : null; salvar(); if (mudou) mudou(); });
      sa.addEventListener("change", function () { v.ano = sa.value ? Number(sa.value) : null; salvar(); if (mudou) mudou(); });
      return el("div", { class: "wiz-mesano" }, [sm, sa]);
    }

    function controle(c, refazer, mudou, auto) {
      if (c.tipo === "escolha") return escolhas(c, c.colunas, auto || refazer);
      if (c.tipo === "multi") return multi(c, refazer);
      if (c.tipo === "numero") return el("div", { class: "wiz-num" }, [entrada(c, "number", mudou), c.sufixo ? el("span", { text: c.sufixo }) : null]);
      if (c.tipo === "textarea") return entrada(c, "textarea", mudou);
      if (c.tipo === "mesano") return mesAno(c, mudou);
      return entrada(c, "text", mudou);
    }

    function completo(c) {
      if (c.opcional) return true;
      var v = r[c.id];
      if (c.tipo === "data") return !!(v && v.dia && v.mes && v.ano);
      if (c.tipo === "mesano") return !!(v && v.ano);
      if (c.tipo === "multi") return Array.isArray(v) && v.length > 0;
      if (c.tipo === "dados") return !vazio(r.cidade) && r.cidade.trim().length >= 2 && !!r.uf && (c.nome !== "obrigatorio" || (!vazio(r.nome) && r.nome.trim().length >= 3));
      return !vazio(v);
    }
    function podeAvancar(s) {
      if (!completo(s)) return false;
      if (s.extras && abre(s, r[s.id])) return s.extras.every(function (x) { return !visivel(x) || x.tipo === "escolha" ? true : completo(x); });
      return true;
    }

    function visivel(x) { return !x.se || r[x.se.campo] === x.se.valor; }
    function ir(i) { atual = Math.max(0, Math.min(TOTAL - 1, i)); salvar(); render(true); if (window.WB.trackStep) window.WB.trackStep(cfg.track, atual + 1); }

    function render(foco) {
      var step = steps[atual];
      root.replaceChildren();
      root.appendChild(el("div", { class: "wiz-head" }, [
        el("h2", { text: cfg.titulo }),
        el("p", { class: "wiz-sub", text: cfg.subtitulo || "Gratuita · leva cerca de 2 minutos" }),
        el("div", { class: "wiz-progress", role: "progressbar", "aria-valuemin": "1", "aria-valuemax": String(TOTAL), "aria-valuenow": String(atual + 1), "aria-label": "Progresso" },
          [el("span", { style: "width:" + Math.round(((atual + 1) / TOTAL) * 100) + "%" })]),
        el("p", { class: "wiz-count", text: "Etapa " + (atual + 1) + " de " + TOTAL })
      ]));
      var body = el("div", { class: "wiz-body" });
      root.appendChild(body);
      var q = el("h3", { class: "wiz-q", tabindex: "-1", text: step.pergunta || "Revise e envie" });
      body.appendChild(q);
      if (step.dica) body.appendChild(el("p", { class: "wiz-hint wiz-hint--top", text: step.dica }));

      if (step.tipo === "final") return renderFinal(body, q, foco);

      var prox = el("button", { type: "button", class: "btn btn--gold wiz-next", text: "Próximo", onclick: function () { if (podeAvancar(step)) ir(atual + 1); } });
      function atualiza() { prox.disabled = !podeAvancar(step); }

      if (step.tipo === "escolha") {
        body.appendChild(escolhas(step, step.colunas, function (op) {
          if (step.extras && abre(step, op)) { render(false); var ex = root.querySelector(".wiz-extras input, .wiz-extras textarea, .wiz-extras select, .wiz-extras .wiz-opt"); if (ex) ex.focus(); }
          else ir(atual + 1);
        }));
        if (step.extras && abre(step, r[step.id])) {
          var box = el("div", { class: "wiz-extras" });
          step.extras.forEach(function (x) {
            if (!visivel(x)) return;
            var lab = (x.tipo === "escolha" || x.tipo === "multi" || x.tipo === "mesano") ? el("p", { class: "wiz-sublabel", text: x.pergunta + (x.opcional ? " (opcional)" : "") }) : el("label", { class: "wiz-sublabel", for: "wiz-" + cfg.id + "-" + x.id, text: x.pergunta + (x.opcional ? " (opcional)" : "") });
            box.appendChild(el("div", { class: "wiz-extra" }, [lab, controle(x, function () { render(false); }, atualiza), x.dica ? el("small", { class: "wiz-hint", text: x.dica }) : null]));
          });
          body.appendChild(box);
        } else prox.hidden = !r[step.id];
      } else if (step.tipo === "multi") {
        body.appendChild(multi(step, function () { render(false); }));
      } else if (step.tipo === "data") {
        var d = r[step.id] || (r[step.id] = {});
        var dias = []; for (var i = 1; i <= 31; i++) dias.push({ v: i, t: String(i) });
        var anos = []; for (var a = ANO - 14; a >= 1925; a--) anos.push({ v: a, t: String(a) });
        var sd = select("wiz-dia", "Dia", dias, d.dia), sm = select("wiz-mes", "Mês", MESES.map(function (m, k) { return { v: k + 1, t: m }; }), d.mes), sa = select("wiz-ano", "Ano", anos, d.ano);
        [[sd, "dia"], [sm, "mes"], [sa, "ano"]].forEach(function (p) { p[0].addEventListener("change", function () { d[p[1]] = p[0].value ? Number(p[0].value) : null; salvar(); atualiza(); }); });
        body.appendChild(el("div", { class: "wiz-date" }, [sd, sm, sa]));
      } else if (step.tipo === "dados") {
        var campos = el("div", { class: "wiz-dados" });
        if (step.nome) {
          var nomeC = { id: "nome", exemplo: step.nome === "obrigatorio" ? "Nome e sobrenome" : "Opcional", autocomplete: step.nome === "obrigatorio" ? "name" : "given-name", max: 80 };
          campos.appendChild(el("div", { class: "wiz-extra" }, [el("label", { class: "wiz-sublabel", for: "wiz-" + cfg.id + "-nome", text: step.nome === "obrigatorio" ? "Nome completo" : "Seu primeiro nome (opcional)" }), entrada(nomeC, "text", atualiza)]));
        }
        if (step.telefone) {
          campos.appendChild(el("div", { class: "wiz-extra" }, [el("label", { class: "wiz-sublabel", for: "wiz-" + cfg.id + "-telefone", text: "Telefone/WhatsApp (opcional)" }),
            entrada({ id: "telefone", exemplo: "(54) 99999-9999", autocomplete: "tel", max: 20 }, "tel", atualiza),
            el("small", { class: "wiz-hint", text: "Preencha se o WhatsApp que vai enviar a mensagem não for o seu." })]));
        }
        if (!r.uf) r.uf = "RS";
        var cid = entrada({ id: "cidade", exemplo: "Sua cidade", autocomplete: "address-level2", max: 60 }, "text", atualiza);
        var uf = select("wiz-" + cfg.id + "-uf", "UF", UFS.map(function (u) { return { v: u, t: u }; }), r.uf);
        uf.addEventListener("change", function () { r.uf = uf.value; salvar(); atualiza(); });
        campos.appendChild(el("div", { class: "wiz-city" }, [el("label", { class: "wiz-sublabel", for: "wiz-" + cfg.id + "-cidade", text: step.rotuloCidade || "Cidade" }), el("label", { class: "wiz-sublabel", for: "wiz-" + cfg.id + "-uf", text: "Estado" }), cid, uf]));
        body.appendChild(campos);
      } else {
        body.appendChild(controle(step, function () { render(false); }, atualiza));
      }

      root.appendChild(el("div", { class: "wiz-nav" }, [
        atual > 0 ? el("button", { type: "button", class: "wiz-back", text: "← Voltar", onclick: function () { ir(atual - 1); } })
          : (cfg.aoVoltarInicio ? el("button", { type: "button", class: "wiz-back", text: "← Outras opções", onclick: cfg.aoVoltarInicio }) : el("span")),
        prox
      ]));
      atualiza();
      root.appendChild(el("a", { class: "wiz-skip", href: window.WB.whatsUrl(cfg.msgDireta || document.body.getAttribute("data-whats-msg") || ""), target: "_blank", rel: "noopener", text: "Prefiro falar direto no WhatsApp",
        onclick: function () { window.WB.track(cfg.track + "-atalho"); } }));
      if (foco) focar(q);
    }

    function renderFinal(body, q, foco) {
      var lista = el("dl", { class: "wiz-review" });
      linhas().forEach(function (l) {
        lista.appendChild(el("dt", { class: l[2] ? "sub" : null, text: l[0] }));
        lista.appendChild(el("dd", { class: l[2] ? "sub" : null, text: l[1] }));
      });
      body.appendChild(lista);
      body.appendChild(el("button", { type: "button", class: "wiz-back wiz-edit", text: "Corrigir alguma resposta", onclick: function () { ir(0); } }));
      if (cfg.docsAviso) body.appendChild(el("div", { class: "wiz-docs" }, [el("strong", { text: "Documentos: " }), cfg.docsAviso]));
      body.appendChild(el("p", { class: "wiz-disclaimer" }, [el("strong", { text: "Importante: " }), cfg.aviso]));

      var chk = el("input", { type: "checkbox", id: "wiz-" + cfg.id + "-consent" });
      if (r._consent) chk.checked = true;
      body.appendChild(el("div", { class: "wiz-privacy" }, [
        el("label", { class: "wiz-consent", for: "wiz-" + cfg.id + "-consent" }, [chk, el("span", { text: cfg.consentimento })]),
        el("p", { class: "wiz-privacy-text" }, [
          "Suas respostas não ficam guardadas neste site: elas vão apenas na mensagem que você mesmo envia pelo WhatsApp. Serão usadas só para avaliar o seu caso, pelo advogado Willian Bussolotto Bocalon (OAB/RS 138.665). Você pode pedir a exclusão a qualquer momento pelo mesmo WhatsApp. ",
          el("a", { href: "politica-de-privacidade.html", target: "_blank", rel: "noopener", text: "Política de Privacidade" })
        ])
      ]));

      var enviar = el("a", { class: "btn btn--whats btn--block btn--lg wiz-send", href: window.WB.whatsUrl(mensagem()), target: "_blank", rel: "noopener", role: "button" });
      enviar.innerHTML = ICON_WHATS;
      enviar.appendChild(document.createTextNode(cfg.botao));
      var aviso = el("p", { class: "wiz-need", role: "alert", text: "Marque a autorização acima para enviar." });
      aviso.hidden = true;
      function estado() { enviar.setAttribute("aria-disabled", chk.checked ? "false" : "true"); enviar.classList.toggle("is-disabled", !chk.checked); if (chk.checked) aviso.hidden = true; }
      chk.addEventListener("change", function () { r._consent = chk.checked; salvar(); estado(); });
      enviar.addEventListener("click", function (ev) {
        if (!chk.checked) { ev.preventDefault(); aviso.hidden = false; chk.focus(); return; }
        window.WB.track(cfg.track + "-enviado");
        setTimeout(renderObrigado, 400);
      });
      estado();
      body.appendChild(enviar);
      body.appendChild(aviso);
      root.appendChild(el("div", { class: "wiz-nav" }, [el("button", { type: "button", class: "wiz-back", text: "← Voltar", onclick: function () { ir(atual - 1); } }), el("span")]));
      if (foco) focar(q);
    }

    function renderObrigado() {
      root.replaceChildren(
        el("div", { class: "wiz-head" }, [el("h2", { text: "Pronto! Abrimos o seu WhatsApp" })]),
        el("div", { class: "wiz-body" }, [
          el("p", { class: "wiz-sub", text: "A mensagem com as suas respostas já está escrita. É só tocar em enviar no WhatsApp." + (cfg.docsAviso ? " Depois, mande os documentos na mesma conversa." : "") + " O Dr. Willian responde pessoalmente." }),
          el("a", { class: "btn btn--whats btn--block btn--lg", href: window.WB.whatsUrl(mensagem()), target: "_blank", rel: "noopener", text: "Abrir o WhatsApp de novo" }),
          el("button", { type: "button", class: "wiz-back wiz-edit", text: "Preencher de novo", onclick: function () { r = {}; atual = 0; salvar(); render(true); } })
        ])
      );
    }

    function focar(q) {
      var top = root.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) root.scrollIntoView({ behavior: "smooth", block: "start" });
      try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
    }

    render(false);
    return { render: render, mensagem: mensagem };
  }

  // No celular, a barra fixa do WhatsApp some enquanto um formulário está na tela
  function esconderBarra(alvo) {
    var barra = document.querySelector(".mobile-bar");
    if (!barra || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (es) { barra.classList.toggle("is-hidden", es[0].isIntersecting); }, { threshold: 0.15 }).observe(alvo);
  }

  // Cartões que escolhem qual formulário abrir no painel abaixo deles
  function escolhedor(cards, painel, configs) {
    var STORE = "wb-wiz-escolha-" + (painel.id || "form");
    var montado = null;
    function abrir(chave, rolar) {
      var cfg = configs[chave];
      if (!cfg) return;
      cards.forEach(function (c) { var on = c.getAttribute("data-form") === chave; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
      painel.hidden = false;
      cfg.aoVoltarInicio = function () { fechar(true); };
      montado = mount(painel, cfg);
      try { sessionStorage.setItem(STORE, chave); } catch (e) {}
      if (window.WB.track) window.WB.track(cfg.track + "-aberto");
      if (rolar) painel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function fechar(rolar) {
      painel.hidden = true;
      painel.replaceChildren();
      cards.forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      try { sessionStorage.removeItem(STORE); } catch (e) {}
      if (rolar && cards[0]) cards[0].closest("section").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    cards.forEach(function (c) {
      c.addEventListener("click", function (ev) { ev.preventDefault(); abrir(c.getAttribute("data-form"), true); });
    });
    var salvo = null;
    try { salvo = sessionStorage.getItem(STORE); } catch (e) {}
    var pedido = (location.hash || "").slice(1);
    if (configs[pedido]) abrir(pedido, true); else if (salvo) abrir(salvo, false);
    esconderBarra(painel);
  }

  window.WBWizard = { mount: mount, esconderBarra: esconderBarra, escolhedor: escolhedor, SIM_NAO: ["Sim", "Não"] };
})();
