/**
 * =============================================
 * FUNÇÕES DE PARSE DO ARQUIVO MARKDOWN
 * =============================================
 */

/**
 * Parseia o conteúdo do arquivo markdown para extrair perguntas
 * @param {string} content - Conteúdo do arquivo markdown
 * @returns {Array} - Array de objetos de perguntas
 */
function parseQuizContent(content) {
    // Divide o conteúdo em linhas
    const lines = content.split('\n');
    const parsedQuestions = [];
    let currentQuestion = null;
    let inCodeBlock = false;
    let inQuestionText = false;
    let currentCodeBlock = [];

    // Processa cada linha do arquivo
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Verifica se é início ou fim de bloco de código
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // Se estava em bloco de código, finaliza e adiciona à pergunta
                if (currentQuestion) {
                    currentQuestion.questionText += formatCodeBlock(currentCodeBlock.join('\n'));
                }
                currentCodeBlock = [];
            }
            inCodeBlock = !inCodeBlock;
            continue;
        }

        // Se estiver dentro de bloco de código, armazena a linha
        if (inCodeBlock) {
            currentCodeBlock.push(escapeHtml(line));
            continue;
        }

        // Ignora linhas vazias
        if (line.trim() === '') continue;

        // Detecta linhas de pergunta (ex: ## Q1. ou #### Question 1:)
        const questionMatch = line.match(/^#+\s*(Q\d+\.|Question\s*\d+[:.]?|\d+\.)\s*(.*)$/i);
        if (questionMatch) {
            // Se já havia uma pergunta em processamento, adiciona ao array
            if (currentQuestion) {
                parsedQuestions.push(currentQuestion);
            }
            // Cria nova pergunta
            currentQuestion = {
                questionText: escapeHtml(questionMatch[2]),  // Texto da pergunta
                options: [],                               // Opções de resposta
                correctAnswer: '',                          // Resposta correta
                hasCode: false                              // Flag para código
            };
            inQuestionText = true;
            continue;
        }

        // Processa opções de resposta (ex: - [ ] ou - [x])
        if (currentQuestion) {
            const optionMatch = line.match(/^\s*[-*]\s*\[(x|\s)\]\s*(.*)$/i);
            if (optionMatch) {
                const optionText = escapeHtml(optionMatch[2].trim());
                currentQuestion.options.push(optionText);
                
                // Se for a resposta correta (tem [x])
                if (optionMatch[1].toLowerCase() === 'x') {
                    currentQuestion.correctAnswer = optionText;
                }
                inQuestionText = false;
            } else if (inQuestionText) {
                // Se estiver no texto da pergunta, adiciona à pergunta atual
                currentQuestion.questionText += '<br>' + escapeHtml(line);
            }
        }
    }

    // Adiciona a última pergunta processada (se existir)
    if (currentQuestion) {
        parsedQuestions.push(currentQuestion);
    }

    // Filtra perguntas válidas (com texto, pelo menos 2 opções e resposta correta definida)
    return parsedQuestions.filter(q => 
        q.questionText && 
        q.options.length >= 2 && 
        q.correctAnswer && 
        q.options.includes(q.correctAnswer)
    );
}

/**
 * Formata um bloco de código para HTML
 * @param {string} code - Código a ser formatado
 * @returns {string} - HTML do bloco de código
 */
function formatCodeBlock(code) {
    return `<pre class="code-snippet">${code}</pre>`;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} unsafe - Texto não seguro
 * @returns {string} - Texto seguro para HTML
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}