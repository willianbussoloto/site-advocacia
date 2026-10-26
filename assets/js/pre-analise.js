// Pré-análise previdenciária (aposentadoria, auxílio-doença e auxílio-acidente)
(function () {
  var root = document.querySelector("[data-wizard]");
  if (!root || !window.WBWizard) return;
  var SN = WBWizard.SIM_NAO;
  var origem = root.getAttribute("data-origem") || "site";

  WBWizard.mount(root, {
    id: "previdencia",
    titulo: "Pré-análise previdenciária",
    track: root.getAttribute("data-track") || "pre-analise",
    intro: "Olá, Dr. Willian! Gostaria de realizar uma análise previdenciária.",
    origemTexto: "Preenchi a pré-análise na página de " + origem + " do site.",
    botao: "Solicitar minha análise previdenciária",
    aviso: "o preenchimento não garante a concessão de benefício. A análise definitiva depende da avaliação dos documentos pelo advogado.",
    consentimento: "Autorizo o envio destas informações, incluindo dados de saúde, ao escritório Willian Bocalon Advocacia pelo WhatsApp, para a análise do meu caso.",
    ordem: ["nascimento", "contribuicao", "rural", "especial", "saude", "cirurgia", "situacao", "dados"],
    steps: [
      { id: "situacao", rotulo: "Situação atual", pergunta: "Atualmente você está:", tipo: "escolha",
        opcoes: ["Trabalhando com carteira assinada", "Trabalhando como autônomo", "Trabalhando na agricultura", "Desempregado(a)", "Afastado(a) por problemas de saúde", "Recebendo algum benefício do INSS"] },
      { id: "nascimento", rotulo: "Data de nascimento", pergunta: "Qual é a sua data de nascimento?", tipo: "data" },
      { id: "contribuicao", rotulo: "Tempo de contribuição", pergunta: "Há quantos anos você trabalha ou contribui para o INSS?", tipo: "escolha", colunas: 2,
        opcoes: ["Menos de 5 anos", "5 a 10 anos", "10 a 15 anos", "15 a 20 anos", "20 a 25 anos", "25 a 30 anos", "30 a 35 anos", "Mais de 35 anos", "Não sei informar"] },
      { id: "rural", rotulo: "Trabalho rural", pergunta: "Você já trabalhou na roça, mesmo sem carteira assinada?", tipo: "escolha", opcoes: SN, abreCom: "Sim",
        extras: [
          { id: "rural_inicio", rotulo: "Começou a trabalhar na roça com", pergunta: "Com quantos anos começou a trabalhar na roça?", tipo: "numero", sufixo: "anos de idade", sufixoMsg: "anos de idade", min: 4, maxNum: 80, opcional: true },
          { id: "rural_ate", rotulo: "Trabalhou na agricultura até", pergunta: "Até que ano trabalhou na agricultura?", tipo: "numero", sufixo: "(ano)", min: 1940, maxNum: new Date().getFullYear(), dica: "Se ainda trabalha, deixe em branco.", opcional: true },
          { id: "rural_familia", rotulo: "Trabalhava com pais ou familiares", pergunta: "Trabalhava com seus pais ou familiares?", tipo: "escolha", opcoes: SN },
          { id: "rural_atual", rotulo: "Ainda trabalha na agricultura", pergunta: "Atualmente ainda trabalha na agricultura?", tipo: "escolha", opcoes: SN }
        ] },
      { id: "especial", rotulo: "Atividade especial", pergunta: "Você já trabalhou exposto a barulho excessivo, produtos químicos, agentes biológicos ou outros riscos à saúde?", tipo: "escolha", opcoes: ["Sim", "Não", "Não sei"], abreCom: "Sim",
        extras: [
          { id: "especial_anos", rotulo: "Tempo nessas condições", pergunta: "Por aproximadamente quantos anos trabalhou nessas condições?", tipo: "numero", sufixo: "anos", sufixoMsg: "anos", min: 0, maxNum: 60, opcional: true },
          { id: "especial_profissao", rotulo: "Profissão ou atividade", pergunta: "Qual era a sua profissão ou atividade?", tipo: "texto", exemplo: "Ex.: metalúrgico, frentista, técnico de enfermagem", opcional: true }
        ] },
      { id: "saude", rotulo: "Problemas de saúde", pergunta: "Você tem alguma doença ou problema de saúde que dificulta ou impede o seu trabalho?", tipo: "escolha", opcoes: SN, abreCom: "Sim",
        extras: [
          { id: "saude_qual", rotulo: "Doença ou problema", pergunta: "Qual doença ou problema de saúde você tem?", tipo: "texto", exemplo: "Ex.: hérnia de disco, depressão, problema no coração", opcional: true },
          { id: "saude_trabalho", rotulo: "Consegue trabalhar", pergunta: "Está conseguindo trabalhar normalmente?", tipo: "escolha", opcoes: ["Sim", "Com dificuldades", "Não consigo trabalhar"] }
        ] },
      { id: "cirurgia", rotulo: "Cirurgias, pinos ou placas", pergunta: "Você já sofreu algum acidente, passou por cirurgia ou tem pinos, placas ou próteses no corpo?", tipo: "escolha", opcoes: SN, abreCom: "Sim",
        extras: [
          { id: "cirurgia_parte", rotulo: "Parte do corpo", pergunta: "Qual parte do corpo foi afetada?", tipo: "texto", exemplo: "Ex.: joelho direito, coluna, mão esquerda", opcional: true },
          { id: "cirurgia_limitacao", rotulo: "Ficou com limitação, dor ou dificuldade", pergunta: "Ficou com alguma limitação, dor ou dificuldade para trabalhar?", tipo: "escolha", opcoes: SN }
        ] },
      { id: "dados", tipo: "dados", pergunta: "Em qual cidade e estado você mora?", nome: "opcional" }
    ]
  });
  WBWizard.esconderBarra(root);
})();
