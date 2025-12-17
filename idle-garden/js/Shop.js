/**
 * Shop class - Manages shop display, purchase logic, and affordability checking
 * Handles plant type selection, cost validation, and purchase processing
 */
class Shop {
    /**
     * Create a new Shop instance
     * @param {ResourceManager} resourceManager - Resource manager instance
     * @param {HTMLElement} shopContainer - DOM element to render shop items
     */
    constructor(resourceManager, shopContainer = null, gameEngine = null) {
        this.resourceManager = resourceManager;
        this.shopContainer = shopContainer || document.getElementById('shop-items');
        this.gameEngine = gameEngine; // Reference to game engine for unlock checking
        this.selectedPlantType = null;
        this.shopItems = new Map(); // Store shop item elements by plant type
        
        // Import plant configuration
        if (typeof require !== 'undefined') {
            const { getAllPlantTypes, getPlantConfig } = require('./PlantConfig.js');
            this.getAllPlantTypes = getAllPlantTypes;
            this.getPlantConfig = getPlantConfig;
        } else if (typeof getAllPlantTypes !== 'undefined') {
            this.getAllPlantTypes = getAllPlantTypes;
            this.getPlantConfig = getPlantConfig;
        } else {
            // Fallback for testing
            this.getAllPlantTypes = () => ['carrot', 'tomato', 'corn'];
            this.getPlantConfig = (type) => {
                const configs = {
                    'carrot': { name: 'Carrot', icon: '🥕', cost: { coins: 5, seeds: 1, water: 1 }, income: 10, description: 'Fast-growing starter crop' },
                    'tomato': { name: 'Tomato', icon: '🍅', cost: { coins: 15, seeds: 2, water: 2 }, income: 20, description: 'Popular crop with good returns' },
                    'corn': { name: 'Corn', icon: '🌽', cost: { coins: 30, seeds: 3, water: 3 }, income: 35, description: 'Premium crop with excellent returns' }
                };
                return configs[type] || null;
            };
        }
        
        this.initializeShop();
    }
    
    /**
     * Initialize shop display with all available plant types
     */
    initializeShop() {
        if (!this.shopContainer) {
            console.warn('Контейнер магазина не найден');
            return;
        }
        
        this.shopContainer.innerHTML = '';
        
        const plantTypes = this.getAllPlantTypes();
        plantTypes.forEach(plantType => {
            // Check if plant is unlocked
            if (this.gameEngine && !this.gameEngine.isPlantUnlocked(plantType)) {
                return; // Skip locked plants
            }
            
            const plantConfig = this.getPlantConfig(plantType);
            if (plantConfig) {
                this.createShopItem(plantType, plantConfig);
            }
        });
        
        // Update affordability indicators
        this.updateAffordabilityDisplay();
    }
    
    /**
     * Create a shop item element for a plant type
     * @param {string} plantType - Plant type identifier
     * @param {Object} plantConfig - Plant configuration object
     */
    createShopItem(plantType, plantConfig) {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        shopItem.dataset.plantType = plantType;
        
        // Plant icon and name
        const header = document.createElement('div');
        header.className = 'shop-item-header';
        header.innerHTML = `
            <span class="shop-item-icon">${plantConfig.icon}</span>
            <span class="shop-item-name">${plantConfig.name}</span>
        `;
        
        // Plant description
        const description = document.createElement('div');
        description.className = 'shop-item-description';
        description.textContent = plantConfig.description;
        
        // Cost breakdown
        const costContainer = document.createElement('div');
        costContainer.className = 'shop-item-cost';
        costContainer.innerHTML = `
            <div class="cost-label">Стоимость:</div>
            <div class="cost-breakdown">
                <span class="cost-item">🪙 ${plantConfig.cost.coins}</span>
                <span class="cost-item">🌰 ${plantConfig.cost.seeds}</span>
                <span class="cost-item">💧 ${plantConfig.cost.water}</span>
            </div>
        `;
        
        // Income information
        const incomeContainer = document.createElement('div');
        incomeContainer.className = 'shop-item-income';
        
        // Calculate income per second (base rate without upgrades)
        const growthTimeInSeconds = plantConfig.growthTime / 1000;
        const incomePerSecond = plantConfig.income / growthTimeInSeconds;
        
        incomeContainer.innerHTML = `
            <div class="income-label">Доход за цикл:</div>
            <div class="income-value">🪙 ${plantConfig.income}</div>
            <div class="income-per-second">💰 ${incomePerSecond.toFixed(1)}/сек</div>
        `;
        
        // Purchase button
        const purchaseButton = document.createElement('button');
        purchaseButton.className = 'shop-purchase-btn';
        purchaseButton.textContent = 'Выбрать';
        purchaseButton.addEventListener('click', () => this.selectPlantType(plantType));
        
        // Affordability indicator
        const affordabilityIndicator = document.createElement('div');
        affordabilityIndicator.className = 'affordability-indicator';
        
        // Assemble shop item
        shopItem.appendChild(header);
        shopItem.appendChild(description);
        shopItem.appendChild(costContainer);
        shopItem.appendChild(incomeContainer);
        shopItem.appendChild(affordabilityIndicator);
        shopItem.appendChild(purchaseButton);
        
        this.shopContainer.appendChild(shopItem);
        this.shopItems.set(plantType, shopItem);
    }
    
    /**
     * Select a plant type for planting
     * @param {string} plantType - Plant type to select
     */
    selectPlantType(plantType) {
        const plantConfig = this.getPlantConfig(plantType);
        if (!plantConfig) {
            this.showNotification('Invalid plant type', 'error');
            return;
        }
        
        // Check affordability with bankruptcy protection
        if (!this.resourceManager.canAffordSafely(plantConfig.cost, true)) {
            if (this.resourceManager.canAfford(plantConfig.cost)) {
                this.showNotification('Невозможно купить - нужно сохранить ресурсы для базовых растений', 'warning');
            } else {
                this.showNotification('Недостаточно ресурсов для этого растения', 'error');
            }
            return;
        }
        
        // Update selection
        this.selectedPlantType = plantType;
        this.updateSelectionDisplay();
        this.showNotification(`Выбрано ${plantConfig.name} для посадки`, 'success');
    }
    
    /**
     * Attempt to purchase the selected plant type
     * @returns {Object|null} Purchase result with success status and plant type, or null if failed
     */
    purchaseSelectedPlant() {
        if (!this.selectedPlantType) {
            this.showNotification('Тип растения не выбран', 'error');
            return null;
        }
        
        const plantConfig = this.getPlantConfig(this.selectedPlantType);
        if (!plantConfig) {
            this.showNotification('Неверная конфигурация растения', 'error');
            return null;
        }
        
        // Attempt to deduct resources safely
        const success = this.resourceManager.deductResourcesSafely(plantConfig.cost, true);
        
        if (success) {
            const result = {
                success: true,
                plantType: this.selectedPlantType,
                cost: plantConfig.cost
            };
            
            this.showNotification(`Куплено ${plantConfig.name}!`, 'success');
            this.updateAffordabilityDisplay();
            
            return result;
        } else {
            if (this.resourceManager.canAfford(plantConfig.cost)) {
                this.showNotification('Невозможно купить - нужно сохранить ресурсы для базовых растений', 'warning');
            } else {
                this.showNotification('Недостаточно ресурсов', 'error');
            }
            return { success: false, plantType: this.selectedPlantType };
        }
    }
    
    /**
     * Check if a specific plant type is affordable
     * @param {string} plantType - Plant type to check
     * @returns {boolean} True if affordable, false otherwise
     */
    isAffordable(plantType) {
        const plantConfig = this.getPlantConfig(plantType);
        if (!plantConfig) {
            return false;
        }
        
        return this.resourceManager.canAffordSafely(plantConfig.cost, true);
    }
    
    /**
     * Update affordability display for all shop items
     */
    updateAffordabilityDisplay() {
        this.shopItems.forEach((shopItem, plantType) => {
            const isAffordable = this.isAffordable(plantType);
            const affordabilityIndicator = shopItem.querySelector('.affordability-indicator');
            const purchaseButton = shopItem.querySelector('.shop-purchase-btn');
            
            if (isAffordable) {
                shopItem.classList.remove('unaffordable');
                shopItem.classList.add('affordable');
                affordabilityIndicator.textContent = '✅ Доступно';
                affordabilityIndicator.className = 'affordability-indicator affordable';
                purchaseButton.disabled = false;
            } else {
                shopItem.classList.remove('affordable');
                shopItem.classList.add('unaffordable');
                affordabilityIndicator.textContent = '❌ Слишком дорого';
                affordabilityIndicator.className = 'affordability-indicator unaffordable';
                purchaseButton.disabled = true;
            }
        });
    }
    
    /**
     * Update visual display of selected plant type
     */
    updateSelectionDisplay() {
        this.shopItems.forEach((shopItem, plantType) => {
            if (plantType === this.selectedPlantType) {
                shopItem.classList.add('selected');
            } else {
                shopItem.classList.remove('selected');
            }
        });
    }
    
    /**
     * Get currently selected plant type
     * @returns {string|null} Selected plant type or null if none selected
     */
    getSelectedPlantType() {
        return this.selectedPlantType;
    }
    
    /**
     * Clear plant type selection
     */
    clearSelection() {
        this.selectedPlantType = null;
        this.updateSelectionDisplay();
    }
    
    /**
     * Get plant configuration for display purposes
     * @param {string} plantType - Plant type identifier
     * @returns {Object|null} Plant configuration with display information
     */
    getPlantDisplayInfo(plantType) {
        const config = this.getPlantConfig(plantType);
        if (!config) {
            return null;
        }
        
        // Calculate income per second (base rate without upgrades)
        const growthTimeInSeconds = config.growthTime / 1000;
        const incomePerSecond = config.income / growthTimeInSeconds;
        
        return {
            type: plantType,
            name: config.name,
            icon: config.icon,
            cost: config.cost,
            income: config.income,
            incomePerSecond: incomePerSecond,
            description: config.description,
            affordable: this.isAffordable(plantType)
        };
    }
    
    /**
     * Get all plant types sorted by affordability and cost
     * @returns {Array} Array of plant display information objects
     */
    getAllPlantsDisplayInfo() {
        const plantTypes = this.getAllPlantTypes();
        return plantTypes
            .map(plantType => this.getPlantDisplayInfo(plantType))
            .filter(info => info !== null)
            .sort((a, b) => {
                // Sort by affordability first, then by total cost
                if (a.affordable !== b.affordable) {
                    return b.affordable - a.affordable; // Affordable first
                }
                
                const totalCostA = a.cost.coins + a.cost.seeds + a.cost.water;
                const totalCostB = b.cost.coins + b.cost.seeds + b.cost.water;
                return totalCostA - totalCostB; // Cheaper first
            });
    }
    
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Dispatch event for main game to handle
        if (typeof document !== 'undefined' && typeof CustomEvent !== 'undefined') {
            try {
                const event = new CustomEvent('shop-notification', {
                    detail: { message, type }
                });
                document.dispatchEvent(event);
            } catch (error) {
                // Fallback to console in test environment
                if (typeof console !== 'undefined') {
                    console.log(`[SHOP ${type.toUpperCase()}] ${message}`);
                }
            }
        } else {
            // Fallback for testing environment
            if (typeof console !== 'undefined') {
                console.log(`[SHOP ${type.toUpperCase()}] ${message}`);
            }
        }
    }
    
    /**
     * Refresh shop display (useful after resource changes)
     */
    refresh() {
        this.updateAffordabilityDisplay();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shop;
} else if (typeof window !== 'undefined') {
    window.Shop = Shop;
}