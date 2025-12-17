/**
 * Система объектного пула для оптимизации производительности
 * Космический Защитник
 */
class ObjectPool {
    constructor() {
        this.pools = new Map();
        this.maxPoolSize = 50; // Максимальный размер каждого пула
    }

    /**
     * Инициализация пула для определенного типа объектов
     * @param {string} type - Тип объекта ('asteroid', 'projectile')
     * @param {Function} createFunction - Функция создания объекта
     * @param {Function} resetFunction - Функция сброса объекта
     * @param {number} initialSize - Начальный размер пула
     */
    initializePool(type, createFunction, resetFunction, initialSize = 10) {
        const pool = {
            available: [],
            inUse: [],
            createFunction: createFunction,
            resetFunction: resetFunction,
            totalCreated: 0,
            totalReused: 0
        };

        // Предварительное создание объектов
        for (let i = 0; i < initialSize; i++) {
            const obj = createFunction();
            obj.active = false;
            pool.available.push(obj);
            pool.totalCreated++;
        }

        this.pools.set(type, pool);
    }

    /**
     * Получение объекта из пула
     * @param {string} type - Тип объекта
     * @param {...any} args - Аргументы для инициализации объекта
     * @returns {Object} Объект из пула
     */
    acquire(type, ...args) {
        const pool = this.pools.get(type);
        if (!pool) {
            console.warn(`Пул для типа ${type} не инициализирован`);
            return null;
        }

        let obj;
        
        if (pool.available.length > 0) {
            // Переиспользование существующего объекта
            obj = pool.available.pop();
            pool.totalReused++;
        } else {
            // Создание нового объекта если пул пуст
            obj = pool.createFunction();
            pool.totalCreated++;
        }

        // Сброс и инициализация объекта
        pool.resetFunction(obj, ...args);
        obj.active = true;
        
        pool.inUse.push(obj);
        return obj;
    }

    /**
     * Возврат объекта в пул
     * @param {string} type - Тип объекта
     * @param {Object} obj - Объект для возврата
     */
    release(type, obj) {
        const pool = this.pools.get(type);
        if (!pool) {
            console.warn(`Пул для типа ${type} не инициализирован`);
            return;
        }

        // Удаление из списка используемых
        const index = pool.inUse.indexOf(obj);
        if (index !== -1) {
            pool.inUse.splice(index, 1);
        }

        // Деактивация объекта
        obj.active = false;

        // Возврат в пул если есть место
        if (pool.available.length < this.maxPoolSize) {
            pool.available.push(obj);
        }
        // Иначе объект будет удален сборщиком мусора
    }

    /**
     * Автоматическая очистка неактивных объектов
     * @param {string} type - Тип объекта
     * @param {Array} entities - Массив всех объектов игры
     */
    autoRelease(type, entities) {
        const pool = this.pools.get(type);
        if (!pool) return;

        // Поиск неактивных объектов в списке используемых
        for (let i = pool.inUse.length - 1; i >= 0; i--) {
            const obj = pool.inUse[i];
            if (!obj.active) {
                this.release(type, obj);
                // Don't modify entities array here - let cleanupEntities handle filtering
            }
        }
    }

    /**
     * Получение статистики пула
     * @param {string} type - Тип объекта
     * @returns {Object} Статистика пула
     */
    getPoolStats(type) {
        const pool = this.pools.get(type);
        if (!pool) return null;

        return {
            available: pool.available.length,
            inUse: pool.inUse.length,
            totalCreated: pool.totalCreated,
            totalReused: pool.totalReused,
            reuseRatio: pool.totalCreated > 0 ? (pool.totalReused / pool.totalCreated).toFixed(2) : 0
        };
    }

    /**
     * Получение общей статистики всех пулов
     * @returns {Object} Общая статистика
     */
    getAllStats() {
        const stats = {};
        for (const [type, pool] of this.pools) {
            stats[type] = this.getPoolStats(type);
        }
        return stats;
    }

    /**
     * Очистка всех пулов
     */
    clear() {
        for (const [type, pool] of this.pools) {
            pool.available = [];
            pool.inUse = [];
        }
    }

    /**
     * Предварительный прогрев пула
     * @param {string} type - Тип объекта
     * @param {number} count - Количество объектов для создания
     */
    warmUp(type, count) {
        const pool = this.pools.get(type);
        if (!pool) return;

        for (let i = 0; i < count; i++) {
            if (pool.available.length < this.maxPoolSize) {
                const obj = pool.createFunction();
                obj.active = false;
                pool.available.push(obj);
                pool.totalCreated++;
            }
        }
    }

    /**
     * Установка максимального размера пула
     * @param {number} size - Максимальный размер
     */
    setMaxPoolSize(size) {
        this.maxPoolSize = size;
    }

    /**
     * Получение количества доступных объектов в пуле
     * @param {string} type - Тип объекта
     * @returns {number} Количество доступных объектов
     */
    getAvailableCount(type) {
        const pool = this.pools.get(type);
        return pool ? pool.available.length : 0;
    }

    /**
     * Получение количества используемых объектов в пуле
     * @param {string} type - Тип объекта
     * @returns {number} Количество используемых объектов
     */
    getInUseCount(type) {
        const pool = this.pools.get(type);
        return pool ? pool.inUse.length : 0;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectPool;
}