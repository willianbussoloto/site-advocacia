// Formulários da página Direito Tributário para empresas (respostas vão pelo WhatsApp)
(function () {
  if (!window.WBWizard) return;
  var comum = {
    subtitulo: "Gratuito · leva cerca de 3 minutos",
    aviso: "o preenchimento não garante descontos, parcelamento ou o cancelamento de cobranças. Cada situação depende da análise dos documentos da empresa pelo advogado.",
    consentimento: "Autorizo o envio destas informações ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do caso da empresa.",
    docsMsg: "documentos",
    msgDireta: "Olá, Dr. Willian! Vim pela página de Direito Tributário do site e gostaria de conversar sobre as dívidas da minha empresa."
  };
  function cfg(o) { var c = {}; Object.keys(comum).forEach(function (k) { c[k] = comum[k]; }); Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  // Etapas reaproveitadas pelos três formulários
  var regime = { id: "regime", rotulo: "Regime de tributação", pergunta: "Qual o regime de tributação da empresa?", tipo: "escolha", colunas: 2, opcoes: ["Simples Nacional", "MEI", "Lucro Presumido", "Lucro Real", "Não sei"] };
  var atividade = { id: "atividade", rotulo: "Atividade da empresa", pergunta: "Qual é a atividade da empresa?", tipo: "texto", exemplo: "Ex.: comércio de materiais de construção, transporte, indústria de móveis" };
  var orgao = { id: "orgao", rotulo: "Dívidas com", pergunta: "Com quem são as dívidas?", tipo: "multi", dica: "Pode marcar mais de um.",
    opcoes: ["Receita Federal ou PGFN (União)", "Estado (ICMS)", "Prefeitura (ISS e taxas)", "Não sei"], exclusivo: "Não sei" };
  var valor = { id: "valor", rotulo: "Valor aproximado das dívidas", pergunta: "Qual o valor aproximado das dívidas de impostos?", tipo: "escolha",
    opcoes: ["Até R$ 50 mil", "De R$ 50 mil a R$ 200 mil", "De R$ 200 mil a R$ 1 milhão", "Acima de R$ 1 milhão", "Não sei"] };
  var parcelamento = { id: "parcelamento", rotulo: "Parcelamento", pergunta: "A empresa já parcelou essas dívidas?", tipo: "escolha", opcoes: ["Sim, estou pagando", "Sim, mas foi cancelado", "Não"] };
  var funcionando = { id: "funcionando", rotulo: "Situação da empresa", pergunta: "Como está a empresa hoje?", tipo: "escolha", opcoes: ["Funcionando normalmente", "Funcionando, mas com dificuldade financeira", "Parada ou fechada"] };
  var empresa = { id: "empresa", rotulo: "Empresa", pergunta: "Qual o nome da empresa?", tipo: "texto", opcional: true, exemplo: "Razão social ou nome fantasia", max: 100 };
  var dados = { id: "dados", tipo: "dados", pergunta: "Para finalizar, seus dados:", nome: "obrigatorio", telefone: true, rotuloCidade: "Cidade da empresa" };
  function relato(exemplo) { return { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique a situação da empresa.", tipo: "textarea", opcional: true, exemplo: exemplo }; }
  function docs(opcoes) {
    return { id: "documentos", rotulo: "Documentos que tenho para enviar", pergunta: "Quais documentos você tem para mandar na conversa?", tipo: "multi",
      dica: "Toque em todos que tiver. Você manda as fotos ou PDF no WhatsApp, logo depois. Se a empresa tiver contador, ele pode ajudar a separar.", opcoes: opcoes.concat(["Ainda não tenho documentos"]), exclusivo: "Ainda não tenho documentos" };
  }

  var configs = {
    negociar: cfg({
      id: "trib-negociar", track: "trib-negociar", titulo: "Negociar as dívidas da empresa",
      botao: "Solicitar análise das dívidas",
      intro: "Olá, Dr. Willian! Minha empresa tem dívidas de impostos e gostaria de uma análise para negociar.",
      origemTexto: "Preenchi o formulário de negociação de dívidas na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa o relatório de dívidas da empresa (e-CAC, Regularize/PGFN ou Simples Nacional), as cartas de cobrança e os parcelamentos anteriores, se tiver.",
      ordem: ["dados", "empresa", "regime", "atividade", "orgao", "valor", "tempo", "parcelamento", "funcionando", "relato", "documentos"],
      steps: [
        regime, atividade, orgao, valor,
        { id: "tempo", rotulo: "Desde quando há dívidas", pergunta: "Há quanto tempo a empresa tem essas dívidas?", tipo: "escolha", opcoes: ["Menos de 1 ano", "De 1 a 5 anos", "Mais de 5 anos", "Não sei"] },
        parcelamento, funcionando,
        relato("Ex.: deixamos de pagar o Simples em 2023 e agora a dívida passou de R$ 150 mil..."),
        docs(["Relatório de dívidas (e-CAC, PGFN ou Simples)", "Cartas ou notificações de cobrança", "Parcelamentos anteriores", "Outros documentos"]),
        empresa, dados
      ]
    }),
    execucao: cfg({
      id: "trib-execucao", track: "trib-execucao", titulo: "Execução fiscal e bloqueios",
      botao: "Solicitar análise da execução",
      intro: "Olá, Dr. Willian! Minha empresa está sendo cobrada na Justiça por dívidas de impostos e gostaria de uma análise.",
      origemTexto: "Preenchi o formulário de execução fiscal na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa a citação ou o número do processo, os comprovantes de bloqueio e a certidão de dívida ativa, se tiver.",
      ordem: ["dados", "empresa", "situacao", "quando", "orgao", "valor", "regime", "parcelamento", "funcionando", "relato", "documentos"],
      steps: [
        { id: "situacao", rotulo: "O que aconteceu", pergunta: "O que já aconteceu?", tipo: "multi", dica: "Marque tudo o que já aconteceu.",
          opcoes: ["A empresa foi citada em execução fiscal", "Contas da empresa bloqueadas", "Bens, veículos ou faturamento penhorados", "Cobrança passada para o CPF dos sócios", "Protesto em cartório"] },
        { id: "quando", rotulo: "Citação ou bloqueio em", pergunta: "Quando a empresa recebeu a citação ou teve o bloqueio?", tipo: "mesano", desde: 2010, opcional: true, dica: "Mês e ano aproximados. Os prazos de defesa são curtos." },
        orgao, valor, regime, parcelamento, funcionando,
        relato("Ex.: bloquearam R$ 40 mil da conta da empresa e não conseguimos pagar os funcionários..."),
        docs(["Citação ou processo", "Comprovante de bloqueio ou penhora", "Certidão de dívida ativa", "Outros documentos"]),
        empresa, dados
      ]
    }),
    simples: cfg({
      id: "trib-simples", track: "trib-simples", titulo: "Exclusão do Simples ou certidão negativa",
      botao: "Solicitar análise da regularização",
      intro: "Olá, Dr. Willian! Minha empresa precisa se regularizar (Simples Nacional ou certidão negativa) e gostaria de uma análise.",
      origemTexto: "Preenchi o formulário de Simples Nacional e certidão negativa na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa o termo de exclusão do Simples, o relatório de pendências da empresa ou a certidão positiva, se tiver.",
      ordem: ["dados", "empresa", "problema", "regime", "atividade", "orgao", "valor", "parcelamento", "relato", "documentos"],
      steps: [
        { id: "problema", rotulo: "Problema", pergunta: "Qual é o problema da empresa?", tipo: "escolha",
          opcoes: ["Recebi termo de exclusão do Simples Nacional", "Já fui excluído do Simples Nacional", "Não consigo tirar certidão negativa (CND)"],
          abreCom: ["Recebi termo de exclusão do Simples Nacional", "Já fui excluído do Simples Nacional"],
          extras: [{ id: "termo_quando", rotulo: "Termo de exclusão recebido em", pergunta: "Quando a empresa recebeu o termo de exclusão?", tipo: "mesano", desde: 2018, opcional: true }] },
        regime, atividade, orgao, valor, parcelamento,
        relato("Ex.: precisamos da certidão negativa para uma licitação no mês que vem..."),
        docs(["Termo de exclusão do Simples", "Relatório de pendências (e-CAC)", "Certidão positiva", "Outros documentos"]),
        empresa, dados
      ]
    })
  };

  var painel = document.getElementById("formulario");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-form]"));
  if (painel && cards.length) WBWizard.escolhedor(cards, painel, configs);
})();
