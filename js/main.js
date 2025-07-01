/**
 * =============================================
 * CONSTANTES GLOBAIS E CONFIGURAÇÕES DO QUIZ
 * =============================================
 */

// Número fixo de perguntas a serem exibidas no quiz
const NUM_QUESTIONS_TO_DISPLAY = 20;

// Porcentagem mínima para aprovação no quiz
const PASS_RATE_PERCENTAGE = 75;

// Tempo padrão do quiz em minutos (caso o usuário não especifique)
const DEFAULT_QUIZ_TIME = 10;

/**
 * =============================================
 * SELEÇÃO DE ELEMENTOS DO DOM
 * =============================================
 * Agrupamos todos os seletores DOM em um objeto para:
 * 1. Facilitar a manutenção
 * 2. Evitar repetição de código
 * 3. Melhorar a legibilidade
 */
const elements = {
    quizFile: document.getElementById('quizFile'),           // Input para upload do arquivo
    quizTimeInput: document.getElementById('quizTime'),      // Input para tempo do quiz
    timerDisplay: document.getElementById('timerDisplay'),   // Display do temporizador
    quizForm: document.getElementById('quizForm'),           // Formulário do quiz
    submitQuizBtn: document.getElementById('submitQuiz'),     // Botão de envio
    restartQuizBtn: document.getElementById('restartQuizBtn'),// Botão de reinício
    resultsDiv: document.getElementById('results'),           // Div de resultados
    errorMessageDiv: document.getElementById('errorMessage'),// Div de mensagens de erro
    progressBar: document.getElementById('progressBar'),     // Barra de progresso
    currentQuestionCountSpan: document.getElementById('currentQuestionCount'), // Contador de perguntas respondidas
    totalQuestionsCountSpan: document.getElementById('totalQuestionsCount'), // Total de perguntas
    progressSection: document.getElementById('progressSection') // Seção de progresso
};

/**
 * =============================================
 * ESTADO DO QUIZ (VARIÁVEIS GLOBAIS)
 * =============================================
 * Centralizamos o estado da aplicação em um único objeto
 * Isso facilita o gerenciamento e o reset do estado
 */
const quizState = {
    allQuestions: [],        // Todas as perguntas carregadas do arquivo
    displayedQuestions: [],  // Perguntas selecionadas para o quiz atual
    timeRemaining: 0,        // Tempo restante em segundos
    timerInterval: null,     // Referência do intervalo do temporizador
    codeBlockContent: []     // Armazena blocos de código durante o parsing
};

/**
 * =============================================
 * INICIALIZAÇÃO DA APLICAÇÃO
 * =============================================
 */
function init() {
    // Configura todos os event listeners necessários
    setupEventListeners();
    
    // Reseta a interface para o estado inicial
    resetQuizUI();
    
    // Atualiza o display do timer (para mostrar 00:00 inicialmente)
    updateTimerDisplay();
}

// Chama a função de inicialização quando o script carrega
init();

/**
 * =============================================
 * CONFIGURAÇÃO DOS EVENT LISTENERS
 * =============================================
 * Centraliza todos os listeners em uma função
 * Facilita a manutenção e visualização das interações
 */
function setupEventListeners() {
    // Quando um arquivo é selecionado
    elements.quizFile.addEventListener('change', handleFileUpload);
    
    // Quando o botão de enviar é clicado
    elements.submitQuizBtn.addEventListener('click', handleQuizSubmission);
    
    // Quando o botão de reiniciar é clicado
    elements.restartQuizBtn.addEventListener('click', handleQuizRestart);
    
    // Quando uma resposta é alterada no formulário
    elements.quizForm.addEventListener('change', handleFormChange);
}

/**
 * =============================================
 * MANIPULADORES DE EVENTOS (HANDLERS)
 * =============================================
 */

/**
 * Manipulador de upload de arquivo
 * @param {Event} event - Evento de change do input file
 */
function handleFileUpload(event) {
    // Obtém o arquivo selecionado
    const file = event.target.files[0];
    
    // Se nenhum arquivo foi selecionado, sai da função
    if (!file) return;

    // Reseta o estado do quiz antes de carregar novo arquivo
    resetQuizState();
    
    // Cria um FileReader para ler o conteúdo do arquivo
    const reader = new FileReader();
    
    // Define o que acontece quando o arquivo é carregado com sucesso
    reader.onload = (e) => handleFileLoad(e.target.result);
    
    // Define o que acontece se ocorrer erro na leitura
    reader.onerror = () => showError('Erro ao ler o arquivo.');
    
    // Inicia a leitura do arquivo como texto
    reader.readAsText(file);
}

/**
 * Manipulador de carregamento do arquivo
 * @param {string} content - Conteúdo do arquivo lido
 */
function handleFileLoad(content) {
    try {
        // Parseia o conteúdo do arquivo para extrair as perguntas
        quizState.allQuestions = parseQuizContent(content);
        
        // Se encontrou perguntas válidas
        if (quizState.allQuestions.length > 0) {
            // Renderiza o quiz com as perguntas
            renderQuiz(quizState.allQuestions);
            
            // Mostra os controles do quiz
            showQuizControls();
            
            // Inicia o temporizador
            startTimer();
            
            // Atualiza a barra de progresso
            updateProgressBar();
        } else {
            // Se não encontrou perguntas válidas
            showError('O arquivo não contém perguntas válidas ou está em um formato inesperado.');
            resetQuizUI();
        }
    } catch (error) {
        // Se ocorrer algum erro durante o parsing
        console.error("Erro ao processar o arquivo:", error);
        showError('Ocorreu um erro ao ler o arquivo. Certifique-se de que o formato está correto.');
        resetQuizUI();
    }
}

/**
 * Manipulador de envio do quiz
 */
function handleQuizSubmission() {
    // Verifica se todas as perguntas foram respondidas
    if (validateAllQuestionsAnswered()) {
        // Se sim, calcula os resultados
        calculateResults();
        
        // Para o temporizador
        stopTimer();
    } else {
        // Se não, alerta o usuário
        alert("Por favor, responda a todas as perguntas antes de finalizar o questionário.");
    }
}

/**
 * Manipulador de reinício do quiz
 */
function handleQuizRestart() {
    // Reseta o estado interno do quiz
    resetQuizState();
    
    // Reseta a interface
    resetQuizUI();
    
    // Limpa o input de arquivo
    elements.quizFile.value = '';
}

/**
 * Manipulador de mudança no formulário
 * @param {Event} event - Evento de change
 */
function handleFormChange(event) {
    // Verifica se a mudança foi em um radio button (resposta)
    if (event.target.type === 'radio') {
        // Atualiza a barra de progresso
        updateProgressBar();
    }
}

/**
 * =============================================
 * FUNÇÕES DE RENDERIZAÇÃO DO QUIZ
 * =============================================
 */

/**
 * Renderiza o quiz na tela
 * @param {Array} allAvailableQuestions - Todas as perguntas disponíveis
 */
function renderQuiz(allAvailableQuestions) {
    // Limpa o formulário
    elements.quizForm.innerHTML = '';
    
    // Esconde os resultados anteriores
    hideResults();
    
    // Determina quantas perguntas mostrar (no máximo NUM_QUESTIONS_TO_DISPLAY)
    const questionsToDisplayCount = Math.min(NUM_QUESTIONS_TO_DISPLAY, allAvailableQuestions.length);
    
    // Embaralha e seleciona as perguntas a serem exibidas
    quizState.displayedQuestions = shuffleArray([...allAvailableQuestions]).slice(0, questionsToDisplayCount);
    
    // Se não conseguiu selecionar perguntas
    if (quizState.displayedQuestions.length === 0) {
        showError(`Não foi possível selecionar ${NUM_QUESTIONS_TO_DISPLAY} perguntas. Verifique o formato do arquivo.`);
        resetQuizUI();
        return;
    }
    
    // Atualiza o contador total de perguntas
    elements.totalQuestionsCountSpan.textContent = quizState.displayedQuestions.length;
    
    // Para cada pergunta, cria e adiciona os elementos no formulário
    quizState.displayedQuestions.forEach((question, index) => {
        const questionBlock = createQuestionElement(question, index);
        elements.quizForm.appendChild(questionBlock);
    });
}

/**
 * Cria o elemento HTML para uma pergunta
 * @param {Object} question - Objeto da pergunta
 * @param {number} index - Índice da pergunta
 * @returns {HTMLElement} - Elemento DOM da pergunta
 */
function createQuestionElement(question, index) {
    // Cria o container principal da pergunta
    const questionBlock = document.createElement('div');
    questionBlock.classList.add('question-block');
    
    // Cria o container do texto da pergunta
    const questionTextContainer = document.createElement('div');
    questionTextContainer.innerHTML = `<p class="question-text">Q${index + 1}. ${question.questionText}</p>`;
    questionBlock.appendChild(questionTextContainer);
    
    // Cria a lista de opções
    const optionsList = document.createElement('ul');
    optionsList.classList.add('options-list');
    
    // Embaralha as opções para randomizar a ordem
    const shuffledOptions = shuffleArray([...question.options]);
    
    // Para cada opção, cria o elemento correspondente
    shuffledOptions.forEach((option, optionIndex) => {
        const listItem = document.createElement('li');
        const label = document.createElement('label');
        const radioInput = document.createElement('input');
        
        // Configura o radio button
        radioInput.type = 'radio';
        radioInput.name = `question-${index}`;  // Agrupa por pergunta
        radioInput.value = option;              // Valor da opção
        radioInput.id = `q${index}-opt${optionIndex}`; // ID único
        
        // Monta a estrutura do label
        label.appendChild(radioInput);
        label.appendChild(document.createTextNode(option));
        
        // Adiciona à lista
        listItem.appendChild(label);
        optionsList.appendChild(listItem);
    });
    
    // Adiciona a lista de opções ao bloco da pergunta
    questionBlock.appendChild(optionsList);
    
    return questionBlock;
}

/**
 * =============================================
 * FUNÇÕES DE VALIDAÇÃO E CÁLCULO DE RESULTADOS
 * =============================================
 */

/**
 * Valida se todas as perguntas foram respondidas
 * @returns {boolean} - True se todas respondidas, False caso contrário
 */
function validateAllQuestionsAnswered() {
    return quizState.displayedQuestions.every((_, index) => {
        return document.querySelector(`input[name="question-${index}"]:checked`);
    });
}

/**
 * Calcula e exibe os resultados do quiz
 */
function calculateResults() {
    // Conta quantas respostas estão corretas
    const correctAnswersCount = quizState.displayedQuestions.reduce((count, question, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        return count + (selectedOption && selectedOption.value === question.correctAnswer ? 1 : 0);
    }, 0);
    
    // Calcula totais e porcentagem
    const totalQuestions = quizState.displayedQuestions.length;
    const scorePercentage = (correctAnswersCount / totalQuestions) * 100;
    
    // Monta a mensagem de resultado
    let resultMessage = `Você acertou ${correctAnswersCount} de ${totalQuestions} perguntas (${scorePercentage.toFixed(2)}%).<br>`;
    
    // Verifica se passou ou não
    if (scorePercentage >= PASS_RATE_PERCENTAGE) {
        resultMessage += 'Parabéns! Você foi APROVADO(a)!';
        elements.resultsDiv.classList.add('approved');
    } else {
        resultMessage += `Você foi REPROVADO(a). A taxa de aprovação é de ${PASS_RATE_PERCENTAGE}%.`;
        elements.resultsDiv.classList.add('reproved');
    }
    
    // Exibe os resultados
    showResults(resultMessage);
}

/**
 * =============================================
 * FUNÇÕES DE CONTROLE DA INTERFACE (UI)
 * =============================================
 */

/**
 * Mostra os controles do quiz (botões, progresso, etc)
 */
function showQuizControls() {
    elements.submitQuizBtn.style.display = 'block';
    elements.restartQuizBtn.style.display = 'block';
    elements.errorMessageDiv.textContent = '';
    elements.progressSection.style.display = 'block';
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    elements.errorMessageDiv.textContent = message;
}

/**
 * Mostra os resultados na tela
 * @param {string} message - Mensagem de resultado
 */
function showResults(message) {
    elements.resultsDiv.innerHTML = message;
    elements.resultsDiv.style.display = 'block';
}

/**
 * Esconde os resultados
 */
function hideResults() {
    elements.resultsDiv.style.display = 'none';
    elements.resultsDiv.classList.remove('approved', 'reproved');
}

/**
 * =============================================
 * FUNÇÕES DO TEMPORIZADOR
 * =============================================
 */

/**
 * Inicia o temporizador
 */
function startTimer() {
    // Para qualquer temporizador existente
    stopTimer();
    
    // Calcula o tempo total em segundos
    const quizDurationMinutes = parseInt(elements.quizTimeInput.value) || DEFAULT_QUIZ_TIME;
    quizState.timeRemaining = quizDurationMinutes * 60;
    
    // Atualiza o display
    updateTimerDisplay();
    
    // Configura o intervalo para decrementar o tempo a cada segundo
    quizState.timerInterval = setInterval(() => {
        quizState.timeRemaining--;
        updateTimerDisplay();
        
        // Se o tempo acabou
        if (quizState.timeRemaining <= 0) {
            stopTimer();
            // Se houver perguntas, calcula os resultados
            if (quizState.displayedQuestions.length > 0) {
                alert("Tempo esgotado! O questionário será finalizado.");
                calculateResults();
            }
        }
    }, 1000);
}

/**
 * Para o temporizador
 */
function stopTimer() {
    if (quizState.timerInterval) {
        clearInterval(quizState.timerInterval);
        quizState.timerInterval = null;
    }
}

/**
 * Atualiza o display do temporizador
 */
function updateTimerDisplay() {
    const minutes = Math.floor(quizState.timeRemaining / 60);
    const seconds = quizState.timeRemaining % 60;
    
    // Formata como MM:SS com zeros à esquerda
    elements.timerDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * =============================================
 * FUNÇÕES DE BARRA DE PROGRESSO
 * =============================================
 */

/**
 * Atualiza a barra de progresso
 */
function updateProgressBar() {
    const totalQuestions = quizState.displayedQuestions.length;
    
    // Se não há perguntas, sai da função
    if (totalQuestions === 0) return;
    
    // Conta quantas perguntas foram respondidas
    const answeredQuestions = quizState.displayedQuestions.reduce((count, _, index) => {
        return count + (document.querySelector(`input[name="question-${index}"]:checked`) ? 1 : 0);
    }, 0);
    
    // Calcula a porcentagem respondida
    const percentage = (answeredQuestions / totalQuestions) * 100;
    
    // Atualiza a barra e os contadores
    elements.progressBar.style.width = `${percentage}%`;
    elements.currentQuestionCountSpan.textContent = answeredQuestions;
}

/**
 * =============================================
 * FUNÇÕES DE RESET
 * =============================================
 */

/**
 * Reseta o estado interno do quiz
 */
function resetQuizState() {
    quizState.allQuestions = [];
    quizState.displayedQuestions = [];
    stopTimer();
    quizState.timeRemaining = 0;
    updateTimerDisplay();
    elements.progressBar.style.width = '0%';
    elements.currentQuestionCountSpan.textContent = 0;
    elements.totalQuestionsCountSpan.textContent = 0;
    quizState.codeBlockContent = [];
}

/**
 * Reseta a interface do quiz
 */
function resetQuizUI() {
    elements.quizForm.innerHTML = '';
    elements.submitQuizBtn.style.display = 'none';
    elements.restartQuizBtn.style.display = 'none';
    hideResults();
    elements.errorMessageDiv.textContent = '';
    elements.progressSection.style.display = 'none';
}

/**
 * =============================================
 * FUNÇÕES UTILITÁRIAS
 * =============================================
 */

/**
 * Embaralha um array (Fisher-Yates algorithm)
 * @param {Array} array - Array a ser embaralhado
 * @returns {Array} - Array embaralhado
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}