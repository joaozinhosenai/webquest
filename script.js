class Jogador {
  #nome;
  #xp;
  #nivel;

  constructor(nome = 'Padawan') {
    this.#nome = nome;
    this.#xp = 0;
    this.#nivel = 1;
  }

  get nome() {
    return this.#nome;
  }

  set nome(valor) {
    this.#nome = valor || 'Padawan';
  }

  get xp() {
    return this.#xp;
  }

  get nivel() {
    return this.#nivel;
  }

  adicionarXp(valor) {
    if (valor <= 0) return;
    this.#xp += valor;
    this.#nivel = this.calcularNivel();
  }

  calcularNivel() {
    if (this.#xp >= 300) return 4;
    if (this.#xp >= 200) return 3;
    if (this.#xp >= 100) return 2;
    return 1;
  }

  obterTituloNivel() {
    const titulos = {
      1: 'Padawan',
      2: 'Desenvolvedor Júnior',
      3: 'Desenvolvedor Pleno',
      4: 'Desenvolvedor Sênior',
    };
    return titulos[this.#nivel] || 'Mestre';
  }
}

class Questao {
  constructor(texto, tema, tipo) {
    this.texto = texto;
    this.tema = tema;
    this.tipo = tipo;
    this.tentativas = 0;
  }

  validarResposta(resposta) {
    return false;
  }
}

class QuestaoMultiplaEscolha extends Questao {
  constructor(texto, tema, alternativas, correta) {
    super(texto, tema, 'múltipla-escolha');
    this.alternativas = alternativas;
    this.correta = correta;
  }

  validarResposta(resposta) {
    return resposta === this.correta;
  }
}

class QuestaoVerdadeiroFalso extends Questao {
  constructor(texto, tema, correta) {
    super(texto, tema, 'verdadeiro-falso');
    this.correta = correta;
  }

  validarResposta(resposta) {
    const normalized = String(resposta).toLowerCase();
    return normalized === String(this.correta).toLowerCase();
  }
}

const elementos = {
  themeButtons: document.querySelectorAll('.theme-btn'),
  themeSummary: document.getElementById('theme-summary'),
  quizArea: document.getElementById('quiz-area'),
  questionTitle: document.getElementById('question-title'),
  questionText: document.getElementById('question-text'),
  questionTheme: document.getElementById('question-theme'),
  answerForm: document.getElementById('answer-form'),
  submitButton: document.getElementById('submit-answer'),
  nextButton: document.getElementById('next-question'),
  resultText: document.getElementById('result-text'),
  playerName: document.getElementById('player-name'),
  playerLevel: document.getElementById('player-level'),
  playerXp: document.getElementById('player-xp'),
  questionCount: document.getElementById('question-count'),
};

const limitesPorTema = {
  python: 'Entenda o histórico, operadores e paradigmas essenciais do Python.',
  php: 'Reforce conceitos de sintaxe, paradigmas e desenvolvimento em PHP.',
};

const bancoQuestoes = {
  python: [],
  php: [],
};

let jogador = new Jogador();
let perguntasAtuais = [];
let indiceAtual = 0;
let temaSelecionado = '';
let respostaSelecionada = null;

async function carregarDados() {
  const temas = ['python', 'php'];
  await Promise.all(
    temas.map(async (tema) => {
      const resposta = await fetch(`data/questions_${tema}.csv`);
      const texto = await resposta.text();
      bancoQuestoes[tema] = parseCSV(texto, tema);
    })
  );
}

function parseCSV(csvText, tema) {
  const linhas = csvText.trim().split('\n');
  return linhas.slice(1).map((linha) => {
    const colunas = linha.split(';');
    const tipo = colunas[0];
    const texto = colunas[1];
    if (tipo === 'MC') {
      const alternativas = [colunas[2], colunas[3], colunas[4], colunas[5]];
      return new QuestaoMultiplaEscolha(texto, tema, alternativas, colunas[6]);
    }
    if (tipo === 'VF') {
      return new QuestaoVerdadeiroFalso(texto, tema, colunas[2]);
    }
    return null;
  }).filter(Boolean);
}

function definirTema(tema) {
  temaSelecionado = tema;
  perguntasAtuais = bancoQuestoes[tema] || [];
  indiceAtual = 0;
  elementos.themeSummary.textContent = limitesPorTema[tema] || '';
  elementos.quizArea.classList.remove('hidden');
  elementos.resultText.textContent = '';
  elementos.nextButton.classList.add('hidden');
  atualizarContagem();
  carregarPergunta();
}

function atualizarContagem() {
  elementos.questionCount.textContent = `Pergunta ${indiceAtual + 1}/${perguntasAtuais.length}`;
}

function carregarPergunta() {
  const questao = perguntasAtuais[indiceAtual];
  if (!questao) {
    finalizarQuiz();
    return;
  }
  questao.tentativas = 0;
  elementos.questionTitle.textContent = `Pergunta ${indiceAtual + 1}`;
  elementos.questionTheme.textContent = `Tema: ${temaSelecionado.toUpperCase()}`;
  elementos.questionText.textContent = questao.texto;
  elementos.answerForm.innerHTML = '';
  elementos.resultText.textContent = '';
  elementos.submitButton.disabled = true;
  respostaSelecionada = null;

  if (questao.tipo === 'múltipla-escolha') {
    questao.alternativas.forEach((alternativa) => {
      const option = document.createElement('label');
      option.className = 'answer-option';
      option.innerHTML = `
        <input type="radio" name="answer" value="${alternativa}" />
        <span>${alternativa}</span>
      `;
      elementos.answerForm.appendChild(option);
    });
  } else {
    ['Verdadeiro', 'Falso'].forEach((texto) => {
      const option = document.createElement('label');
      option.className = 'answer-option';
      option.innerHTML = `
        <input type="radio" name="answer" value="${texto}" />
        <span>${texto}</span>
      `;
      elementos.answerForm.appendChild(option);
    });
  }

  elementos.answerForm.querySelectorAll('input[name="answer"]').forEach((input) => {
    input.addEventListener('change', () => {
      respostaSelecionada = input.value;
      elementos.submitButton.disabled = false;
    });
  });
}

function processarResposta(event) {
  event.preventDefault();
  const questao = perguntasAtuais[indiceAtual];
  if (!questao || !respostaSelecionada) return;

  questao.tentativas += 1;
  const acertou = questao.validarResposta(respostaSelecionada);
  let ganhoXp = 0;

  if (acertou) {
    ganhoXp = questao.tentativas === 1 ? 50 : 20;
    jogador.adicionarXp(ganhoXp);
    elementos.resultText.textContent = `Correto! +${ganhoXp} XP`;
    elementos.nextButton.classList.remove('hidden');
    elementos.submitButton.disabled = true;
    atualizarJogador();
  } else {
    if (questao.tentativas >= 2) {
      elementos.resultText.textContent = 'Resposta incorreta. Você não ganhou XP nesta pergunta.';
      elementos.nextButton.classList.remove('hidden');
      elementos.submitButton.disabled = true;
    } else {
      elementos.resultText.textContent = 'Errado. Tente novamente para ganhar 20 XP.';
    }
  }
}

function proximaPergunta() {
  indiceAtual += 1;
  if (indiceAtual >= perguntasAtuais.length) {
    finalizarQuiz();
    return;
  }
  atualizarContagem();
  carregarPergunta();
}

function finalizarQuiz() {
  elementos.questionTitle.textContent = 'Quiz concluído';
  elementos.questionText.textContent = 'Parabéns! Você concluiu todas as perguntas do tema.';
  elementos.answerForm.innerHTML = '';
  elementos.submitButton.classList.add('hidden');
  elementos.nextButton.classList.add('hidden');
  elementos.questionTheme.textContent = '';
  elementos.questionCount.textContent = `Você finalizou com ${jogador.xp} XP e nível ${jogador.nivel}.`;
}

function atualizarJogador() {
  jogador.nome = elementos.playerName.value;
  elementos.playerLevel.textContent = `Nível: ${jogador.nivel} - ${jogador.obterTituloNivel()}`;
  elementos.playerXp.textContent = `XP: ${jogador.xp}`;
}

elementos.themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => definirTema(btn.dataset.theme));
});

elementos.submitButton.addEventListener('click', processarResposta);

elementos.nextButton.addEventListener('click', () => {
  elementos.submitButton.classList.remove('hidden');
  proximaPergunta();
});

window.addEventListener('load', async () => {
  await carregarDados();
  atualizarJogador();
});
