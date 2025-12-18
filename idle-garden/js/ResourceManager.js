/**
 * ResourceManager class - Manages game resources (coins, seeds, water)
 * Handles resource tracking, validation, transactions, and display updates
 */
class ResourceManager {
    /**
     * Create a new ResourceManager instance
     * @param {Object} initialResources - Starting resource amounts
     * @param {UIFeedback} uiFeedback - UI feedback system (optional)
     */
    constructor(initialResources = {}, uiFeedback = null) {
        this.resources = {
            coins: initialResources.coins !== undefined ? initialResources.coins : 50,
            seeds: initialResources.seeds !== undefined ? initialResources.seeds : 5,
            water: initialResources.water !== undefined ? initialResources.water : 10,
            gems: initialResources.gems !== undefined ? initialResources.gems : 0,
            fertilizer: initialResources.fertilizer !== undefined ? initialResources.fertilizer : 0,
            prestigePoints: initialResources.prestigePoints !== undefined ? initialResources.prestigePoints : 0
        };
        
        // UI feedback system
        this.uiFeedback = uiFeedback;
        
        // Animation and display elements
        this.displayElements = {
            coins: null,
            seeds: null,
            water: null,
            gems: null,
            fertilizer: null,
            prestigePoints: null
        };
        
        // Track displayed values for smooth animations
        this.displayedValues = {
            coins: this.resources.coins,
            seeds: this.resources.seeds,
            water: this.resources.water,
            gems: this.resources.gems,
            fertilizer: this.resources.fertilizer,
            prestigePoints: this.resources.prestigePoints
        };
        
        this.initializeDisplayElements();
    }
    
    /**
     * Initialize DOM elements for resource display
     */
    initializeDisplayElements() {
        this.displayElements.coins = document.getElementById('coins-display');
        this.displayElements.seeds = document.getElementById('seeds-display');
        this.displayElements.water = document.getElementById('water-display');
        this.displayElements.gems = document.getElementById('gems-display');
        this.displayElements.fertilizer = document.getElementById('fertilizer-display');
        this.displayElements.prestigePoints = document.getElementById('prestige-points-display');
        
        // Update display immediately
        this.updateDisplay();
    }
    
    /**
     * Get current amount of a specific resource
     * @param {string} resourceType - Type of resource (coins, seeds, water)
     * @returns {number} Current amount of the resource
     */
    getResource(resourceType) {
        if (!(resourceType in this.resources)) {
            throw new Error(`Invalid resource type: ${resourceType}`);
        }
        return this.resources[resourceType];
    }
    
    /**
     * Get all current resources
     * @returns {Object} Object containing all resource amounts
     */
    getAllResources() {
        return { ...this.resources };
    }
    
    /**
     * Add resources to the player's inventory
     * @param {string} resourceType - Type of resource to add
     * @param {number} amount - Amount to add (must be positive)
     * @returns {boolean} True if successful, false if invalid
     */
    addResource(resourceType, amount) {
        if (!(resourceType in this.resources)) {
            throw new Error(`Invalid resource type: ${resourceType}`);
        }
        
        if (amount < 0) {
            throw new Error('Amount must be positive for adding resources');
        }
        
        this.resources[resourceType] += amount;
        this.updateDisplay(resourceType, amount);
        return true;
    }
    
    /**
     * Add resources silently without animation (for continuous income)
     * @param {string} resourceType - Type of resource to add
     * @param {number} amount - Amount to add (must be positive)
     * @returns {boolean} True if successful, false if invalid
     */
    addResourceSilently(resourceType, amount) {
        if (!(resourceType in this.resources)) {
            throw new Error(`Invalid resource type: ${resourceType}`);
        }
        
        if (amount < 0) {
            throw new Error('Amount must be positive for adding resources');
        }
        
        this.resources[resourceType] += amount;
        this.updateDisplaySilently(resourceType);
        return true;
    }
    
    /**
     * Add multiple resources at once
     * @param {Object} resourceAmounts - Object with resource types and amounts
     * @returns {boolean} True if all additions successful
     */
    addResources(resourceAmounts) {
        // Validate all resources first
        for (const [resourceType, amount] of Object.entries(resourceAmounts)) {
            if (!(resourceType in this.resources)) {
                throw new Error(`Invalid resource type: ${resourceType}`);
            }
            if (amount < 0) {
                throw new Error(`Amount must be positive for ${resourceType}`);
            }
        }
        
        // Add all resources
        for (const [resourceType, amount] of Object.entries(resourceAmounts)) {
            this.resources[resourceType] += amount;
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Deduct resources from the player's inventory
     * @param {string} resourceType - Type of resource to deduct
     * @param {number} amount - Amount to deduct (must be positive)
     * @returns {boolean} True if successful, false if insufficient resources
     */
    deductResource(resourceType, amount) {
        if (!(resourceType in this.resources)) {
            throw new Error(`Invalid resource type: ${resourceType}`);
        }
        
        if (amount < 0) {
            throw new Error('Amount must be positive for deducting resources');
        }
        
        if (this.resources[resourceType] < amount) {
            return false; // Insufficient resources
        }
        
        this.resources[resourceType] -= amount;
        this.updateDisplay(resourceType, -amount);
        return true;
    }
    
    /**
     * Deduct multiple resources at once (atomic transaction)
     * @param {Object} resourceCosts - Object with resource types and amounts to deduct
     * @returns {boolean} True if successful, false if insufficient resources
     */
    deductResources(resourceCosts) {
        // First, validate all resources are available
        if (!this.canAfford(resourceCosts)) {
            return false;
        }
        
        // Deduct all resources
        for (const [resourceType, amount] of Object.entries(resourceCosts)) {
            this.resources[resourceType] -= amount;
        }
        
        this.updateDisplay();
        return true;
    }

    /**
     * Deduct multiple resources at once with bankruptcy protection
     * @param {Object} resourceCosts - Object with resource types and amounts to deduct
     * @param {boolean} preventBankruptcy - If true, ensures player can still afford cheapest plant after purchase
     * @returns {boolean} True if successful, false if insufficient resources
     */
    deductResourcesSafely(resourceCosts, preventBankruptcy = true) {
        // First, validate all resources are available with safety check
        if (!this.canAffordSafely(resourceCosts, preventBankruptcy)) {
            return false;
        }
        
        // Deduct all resources
        for (const [resourceType, amount] of Object.entries(resourceCosts)) {
            this.resources[resourceType] -= amount;
        }
        
        this.updateDisplay();
        return true;
    }
    
    /**
     * Check if player can afford a cost
     * @param {Object} cost - Object with resource types and required amounts
     * @returns {boolean} True if player has sufficient resources
     */
    canAfford(cost) {
        for (const [resourceType, amount] of Object.entries(cost)) {
            if (!(resourceType in this.resources)) {
                throw new Error(`Invalid resource type: ${resourceType}`);
            }
            if (this.resources[resourceType] < amount) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if player can afford a cost while keeping enough resources for the cheapest plant
     * @param {Object} cost - Object with resource types and required amounts
     * @param {boolean} preventBankruptcy - If true, ensures player can still afford cheapest plant after purchase
     * @returns {boolean} True if player has sufficient resources
     */
    canAffordSafely(cost, preventBankruptcy = true) {
        if (!preventBankruptcy) {
            return this.canAfford(cost);
        }

        // For expensive plants (>1000 coins), skip bankruptcy protection
        if (cost.coins && cost.coins > 1000) {
            return this.canAfford(cost);
        }

        // Get cheapest plant cost (using global function)
        let cheapestPlantCost = null;
        try {
            if (typeof window !== 'undefined' && window.getCheapestPlant) {
                const cheapestPlant = window.getCheapestPlant();
                cheapestPlantCost = cheapestPlant ? cheapestPlant.cost : null;
            }
        } catch (error) {
            console.warn('Could not get cheapest plant cost:', error);
            // Fallback to basic affordability check
            return this.canAfford(cost);
        }

        if (!cheapestPlantCost) {
            // If we can't determine cheapest plant, use basic check
            return this.canAfford(cost);
        }

        // Check if we can afford both the requested cost AND the cheapest plant
        // But only if we're not buying the cheapest plant itself
        const isBuyingCheapestPlant = JSON.stringify(cost) === JSON.stringify(cheapestPlantCost);
        
        for (const [resourceType, amount] of Object.entries(cost)) {
            if (!(resourceType in this.resources)) {
                throw new Error(`Invalid resource type: ${resourceType}`);
            }
            
            const requiredAmount = amount;
            // Only reserve resources if we're not buying the cheapest plant
            const reserveAmount = isBuyingCheapestPlant ? 0 : (cheapestPlantCost[resourceType] || 0);
            const totalRequired = requiredAmount + reserveAmount;
            
            if (this.resources[resourceType] < totalRequired) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Validate resource amounts are non-negative
     * @returns {boolean} True if all resources are valid
     */
    validateResources() {
        for (const [resourceType, amount] of Object.entries(this.resources)) {
            if (amount < 0) {
                console.warn(`Negative resource detected: ${resourceType} = ${amount}`);
                this.resources[resourceType] = 0; // Fix negative resources
            }
        }
        return true;
    }
    
    /**
     * Update resource display in the UI
     * @param {string} resourceType - Specific resource to animate (optional)
     * @param {number} changeAmount - Amount that changed for animation (optional)
     */
    updateDisplay(resourceType = null, changeAmount = null) {
        if (resourceType && changeAmount !== null) {
            // Animate specific resource change
            this.animateResourceChange(resourceType, changeAmount);
        } else {
            // Update all displays
            for (const [type, element] of Object.entries(this.displayElements)) {
                if (element && this.resources[type] !== undefined) {
                    element.textContent = this.resources[type].toLocaleString();
                    // Update tracked value
                    this.displayedValues[type] = this.resources[type];
                }
            }
        }
        
        // Update crystal upgrades UI when gems change
        if ((resourceType === 'gems' || resourceType === null) && 
            typeof window !== 'undefined' && 
            typeof window.initializeCrystalUpgradesUI === 'function') {
            try {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    window.initializeCrystalUpgradesUI();
                }, 10);
            } catch (error) {
                console.warn('Failed to update crystal upgrades UI:', error);
            }
        }
    }
    
    /**
     * Update resource display silently without animation
     * @param {string} resourceType - Type of resource to update
     */
    updateDisplaySilently(resourceType) {
        const element = this.displayElements[resourceType];
        if (element && this.resources[resourceType] !== undefined) {
            element.textContent = this.resources[resourceType].toLocaleString();
            // Update tracked value
            this.displayedValues[resourceType] = this.resources[resourceType];
        }
        
        // Update crystal upgrades UI when gems change
        if (resourceType === 'gems' && 
            typeof window !== 'undefined' && 
            typeof window.initializeCrystalUpgradesUI === 'function') {
            try {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    window.initializeCrystalUpgradesUI();
                }, 10);
            } catch (error) {
                console.warn('Failed to update crystal upgrades UI:', error);
            }
        }
    }
    
    /**
     * Set UI feedback system
     * @param {UIFeedback} uiFeedback - UI feedback system instance
     */
    setUIFeedback(uiFeedback) {
        this.uiFeedback = uiFeedback;
    }
    
    /**
     * Animate resource change with visual feedback
     * @param {string} resourceType - Type of resource that changed
     * @param {number} changeAmount - Amount that changed (positive or negative)
     */
    animateResourceChange(resourceType, changeAmount) {
        const element = this.displayElements[resourceType];
        if (!element) return;
        
        // Use the tracked displayed value as the starting point
        const oldValue = this.displayedValues[resourceType];
        const newValue = this.resources[resourceType];
        
        // Update tracked value
        this.displayedValues[resourceType] = newValue;
        
        // Use UIFeedback system if available
        if (this.uiFeedback) {
            this.uiFeedback.animateResourceChange(element, oldValue, newValue, resourceType);
        } else {
            // Fallback to simple update
            element.textContent = newValue.toLocaleString();
            
            // Add animation class based on change type
            const animationClass = changeAmount > 0 ? 'resource-increase' : 'resource-decrease';
            element.classList.add(animationClass);
            
            // Create floating change indicator
            this.createChangeIndicator(element, changeAmount);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, 600);
        }
    }
    
    /**
     * Create floating change indicator for resource changes
     * @param {HTMLElement} element - Element to attach indicator to
     * @param {number} changeAmount - Amount that changed
     */
    createChangeIndicator(element, changeAmount) {
        const indicator = document.createElement('div');
        indicator.className = 'resource-change-indicator';
        indicator.textContent = (changeAmount > 0 ? '+' : '') + changeAmount.toLocaleString();
        
        // Position relative to the resource element
        const rect = element.getBoundingClientRect();
        indicator.style.position = 'fixed';
        indicator.style.left = rect.right + 'px';
        indicator.style.top = rect.top + 'px';
        indicator.style.color = changeAmount > 0 ? '#4CAF50' : '#f44336';
        indicator.style.fontWeight = 'bold';
        indicator.style.fontSize = '14px';
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '1000';
        indicator.style.transition = 'all 1s ease-out';
        
        document.body.appendChild(indicator);
        
        // Animate the indicator
        setTimeout(() => {
            indicator.style.transform = 'translateY(-30px)';
            indicator.style.opacity = '0';
        }, 100);
        
        // Remove indicator after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1100);
    }
    
    /**
     * Reset resources to initial values
     * @param {Object} initialResources - New starting resource amounts
     */
    reset(initialResources = {}) {
        this.resources = {
            coins: initialResources.coins !== undefined ? initialResources.coins : 100,
            seeds: initialResources.seeds !== undefined ? initialResources.seeds : 20,
            water: initialResources.water !== undefined ? initialResources.water : 30,
            gems: initialResources.gems !== undefined ? initialResources.gems : 0,
            fertilizer: initialResources.fertilizer !== undefined ? initialResources.fertilizer : 0,
            prestigePoints: initialResources.prestigePoints !== undefined ? initialResources.prestigePoints : 0
        };
        
        // Reset tracked displayed values
        this.displayedValues = {
            coins: this.resources.coins,
            seeds: this.resources.seeds,
            water: this.resources.water,
            gems: this.resources.gems,
            fertilizer: this.resources.fertilizer,
            prestigePoints: this.resources.prestigePoints
        };
        
        this.updateDisplay();
    }
    
    /**
     * Serialize resource data for saving
     * @returns {Object} Serialized resource data
     */
    serialize() {
        return {
            resources: { ...this.resources }
        };
    }
    
    /**
     * Load resource data from serialized state
     * @param {Object} data - Serialized resource data
     */
    deserialize(data) {
        if (data && data.resources) {
            this.resources = { ...data.resources };
            this.validateResources();
            
            // Update tracked displayed values
            this.displayedValues = {
                coins: this.resources.coins,
                seeds: this.resources.seeds,
                water: this.resources.water,
                gems: this.resources.gems,
                fertilizer: this.resources.fertilizer,
                prestigePoints: this.resources.prestigePoints || 0
            };
            
            this.updateDisplay();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceManager;
} else if (typeof window !== 'undefined') {
    window.ResourceManager = ResourceManager;
}