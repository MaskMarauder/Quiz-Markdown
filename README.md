# 📚 Quiz Markdown - Documentação

## 📌 Visão Geral
Um aplicativo web que permite carregar perguntas em formato **Markdown** e gerar **quizzes interativos** com temporizador e avaliação automática.

---

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Arquivos Markdown no formato especificado

---

## 🛠️ Instalação

Nenhuma instalação necessária.  
Basta abrir o arquivo `index.html` num navegador.

---

## 📂 Estrutura de Arquivos

```
/projeto-quiz/
├── index.html        # Interface principal
├── css\styles.css        # Estilos da aplicação
├── js\main.js           # Lógica principal
└── js\quiz-parser.js    # Parser de Markdown
```

---

## ✍️ Formato do Arquivo Markdown

### 🔤 Sintaxe para Perguntas

```markdown
## 1. Qual é a capital do Brasil?

- [ ] Rio de Janeiro  
- [x] Brasília  
- [ ] São Paulo  
- [ ] Belo Horizonte
```

### 📏 Regras

1. Títulos de perguntas devem começar com `#`, `##` ou `####`, seguido de:
   - Número (`1.`, `2.`) **ou**
   - `Q1`, `Question 1` **ou**
   - `Pergunta 1`
2. Opções de resposta:
   - `- [ ]` para respostas **incorretas**
   - `- [x]` para resposta **correta**
3. Blocos de código são suportados entre \`\`\`

---

### ✅ Exemplo Completo

````markdown
## Q1. Qual comando Git inicializa um repositório?

```bash
git init
```

- [ ] git start  
- [x] git init  
- [ ] git new  
- [ ] git begin

## 2. Qual linguagem é usada para estilizar páginas web?

- [ ] JavaScript  
- [ ] HTML  
- [x] CSS  
- [ ] Python
````

---

## 🎮 Funcionalidades

### Principais:
- ✅ Carregar arquivo Markdown  
- ⏱️ Temporizador configurável  
- 📊 Barra de progresso  
- ✔️ Correção automática  
- 🔄 Reiniciar quiz  

### 👣 Fluxo do Usuário:
1. Selecionar arquivo `.md`
2. Definir tempo (opcional)
3. Responder perguntas
4. Ver resultados

---

## 🧩 Como Funciona Internamente

### `quiz-parser.js`
```javascript
function parseQuizContent(content) {
    // 1. Divide o conteúdo em linhas
    // 2. Identifica perguntas pelo padrão ## Q1, ### 1., etc.
    // 3. Extrai opções de resposta (- [ ] texto)
    // 4. Marca a correta (- [x] texto)
    // 5. Processa blocos de código entre ```
    // 6. Retorna array de objetos de perguntas
}
```

### `main.js`

#### Estado Global:
```javascript
const quizState = {
    allQuestions: [],       // Todas perguntas do arquivo
    displayedQuestions: [], // Perguntas sendo exibidas
    timeRemaining: 0,       // Tempo em segundos
    timerInterval: null     // Referência do timer
};
```

#### Fluxo Principal:
1. `init()` → Configura listeners  
2. `handleFileUpload()` → Processa arquivo  
3. `renderQuiz()` → Exibe perguntas  
4. `calculateResults()` → Calcula pontuação  

---

## 🚀 Melhorias Futuras

- [ ] Suporte a imagens nas perguntas  
- [ ] Modo de estudo (mostrar respostas)  
- [ ] Exportar resultados  
- [ ] Multiplataforma (PWA)  

---

## ⁉️ Solução de Problemas

### ❌ Erro: "Arquivo não contém perguntas válidas"
Verifique se:
- As perguntas seguem o formato `## 1. Texto`
- Há pelo menos 2 opções por pergunta
- Existe uma resposta marcada com `[x]`

### ⏱️ Timer não inicia:
- Verifique se o arquivo foi carregado corretamente
- Confira se há perguntas válidas no arquivo

---

## 📄 Licença

**MIT License** – Livre para uso e modificação.

---

## 📥 Como Usar

1. Clone o repositório ou baixe os arquivos
2. Edite/crie seu arquivo `.md` com perguntas
3. Abra `index.html` no navegador
4. Carregue seu arquivo e comece o quiz!

---

## 👨‍💻 Personalização

### Estilos
- Edite `styles.css`  
- Cores principais estão nas variáveis CSS no topo do ficheiro

### Regras do Quiz
Modifique as constantes no topo de `main.js`:
```javascript
const NUM_QUESTIONS_TO_DISPLAY = 20;  // Número de perguntas
const PASS_RATE_PERCENTAGE = 75;      // Percentagem de aprovação
```

> 📌 A documentação completa está no próprio código, com comentários detalhados.
