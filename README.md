# WebQuest: O Motor de Conhecimento

Quiz gamificado em HTML, CSS e JavaScript.

## Recursos implementados

- Classe `Jogador` com `XP`, `nível` e encapsulamento em JavaScript.
- Classe base `Questao` e herança para `QuestaoMultiplaEscolha` e `QuestaoVerdadeiroFalso`.
- Banco de perguntas em arquivos CSV (`data/questions_python.csv` e `data/questions_php.csv`).
- XP por resposta correta: 50 no primeiro acerto, 20 na segunda tentativa, 0 em erro.
- Níveis com títulos: Padawan, Desenvolvedor Júnior, Desenvolvedor Pleno e Desenvolvedor Sênior.
- Interface responsiva com seleção de tema, visualização de perguntas e painel de status.

## Como executar

O app usa `fetch()` para carregar os arquivos CSV, então é preciso rodar um servidor local.

No diretório do projeto, execute:

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

## Estrutura de arquivos

- `index.html` - interface principal
- `styles.css` - estilo visual
- `script.js` - lógica do jogo e classes
- `data/questions_python.csv` - perguntas sobre Python
- `data/questions_php.csv` - perguntas sobre PHP
