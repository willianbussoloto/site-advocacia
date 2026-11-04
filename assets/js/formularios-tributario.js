// Formulários da página Direito Tributário (respostas vão pelo WhatsApp)
(function () {
  if (!window.WBWizard) return;
  var SN = WBWizard.SIM_NAO;
  function qual(id, rotulo, exemplo) { return { id: id, rotulo: rotulo, pergunta: "Qual?", tipo: "texto", exemplo: exemplo }; }
  var comum = {
    subtitulo: "Gratuito · leva cerca de 3 minutos",
    aviso: "o preenchimento não garante isenção, restituição ou o cancelamento de cobranças. Cada situação depende da análise dos documentos pelo advogado.",
    consentimento: "Autorizo o envio destas informações ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do meu caso.",
    docsMsg: "documentos",
    msgDireta: "Olá, Dr. Willian! Vim pela página de Direito Tributário do site e gostaria de conversar sobre o meu caso."
  };
  var dados = { id: "dados", tipo: "dados", pergunta: "Para finalizar, seus dados:", nome: "obrigatorio", telefone: true };
  function docs(opcoes) {
    return { id: "documentos", rotulo: "Documentos que tenho para enviar", pergunta: "Quais documentos você tem para mandar na conversa?", tipo: "multi",
      dica: "Toque em todos que tiver. Você manda as fotos ou PDF no WhatsApp, logo depois.", opcoes: opcoes.concat(["Ainda não tenho documentos"]), exclusivo: "Ainda não tenho documentos" };
  }
  function cfg(o) { var c = {}; Object.keys(comum).forEach(function (k) { c[k] = comum[k]; }); Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  var configs = {
    ir: cfg({
      id: "trib-ir", track: "trib-ir-doenca-grave", titulo: "Isenção de Imposto de Renda por doença grave",
      botao: "Solicitar análise da minha isenção",
      intro: "Olá, Dr. Willian! Gostaria de uma análise sobre a isenção de Imposto de Renda por doença grave.",
      origemTexto: "Preenchi o formulário de isenção de IR por doença grave na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa fotos ou PDF do laudo médico, dos exames e do extrato ou informe de rendimentos do benefício, se tiver.",
      ordem: ["dados", "beneficio", "doenca", "diagnostico", "laudo", "desconto", "pediu", "relato", "documentos"],
      steps: [
        { id: "beneficio", rotulo: "Renda que recebe", pergunta: "Que tipo de renda você recebe?", tipo: "escolha",
          opcoes: ["Aposentadoria do INSS", "Aposentadoria de servidor público", "Pensão por morte", "Reforma ou reserva militar", "Previdência privada", "Ainda estou trabalhando"] },
        { id: "doenca", rotulo: "Doença", pergunta: "Qual é a doença?", tipo: "escolha", colunas: 2,
          opcoes: ["Câncer", "Cardiopatia grave", "Doença de Parkinson", "Cegueira (mesmo de um olho)", "Esclerose múltipla", "Doença grave nos rins ou no fígado", "Alienação mental", "Paralisia irreversível", "HIV/AIDS", "Outra doença"], abreCom: "Outra doença",
          extras: [qual("doenca_outra", "Qual doença", "Ex.: espondilite anquilosante, tuberculose")] },
        { id: "diagnostico", rotulo: "Diagnóstico em", pergunta: "Quando você recebeu o diagnóstico?", tipo: "mesano", desde: 1990, dica: "Mês e ano aproximados. A isenção vale mesmo se a doença estiver controlada ou já tiver sido tratada." },
        { id: "laudo", rotulo: "Tem laudo ou exames", pergunta: "Você tem laudo médico ou exames que comprovem a doença?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"] },
        { id: "desconto", rotulo: "Ainda desconta IR", pergunta: "Ainda é descontado Imposto de Renda da sua aposentadoria ou pensão?", tipo: "escolha", opcoes: ["Sim", "Não, já tenho a isenção", "Não sei"] },
        { id: "pediu", rotulo: "Pediu a isenção", pergunta: "Você já pediu a isenção ao INSS ou ao órgão que paga o benefício?", tipo: "escolha", opcoes: ["Sim, mas foi negada", "Sim, estou aguardando resposta", "Não pedi"] },
        { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique a sua situação.", tipo: "textarea", opcional: true, exemplo: "Ex.: me aposentei em 2019, tive câncer de mama em 2021 e o IR continua sendo descontado..." },
        docs(["Laudo médico", "Exames", "Extrato ou informe de rendimentos do benefício", "Declarações de Imposto de Renda", "Outros documentos"]),
        dados
      ]
    }),
    dividas: cfg({
      id: "trib-dividas", track: "trib-dividas", titulo: "Dívidas de impostos e execução fiscal",
      botao: "Solicitar análise da minha dívida",
      intro: "Olá, Dr. Willian! Estou com uma dívida de impostos e gostaria de uma análise do meu caso.",
      origemTexto: "Preenchi o formulário de dívidas de impostos na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa fotos ou PDF das cartas de cobrança, da certidão de dívida ativa e do processo, se tiver.",
      ordem: ["dados", "titular", "orgao", "tributo", "situacao", "valor", "tempo", "parcelamento", "relato", "documentos"],
      steps: [
        { id: "titular", rotulo: "Dívida em nome de", pergunta: "A dívida está em nome de quem?", tipo: "escolha", opcoes: ["Pessoa física (no meu nome)", "Produtor rural", "Empresa"] },
        { id: "orgao", rotulo: "Quem está cobrando", pergunta: "Quem está cobrando?", tipo: "multi", dica: "Pode marcar mais de um.",
          opcoes: ["Receita Federal ou União", "Estado", "Município (prefeitura)", "Não sei"], exclusivo: "Não sei" },
        { id: "tributo", rotulo: "Imposto cobrado", pergunta: "Qual imposto está sendo cobrado?", tipo: "texto", opcional: true, exemplo: "Ex.: Imposto de Renda, IPVA, IPTU, ICMS, Simples Nacional" },
        { id: "situacao", rotulo: "Situação da cobrança", pergunta: "Em que situação está a cobrança?", tipo: "multi", dica: "Marque tudo o que já aconteceu.",
          opcoes: ["Recebi carta ou notificação de cobrança", "Meu nome está em dívida ativa", "Protesto em cartório", "Processo de execução fiscal na Justiça", "Conta bancária ou bens bloqueados", "Não consigo tirar certidão negativa"] },
        { id: "valor", rotulo: "Valor aproximado", pergunta: "Qual o valor aproximado da dívida?", tipo: "escolha", opcoes: ["Até R$ 20 mil", "De R$ 20 mil a R$ 100 mil", "De R$ 100 mil a R$ 500 mil", "Acima de R$ 500 mil", "Não sei"] },
        { id: "tempo", rotulo: "Idade da dívida", pergunta: "Há quanto tempo existe essa dívida?", tipo: "escolha", opcoes: ["Menos de 5 anos", "Mais de 5 anos", "Não sei"] },
        { id: "parcelamento", rotulo: "Parcelamento", pergunta: "Você já parcelou essa dívida?", tipo: "escolha", opcoes: ["Sim, estou pagando", "Sim, mas o parcelamento foi cancelado", "Não"] },
        { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique a sua situação.", tipo: "textarea", opcional: true, exemplo: "Ex.: a prefeitura está cobrando IPTU de um terreno que vendi em 2015..." },
        docs(["Carta ou notificação de cobrança", "Certidão de dívida ativa", "Processo ou citação da execução", "Comprovante de bloqueio", "Outros documentos"]),
        dados
      ]
    }),
    recuperar: cfg({
      id: "trib-recuperar", track: "trib-recuperar", titulo: "Recuperação de impostos pagos a mais",
      botao: "Solicitar análise dos meus impostos",
      intro: "Olá, Dr. Willian! Gostaria de uma análise para saber se paguei impostos a mais ou indevidamente.",
      origemTexto: "Preenchi o formulário de recuperação de impostos na página de Direito Tributário do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa as guias de pagamento e as declarações que tiver; se tiver contador, ele também pode enviar.",
      ordem: ["dados", "perfil", "atividade", "tributos", "contador", "relato", "documentos"],
      steps: [
        { id: "perfil", rotulo: "Perfil", pergunta: "Para quem é a análise?", tipo: "escolha", opcoes: ["Empresa", "Produtor rural", "Pessoa física"], abreCom: "Empresa",
          extras: [{ id: "regime", rotulo: "Regime de tributação", pergunta: "Qual o regime de tributação da empresa?", tipo: "escolha", opcoes: ["Simples Nacional", "Lucro Presumido", "Lucro Real", "Não sei"] }] },
        { id: "atividade", rotulo: "Atividade principal", pergunta: "Qual é a atividade principal?", tipo: "texto", exemplo: "Ex.: comércio de peças, produção de leite, transporte" },
        { id: "tributos", rotulo: "Impostos a revisar", pergunta: "Quais impostos você quer revisar?", tipo: "multi", dica: "Se não souber, marque a última opção.",
          opcoes: ["Contribuição ao INSS ou Funrural", "PIS e Cofins", "ICMS", "Imposto de Renda", "ISS", "IPTU ou ITR", "Não sei, quero uma revisão geral"], exclusivo: "Não sei, quero uma revisão geral" },
        { id: "contador", rotulo: "Tem contador", pergunta: "Você tem contador?", tipo: "escolha", opcoes: SN },
        { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique o que você desconfia que está pagando a mais.", tipo: "textarea", opcional: true, exemplo: "Ex.: pago Funrural sobre toda a venda do leite e não sei se está certo..." },
        docs(["Guias de pagamento", "Notas fiscais", "Declarações entregues à Receita", "Outros documentos"]),
        dados
      ]
    })
  };

  var painel = document.getElementById("formulario");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-form]"));
  if (painel && cards.length) WBWizard.escolhedor(cards, painel, configs);
})();
