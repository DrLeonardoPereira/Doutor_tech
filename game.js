// ========== VARIÁVEIS GLOBAIS ==========
let playerData = {
    name: '',
    age: 0,
    sex: '',
    education: ''
};

let gameData = {
    score: 0,
    level: 1,
    timeRemaining: 60,
    gameActive: false,
    sequence: [],
    userSequence: [],
    timer: null
};

// ========== ELEMENTOS DO DOM ==========
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');

const playerForm = document.getElementById('playerForm');
const playerGreeting = document.getElementById('playerGreeting');
const playerStats = document.getElementById('playerStats');
const gameArea = document.getElementById('gameArea');

const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const timerDisplay = document.getElementById('timer');

const backButton = document.getElementById('backButton');
const playAgainButton = document.getElementById('playAgainButton');
const downloadButton = document.getElementById('downloadButton');

// Mapa de educação para exibição amigável
const educationMap = {
    'fundamental_incompleto': 'Fundamental Incompleto',
    'fundamental_completo': 'Fundamental Completo',
    'medio_incompleto': 'Médio Incompleto',
    'medio_completo': 'Médio Completo',
    'superior_incompleto': 'Superior Incompleto',
    'superior_completo': 'Superior Completo',
    'pos_graduacao': 'Pós-Graduação'
};

const sexMap = {
    'masculino': 'Masculino',
    'feminino': 'Feminino',
    'outro': 'Outro',
    'prefiro_nao_informar': 'Prefiro não informar'
};

// ========== EVENTOS ==========
playerForm.addEventListener('submit', handleFormSubmit);
backButton.addEventListener('click', goBackToStart);
playAgainButton.addEventListener('click', resetGame);
downloadButton.addEventListener('click', downloadResult);

// ========== FUNÇÕES PRINCIPAIS ==========

/**
 * Manipula o envio do formulário
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // Validar se todos os campos estão preenchidos
    const name = document.getElementById('playerName').value.trim();
    const age = document.getElementById('playerAge').value;
    const sex = document.getElementById('playerSex').value;
    const education = document.getElementById('playerEducation').value;

    if (!name || !age || !sex || !education) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Armazenar dados do jogador
    playerData = {
        name: name,
        age: parseInt(age),
        sex: sex,
        education: education
    };

    // Iniciar o jogo
    startGame();
}

/**
 * Inicializa o jogo
 */
function startGame() {
    // Limpar dados do jogo anterior
    gameData.score = 0;
    gameData.level = 1;
    gameData.timeRemaining = 60;
    gameData.sequence = [];
    gameData.userSequence = [];
    gameData.gameActive = true;

    // Atualizar interface
    playerGreeting.textContent = `Bem-vindo, ${playerData.name}!`;
    playerStats.textContent = `${playerData.age} anos | ${sexMap[playerData.sex]} | ${educationMap[playerData.education]}`;

    // Trocar para tela do jogo
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Criar botões do jogo
    createGameButtons();

    // Atualizar displays
    updateGameDisplay();

    // Iniciar temporizador
    startTimer();

    // Começar sequência
    generateNextLevel();
}

/**
 * Cria os botões do jogo
 */
function createGameButtons() {
    gameArea.innerHTML = '';

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    const colorNames = ['Azul', 'Vermelho', 'Verde', 'Amarelo'];

    for (let i = 0; i < 4; i++) {
        const button = document.createElement('button');
        button.className = 'game-button';
        button.textContent = colorNames[i];
        button.style.background = colors[i];
        button.dataset.index = i;
        button.addEventListener('click', () => handleButtonClick(i, button));
        gameArea.appendChild(button);
    }
}

/**
 * Manipula o clique em um botão
 */
function handleButtonClick(index, buttonElement) {
    if (!gameData.gameActive) return;

    // Adicionar à sequência do usuário
    gameData.userSequence.push(index);

    // Efeito visual
    buttonElement.classList.add('active');
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 150);

    // Validar sequência
    if (gameData.userSequence[gameData.userSequence.length - 1] !== gameData.sequence[gameData.userSequence.length - 1]) {
        // Erro! Acertou errado
        endGame();
        return;
    }

    // Se completou a sequência corretamente
    if (gameData.userSequence.length === gameData.sequence.length) {
        gameData.userSequence = [];
        gameData.score += 10 * gameData.level;
        gameData.level++;
        updateGameDisplay();

        // Pequena pausa antes do próximo nível
        setTimeout(() => {
            generateNextLevel();
        }, 500);
    }
}

/**
 * Gera o próximo nível da sequência
 */
function generateNextLevel() {
    gameData.sequence.push(Math.floor(Math.random() * 4));
    playSequence();
}

/**
 * Toca a sequência de forma visual
 */
async function playSequence() {
    gameData.gameActive = false;

    for (let i = 0; i < gameData.sequence.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));

        const index = gameData.sequence[i];
        const buttons = gameArea.querySelectorAll('.game-button');
        const button = buttons[index];

        button.classList.add('active');
        await new Promise(resolve => setTimeout(resolve, 300));
        button.classList.remove('active');
    }

    gameData.gameActive = true;
    gameData.userSequence = [];
}

/**
 * Inicia o temporizador
 */
function startTimer() {
    gameData.timer = setInterval(() => {
        gameData.timeRemaining--;
        updateGameDisplay();

        if (gameData.timeRemaining <= 0) {
            clearInterval(gameData.timer);
            endGame();
        }
    }, 1000);
}

/**
 * Atualiza a exibição do jogo
 */
function updateGameDisplay() {
    scoreDisplay.textContent = gameData.score;
    levelDisplay.textContent = gameData.level;
    timerDisplay.textContent = gameData.timeRemaining + 's';

    // Mudar cor do timer se estiver acabando
    if (gameData.timeRemaining <= 10) {
        timerDisplay.style.color = '#ef4444';
    } else {
        timerDisplay.style.color = '';
    }
}

/**
 * Termina o jogo
 */
function endGame() {
    gameData.gameActive = false;
    clearInterval(gameData.timer);

    // Aguardar um momento e mostrar resultado
    setTimeout(() => {
        showResults();
    }, 500);
}

/**
 * Exibe a tela de resultados
 */
function showResults() {
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');

    // Preencher dados de resultado
    document.getElementById('resultName').textContent = playerData.name;
    document.getElementById('resultAge').textContent = playerData.age + ' anos';
    document.getElementById('resultSex').textContent = sexMap[playerData.sex];
    document.getElementById('resultEducation').textContent = educationMap[playerData.education];
    document.getElementById('resultScore').textContent = gameData.score;
    document.getElementById('resultLevel').textContent = gameData.level;
}

/**
 * Volta para a tela inicial
 */
function goBackToStart() {
    gameData.gameActive = false;
    clearInterval(gameData.timer);

    gameScreen.classList.remove('active');
    startScreen.classList.add('active');

    // Limpar formulário
    playerForm.reset();
}

/**
 * Reinicia o jogo com o mesmo jogador
 */
function resetGame() {
    resultScreen.classList.remove('active');
    startGame();
}

/**
 * Baixa o resultado em JSON
 */
function downloadResult() {
    const result = {
        timestamp: new Date().toLocaleString('pt-BR'),
        jogador: {
            nome: playerData.name,
            idade: playerData.age,
            sexo: sexMap[playerData.sex],
            escolaridade: educationMap[playerData.education]
        },
        resultado: {
            pontuacao: gameData.score,
            nivel: gameData.level,
            tempoJogo: 60 + ' segundos'
        }
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2)));
    element.setAttribute('download', `resultado_${playerData.name.replace(/\s+/g, '_')}_${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Doutor Tech - Teste Cognitivo Carregado');
    startScreen.classList.add('active');
});
