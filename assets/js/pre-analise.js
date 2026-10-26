// Pré-análise previdenciária: assistente em etapas que monta a mensagem do WhatsApp.
// Nada é enviado a servidor nem guardado no site; as respostas só vão no texto do WhatsApp.
(function () {
  var root = document.querySelector("[data-wizard]");
  if (!root || !window.WB) return;

  var ORIGEM = root.getAttribute("data-origem") || "site";
  var TRACK = root.getAttribute("data-track") || "pre-analise";
  var STORE = "wb-pre-analise";
  var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  var UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  var SIM_NAO = ["Sim", "Não"];

  // Etapas na ordem combinada: das mais fáceis para as mais pessoais
  var STEPS = [
    { id: "situacao", rotulo: "Situação atual", pergunta: "Atualmente você está:", tipo: "escolha",
      opcoes: ["Trabalhando com carteira assinada", "Trabalhando como autônomo", "Trabalhando na agricultura", "Desempregado(a)", "Afastado(a) por problemas de saúde", "Recebendo algum benefício do INSS"] },
    { id: "nascimento", rotulo: "Data de nascimento", pergunta: "Qual é a sua data de nascimento?", tipo: "data" },
    { id: "contribuicao", rotulo: "Tempo de contribuição", pergunta: "Há quantos anos você trabalha ou contribui para o INSS?", tipo: "escolha", colunas: 2,
      opcoes: ["Menos de 5 anos", "5 a 10 anos", "10 a 15 anos", "15 a 20 anos", "20 a 25 anos", "25 a 30 anos", "30 a 35 anos", "Mais de 35 anos", "Não sei informar"] },
    { id: "rural", rotulo: "Trabalho rural", pergunta: "Você já trabalhou na roça, mesmo sem carteira assinada?", tipo: "escolha", opcoes: SIM_NAO, abreCom: "Sim",
      extras: [
        { id: "rural_inicio", rotulo: "Começou a trabalhar na roça com", pergunta: "Com quantos anos começou a trabalhar na roça?", tipo: "numero", sufixo: "anos de idade", min: 4, max: 80 },
        { id: "rural_ate", rotulo: "Trabalhou na agricultura até", pergunta: "Até que ano trabalhou na agricultura?", tipo: "numero", sufixo: "(ano)", min: 1940, max: new Date().getFullYear(), dica: "Se ainda trabalha, deixe em branco." },
        { id: "rural_familia", rotulo: "Trabalhava com pais ou familiares", pergunta: "Trabalhava com seus pais ou familiares?", tipo: "escolha", opcoes: SIM_NAO },
        { id: "rural_atual", rotulo: "Ainda trabalha na agricultura", pergunta: "Atualmente ainda trabalha na agricultura?", tipo: "escolha", opcoes: SIM_NAO }
      ] },
    { id: "especial", rotulo: "Atividade especial", pergunta: "Você já trabalhou exposto a barulho excessivo, produtos químicos, agentes biológicos ou outros riscos à saúde?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"], abreCom: "Sim",
      extras: [
        { id: "especial_anos", rotulo: "Tempo nessas condições", pergunta: "Por aproximadamente quantos anos trabalhou nessas condições?", tipo: "numero", sufixo: "anos", min: 0, max: 60 },
        { id: "especial_profissao", rotulo: "Profissão ou atividade", pergunta: "Qual era a sua profissão ou atividade?", tipo: "texto", exemplo: "Ex.: metalúrgico, frentista, técnico de enfermagem" }
      ] },
    { id: "saude", rotulo: "Problemas de saúde", pergunta: "Você tem alguma doença ou problema de saúde que dificulta ou impede o seu trabalho?", tipo: "escolha", opcoes: SIM_NAO, abreCom: "Sim",
      extras: [
        { id: "saude_qual", rotulo: "Doença ou problema", pergunta: "Qual doença ou problema de saúde você tem?", tipo: "texto", exemplo: "Ex.: hérnia de disco, depressão, problema no coração" },
        { id: "saude_trabalho", rotulo: "Consegue trabalhar", pergunta: "Está conseguindo trabalhar normalmente?", tipo: "escolha", opcoes: ["Sim", "Com dificuldades", "Não consigo trabalhar"] }
      ] },
    { id: "cirurgia", rotulo: "Cirurgias, pinos ou placas", pergunta: "Você já sofreu algum acidente, passou por cirurgia ou tem pinos, placas ou próteses no corpo?", tipo: "escolha", opcoes: SIM_NAO, abreCom: "Sim",
      extras: [
        { id: "cirurgia_parte", rotulo: "Parte do corpo", pergunta: "Qual parte do corpo foi afetada?", tipo: "texto", exemplo: "Ex.: joelho direito, coluna, mão esquerda" },
        { id: "cirurgia_limitacao", rotulo: "Ficou com limitação, dor ou dificuldade", pergunta: "Ficou com alguma limitação, dor ou dificuldade para trabalhar?", tipo: "escolha", opcoes: SIM_NAO }
      ] },
    { id: "cidade", rotulo: "Cidade", pergunta: "Em qual cidade e estado você mora?", tipo: "cidade" },
    { id: "final", tipo: "final" }
  ];
  var TOTAL = STEPS.length;

  var r = {};
  var atual = 0;
  var enviado = false;
  try { var salvo = JSON.parse(sessionStorage.getItem(STORE) || "null"); if (salvo) { r = salvo.r || {}; atual = Math.min(salvo.atual || 0, TOTAL - 1); } } catch (e) {}
  function salvar() { try { sessionStorage.setItem(STORE, JSON.stringify({ r: r, atual: atual })); } catch (e) {} }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  function idade() {
    var d = r.nascimento;
    if (!d || !d.dia || !d.mes || !d.ano) return null;
    var hoje = new Date();
    var a = hoje.getFullYear() - d.ano;
    if (hoje.getMonth() + 1 < d.mes || (hoje.getMonth() + 1 === Number(d.mes) && hoje.getDate() < d.dia)) a--;
    return a;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dataTexto() {
    var d = r.nascimento;
    if (!d || !d.dia || !d.mes || !d.ano) return "";
    return pad(Number(d.dia)) + "/" + pad(Number(d.mes)) + "/" + d.ano + " (" + idade() + " anos)";
  }

  // Bloco de botões de escolha (um toque escolhe)
  function escolhas(campo, opcoes, colunas, aoEscolher) {
    var box = el("div", { class: "wiz-opts" + (colunas === 2 ? " wiz-opts--2" : ""), role: "radiogroup", "aria-label": campo.pergunta });
    opcoes.forEach(function (op) {
      var b = el("button", { type: "button", class: "wiz-opt", role: "radio", "aria-checked": r[campo.id] === op ? "true" : "false", text: op,
        onclick: function () { r[campo.id] = op; salvar(); aoEscolher(op); } });
      box.appendChild(b);
    });
    return box;
  }

  function numero(campo) {
    var inp = el("input", { type: "number", inputmode: "numeric", class: "wiz-input wiz-input--num", id: "wiz-" + campo.id, min: campo.min, max: campo.max });
    if (r[campo.id] != null) inp.value = r[campo.id];
    inp.addEventListener("input", function () { r[campo.id] = inp.value; salvar(); });
    return el("div", { class: "wiz-num" }, [inp, campo.sufixo ? el("span", { text: campo.sufixo }) : null]);
  }

  function texto(campo) {
    var inp = el("input", { type: "text", class: "wiz-input", id: "wiz-" + campo.id, placeholder: campo.exemplo || "", maxlength: "120", autocomplete: "off" });
    if (r[campo.id]) inp.value = r[campo.id];
    inp.addEventListener("input", function () { r[campo.id] = inp.value; salvar(); });
    return inp;
  }

  function campoExtra(campo, refazer) {
    var corpo;
    if (campo.tipo === "escolha") corpo = escolhas(campo, campo.opcoes, 0, refazer);
    else if (campo.tipo === "numero") corpo = numero(campo);
    else corpo = texto(campo);
    var lab = campo.tipo === "escolha" ? el("p", { class: "wiz-sublabel", text: campo.pergunta }) : el("label", { class: "wiz-sublabel", for: "wiz-" + campo.id, text: campo.pergunta });
    return el("div", { class: "wiz-extra" }, [lab, corpo, campo.dica ? el("small", { class: "wiz-hint", text: campo.dica }) : null]);
  }

  function selectData(id, rotulo, opcoes, valor) {
    var s = el("select", { id: id, class: "wiz-input", "aria-label": rotulo });
    s.appendChild(el("option", { value: "", text: rotulo }));
    opcoes.forEach(function (o) { var op = el("option", { value: o.v, text: o.t }); if (String(o.v) === String(valor)) op.selected = true; s.appendChild(op); });
    return s;
  }

  function podeAvancar(step) {
    if (step.tipo === "data") { var d = r.nascimento || {}; return !!(d.dia && d.mes && d.ano); }
    if (step.tipo === "cidade") return !!(r.cidade && r.cidade.trim().length >= 2 && r.uf);
    if (step.tipo === "escolha") return !!r[step.id];
    return true;
  }

  function ir(i) {
    atual = Math.max(0, Math.min(TOTAL - 1, i));
    salvar();
    render(true);
    if (window.WB.trackStep) window.WB.trackStep(TRACK, atual + 1);
  }

  function render(foco) {
    var step = STEPS[atual];
    root.replaceChildren();
    root.classList.remove("wiz--fallback");

    var head = el("div", { class: "wiz-head" }, [
      el("h2", { text: "Pré-análise previdenciária" }),
      el("p", { class: "wiz-sub", text: "Gratuita · leva cerca de 2 minutos" }),
      el("div", { class: "wiz-progress", role: "progressbar", "aria-valuemin": "1", "aria-valuemax": String(TOTAL), "aria-valuenow": String(atual + 1), "aria-label": "Progresso" },
        [el("span", { style: "width:" + Math.round(((atual + 1) / TOTAL) * 100) + "%" })]),
      el("p", { class: "wiz-count", text: "Etapa " + (atual + 1) + " de " + TOTAL })
    ]);
    root.appendChild(head);

    var body = el("div", { class: "wiz-body" });
    root.appendChild(body);
    var q = el("h3", { class: "wiz-q", tabindex: "-1", text: step.pergunta || "Revise e envie" });
    body.appendChild(q);

    var avancar = el("button", { type: "button", class: "btn btn--gold wiz-next", text: "Próximo", onclick: function () { if (podeAvancar(step)) ir(atual + 1); } });
    function atualizaBotao() { avancar.disabled = !podeAvancar(step); }

    if (step.tipo === "escolha") {
      var extrasBox = el("div", { class: "wiz-extras" });
      var precisaProximo = !!step.extras;
      body.appendChild(escolhas(step, step.opcoes, step.colunas, function (op) {
        if (step.extras && op === step.abreCom) { render(false); var ex = root.querySelector(".wiz-extras input, .wiz-extras .wiz-opt"); if (ex) ex.focus(); }
        else ir(atual + 1);
      }));
      if (step.extras && r[step.id] === step.abreCom) {
        step.extras.forEach(function (c) { extrasBox.appendChild(campoExtra(c, function () { render(false); })); });
        body.appendChild(extrasBox);
      }
      if (!precisaProximo || r[step.id] !== step.abreCom) avancar.hidden = !r[step.id];
    }

    if (step.tipo === "data") {
      var d = r.nascimento || (r.nascimento = {});
      var dias = []; for (var i = 1; i <= 31; i++) dias.push({ v: i, t: String(i) });
      var meses = MESES.map(function (m, k) { return { v: k + 1, t: m }; });
      var anos = []; for (var a = new Date().getFullYear() - 14; a >= 1925; a--) anos.push({ v: a, t: String(a) });
      var sd = selectData("wiz-dia", "Dia", dias, d.dia), sm = selectData("wiz-mes", "Mês", meses, d.mes), sa = selectData("wiz-ano", "Ano", anos, d.ano);
      [[sd, "dia"], [sm, "mes"], [sa, "ano"]].forEach(function (p) {
        p[0].addEventListener("change", function () { d[p[1]] = p[0].value ? Number(p[0].value) : null; salvar(); atualizaBotao(); });
      });
      body.appendChild(el("div", { class: "wiz-date" }, [sd, sm, sa]));
    }

    if (step.tipo === "cidade") {
      var cid = el("input", { type: "text", id: "wiz-cidade", class: "wiz-input", placeholder: "Sua cidade", autocomplete: "address-level2", maxlength: "60" });
      if (r.cidade) cid.value = r.cidade;
      cid.addEventListener("input", function () { r.cidade = cid.value; salvar(); atualizaBotao(); });
      if (!r.uf) r.uf = "RS";
      var uf = selectData("wiz-uf", "UF", UFS.map(function (u) { return { v: u, t: u }; }), r.uf);
      uf.addEventListener("change", function () { r.uf = uf.value; salvar(); atualizaBotao(); });
      body.appendChild(el("div", { class: "wiz-city" }, [el("label", { class: "wiz-sublabel", for: "wiz-cidade", text: "Cidade" }), el("label", { class: "wiz-sublabel", for: "wiz-uf", text: "Estado" }), cid, uf]));
      var nome = el("input", { type: "text", id: "wiz-nome", class: "wiz-input", placeholder: "Opcional", autocomplete: "given-name", maxlength: "40" });
      if (r.nome) nome.value = r.nome;
      nome.addEventListener("input", function () { r.nome = nome.value; salvar(); });
      body.appendChild(el("div", { class: "wiz-extra" }, [el("label", { class: "wiz-sublabel", for: "wiz-nome", text: "Seu primeiro nome (opcional)" }), nome]));
    }

    if (step.tipo === "final") return renderFinal(body, q, foco);

    var nav = el("div", { class: "wiz-nav" }, [
      atual > 0 ? el("button", { type: "button", class: "wiz-back", text: "← Voltar", onclick: function () { ir(atual - 1); } }) : el("span"),
      avancar
    ]);
    root.appendChild(nav);
    atualizaBotao();
    root.appendChild(atalhoWhats());
    if (foco) focar(q);
  }

  function linhas() {
    var out = [];
    if (r.nome && r.nome.trim()) out.push(["Nome", r.nome.trim()]);
    out.push(["Data de nascimento", dataTexto()]);
    out.push(["Tempo de contribuição", r.contribuicao]);
    STEPS.forEach(function (s) {
      if (!s.extras) return;
      out.push([s.rotulo, r[s.id]]);
      if (r[s.id] === s.abreCom) s.extras.forEach(function (c) {
        var v = r[c.id];
        if (v == null || String(v).trim() === "") return;
        if (c.id === "rural_inicio") v = v + " anos de idade";
        if (c.id === "especial_anos") v = v + " anos";
        out.push(["   • " + c.rotulo, String(v).trim()]);
      });
    });
    out.push(["Situação atual", r.situacao]);
    out.push(["Cidade", (r.cidade || "").trim() + (r.uf ? "/" + r.uf : "")]);
    return out.filter(function (l) { return l[1]; });
  }

  function mensagem() {
    var txt = "Olá, Dr. Willian! Gostaria de realizar uma análise previdenciária.\n(Preenchi a pré-análise na página de " + ORIGEM + " do site.)\n\n";
    linhas().forEach(function (l) {
      txt += l[0].indexOf("•") >= 0 ? l[0] + ": " + l[1] + "\n" : "*" + l[0] + ":* " + l[1] + "\n";
    });
    return txt.trim();
  }

  function renderFinal(body, q, foco) {
    var lista = el("dl", { class: "wiz-review" });
    linhas().forEach(function (l) {
      var sub = l[0].indexOf("•") >= 0;
      lista.appendChild(el("dt", { class: sub ? "sub" : "", text: l[0].replace("   • ", "") }));
      lista.appendChild(el("dd", { class: sub ? "sub" : "", text: l[1] }));
    });
    body.appendChild(lista);
    body.appendChild(el("button", { type: "button", class: "wiz-back wiz-edit", text: "Corrigir alguma resposta", onclick: function () { ir(0); } }));

    body.appendChild(el("p", { class: "wiz-disclaimer" }, [el("strong", { text: "Importante: " }),
      "o preenchimento não garante a concessão de benefício. A análise definitiva depende da avaliação dos documentos pelo advogado."]));

    var chk = el("input", { type: "checkbox", id: "wiz-consent" });
    if (r.consent) chk.checked = true;
    var priv = el("div", { class: "wiz-privacy" }, [
      el("label", { class: "wiz-consent", for: "wiz-consent" }, [chk, el("span", { text: "Autorizo o envio destas informações, incluindo dados de saúde, ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do meu caso." })]),
      el("p", { class: "wiz-privacy-text" }, [
        "Suas respostas não ficam guardadas neste site: elas vão apenas na mensagem que você mesmo envia pelo WhatsApp. Serão usadas só para avaliar o seu caso, pelo advogado Willian Bussolotto Bocalon (OAB/RS 138.665). Você pode pedir a exclusão a qualquer momento pelo mesmo WhatsApp. ",
        el("a", { href: "politica-de-privacidade.html", target: "_blank", rel: "noopener", text: "Política de Privacidade" })
      ])
    ]);
    body.appendChild(priv);

    var enviar = el("a", { class: "btn btn--whats btn--block btn--lg wiz-send", href: window.WB.whatsUrl(mensagem()), target: "_blank", rel: "noopener", role: "button" });
    enviar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>';
    enviar.appendChild(document.createTextNode("Solicitar minha análise previdenciária"));
    var aviso = el("p", { class: "wiz-need", role: "alert", text: "Marque a autorização acima para enviar." });
    aviso.hidden = true;
    function estado() {
      enviar.setAttribute("aria-disabled", chk.checked ? "false" : "true");
      enviar.classList.toggle("is-disabled", !chk.checked);
      if (chk.checked) aviso.hidden = true;
    }
    chk.addEventListener("change", function () { r.consent = chk.checked; salvar(); estado(); });
    enviar.addEventListener("click", function (ev) {
      if (!chk.checked) { ev.preventDefault(); aviso.hidden = false; chk.focus(); return; }
      window.WB.track(TRACK + "-enviado");
      enviado = true;
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
        el("p", { class: "wiz-sub", text: "A mensagem com as suas respostas já está escrita. É só tocar em enviar no WhatsApp. O Dr. Willian responde pessoalmente." }),
        el("a", { class: "btn btn--whats btn--block btn--lg", href: window.WB.whatsUrl(mensagem()), target: "_blank", rel: "noopener", text: "Abrir o WhatsApp de novo" }),
        el("button", { type: "button", class: "wiz-back wiz-edit", text: "Fazer uma nova pré-análise", onclick: function () { r = {}; atual = 0; salvar(); render(true); } })
      ])
    );
  }

  function atalhoWhats() {
    return el("a", { class: "wiz-skip", href: window.WB.whatsUrl(document.body.getAttribute("data-whats-msg") || ""), target: "_blank", rel: "noopener", text: "Prefiro falar direto no WhatsApp",
      onclick: function () { window.WB.track(TRACK + "-atalho"); } });
  }

  function focar(q) {
    var top = root.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) root.scrollIntoView({ behavior: "smooth", block: "start" });
    try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
  }

  // No celular, a barra fixa do WhatsApp some enquanto a pré-análise está na tela
  var barra = document.querySelector(".mobile-bar");
  if (barra && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      barra.classList.toggle("is-hidden", es[0].isIntersecting);
    }, { threshold: 0.15 }).observe(root);
  }

  render(false);
})();
