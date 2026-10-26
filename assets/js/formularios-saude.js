// Formulários da página Direito da Saúde (respostas vão pelo WhatsApp)
(function () {
  if (!window.WBWizard) return;
  var SN = WBWizard.SIM_NAO;
  var comum = {
    subtitulo: "Gratuito · leva cerca de 2 minutos",
    botao: "Solicitar análise do meu caso",
    aviso: "o preenchimento não garante o acesso ao tratamento nem o resultado de um pedido judicial. Cada caso depende da análise dos documentos médicos pelo advogado.",
    consentimento: "Autorizo o envio destas informações, incluindo dados de saúde, ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do meu caso.",
    docsAviso: "depois de enviar a mensagem, mande na mesma conversa fotos ou PDF da prescrição ou do laudo médico e, se tiver, da negativa e dos exames.",
    docsMsg: "documentos",
    msgDireta: "Olá, Dr. Willian! Vim pela página de Direito da Saúde do site e gostaria de falar sobre um tratamento."
  };
  var dados = { id: "dados", tipo: "dados", pergunta: "Para finalizar, seus dados:", nome: "obrigatorio", telefone: true };
  var situacao = { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique brevemente a situação.", tipo: "textarea", opcional: true,
    exemplo: "Ex.: o médico indicou a cirurgia em agosto, o plano negou dizendo que não está no rol da ANS..." };
  function docs(opcoes) {
    return { id: "documentos", rotulo: "Documentos que tenho para enviar", pergunta: "Quais documentos você tem para mandar na conversa?", tipo: "multi",
      dica: "Toque em todos que tiver. Você manda as fotos ou PDF no WhatsApp, logo depois.", opcoes: opcoes.concat(["Ainda não tenho documentos"]), exclusivo: "Ainda não tenho documentos" };
  }
  function cfg(o) { var c = {}; Object.keys(comum).forEach(function (k) { c[k] = comum[k]; }); Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  var configs = {
    plano: cfg({
      id: "saude-plano", track: "saude-plano", titulo: "Meu plano de saúde negou o tratamento",
      intro: "Olá, Dr. Willian! Meu plano de saúde negou um tratamento e gostaria de uma análise do meu caso.",
      origemTexto: "Preenchi o formulário \"Meu plano de saúde negou o tratamento\" na página de Direito da Saúde do site.",
      ordem: ["dados", "plano", "negado", "prescricao", "negativa", "urgente", "relato", "documentos"],
      steps: [
        { id: "plano", rotulo: "Plano de saúde", pergunta: "Qual é o seu plano de saúde?", tipo: "texto", exemplo: "Ex.: Unimed, Bradesco Saúde, IPE Saúde" },
        { id: "negado", rotulo: "O que foi negado", pergunta: "Qual tratamento, cirurgia, exame ou medicamento foi negado?", tipo: "texto", exemplo: "Ex.: cirurgia bariátrica, terapia ABA, quimioterapia oral" },
        { id: "prescricao", rotulo: "Tem prescrição médica", pergunta: "Você tem prescrição ou indicação médica por escrito?", tipo: "escolha", opcoes: SN },
        { id: "negativa", rotulo: "Negativa por escrito", pergunta: "O plano de saúde deu a negativa por escrito?", tipo: "escolha", opcoes: SN.concat(["Não sei"]), abreCom: ["Sim", "Não", "Não sei"],
          extras: [{ id: "motivo", rotulo: "Motivo informado", pergunta: "Qual foi o motivo informado para a negativa?", tipo: "texto", opcional: true, exemplo: "Ex.: não está no rol da ANS, carência, doença preexistente" }] },
        { id: "urgente", rotulo: "É urgente", pergunta: "O tratamento é urgente?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"], dica: "Urgente é quando o médico diz que a demora pode causar risco ou piora." },
        situacao,
        docs(["Prescrição ou laudo médico", "Negativa do plano", "Carteirinha ou contrato do plano", "Exames"]),
        dados
      ]
    }),
    direito: cfg({
      id: "saude-direito", track: "saude-direito", titulo: "Tenho direito a esse tratamento?",
      intro: "Olá, Dr. Willian! Gostaria de saber se tenho direito a um tratamento de saúde.",
      origemTexto: "Preenchi o formulário \"Tenho direito a esse tratamento?\" na página de Direito da Saúde do site.",
      ordem: ["dados", "condicao", "tratamento", "indicacao", "onde", "tentou", "urgente", "relato", "documentos"],
      steps: [
        { id: "condicao", rotulo: "Doença ou condição", pergunta: "Qual doença ou condição de saúde motivou a indicação do tratamento?", tipo: "texto", exemplo: "Ex.: autismo, câncer de mama, diabetes" },
        { id: "tratamento", rotulo: "Tratamento necessário", pergunta: "Qual tratamento, medicamento, cirurgia ou procedimento você precisa?", tipo: "texto" },
        { id: "indicacao", rotulo: "Tem indicação médica", pergunta: "Você tem indicação médica para esse tratamento?", tipo: "escolha", opcoes: SN },
        { id: "onde", rotulo: "Pedido será feito", pergunta: "O tratamento será pedido ao SUS ou ao plano de saúde?", tipo: "escolha", opcoes: ["Plano de saúde", "SUS", "Não sei"] },
        { id: "tentou", rotulo: "Já tentou conseguir", pergunta: "Você já tentou conseguir o tratamento?", tipo: "escolha", opcoes: SN },
        { id: "urgente", rotulo: "É urgente", pergunta: "O tratamento é urgente?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"], dica: "Urgente é quando o médico diz que a demora pode causar risco ou piora." },
        situacao,
        docs(["Prescrição ou laudo médico", "Exames", "Resposta do plano ou do SUS"]),
        dados
      ]
    }),
    sus: cfg({
      id: "saude-sus", track: "saude-sus", titulo: "O SUS deve fornecer meu tratamento?",
      intro: "Olá, Dr. Willian! Preciso de um tratamento pelo SUS e gostaria de uma análise do meu caso.",
      origemTexto: "Preenchi o formulário \"O SUS deve fornecer meu tratamento?\" na página de Direito da Saúde do site.",
      ordem: ["dados", "tratamento", "prescricao", "solicitou", "urgencia", "relato", "documentos"],
      steps: [
        { id: "tratamento", rotulo: "Tratamento necessário", pergunta: "Qual tratamento, medicamento, cirurgia ou exame você precisa?", tipo: "texto", exemplo: "Ex.: cirurgia de quadril, medicamento para esclerose múltipla" },
        { id: "prescricao", rotulo: "Tem prescrição médica", pergunta: "Você tem prescrição médica?", tipo: "escolha", opcoes: SN },
        { id: "solicitou", rotulo: "Já pediu ao SUS", pergunta: "Você já pediu o tratamento pelo SUS?", tipo: "escolha", opcoes: SN, abreCom: "Sim",
          extras: [
            { id: "negou", rotulo: "O SUS negou", pergunta: "O SUS negou o fornecimento?", tipo: "escolha", opcoes: SN },
            { id: "fila", rotulo: "Está na fila de espera", pergunta: "Está aguardando em fila de espera?", tipo: "escolha", opcoes: SN },
            { id: "espera", rotulo: "Tempo de espera", pergunta: "Há quanto tempo está aguardando?", tipo: "escolha", opcoes: ["Menos de 3 meses", "3 a 6 meses", "6 meses a 1 ano", "Mais de 1 ano"], se: { campo: "fila", valor: "Sim" } }
          ] },
        { id: "urgencia", rotulo: "Médico informou urgência", pergunta: "O médico informou que existe urgência?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"] },
        situacao,
        docs(["Prescrição ou laudo médico", "Exames", "Comprovante do pedido no SUS ou da fila", "Resposta ou negativa do SUS"]),
        dados
      ]
    })
  };

  var painel = document.getElementById("formulario");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-form]"));
  if (painel && cards.length) WBWizard.escolhedor(cards, painel, configs);
})();
