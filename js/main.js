/**
 * Точка входа в игру Космический Защитник
 */

// Глобальная переменная для игрового движка
let gameEngine = null;

/**
 * Инициализация игры
 */
function initializeGame() {
    // Получение canvas элемента
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas элемент не найден!');
        return;
    }
    
    // Проверка поддержки Canvas
    if (!canvas.getContext) {
        console.error('Canvas не поддерживается браузером!');
        showError('Ваш браузер не поддерживает Canvas. Пожалуйста, обновите браузер.');
        return;
    }
    
    try {
        // Создание игрового движка
        gameEngine = new GameEngine(canvas);
        
        // Запуск игры
        gameEngine.start();
        
        console.log('Игра Космический Защитник запущена!');
        console.log('Управление: Стрелки или WASD для движения, Пробел для стрельбы');
        console.log('M - включить/выключить звук');
        console.log('F1 - включить/выключить отладочную информацию');
        console.log('F2 - показать/скрыть границы объектов');
        
    } catch (error) {
        console.error('Ошибка при инициализации игры:', error);
        showError('Произошла ошибка при запуске игры. Пожалуйста, перезагрузите страницу.');
    }
}

/**
 * Показ сообщения об ошибке пользователю
 * @param {string} message - Сообщение об ошибке
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff0000;
        color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        font-size: 16px;
        z-index: 9999;
        text-align: center;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

/**
 * Обработка изменения размера окна
 */
function handleResize() {
    if (gameEngine && gameEngine.renderer) {
        // Можно добавить логику адаптивного изменения размера canvas
        // Пока что оставляем фиксированный размер
    }
}

/**
 * Обработка видимости страницы
 */
function handleVisibilityChange() {
    if (gameEngine) {
        if (document.hidden) {
            gameEngine.pause();
        } else {
            // Не возобновляем автоматически, пусть игрок сам решает
        }
    }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Изменение размера окна
    window.addEventListener('resize', handleResize);
    
    // Изменение видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Предотвращение контекстного меню на canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    // Предотвращение прокрутки страницы стрелками
    window.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
            event.preventDefault();
        }
    });
}

/**
 * Проверка готовности DOM
 */
function checkDOMReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        initializeGame();
    }
}

/**
 * Основная функция запуска
 */
function main() {
    console.log('Загрузка Космический Защитник...');
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Проверка готовности DOM и запуск игры
    checkDOMReady();
}

/**
 * Переключение панели улучшений
 */
function toggleUpgrades() {
    if (gameEngine && gameEngine.upgradeUI) {
        if (gameEngine.upgradeUI.isOpen()) {
            gameEngine.upgradeUI.hide();
            gameEngine.resume();
        } else {
            gameEngine.pause();
            gameEngine.upgradeUI.show(gameEngine.gameState.score);
        }
    }
}

// Запуск игры
main();

// Экспорт для возможного использования в тестах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeGame,
        gameEngine: () => gameEngine
    };
}