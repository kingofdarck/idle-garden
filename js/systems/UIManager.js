/**
 * Менеджер пользовательского интерфейса
 * Космический Защитник
 */
class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.healthElement = document.getElementById('planet-health');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartButton = document.getElementById('restartButton');
        
        this.currentScore = 0;
        this.currentHealth = 100;
        
        this.setupEventListeners();
    }

    /**
     * Настройка обработчиков событий UI
     */
    setupEventListeners() {
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.hideGameOverScreen();
                // Событие перезапуска будет обработано в GameEngine
                window.dispatchEvent(new CustomEvent('gameRestart'));
            });
        }
    }

    /**
     * Обновление отображения счета
     * @param {number} score - Новый счет
     */
    updateScore(score) {
        this.currentScore = score;
        if (this.scoreElement) {
            this.scoreElement.textContent = score.toString();
        }
    }

    /**
     * Обновление отображения здоровья планеты
     * @param {number} health - Текущее здоровье планеты
     */
    updateHealth(health) {
        this.currentHealth = Math.max(0, health);
        if (this.healthElement) {
            this.healthElement.textContent = this.currentHealth.toString();
            
            // Изменение цвета в зависимости от здоровья
            if (this.currentHealth <= 20) {
                this.healthElement.style.color = '#ff0000';
            } else if (this.currentHealth <= 50) {
                this.healthElement.style.color = '#ffaa00';
            } else {
                this.healthElement.style.color = '#ff6b6b';
            }
        }
    }

    /**
     * Показ экрана окончания игры
     * @param {number} finalScore - Финальный счет игрока
     */
    showGameOverScreen(finalScore) {
        if (this.gameOverScreen) {
            this.gameOverScreen.style.display = 'block';
        }
        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = finalScore.toString();
        }
    }

    /**
     * Скрытие экрана окончания игры
     */
    hideGameOverScreen() {
        if (this.gameOverScreen) {
            this.gameOverScreen.style.display = 'none';
        }
    }

    /**
     * Сброс UI к начальному состоянию
     */
    reset() {
        this.updateScore(0);
        this.updateHealth(100);
        this.hideGameOverScreen();
    }

    /**
     * Получение текущего счета
     * @returns {number} Текущий счет
     */
    getScore() {
        return this.currentScore;
    }

    /**
     * Получение текущего здоровья
     * @returns {number} Текущее здоровье планеты
     */
    getHealth() {
        return this.currentHealth;
    }

    /**
     * Проверка синхронизации UI с игровым состоянием
     * @param {Object} gameState - Состояние игры
     * @returns {boolean} True если UI синхронизирован
     */
    isSynchronized(gameState) {
        return this.currentScore === gameState.score && 
               this.currentHealth === gameState.planetHealth;
    }

    /**
     * Принудительная синхронизация с игровым состоянием
     * @param {Object} gameState - Состояние игры
     */
    synchronize(gameState) {
        this.updateScore(gameState.score);
        this.updateHealth(gameState.planetHealth);
        
        if (gameState.gameOver) {
            this.showGameOverScreen(gameState.score);
        }
    }

    /**
     * Отображение временного сообщения
     * @param {string} message - Сообщение для отображения
     * @param {number} duration - Длительность в миллисекундах
     */
    showMessage(message, duration = 2000) {
        // Создание временного элемента для сообщения
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, duration);
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}