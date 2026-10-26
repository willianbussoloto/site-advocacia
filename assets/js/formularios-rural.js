// Formulários da página Direito Rural (respostas vão pelo WhatsApp)
(function () {
  if (!window.WBWizard) return;
  var SN = WBWizard.SIM_NAO;
  var BANCOS = ["Banco do Brasil", "Sicredi", "Sicoob", "Banrisul", "Cresol", "Outro"];
  var VALORES = ["Até R$ 50 mil", "De R$ 50 mil a R$ 100 mil", "De R$ 100 mil a R$ 300 mil", "De R$ 300 mil a R$ 500 mil", "Acima de R$ 500 mil"];
  function qual(id, rotulo, exemplo) { return { id: id, rotulo: rotulo, pergunta: "Qual?", tipo: "texto", exemplo: exemplo }; }
  var comum = {
    subtitulo: "Gratuito · leva cerca de 3 minutos",
    aviso: "o preenchimento não garante a revisão do PROAGRO nem a prorrogação da dívida. Cada situação depende da análise dos contratos e documentos pelo advogado.",
    consentimento: "Autorizo o envio destas informações ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do meu caso.",
    docsMsg: "documentos",
    msgDireta: "Olá, Dr. Willian! Vim pela página de Direito Rural do site e gostaria de conversar sobre o meu caso."
  };
  var dados = { id: "dados", tipo: "dados", pergunta: "Para finalizar, seus dados:", nome: "obrigatorio", telefone: true, rotuloCidade: "Cidade da propriedade" };
  function docs(opcoes) {
    return { id: "documentos", rotulo: "Documentos que tenho para enviar", pergunta: "Quais documentos você tem para mandar na conversa?", tipo: "multi",
      dica: "Toque em todos que tiver. Você manda as fotos ou PDF no WhatsApp, logo depois.", opcoes: opcoes.concat(["Ainda não tenho documentos"]), exclusivo: "Ainda não tenho documentos" };
  }
  function cfg(o) { var c = {}; Object.keys(comum).forEach(function (k) { c[k] = comum[k]; }); Object.keys(o).forEach(function (k) { c[k] = o[k]; }); return c; }

  var configs = {
    proagro: cfg({
      id: "rural-proagro", track: "rural-proagro", titulo: "Meu PROAGRO foi negado",
      botao: "Solicitar análise do meu PROAGRO",
      intro: "Olá, Dr. Willian! Meu PROAGRO foi negado e gostaria de uma análise do meu caso.",
      origemTexto: "Preenchi o formulário do PROAGRO na página de Direito Rural do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa fotos ou PDF da negativa do PROAGRO, do laudo de vistoria e do contrato de financiamento, se tiver.",
      ordem: ["dados", "cultura", "perda", "motivo", "percentual", "banco", "solicitou", "negado", "valor", "relato", "documentos"],
      steps: [
        { id: "cultura", rotulo: "Cultura plantada", pergunta: "Qual cultura você plantou?", tipo: "escolha", colunas: 2, opcoes: ["Soja", "Milho", "Trigo", "Uva", "Outra"], abreCom: "Outra",
          extras: [qual("cultura_outra", "Qual cultura", "Ex.: feijão, fumo, maçã")] },
        { id: "perda", rotulo: "Quando perdeu a safra", pergunta: "Quando você perdeu a safra?", tipo: "mesano", desde: 2015, dica: "Mês e ano aproximados." },
        { id: "motivo", rotulo: "Motivo da perda", pergunta: "Qual foi o motivo da perda?", tipo: "escolha", colunas: 2, opcoes: ["Seca", "Excesso de chuva", "Granizo", "Geada", "Pragas ou doenças", "Outro"], abreCom: "Outro",
          extras: [qual("motivo_outro", "Qual motivo", "Descreva o motivo")] },
        { id: "percentual", rotulo: "Perda aproximada da produção", pergunta: "Qual foi a perda aproximada da produção?", tipo: "escolha", colunas: 2, opcoes: ["Até 30%", "De 30% a 50%", "De 50% a 70%", "De 70% a 90%", "Mais de 90%", "Não sei"] },
        { id: "banco", rotulo: "Banco ou cooperativa", pergunta: "Em qual banco ou cooperativa você fez o financiamento?", tipo: "escolha", colunas: 2, opcoes: BANCOS, abreCom: "Outro",
          extras: [qual("banco_outro", "Qual banco ou cooperativa", "Nome do banco ou cooperativa")] },
        { id: "solicitou", rotulo: "Pediu a cobertura do PROAGRO", pergunta: "Você pediu a cobertura do PROAGRO?", tipo: "escolha", opcoes: SN },
        { id: "negado", rotulo: "PROAGRO negado", pergunta: "O PROAGRO foi negado?", tipo: "escolha", opcoes: ["Sim", "Não", "Ainda aguardo resposta"], abreCom: "Sim",
          extras: [
            { id: "negativa_motivo", rotulo: "Motivo da negativa", pergunta: "Qual foi o motivo informado para a negativa?", tipo: "escolha",
              opcoes: ["Plantio fora do período recomendado", "Problemas com documentação", "Divergência no laudo de vistoria", "Descumprimento de regras do PROAGRO", "Não informaram o motivo", "Outro motivo"] },
            { id: "negativa_outro", rotulo: "Outro motivo", pergunta: "Qual foi o outro motivo?", tipo: "texto", opcional: true, se: { campo: "negativa_motivo", valor: "Outro motivo" } },
            { id: "negativa_quando", rotulo: "Recebeu a negativa em", pergunta: "Quando você recebeu a negativa? (aproximado)", tipo: "mesano", desde: 2015, opcional: true },
            { id: "recurso", rotulo: "Apresentou recurso administrativo", pergunta: "Você apresentou recurso administrativo?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"] }
          ] },
        { id: "valor", rotulo: "Valor aproximado do financiamento", pergunta: "Qual era o valor aproximado do financiamento?", tipo: "escolha", opcoes: VALORES.concat(["Não sei"]) },
        { id: "relato", rotulo: "O que aconteceu", pergunta: "Se quiser, explique brevemente o que aconteceu.", tipo: "textarea", opcional: true, exemplo: "Ex.: a seca de janeiro perdeu quase toda a soja; o banco negou dizendo que plantei fora da data..." },
        docs(["Negativa do PROAGRO", "Laudo de vistoria", "Contrato de financiamento", "Outros documentos"]),
        dados
      ]
    }),
    dividas: cfg({
      id: "rural-dividas", track: "rural-dividas", titulo: "Prorrogação de dívidas rurais",
      botao: "Solicitar análise da minha dívida rural",
      intro: "Olá, Dr. Willian! Estou com dificuldades para pagar meu financiamento rural e gostaria de uma análise sobre a prorrogação.",
      origemTexto: "Preenchi o formulário de prorrogação de dívidas na página de Direito Rural do site.",
      docsAviso: "depois de enviar a mensagem, mande na mesma conversa fotos ou PDF dos contratos, das cédulas de crédito rural e das notificações do banco, se tiver.",
      ordem: ["dados", "venceram", "vencimento", "valor", "banco", "renegociou", "motivo", "pediu", "cobranca", "condicoes", "relato", "documentos"],
      steps: [
        { id: "venceram", rotulo: "Dívidas já venceram", pergunta: "Suas dívidas rurais já venceram?", tipo: "escolha", opcoes: ["Sim", "Não", "Algumas já venceram"] },
        { id: "vencimento", rotulo: "Vencimento", pergunta: "Quando as dívidas venceram ou vão vencer?", tipo: "mesano", desde: 2018, futuro: true, dica: "Se forem várias, informe a mais próxima." },
        { id: "valor", rotulo: "Valor aproximado das dívidas", pergunta: "Qual o valor aproximado das suas dívidas rurais?", tipo: "escolha", opcoes: VALORES },
        { id: "banco", rotulo: "Banco ou cooperativa", pergunta: "Em qual banco ou cooperativa estão as dívidas?", tipo: "escolha", colunas: 2, opcoes: BANCOS, abreCom: "Outro",
          extras: [qual("banco_outro", "Qual banco ou cooperativa", "Nome do banco ou cooperativa")] },
        { id: "renegociou", rotulo: "Já renegociou antes", pergunta: "Você já renegociou essas dívidas antes?", tipo: "escolha", opcoes: SN, abreCom: "Sim",
          extras: [{ id: "renegociou_quando", rotulo: "Renegociou em", pergunta: "Quando fez a renegociação?", tipo: "mesano", desde: 2010, opcional: true }] },
        { id: "motivo", rotulo: "Motivo da dificuldade", pergunta: "Qual o principal motivo da dificuldade de pagamento?", tipo: "escolha",
          opcoes: ["Perda da safra por seca", "Excesso de chuva", "Queda no preço dos produtos", "Aumento dos custos de produção", "Problemas na comercialização", "Outro motivo"], abreCom: "Outro motivo",
          extras: [qual("motivo_outro", "Qual motivo", "Descreva o motivo")] },
        { id: "pediu", rotulo: "Pediu prorrogação ao banco", pergunta: "Você já pediu a prorrogação da dívida ao banco?", tipo: "escolha", opcoes: ["Sim, mas foi negada", "Sim, estou aguardando resposta", "Não pedi"] },
        { id: "cobranca", rotulo: "Recebeu cobrança judicial, notificação ou protesto", pergunta: "Você recebeu alguma cobrança judicial, notificação ou aviso de protesto?", tipo: "escolha", opcoes: SN },
        { id: "condicoes", rotulo: "Consegue pagar nas datas atuais", pergunta: "Você consegue pagar as parcelas nas datas atuais?", tipo: "escolha", opcoes: ["Sim", "Não", "Apenas parte do valor"] },
        { id: "relato", rotulo: "Situação", pergunta: "Se quiser, explique a sua situação.", tipo: "textarea", opcional: true, exemplo: "Ex.: a parcela de custeio vence em março e a colheita deu metade do esperado..." },
        docs(["Contratos de financiamento", "Cédulas de crédito rural", "Notificações do banco", "Outros documentos"]),
        dados
      ]
    })
  };

  var painel = document.getElementById("formulario");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-form]"));
  if (painel && cards.length) WBWizard.escolhedor(cards, painel, configs);
})();
