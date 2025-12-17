/**
 * Система прокачки
 * Космический Защитник
 */

class UpgradeSystem {
    constructor() {
        this.upgrades = new Map();
        this.playerUpgrades = new Map();
        this.initializeUpgrades();
    }

    /**
     * Инициализация доступных улучшений
     */
    initializeUpgrades() {
        // Улучшение скорости стрельбы
        this.upgrades.set('fireRate', {
            name: 'Скорость стрельбы',
            description: 'Увеличивает скорость стрельбы корабля',
            maxLevel: 5,
            baseCost: 100,
            costMultiplier: 1.5,
            effect: (level) => 1 + (level * 0.3) // +30% за уровень
        });

        // Улучшение урона
        this.upgrades.set('damage', {
            name: 'Урон',
            description: 'Увеличивает урон снарядов',
            maxLevel: 5,
            baseCost: 150,
            costMultiplier: 1.8,
            effect: (level) => 1 + (level * 0.5) // +50% за уровень
        });

        // Улучшение скорости движения
        this.upgrades.set('speed', {
            name: 'Скорость',
            description: 'Увеличивает скорость движения корабля',
            maxLevel: 3,
            baseCost: 200,
            costMultiplier: 2.0,
            effect: (level) => 1 + (level * 0.25) // +25% за уровень
        });

        // Улучшение здоровья планеты
        this.upgrades.set('planetHealth', {
            name: 'Защита планеты',
            description: 'Увеличивает максимальное здоровье планеты',
            maxLevel: 3,
            baseCost: 300,
            costMultiplier: 2.5,
            effect: (level) => level * 25 // +25 здоровья за уровень
        });

        // Мультивыстрел
        this.upgrades.set('multiShot', {
            name: 'Мультивыстрел',
            description: 'Позволяет стрелять несколькими снарядами одновременно',
            maxLevel: 2,
            baseCost: 500,
            costMultiplier: 3.0,
            effect: (level) => level + 1 // +1 снаряд за уровень
        });

        // Инициализация уровней игрока (все на 0)
        for (const upgradeId of this.upgrades.keys()) {
            this.playerUpgrades.set(upgradeId, 0);
        }
    }

    /**
     * Получение информации об улучшении
     * @param {string} upgradeId - ID улучшения
     * @returns {Object} Информация об улучшении
     */
    getUpgradeInfo(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        const currentLevel = this.playerUpgrades.get(upgradeId) || 0;
        
        if (!upgrade) return null;

        return {
            id: upgradeId,
            name: upgrade.name,
            description: upgrade.description,
            currentLevel: currentLevel,
            maxLevel: upgrade.maxLevel,
            cost: this.getUpgradeCost(upgradeId),
            canUpgrade: currentLevel < upgrade.maxLevel,
            currentEffect: upgrade.effect(currentLevel),
            nextEffect: currentLevel < upgrade.maxLevel ? upgrade.effect(currentLevel + 1) : null
        };
    }

    /**
     * Получение стоимости улучшения
     * @param {string} upgradeId - ID улучшения
     * @returns {number} Стоимость улучшения
     */
    getUpgradeCost(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        const currentLevel = this.playerUpgrades.get(upgradeId) || 0;
        
        if (!upgrade || currentLevel >= upgrade.maxLevel) return 0;

        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }

    /**
     * Покупка улучшения
     * @param {string} upgradeId - ID улучшения
     * @param {number} playerScore - Текущий счет игрока
     * @returns {Object} Результат покупки
     */
    purchaseUpgrade(upgradeId, playerScore) {
        const upgrade = this.upgrades.get(upgradeId);
        const currentLevel = this.playerUpgrades.get(upgradeId) || 0;
        
        if (!upgrade) {
            return { success: false, message: 'Улучшение не найдено' };
        }

        if (currentLevel >= upgrade.maxLevel) {
            return { success: false, message: 'Достигнут максимальный уровень' };
        }

        const cost = this.getUpgradeCost(upgradeId);
        if (playerScore < cost) {
            return { success: false, message: 'Недостаточно очков' };
        }

        // Покупка улучшения
        this.playerUpgrades.set(upgradeId, currentLevel + 1);
        
        return {
            success: true,
            message: `${upgrade.name} улучшен до уровня ${currentLevel + 1}`,
            cost: cost,
            newLevel: currentLevel + 1
        };
    }

    /**
     * Получение всех доступных улучшений
     * @returns {Array} Массив информации об улучшениях
     */
    getAllUpgrades() {
        const result = [];
        for (const upgradeId of this.upgrades.keys()) {
            result.push(this.getUpgradeInfo(upgradeId));
        }
        return result;
    }

    /**
     * Получение эффекта улучшения
     * @param {string} upgradeId - ID улучшения
     * @returns {number} Значение эффекта
     */
    getUpgradeEffect(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        const currentLevel = this.playerUpgrades.get(upgradeId) || 0;
        
        if (!upgrade) return 1;
        return upgrade.effect(currentLevel);
    }

    /**
     * Сброс всех улучшений
     */
    resetUpgrades() {
        for (const upgradeId of this.upgrades.keys()) {
            this.playerUpgrades.set(upgradeId, 0);
        }
    }

    /**
     * Сохранение прогресса улучшений в localStorage
     */
    saveProgress() {
        const upgradeData = {};
        for (const [id, level] of this.playerUpgrades) {
            upgradeData[id] = level;
        }
        localStorage.setItem('spaceDefender_upgrades', JSON.stringify(upgradeData));
    }

    /**
     * Загрузка прогресса улучшений из localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('spaceDefender_upgrades');
            if (saved) {
                const upgradeData = JSON.parse(saved);
                for (const [id, level] of Object.entries(upgradeData)) {
                    if (this.upgrades.has(id)) {
                        this.playerUpgrades.set(id, level);
                    }
                }
            }
        } catch (error) {
            console.warn('Ошибка загрузки прогресса улучшений:', error);
        }
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradeSystem;
}