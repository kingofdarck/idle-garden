/**
 * UpgradeSystem class - Manages permanent improvements and their effects
 * Handles upgrade types, purchase logic, and effect application to plants
 */
class UpgradeSystem {
    /**
     * Create a new UpgradeSystem instance
     * @param {ResourceManager} resourceManager - Resource manager instance
     */
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        
        // Current upgrade levels
        this.upgrades = {
            growthSpeed: 1,
            incomeBoost: 1,
            waterEfficiency: 1,
            seedProduction: 1,
            waterCollection: 1,
            gemMining: 1,
            fertilizerProduction: 1,
            autoHarvest: 1
        };
        
        // Upgrade configurations
        this.upgradeConfigs = {
            growthSpeed: {
                name: 'Скорость роста',
                icon: '⚡',
                description: 'Увеличивает скорость роста растений',
                baseEffect: 0.2,
                baseCost: { coins: 100, seeds: 0, water: 0 },
                costMultiplier: 1.5,
                maxLevel: 10
            },
            incomeBoost: {
                name: 'Увеличение дохода',
                icon: '💰',
                description: 'Увеличивает получение монет с растений',
                baseEffect: 0.25,
                baseCost: { coins: 150, seeds: 0, water: 0 },
                costMultiplier: 1.6,
                maxLevel: 10
            },
            waterEfficiency: {
                name: 'Эффективность воды',
                icon: '💧',
                description: 'Снижает затраты воды на посадку',
                baseEffect: 0.1,
                baseCost: { coins: 80, seeds: 0, water: 20 },
                costMultiplier: 1.4,
                maxLevel: 8
            },
            seedProduction: {
                name: 'Производство семян',
                icon: '🌰',
                description: 'Генерирует семена со временем',
                baseEffect: 0.5,
                baseCost: { coins: 120, seeds: 10, water: 0 },
                costMultiplier: 1.7,
                maxLevel: 6
            },
            waterCollection: {
                name: 'Сбор воды',
                icon: '💧',
                description: 'Собирает воду со временем',
                baseEffect: 0.3,
                baseCost: { coins: 100, seeds: 5, water: 0 },
                costMultiplier: 1.6,
                maxLevel: 6
            },
            gemMining: {
                name: 'Добыча кристаллов',
                icon: '💎',
                description: 'Добывает кристаллы из редких растений',
                baseEffect: 0.05,
                baseCost: { coins: 500, seeds: 50, water: 50 },
                costMultiplier: 2.0,
                maxLevel: 5,
                requires: { incomeBoost: 3 }
            },
            fertilizerProduction: {
                name: 'Производство удобрений',
                icon: '🧪',
                description: 'Производит удобрения для элитных растений',
                baseEffect: 0.02,
                baseCost: { coins: 1000, seeds: 100, water: 100, gems: 5 },
                costMultiplier: 2.5,
                maxLevel: 4,
                requires: { gemMining: 2 }
            },
            autoHarvest: {
                name: 'Автосбор',
                icon: '🤖',
                description: 'Автоматически собирает созревшие растения',
                baseEffect: 1,
                baseCost: { coins: 2000, gems: 20, fertilizer: 10 },
                costMultiplier: 1.0,
                maxLevel: 1,
                requires: { fertilizerProduction: 1 }
            }
        };
    }
    
    /**
     * Get current upgrade level for a specific upgrade type
     * @param {string} upgradeType - Type of upgrade
     * @returns {number} Current level of the upgrade
     */
    getUpgradeLevel(upgradeType) {
        if (!(upgradeType in this.upgrades)) {
            throw new Error(`Invalid upgrade type: ${upgradeType}`);
        }
        return this.upgrades[upgradeType];
    }
    
    /**
     * Get all current upgrade levels
     * @returns {Object} Object containing all upgrade levels
     */
    getAllUpgrades() {
        return { ...this.upgrades };
    }
    
    /**
     * Get upgrade configuration for a specific type
     * @param {string} upgradeType - Type of upgrade
     * @returns {Object|null} Upgrade configuration or null if not found
     */
    getUpgradeConfig(upgradeType) {
        return this.upgradeConfigs[upgradeType] || null;
    }
    
    /**
     * Calculate the cost for the next level of an upgrade
     * @param {string} upgradeType - Type of upgrade
     * @returns {Object|null} Cost object or null if max level reached
     */
    getUpgradeCost(upgradeType) {
        const config = this.getUpgradeConfig(upgradeType);
        if (!config) {
            return null;
        }
        
        const currentLevel = this.getUpgradeLevel(upgradeType);
        
        // Check if already at max level
        if (currentLevel >= config.maxLevel) {
            return null;
        }
        
        // Calculate cost based on current level
        const costMultiplier = Math.pow(config.costMultiplier, currentLevel - 1);
        
        return {
            coins: Math.floor(config.baseCost.coins * costMultiplier),
            seeds: Math.floor(config.baseCost.seeds * costMultiplier),
            water: Math.floor(config.baseCost.water * costMultiplier)
        };
    }
    
    /**
     * Check if an upgrade can be purchased
     * @param {string} upgradeType - Type of upgrade
     * @returns {boolean} True if upgrade is affordable and not at max level
     */
    canPurchaseUpgrade(upgradeType) {
        const cost = this.getUpgradeCost(upgradeType);
        if (!cost) {
            return false; // Max level reached or invalid type
        }
        
        return this.resourceManager.canAfford(cost);
    }
    
    /**
     * Purchase an upgrade
     * @param {string} upgradeType - Type of upgrade to purchase
     * @returns {boolean} True if purchase successful, false otherwise
     */
    purchaseUpgrade(upgradeType) {
        const config = this.getUpgradeConfig(upgradeType);
        if (!config) {
            throw new Error(`Invalid upgrade type: ${upgradeType}`);
        }
        
        const cost = this.getUpgradeCost(upgradeType);
        if (!cost) {
            return false; // Max level reached
        }
        
        // Check if player can afford the upgrade
        if (!this.resourceManager.canAfford(cost)) {
            return false;
        }
        
        // Deduct resources
        const success = this.resourceManager.deductResources(cost);
        if (!success) {
            return false;
        }
        
        // Apply upgrade
        this.upgrades[upgradeType]++;
        
        // Apply immediate effects for certain upgrade types
        this.applyUpgradeEffects(upgradeType);
        
        return true;
    }
    
    /**
     * Apply upgrade effects (called after purchasing an upgrade)
     * @param {string} upgradeType - Type of upgrade that was purchased
     */
    applyUpgradeEffects(upgradeType) {
        // Most upgrade effects are applied passively through getEffectMultipliers()
        // This method handles any immediate effects that need to be applied
        
        switch (upgradeType) {
            case 'seedProduction':
                // Seed production is handled by the game engine's update loop
                break;
            case 'growthSpeed':
            case 'incomeBoost':
            case 'waterEfficiency':
                // These are applied passively to plants and purchases
                break;
            default:
                console.warn(`Unknown upgrade type for effect application: ${upgradeType}`);
        }
    }
    
    /**
     * Get effect multipliers for all upgrades
     * @returns {Object} Object containing all effect multipliers
     */
    getEffectMultipliers() {
        const growthSpeedConfig = this.getUpgradeConfig('growthSpeed');
        const incomeBoostConfig = this.getUpgradeConfig('incomeBoost');
        const waterEfficiencyConfig = this.getUpgradeConfig('waterEfficiency');
        
        return {
            growthSpeed: 1 + (this.upgrades.growthSpeed - 1) * growthSpeedConfig.baseEffect,
            incomeBoost: 1 + (this.upgrades.incomeBoost - 1) * incomeBoostConfig.baseEffect,
            waterEfficiency: Math.max(0.1, 1 - (this.upgrades.waterEfficiency - 1) * waterEfficiencyConfig.baseEffect),
            seedProduction: (this.upgrades.seedProduction - 1) * this.upgradeConfigs.seedProduction.baseEffect,
            waterCollection: (this.upgrades.waterCollection - 1) * this.upgradeConfigs.waterCollection.baseEffect,
            gemMining: (this.upgrades.gemMining - 1) * this.upgradeConfigs.gemMining.baseEffect,
            fertilizerProduction: (this.upgrades.fertilizerProduction - 1) * this.upgradeConfigs.fertilizerProduction.baseEffect
        };
    }
    
    /**
     * Get upgrade display information for UI
     * @param {string} upgradeType - Type of upgrade
     * @returns {Object|null} Display information or null if invalid type
     */
    getUpgradeDisplayInfo(upgradeType) {
        const config = this.getUpgradeConfig(upgradeType);
        if (!config) {
            return null;
        }
        
        const currentLevel = this.getUpgradeLevel(upgradeType);
        const cost = this.getUpgradeCost(upgradeType);
        const canPurchase = this.canPurchaseUpgrade(upgradeType);
        const isMaxLevel = currentLevel >= config.maxLevel;
        
        // Calculate current effect
        let currentEffect;
        switch (upgradeType) {
            case 'growthSpeed':
            case 'incomeBoost':
                currentEffect = `${Math.round((this.getEffectMultipliers()[upgradeType] - 1) * 100)}% увеличение`;
                break;
            case 'waterEfficiency':
                currentEffect = `${Math.round((1 - this.getEffectMultipliers()[upgradeType]) * 100)}% снижение`;
                break;
            case 'seedProduction':
                currentEffect = `${this.getEffectMultipliers()[upgradeType].toFixed(1)} семян/сек`;
                break;
            case 'waterCollection':
                currentEffect = `${this.getEffectMultipliers()[upgradeType].toFixed(1)} воды/сек`;
                break;
            case 'gemMining':
                currentEffect = `${this.getEffectMultipliers()[upgradeType].toFixed(2)} кристаллов/сек`;
                break;
            case 'fertilizerProduction':
                currentEffect = `${this.getEffectMultipliers()[upgradeType].toFixed(2)} удобрений/сек`;
                break;
            case 'autoHarvest':
                currentEffect = this.upgrades[upgradeType] > 1 ? 'Активно' : 'Неактивно';
                break;
            default:
                currentEffect = 'Неизвестный эффект';
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
            currentEffect,
            affordable: cost ? this.resourceManager.canAfford(cost) : false
        };
    }
    
    /**
     * Get all upgrades display information
     * @returns {Array} Array of upgrade display information objects
     */
    getAllUpgradesDisplayInfo() {
        return Object.keys(this.upgradeConfigs).map(upgradeType => 
            this.getUpgradeDisplayInfo(upgradeType)
        ).filter(info => info !== null);
    }
    
    /**
     * Update seed production (called by game engine)
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    updateSeedProduction(deltaTime) {
        const seedProductionRate = this.getEffectMultipliers().seedProduction;
        if (seedProductionRate > 0) {
            const seedsToAdd = (seedProductionRate * deltaTime) / 1000; // Convert to seconds
            
            // Only add whole seeds, accumulate fractional parts
            if (!this.seedAccumulator) {
                this.seedAccumulator = 0;
            }
            
            this.seedAccumulator += seedsToAdd;
            
            if (this.seedAccumulator >= 1) {
                const wholeSeedsToAdd = Math.floor(this.seedAccumulator);
                this.resourceManager.addResource('seeds', wholeSeedsToAdd);
                this.seedAccumulator -= wholeSeedsToAdd;
            }
        }
    }
    
    /**
     * Update water collection (called by game engine)
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    updateWaterCollection(deltaTime) {
        const waterCollectionRate = this.getEffectMultipliers().waterCollection;
        if (waterCollectionRate > 0) {
            const waterToAdd = (waterCollectionRate * deltaTime) / 1000; // Convert to seconds
            
            // Only add whole water, accumulate fractional parts
            if (!this.waterAccumulator) {
                this.waterAccumulator = 0;
            }
            
            this.waterAccumulator += waterToAdd;
            
            if (this.waterAccumulator >= 1) {
                const wholeWaterToAdd = Math.floor(this.waterAccumulator);
                this.resourceManager.addResource('water', wholeWaterToAdd);
                this.waterAccumulator -= wholeWaterToAdd;
            }
        }
    }
    
    /**
     * Update gem mining over time
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    updateGemMining(deltaTime) {
        const gemMiningRate = this.getEffectMultipliers().gemMining;
        if (gemMiningRate > 0) {
            const gemsToAdd = (gemMiningRate * deltaTime) / 1000;
            
            if (!this.gemAccumulator) {
                this.gemAccumulator = 0;
            }
            
            this.gemAccumulator += gemsToAdd;
            
            if (this.gemAccumulator >= 1) {
                const wholeGemsToAdd = Math.floor(this.gemAccumulator);
                this.resourceManager.addResource('gems', wholeGemsToAdd);
                this.gemAccumulator -= wholeGemsToAdd;
            }
        }
    }
    
    /**
     * Update fertilizer production over time
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    updateFertilizerProduction(deltaTime) {
        const fertilizerRate = this.getEffectMultipliers().fertilizerProduction;
        if (fertilizerRate > 0) {
            const fertilizerToAdd = (fertilizerRate * deltaTime) / 1000;
            
            if (!this.fertilizerAccumulator) {
                this.fertilizerAccumulator = 0;
            }
            
            this.fertilizerAccumulator += fertilizerToAdd;
            
            if (this.fertilizerAccumulator >= 1) {
                const wholeFertilizerToAdd = Math.floor(this.fertilizerAccumulator);
                this.resourceManager.addResource('fertilizer', wholeFertilizerToAdd);
                this.fertilizerAccumulator -= wholeFertilizerToAdd;
            }
        }
    }
    
    /**
     * Apply water efficiency to plant costs
     * @param {Object} plantCost - Original plant cost
     * @returns {Object} Modified cost with water efficiency applied
     */
    applyWaterEfficiency(plantCost) {
        const waterEfficiency = this.getEffectMultipliers().waterEfficiency;
        
        return {
            coins: plantCost.coins,
            seeds: plantCost.seeds,
            water: Math.ceil(plantCost.water * waterEfficiency)
        };
    }
    
    /**
     * Reset all upgrades to level 1
     */
    reset() {
        this.upgrades = {
            growthSpeed: 1,
            incomeBoost: 1,
            waterEfficiency: 1,
            seedProduction: 1,
            waterCollection: 1,
            gemMining: 1,
            fertilizerProduction: 1,
            autoHarvest: 1
        };
        this.seedAccumulator = 0;
        this.waterAccumulator = 0;
    }
    
    /**
     * Serialize upgrade data for saving
     * @returns {Object} Serialized upgrade data
     */
    serialize() {
        return {
            upgrades: { ...this.upgrades },
            seedAccumulator: this.seedAccumulator || 0
        };
    }
    
    /**
     * Load upgrade data from serialized state
     * @param {Object} data - Serialized upgrade data
     */
    deserialize(data) {
        if (data && data.upgrades) {
            // Merge saved upgrades with defaults to handle new upgrades
            this.upgrades = {
                growthSpeed: data.upgrades.growthSpeed || 1,
                incomeBoost: data.upgrades.incomeBoost || 1,
                waterEfficiency: data.upgrades.waterEfficiency || 1,
                seedProduction: data.upgrades.seedProduction || 1,
                waterCollection: data.upgrades.waterCollection || 1,
                gemMining: data.upgrades.gemMining || 1,
                fertilizerProduction: data.upgrades.fertilizerProduction || 1,
                autoHarvest: data.upgrades.autoHarvest || 1
            };
            this.seedAccumulator = data.seedAccumulator || 0;
            this.waterAccumulator = data.waterAccumulator || 0;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradeSystem;
} else if (typeof window !== 'undefined') {
    window.UpgradeSystem = UpgradeSystem;
}