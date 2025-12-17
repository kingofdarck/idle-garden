/**
 * Тесты для системы прокачки
 * Космический Защитник
 */

const UpgradeSystem = require('./UpgradeSystem.js');

describe('UpgradeSystem Tests', () => {
    let upgradeSystem;

    beforeEach(() => {
        upgradeSystem = new UpgradeSystem();
    });

    test('должен инициализировать улучшения с нулевыми уровнями', () => {
        const upgrades = upgradeSystem.getAllUpgrades();
        
        expect(upgrades.length).toBeGreaterThan(0);
        upgrades.forEach(upgrade => {
            expect(upgrade.currentLevel).toBe(0);
            expect(upgrade.canUpgrade).toBe(true);
        });
    });

    test('должен правильно рассчитывать стоимость улучшений', () => {
        const fireRateCost = upgradeSystem.getUpgradeCost('fireRate');
        expect(fireRateCost).toBe(100); // Базовая стоимость

        // Покупаем улучшение
        upgradeSystem.purchaseUpgrade('fireRate', 1000);
        
        // Стоимость должна увеличиться
        const newCost = upgradeSystem.getUpgradeCost('fireRate');
        expect(newCost).toBeGreaterThan(fireRateCost);
    });

    test('должен предотвращать покупку при недостатке очков', () => {
        const result = upgradeSystem.purchaseUpgrade('fireRate', 50);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('Недостаточно очков');
    });

    test('должен успешно покупать улучшения при достаточных очках', () => {
        const result = upgradeSystem.purchaseUpgrade('fireRate', 1000);
        
        expect(result.success).toBe(true);
        expect(result.newLevel).toBe(1);
        expect(result.cost).toBe(100);
    });

    test('должен предотвращать покупку сверх максимального уровня', () => {
        // Покупаем все уровни
        for (let i = 0; i < 5; i++) {
            upgradeSystem.purchaseUpgrade('fireRate', 10000);
        }
        
        // Попытка купить еще один уровень
        const result = upgradeSystem.purchaseUpgrade('fireRate', 10000);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('максимальный уровень');
    });

    test('должен правильно рассчитывать эффекты улучшений', () => {
        const initialEffect = upgradeSystem.getUpgradeEffect('fireRate');
        expect(initialEffect).toBe(1); // Базовый эффект

        // Покупаем улучшение
        upgradeSystem.purchaseUpgrade('fireRate', 1000);
        
        const newEffect = upgradeSystem.getUpgradeEffect('fireRate');
        expect(newEffect).toBeGreaterThan(initialEffect);
    });

    test('должен сбрасывать все улучшения', () => {
        // Покупаем несколько улучшений
        upgradeSystem.purchaseUpgrade('fireRate', 1000);
        upgradeSystem.purchaseUpgrade('damage', 1000);
        
        // Сбрасываем
        upgradeSystem.resetUpgrades();
        
        // Проверяем что все сброшено
        const upgrades = upgradeSystem.getAllUpgrades();
        upgrades.forEach(upgrade => {
            expect(upgrade.currentLevel).toBe(0);
        });
    });

    test('должен возвращать правильную информацию об улучшении', () => {
        const upgradeInfo = upgradeSystem.getUpgradeInfo('fireRate');
        
        expect(upgradeInfo).toHaveProperty('id', 'fireRate');
        expect(upgradeInfo).toHaveProperty('name');
        expect(upgradeInfo).toHaveProperty('description');
        expect(upgradeInfo).toHaveProperty('currentLevel', 0);
        expect(upgradeInfo).toHaveProperty('maxLevel');
        expect(upgradeInfo).toHaveProperty('cost');
        expect(upgradeInfo).toHaveProperty('canUpgrade', true);
    });
});