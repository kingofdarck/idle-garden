/**
 * Менеджер ввода для обработки клавиатуры
 * Космический Защитник
 */
class InputManager {
    constructor() {
        this.keys = new Map();
        this.setupEventListeners();
    }

    /**
     * Настройка обработчиков событий клавиатуры
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keys.set(event.code, true);
            // Предотвращение стандартного поведения для игровых клавиш
            if (this.isGameKey(event.code)) {
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys.set(event.code, false);
            if (this.isGameKey(event.code)) {
                event.preventDefault();
            }
        });

        // Обработка потери фокуса окна
        window.addEventListener('blur', () => {
            this.keys.clear();
        });
    }

    /**
     * Проверка, является ли клавиша игровой
     * @param {string} keyCode - Код клавиши
     * @returns {boolean} True если клавиша используется в игре
     */
    isGameKey(keyCode) {
        const gameKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'
        ];
        return gameKeys.includes(keyCode);
    }

    /**
     * Проверка, нажата ли клавиша
     * @param {string} keyCode - Код клавиши для проверки
     * @returns {boolean} True если клавиша нажата
     */
    isKeyPressed(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    /**
     * Проверка, была ли клавиша только что нажата (для одиночных действий)
     * @param {string} keyCode - Код клавиши
     * @returns {boolean} True если клавиша была нажата в этом кадре
     */
    isKeyJustPressed(keyCode) {
        // Для реализации этой функции потребуется отслеживание состояния предыдущего кадра
        // Пока что используем простую проверку
        return this.isKeyPressed(keyCode);
    }

    /**
     * Обновление состояния менеджера ввода
     * Вызывается каждый кадр
     */
    update() {
        // Здесь можно добавить логику для отслеживания "только что нажатых" клавиш
        // если это потребуется в будущем
    }

    /**
     * Очистка всех нажатых клавиш
     */
    clear() {
        this.keys.clear();
    }

    /**
     * Получение всех активных клавиш (для отладки)
     * @returns {Array} Массив кодов нажатых клавиш
     */
    getActiveKeys() {
        const activeKeys = [];
        for (const [key, pressed] of this.keys) {
            if (pressed) {
                activeKeys.push(key);
            }
        }
        return activeKeys;
    }
}