/**
 * Plant class - Manages individual plant lifecycle, growth, and income generation
 * Handles growth progress tracking, income calculation, and serialization
 */
class Plant {
    /**
     * Create a new Plant instance
     * @param {string} type - Plant type identifier
     * @param {number} level - Plant upgrade level (default: 1)
     * @param {number} growthProgress - Current growth progress (0-1, default: 0)
     */
    constructor(type, level = 1, growthProgress = 0) {
        this.type = type;
        this.level = level;
        this.planted = true;
        this.growthProgress = growthProgress;
        this.lastUpdate = Date.now();
        this.totalEarned = 0;
        
        // Validate plant type exists in configuration
        if (!this.getConfig()) {
            throw new Error(`Invalid plant type: ${type}`);
        }
    }
    
    /**
     * Get plant configuration from PLANT_CONFIGS
     * @returns {Object|null} Plant configuration object or null if not found
     */
    getConfig() {
        // Import plant configuration
        if (typeof require !== 'undefined') {
            const { getPlantConfig } = require('./PlantConfig.js');
            return getPlantConfig(this.type);
        } else if (typeof getPlantConfig !== 'undefined') {
            return getPlantConfig(this.type);
        }
        
        // Fallback for testing or when config is not available
        const basicConfigs = {
            'carrot': { growthTime: 5000, income: 10, cost: { coins: 5, seeds: 1, water: 1 } },
            'tomato': { growthTime: 8000, income: 20, cost: { coins: 15, seeds: 2, water: 2 } },
            'corn': { growthTime: 12000, income: 35, cost: { coins: 30, seeds: 3, water: 3 } }
        };
        return basicConfigs[this.type] || null;
    }
    
    /**
     * Update plant growth and generate income
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     * @param {Object} upgrades - Current upgrade multipliers
     * @param {Object} prestigeMultipliers - Prestige multipliers
     * @param {number} fertilizerAmount - Current fertilizer amount
     * @returns {number} Coins earned this update (0 if not ready to harvest)
     */
    update(deltaTime, upgrades = {}, prestigeMultipliers = {}, fertilizerAmount = 0) {
        if (!this.planted) {
            return 0;
        }
        
        const config = this.getConfig();
        if (!config) {
            return 0;
        }
        
        // Apply growth speed upgrades and fertilizer boost
        const growthSpeedMultiplier = upgrades.growthSpeed || 1;
        const prestigeGrowthBoost = prestigeMultipliers.growthSpeedBoost || 1;
        const fertilizerBoost = 1 + (fertilizerAmount * 0.01); // 1% per fertilizer
        
        const totalGrowthMultiplier = growthSpeedMultiplier * prestigeGrowthBoost * fertilizerBoost;
        const effectiveDeltaTime = deltaTime * totalGrowthMultiplier;
        
        // Calculate growth progress
        const growthIncrement = effectiveDeltaTime / config.growthTime;
        this.growthProgress += growthIncrement;
        
        let coinsEarned = 0;
        
        // Check if plant completed growth cycle
        if (this.growthProgress >= 1.0) {
            // Calculate income with all multipliers
            const incomeMultiplier = upgrades.incomeBoost || 1;
            const prestigeIncomeMultiplier = prestigeMultipliers.incomeMultiplier || 1;
            
            let baseIncome = config.income * incomeMultiplier * prestigeIncomeMultiplier;
            
            // Check for mega harvest chance (prestige upgrade)
            const megaHarvestChance = prestigeMultipliers.megaHarvestChance || 0;
            if (Math.random() < megaHarvestChance) {
                baseIncome *= 3; // Triple income on mega harvest
            }
            
            coinsEarned = baseIncome;
            this.totalEarned += coinsEarned;
            
            // Restart growth cycle immediately for continuity
            // Carry over any excess progress to maintain continuity
            this.growthProgress = this.growthProgress - 1.0;
        }
        
        this.lastUpdate = Date.now();
        return coinsEarned;
    }
    
    /**
     * Get income per second for this plant
     * @param {Object} upgrades - Current upgrade multipliers
     * @returns {number} Income per second
     */
    getIncomePerSecond(upgrades = {}) {
        const config = this.getConfig();
        if (!config || !this.planted) {
            return 0;
        }
        
        const growthSpeedMultiplier = upgrades.growthSpeed || 1;
        const incomeMultiplier = upgrades.incomeBoost || 1;
        
        // Income per second = (income per cycle * income multiplier) / (growth time in seconds / growth speed multiplier)
        const growthTimeInSeconds = config.growthTime / 1000;
        const effectiveGrowthTime = growthTimeInSeconds / growthSpeedMultiplier;
        
        return (config.income * incomeMultiplier) / effectiveGrowthTime;
    }
    
    /**
     * Get current growth progress as percentage
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercent() {
        return Math.min(this.growthProgress * 100, 100);
    }
    
    /**
     * Serialize plant data for saving
     * @returns {Object} Serialized plant data
     */
    serialize() {
        return {
            type: this.type,
            level: this.level,
            planted: this.planted,
            growthProgress: this.growthProgress,
            lastUpdate: this.lastUpdate,
            totalEarned: this.totalEarned
        };
    }
    
    /**
     * Create Plant instance from serialized data
     * @param {Object} data - Serialized plant data
     * @returns {Plant} New Plant instance
     */
    static deserialize(data) {
        const plant = new Plant(data.type, data.level, data.growthProgress);
        plant.planted = data.planted;
        plant.lastUpdate = data.lastUpdate;
        plant.totalEarned = data.totalEarned || 0;
        return plant;
    }
    
    /**
     * Calculate offline progress for this plant
     * @param {number} offlineTime - Time offline in milliseconds
     * @param {Object} upgrades - Current upgrade multipliers
     * @returns {number} Coins earned while offline
     */
    calculateOfflineProgress(offlineTime, upgrades = {}) {
        if (!this.planted) {
            return 0;
        }
        
        const config = this.getConfig();
        if (!config) {
            return 0;
        }
        
        const growthSpeedMultiplier = upgrades.growthSpeed || 1;
        const incomeMultiplier = upgrades.incomeBoost || 1;
        
        // Calculate how many complete cycles occurred during offline time
        const effectiveGrowthTime = config.growthTime / growthSpeedMultiplier;
        const remainingGrowthTime = (1 - this.growthProgress) * effectiveGrowthTime;
        
        let totalOfflineIncome = 0;
        let remainingOfflineTime = offlineTime;
        
        // First, complete current cycle if enough time passed
        if (remainingOfflineTime >= remainingGrowthTime) {
            totalOfflineIncome += config.income * incomeMultiplier;
            remainingOfflineTime -= remainingGrowthTime;
            
            // Calculate complete cycles
            const completeCycles = Math.floor(remainingOfflineTime / effectiveGrowthTime);
            totalOfflineIncome += completeCycles * config.income * incomeMultiplier;
            
            // Update growth progress for partial remaining cycle
            const remainingCycleTime = remainingOfflineTime % effectiveGrowthTime;
            this.growthProgress = remainingCycleTime / effectiveGrowthTime;
        } else {
            // Not enough time to complete current cycle
            this.growthProgress += remainingOfflineTime / effectiveGrowthTime;
        }
        
        this.totalEarned += totalOfflineIncome;
        return totalOfflineIncome;
    }

    /**
     * Get the sell price for this plant (50% coins, 75% seeds and water)
     * @returns {Object} Sell price with coins, seeds, water
     */
    getSellPrice() {
        const config = this.getConfig();
        if (!config) {
            return { coins: 0, seeds: 0, water: 0 };
        }

        return {
            coins: Math.floor(config.cost.coins * 0.5),  // 50% coins back
            seeds: Math.max(1, Math.floor(config.cost.seeds * 0.75)),  // 75% seeds back, minimum 1
            water: Math.max(1, Math.floor(config.cost.water * 0.75))   // 75% water back, minimum 1
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Plant;
} else if (typeof window !== 'undefined') {
    window.Plant = Plant;
}