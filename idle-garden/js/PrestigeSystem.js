/**
 * PrestigeSystem class - Manages prestige/rebirth mechanics and prestige upgrades
 * Handles prestige points, prestige upgrades, and reset mechanics
 */
class PrestigeSystem {
    /**
     * Create a new PrestigeSystem instance
     * @param {ResourceManager} resourceManager - Resource manager instance
     */
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        
        // Prestige data
        this.prestigeLevel = 0;
        this.prestigePoints = 0;
        this.totalPrestigePoints = 0;
        
        // Prestige upgrade levels
        this.prestigeUpgrades = {
            incomeMultiplier: 0,      // Увеличивает доход от растений
            growthSpeedBoost: 0,      // Ускоряет рост растений
            resourceEfficiency: 0,    // Снижает стоимость растений
            autoPlanter: 0,           // Автоматически сажает растения
            megaHarvest: 0,           // Увеличивает доход от сбора урожая
            crystalMining: 0,         // Увеличивает добычу кристаллов
            fertilizerBoost: 0,       // Увеличивает производство удобрений
            afkBonus: 0,              // Увеличивает оффлайн доходы
            prestigeBoost: 0          // Увеличивает получение очков престижа
        };
        
        // Prestige upgrade configurations
        this.prestigeUpgradeConfigs = {
            incomeMultiplier: {
                name: 'Мультипликатор дохода',
                icon: '💰',
                description: 'Увеличивает доход от всех растений',
                baseEffect: 0.5,
                baseCost: 1,
                costMultiplier: 2,
                maxLevel: 20
            },
            growthSpeedBoost: {
                name: 'Ускорение роста',
                icon: '⚡',
                description: 'Ускоряет рост всех растений',
                baseEffect: 0.3,
                baseCost: 2,
                costMultiplier: 2.5,
                maxLevel: 15
            },
            resourceEfficiency: {
                name: 'Эффективность ресурсов',
                icon: '💎',
                description: 'Снижает стоимость всех растений',
                baseEffect: 0.1,
                baseCost: 3,
                costMultiplier: 3,
                maxLevel: 10
            },
            autoPlanter: {
                name: 'Автопосадка',
                icon: '🤖',
                description: 'Автоматически сажает растения',
                baseEffect: 1,
                baseCost: 10,
                costMultiplier: 5,
                maxLevel: 5
            },
            megaHarvest: {
                name: 'Мега урожай',
                icon: '🌟',
                description: 'Шанс получить бонусный доход',
                baseEffect: 0.05,
                baseCost: 5,
                costMultiplier: 4,
                maxLevel: 10
            },
            crystalMining: {
                name: 'Добыча кристаллов',
                icon: '💎',
                description: 'Увеличивает добычу кристаллов',
                baseEffect: 1,
                baseCost: 15,
                costMultiplier: 6,
                maxLevel: 8
            },
            fertilizerBoost: {
                name: 'Производство удобрений',
                icon: '🧪',
                description: 'Увеличивает производство удобрений',
                baseEffect: 1,
                baseCost: 20,
                costMultiplier: 7,
                maxLevel: 6
            },
            afkBonus: {
                name: 'АФК бонус',
                icon: '😴',
                description: 'Увеличивает оффлайн доходы',
                baseEffect: 0.2,
                baseCost: 25,
                costMultiplier: 8,
                maxLevel: 12
            },
            prestigeBoost: {
                name: 'Престиж бустер',
                icon: '⭐',
                description: 'Увеличивает получение очков престижа',
                baseEffect: 0.25,
                baseCost: 30,
                costMultiplier: 10,
                maxLevel: 8
            },

        };
    }
    
    /**
     * Calculate prestige points that would be gained from current coins
     * @param {number} coins - Current coin amount
     * @returns {number} Prestige points that would be gained
     */
    calculatePrestigePoints(coins) {
        if (coins < 1000000) {
            return 0;
        }
        
        // Formula: sqrt(coins / 1000000) * (1 + prestigeLevel * 0.1) * prestigeBoost
        const basePoints = Math.floor(Math.sqrt(coins / 1000000));
        const levelMultiplier = 1 + (this.prestigeLevel * 0.1);
        const prestigeBoostMultiplier = 1 + (this.prestigeUpgrades.prestigeBoost * this.prestigeUpgradeConfigs.prestigeBoost.baseEffect);
        
        return Math.floor(basePoints * levelMultiplier * prestigeBoostMultiplier);
    }
    
    /**
     * Get the minimum coins required for prestige
     * @returns {number} Minimum coins needed
     */
    getPrestigeRequirement() {
        // First prestige at 1M, then increases
        return 1000000 * Math.pow(2, this.prestigeLevel);
    }
    
    /**
     * Check if prestige is available
     * @returns {boolean} True if can prestige
     */
    canPrestige() {
        const coins = this.resourceManager.getResource('coins');
        const hasCoins = coins >= this.getPrestigeRequirement();
        
        // Check for cosmic orchids requirement
        const hasCosmicOrchids = this.checkCosmicOrchidsRequirement();
        
        return hasCoins && hasCosmicOrchids;
    }
    
    /**
     * Check if player has at least 5 cosmic orchids
     * @returns {boolean} True if has enough cosmic orchids
     */
    checkCosmicOrchidsRequirement() {
        // Access garden grid through game engine or global state
        if (typeof window !== 'undefined' && window.gameState && window.gameState.gardenGrid) {
            const gardenGrid = window.gameState.gardenGrid;
            let cosmicOrchidCount = 0;
            
            // Count cosmic orchids in the garden
            for (let row = 0; row < gardenGrid.rows; row++) {
                for (let col = 0; col < gardenGrid.cols; col++) {
                    const plant = gardenGrid.getPlant(row, col);
                    if (plant && plant.type === 'cosmicorchid') {
                        cosmicOrchidCount++;
                    }
                }
            }
            
            return cosmicOrchidCount >= 5;
        }
        
        return false; // If can't access garden, don't allow prestige
    }
    
    /**
     * Get prestige requirements text
     * @returns {Object} Requirements info
     */
    getPrestigeRequirements() {
        const coins = this.resourceManager.getResource('coins');
        const coinRequirement = this.getPrestigeRequirement();
        const hasCoins = coins >= coinRequirement;
        
        const hasCosmicOrchids = this.checkCosmicOrchidsRequirement();
        let cosmicOrchidCount = 0;
        
        if (typeof window !== 'undefined' && window.gameState && window.gameState.gardenGrid) {
            const gardenGrid = window.gameState.gardenGrid;
            for (let row = 0; row < gardenGrid.rows; row++) {
                for (let col = 0; col < gardenGrid.cols; col++) {
                    const plant = gardenGrid.getPlant(row, col);
                    if (plant && plant.type === 'cosmicorchid') {
                        cosmicOrchidCount++;
                    }
                }
            }
        }
        
        return {
            coinRequirement,
            hasCoins,
            cosmicOrchidRequirement: 5,
            cosmicOrchidCount,
            hasCosmicOrchids,
            canPrestige: hasCoins && hasCosmicOrchids
        };
    }
    
    /**
     * Perform prestige reset
     * @returns {Object} Prestige result with points gained
     */
    performPrestige() {
        const coins = this.resourceManager.getResource('coins');
        const requirements = this.getPrestigeRequirements();
        
        if (!requirements.canPrestige) {
            let message = 'Требования для перерождения не выполнены: ';
            if (!requirements.hasCoins) {
                message += `нужно ${requirements.coinRequirement.toLocaleString()} монет`;
            }
            if (!requirements.hasCosmicOrchids) {
                if (!requirements.hasCoins) message += ', ';
                message += `нужно ${requirements.cosmicOrchidRequirement} космических орхидей (есть: ${requirements.cosmicOrchidCount})`;
            }
            return { success: false, message };
        }
        
        const pointsGained = this.calculatePrestigePoints(coins);
        
        // Add prestige points
        this.prestigePoints += pointsGained;
        this.totalPrestigePoints += pointsGained;
        this.prestigeLevel++;
        
        // Save current gems and fertilizer before reset
        const currentGems = this.resourceManager.getResource('gems');
        const currentFertilizer = this.resourceManager.getResource('fertilizer');
        
        // Reset resources to starting values but keep gems and fertilizer
        this.resourceManager.reset({
            coins: 100,
            seeds: 20,
            water: 30,
            gems: currentGems,
            fertilizer: currentFertilizer
        });
        
        return {
            success: true,
            pointsGained: pointsGained,
            newLevel: this.prestigeLevel,
            totalPoints: this.prestigePoints
        };
    }
    
    /**
     * Get prestige upgrade cost
     * @param {string} upgradeType - Type of upgrade
     * @returns {number} Cost in prestige points
     */
    getPrestigeUpgradeCost(upgradeType) {
        const config = this.prestigeUpgradeConfigs[upgradeType];
        if (!config) return 0;
        
        const currentLevel = this.prestigeUpgrades[upgradeType];
        if (currentLevel >= config.maxLevel) return 0;
        
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    }
    
    /**
     * Purchase prestige upgrade
     * @param {string} upgradeType - Type of upgrade to purchase
     * @returns {boolean} True if successful
     */
    purchasePrestigeUpgrade(upgradeType) {
        const cost = this.getPrestigeUpgradeCost(upgradeType);
        const config = this.prestigeUpgradeConfigs[upgradeType];
        
        if (!config || cost === 0 || this.prestigePoints < cost) {
            return false;
        }
        
        this.prestigePoints -= cost;
        this.prestigeUpgrades[upgradeType]++;
        
        return true;
    }
    
    /**
     * Get prestige multipliers for game systems
     * @returns {Object} Multipliers for various game aspects
     */
    getPrestigeMultipliers() {
        return {
            incomeMultiplier: 1 + (this.prestigeUpgrades.incomeMultiplier * this.prestigeUpgradeConfigs.incomeMultiplier.baseEffect),
            growthSpeedBoost: 1 + (this.prestigeUpgrades.growthSpeedBoost * this.prestigeUpgradeConfigs.growthSpeedBoost.baseEffect),
            resourceEfficiency: Math.max(0.1, 1 - (this.prestigeUpgrades.resourceEfficiency * this.prestigeUpgradeConfigs.resourceEfficiency.baseEffect)),
            megaHarvestChance: this.prestigeUpgrades.megaHarvest * this.prestigeUpgradeConfigs.megaHarvest.baseEffect,
            crystalMiningBoost: 1 + (this.prestigeUpgrades.crystalMining * this.prestigeUpgradeConfigs.crystalMining.baseEffect),
            fertilizerBoost: 1 + (this.prestigeUpgrades.fertilizerBoost * this.prestigeUpgradeConfigs.fertilizerBoost.baseEffect),
            afkBonus: 1 + (this.prestigeUpgrades.afkBonus * this.prestigeUpgradeConfigs.afkBonus.baseEffect),
            prestigeBoost: 1 + (this.prestigeUpgrades.prestigeBoost * this.prestigeUpgradeConfigs.prestigeBoost.baseEffect)
        };
    }
    
    /**
     * Get prestige upgrade display info
     * @param {string} upgradeType - Type of upgrade
     * @returns {Object} Display information
     */
    getPrestigeUpgradeDisplayInfo(upgradeType) {
        const config = this.prestigeUpgradeConfigs[upgradeType];
        if (!config) return null;
        
        const currentLevel = this.prestigeUpgrades[upgradeType];
        const cost = this.getPrestigeUpgradeCost(upgradeType);
        const canPurchase = cost > 0 && this.prestigePoints >= cost;
        const isMaxLevel = currentLevel >= config.maxLevel;
        
        let currentEffect;
        switch (upgradeType) {
            case 'incomeMultiplier':
            case 'growthSpeedBoost':
            case 'crystalMining':
            case 'fertilizerBoost':
            case 'afkBonus':
                currentEffect = `+${Math.round((currentLevel * config.baseEffect) * 100)}%`;
                break;
            case 'resourceEfficiency':
                currentEffect = `-${Math.round((currentLevel * config.baseEffect) * 100)}%`;
                break;
            case 'megaHarvest':
                currentEffect = `${Math.round((currentLevel * config.baseEffect) * 100)}% шанс`;
                break;
            case 'autoPlanter':
                currentEffect = currentLevel > 0 ? 'Активно' : 'Неактивно';
                break;
            case 'prestigeBoost':
                currentEffect = `+${Math.round((currentLevel * config.baseEffect) * 100)}%`;
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
     * Get all prestige upgrades display info
     * @returns {Array} Array of upgrade display info
     */
    getAllPrestigeUpgradesDisplayInfo() {
        return Object.keys(this.prestigeUpgradeConfigs).map(upgradeType =>
            this.getPrestigeUpgradeDisplayInfo(upgradeType)
        ).filter(info => info !== null);
    }
    
    /**
     * Serialize prestige data for saving
     * @returns {Object} Serialized prestige data
     */
    serialize() {
        return {
            prestigeLevel: this.prestigeLevel,
            prestigePoints: this.prestigePoints,
            totalPrestigePoints: this.totalPrestigePoints,
            prestigeUpgrades: { ...this.prestigeUpgrades }
        };
    }
    
    /**
     * Load prestige data from serialized state
     * @param {Object} data - Serialized prestige data
     */
    deserialize(data) {
        if (data) {
            this.prestigeLevel = data.prestigeLevel || 0;
            this.prestigePoints = data.prestigePoints || 0;
            this.totalPrestigePoints = data.totalPrestigePoints || 0;
            this.prestigeUpgrades = {
                incomeMultiplier: data.prestigeUpgrades?.incomeMultiplier || 0,
                growthSpeedBoost: data.prestigeUpgrades?.growthSpeedBoost || 0,
                resourceEfficiency: data.prestigeUpgrades?.resourceEfficiency || 0,
                autoPlanter: data.prestigeUpgrades?.autoPlanter || 0,
                megaHarvest: data.prestigeUpgrades?.megaHarvest || 0,
                crystalMining: data.prestigeUpgrades?.crystalMining || 0,
                fertilizerBoost: data.prestigeUpgrades?.fertilizerBoost || 0,
                afkBonus: data.prestigeUpgrades?.afkBonus || 0,
                prestigeBoost: data.prestigeUpgrades?.prestigeBoost || 0
            };
        }
    }
    
    /**
     * Reset prestige system (for testing)
     */
    reset() {
        this.prestigeLevel = 0;
        this.prestigePoints = 0;
        this.totalPrestigePoints = 0;
        this.prestigeUpgrades = {
            incomeMultiplier: 0,
            growthSpeedBoost: 0,
            resourceEfficiency: 0,
            autoPlanter: 0,
            megaHarvest: 0,
            crystalMining: 0,
            fertilizerBoost: 0,
            afkBonus: 0,
            prestigeBoost: 0
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrestigeSystem;
} else if (typeof window !== 'undefined') {
    window.PrestigeSystem = PrestigeSystem;
}