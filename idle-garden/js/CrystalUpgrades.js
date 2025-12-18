/**
 * CrystalUpgrades class - Manages crystal-based upgrades for AFK resource collection
 * Handles crystal upgrades that improve offline/AFK gameplay
 */
class CrystalUpgrades {
    /**
     * Create a new CrystalUpgrades instance
     * @param {ResourceManager} resourceManager - Resource manager instance
     */
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        
        // Crystal upgrade levels
        this.crystalUpgrades = {
            afkIncome: 0,           // Увеличивает АФК доход
            afkSpeed: 0,            // Ускоряет АФК рост растений
            autoHarvest: 0,         // Автоматический сбор урожая
            resourceGeneration: 0,  // Генерация ресурсов в АФК
            offlineBonus: 0,        // Бонус к оффлайн времени
            crystalMining: 0        // Увеличивает добычу кристаллов
        };
        
        // Crystal upgrade configurations
        this.crystalUpgradeConfigs = {
            afkIncome: {
                name: 'АФК доход',
                icon: '💰',
                description: 'Увеличивает доход от растений в АФК режиме',
                baseEffect: 0.25,
                baseCost: 10,
                costMultiplier: 2,
                maxLevel: 15
            },
            afkSpeed: {
                name: 'АФК скорость',
                icon: '⚡',
                description: 'Ускоряет рост растений в АФК режиме',
                baseEffect: 0.2,
                baseCost: 15,
                costMultiplier: 2.5,
                maxLevel: 12
            },
            autoHarvest: {
                name: 'Автосбор',
                icon: '🤖',
                description: 'Автоматически собирает урожай',
                baseEffect: 1,
                baseCost: 50,
                costMultiplier: 3,
                maxLevel: 3
            },
            resourceGeneration: {
                name: 'Генерация ресурсов',
                icon: '🌰',
                description: 'Генерирует семена и воду в АФК',
                baseEffect: 0.1,
                baseCost: 25,
                costMultiplier: 2.8,
                maxLevel: 10
            },
            offlineBonus: {
                name: 'Оффлайн бонус',
                icon: '😴',
                description: 'Увеличивает эффективность оффлайн времени',
                baseEffect: 0.15,
                baseCost: 30,
                costMultiplier: 3.2,
                maxLevel: 8
            },
            crystalMining: {
                name: 'Добыча кристаллов',
                icon: '💎',
                description: 'Увеличивает добычу кристаллов',
                baseEffect: 0.3,
                baseCost: 20,
                costMultiplier: 2.2,
                maxLevel: 10
            }
        };
    }
    
    /**
     * Get crystal upgrade cost
     * @param {string} upgradeType - Type of upgrade
     * @returns {number} Cost in crystals
     */
    getCrystalUpgradeCost(upgradeType) {
        const config = this.crystalUpgradeConfigs[upgradeType];
        if (!config) return 0;
        
        const currentLevel = this.crystalUpgrades[upgradeType];
        if (currentLevel >= config.maxLevel) return 0;
        
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    }
    
    /**
     * Purchase crystal upgrade
     * @param {string} upgradeType - Type of upgrade to purchase
     * @returns {boolean} True if successful
     */
    purchaseCrystalUpgrade(upgradeType) {
        const cost = this.getCrystalUpgradeCost(upgradeType);
        const config = this.crystalUpgradeConfigs[upgradeType];
        
        if (!config || cost === 0) {
            return false;
        }
        
        const currentGems = this.resourceManager.getResource('gems');
        if (currentGems < cost) {
            return false;
        }
        
        this.resourceManager.deductResource('gems', cost);
        this.crystalUpgrades[upgradeType]++;
        
        return true;
    }
    
    /**
     * Get crystal upgrade multipliers
     * @returns {Object} Multipliers for AFK systems
     */
    getCrystalMultipliers() {
        return {
            afkIncome: 1 + (this.crystalUpgrades.afkIncome * this.crystalUpgradeConfigs.afkIncome.baseEffect),
            afkSpeed: 1 + (this.crystalUpgrades.afkSpeed * this.crystalUpgradeConfigs.afkSpeed.baseEffect),
            autoHarvestLevel: this.crystalUpgrades.autoHarvest,
            resourceGeneration: this.crystalUpgrades.resourceGeneration * this.crystalUpgradeConfigs.resourceGeneration.baseEffect,
            offlineBonus: 1 + (this.crystalUpgrades.offlineBonus * this.crystalUpgradeConfigs.offlineBonus.baseEffect),
            crystalMining: 1 + (this.crystalUpgrades.crystalMining * this.crystalUpgradeConfigs.crystalMining.baseEffect)
        };
    }
    
    /**
     * Get crystal upgrade display info
     * @param {string} upgradeType - Type of upgrade
     * @returns {Object} Display information
     */
    getCrystalUpgradeDisplayInfo(upgradeType) {
        const config = this.crystalUpgradeConfigs[upgradeType];
        if (!config) return null;
        
        const currentLevel = this.crystalUpgrades[upgradeType];
        const cost = this.getCrystalUpgradeCost(upgradeType);
        const currentGems = this.resourceManager.getResource('gems');
        const canPurchase = cost > 0 && currentGems >= cost;
        const isMaxLevel = currentLevel >= config.maxLevel;
        
        let currentEffect;
        switch (upgradeType) {
            case 'afkIncome':
            case 'afkSpeed':
            case 'offlineBonus':
            case 'crystalMining':
                currentEffect = `+${Math.round((currentLevel * config.baseEffect) * 100)}%`;
                break;
            case 'resourceGeneration':
                currentEffect = `${(currentLevel * config.baseEffect).toFixed(1)}/сек`;
                break;
            case 'autoHarvest':
                if (currentLevel === 0) currentEffect = 'Неактивно';
                else if (currentLevel === 1) currentEffect = 'Базовый';
                else if (currentLevel === 2) currentEffect = 'Улучшенный';
                else currentEffect = 'Максимальный';
                break;
            default:
                currentEffect = `Уровень ${currentLevel}`;
        }
        
        return {
            type: upgradeType,
            name: config.name,
            icon: config.icon,
            description: config.description,
            currentLevel,
            maxLevel: config.maxLevel,
            cost,
            canPurchase,
            isMaxLevel,
            currentEffect
        };
    }
    
    /**
     * Get all crystal upgrades display info
     * @returns {Array} Array of upgrade display info
     */
    getAllCrystalUpgradesDisplayInfo() {
        return Object.keys(this.crystalUpgradeConfigs).map(upgradeType =>
            this.getCrystalUpgradeDisplayInfo(upgradeType)
        ).filter(info => info !== null);
    }
    
    /**
     * Update AFK resource generation
     * @param {number} deltaTime - Time elapsed in milliseconds
     */
    updateAfkResourceGeneration(deltaTime) {
        const multipliers = this.getCrystalMultipliers();
        
        if (multipliers.resourceGeneration > 0) {
            const seedsPerSecond = multipliers.resourceGeneration;
            const waterPerSecond = multipliers.resourceGeneration * 0.8;
            
            const seedsToAdd = (seedsPerSecond * deltaTime) / 1000;
            const waterToAdd = (waterPerSecond * deltaTime) / 1000;
            
            // Accumulate fractional resources
            if (!this.seedAccumulator) this.seedAccumulator = 0;
            if (!this.waterAccumulator) this.waterAccumulator = 0;
            
            this.seedAccumulator += seedsToAdd;
            this.waterAccumulator += waterToAdd;
            
            // Add whole resources
            if (this.seedAccumulator >= 1) {
                const wholeSeedsToAdd = Math.floor(this.seedAccumulator);
                this.resourceManager.addResourceSilently('seeds', wholeSeedsToAdd);
                this.seedAccumulator -= wholeSeedsToAdd;
            }
            
            if (this.waterAccumulator >= 1) {
                const wholeWaterToAdd = Math.floor(this.waterAccumulator);
                this.resourceManager.addResourceSilently('water', wholeWaterToAdd);
                this.waterAccumulator -= wholeWaterToAdd;
            }
        }
    }
    
    /**
     * Serialize crystal upgrades data for saving
     * @returns {Object} Serialized crystal upgrades data
     */
    serialize() {
        return {
            crystalUpgrades: { ...this.crystalUpgrades },
            seedAccumulator: this.seedAccumulator || 0,
            waterAccumulator: this.waterAccumulator || 0
        };
    }
    
    /**
     * Load crystal upgrades data from serialized state
     * @param {Object} data - Serialized crystal upgrades data
     */
    deserialize(data) {
        if (data && data.crystalUpgrades) {
            this.crystalUpgrades = {
                afkIncome: data.crystalUpgrades.afkIncome || 0,
                afkSpeed: data.crystalUpgrades.afkSpeed || 0,
                autoHarvest: data.crystalUpgrades.autoHarvest || 0,
                resourceGeneration: data.crystalUpgrades.resourceGeneration || 0,
                offlineBonus: data.crystalUpgrades.offlineBonus || 0,
                crystalMining: data.crystalUpgrades.crystalMining || 0
            };
            this.seedAccumulator = data.seedAccumulator || 0;
            this.waterAccumulator = data.waterAccumulator || 0;
        }
    }
    
    /**
     * Reset crystal upgrades system
     */
    reset() {
        this.crystalUpgrades = {
            afkIncome: 0,
            afkSpeed: 0,
            autoHarvest: 0,
            resourceGeneration: 0,
            offlineBonus: 0,
            crystalMining: 0
        };
        this.seedAccumulator = 0;
        this.waterAccumulator = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrystalUpgrades;
} else if (typeof window !== 'undefined') {
    window.CrystalUpgrades = CrystalUpgrades;
}