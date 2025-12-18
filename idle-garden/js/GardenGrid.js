/**
 * GardenGrid class - Manages garden UI, plant slots, and visual feedback
 * Handles garden slot rendering, plant placement, and progress display
 */
class GardenGrid {
    /**
     * Create a new GardenGrid instance
     * @param {string} containerId - ID of the garden grid container element
     * @param {number} rows - Number of rows in the garden grid
     * @param {number} cols - Number of columns in the garden grid
     */
    constructor(containerId, rows = 3, cols = 4) {
        this.containerId = containerId;
        this.rows = rows;
        this.cols = cols;
        this.totalSlots = rows * cols;
        this.plants = new Array(this.totalSlots).fill(null);
        this.selectedPlantType = null;
        this.onPlantPlaced = null; // Callback for when a plant is placed
        this.onSlotClicked = null; // Callback for slot clicks
        this.onPlantHarvested = null; // Callback for when a plant is harvested
        
        this.initializeGrid();
        this.setupEventListeners();
    }
    
    /**
     * Initialize the garden grid UI
     */
    initializeGrid() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Garden grid container not found: ${this.containerId}`);
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Set up CSS grid
        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        
        // Create garden slots
        for (let i = 0; i < this.totalSlots; i++) {
            const slot = this.createGardenSlot(i);
            container.appendChild(slot);
        }
    }
    
    /**
     * Create a single garden slot element
     * @param {number} slotIndex - Index of the slot
     * @returns {HTMLElement} Garden slot element
     */
    createGardenSlot(slotIndex) {
        const slot = document.createElement('div');
        slot.className = 'garden-slot';
        slot.dataset.slotId = slotIndex;
        
        // Add empty slot indicator
        const emptyIndicator = document.createElement('span');
        emptyIndicator.className = 'empty-indicator';
        emptyIndicator.textContent = '+';
        emptyIndicator.style.cssText = 'color: #ccc; font-size: 1.5rem;';
        slot.appendChild(emptyIndicator);
        
        return slot;
    }
    
    /**
     * Set up event listeners for garden slots
     */
    setupEventListeners() {
        const container = document.getElementById(this.containerId);
        
        container.addEventListener('click', (event) => {
            const slot = event.target.closest('.garden-slot');
            if (!slot) return;
            
            const slotIndex = parseInt(slot.dataset.slotId);
            this.handleSlotClick(slotIndex);
        });
    }
    
    /**
     * Handle garden slot click
     * @param {number} slotIndex - Index of clicked slot
     */
    handleSlotClick(slotIndex) {
        // Call external callback if provided
        if (this.onSlotClicked) {
            this.onSlotClicked(slotIndex, this.plants[slotIndex]);
        }
        
        // If slot is empty and we have a selected plant type, try to place it
        if (!this.plants[slotIndex] && this.selectedPlantType) {
            this.attemptPlantPlacement(slotIndex);
        }
    }
    
    /**
     * Attempt to place a plant in the specified slot
     * @param {number} slotIndex - Index of slot to place plant in
     */
    attemptPlantPlacement(slotIndex) {
        if (this.plants[slotIndex]) {
            console.warn(`Слот ${slotIndex} уже занят`);
            return false;
        }
        
        // Call placement callback if provided
        if (this.onPlantPlaced) {
            const success = this.onPlantPlaced(slotIndex, this.selectedPlantType);
            if (success) {
                // Plant placement will be handled by the callback
                // which should call placePlant() if successful
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Place a plant in the specified slot
     * @param {number} slotIndex - Index of slot to place plant in
     * @param {Plant} plant - Plant instance to place
     */
    placePlant(slotIndex, plant) {
        if (slotIndex < 0 || slotIndex >= this.totalSlots) {
            throw new Error(`Invalid slot index: ${slotIndex}`);
        }
        
        if (this.plants[slotIndex]) {
            throw new Error(`Slot ${slotIndex} is already occupied`);
        }
        
        this.plants[slotIndex] = plant;
        this.updateSlotDisplay(slotIndex);
    }
    
    /**
     * Remove a plant from the specified slot
     * @param {number} slotIndex - Index of slot to remove plant from
     */
    removePlant(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.totalSlots) {
            throw new Error(`Invalid slot index: ${slotIndex}`);
        }
        
        this.plants[slotIndex] = null;
        this.updateSlotDisplay(slotIndex);
    }

    /**
     * Sell a plant from the specified slot and return resources
     * @param {number} slotIndex - Index of slot to sell plant from
     * @returns {Object|null} Sell price object or null if no plant
     */
    sellPlant(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.totalSlots) {
            throw new Error(`Invalid slot index: ${slotIndex}`);
        }

        const plant = this.plants[slotIndex];
        if (!plant) {
            return null; // No plant to sell
        }

        // Get sell price before removing plant
        const sellPrice = plant.getSellPrice();
        
        // Remove plant from slot
        this.plants[slotIndex] = null;
        this.updateSlotDisplay(slotIndex);

        return sellPrice;
    }
    
    /**
     * Update the visual display of a garden slot
     * @param {number} slotIndex - Index of slot to update
     */
    updateSlotDisplay(slotIndex) {
        const container = document.getElementById(this.containerId);
        const slot = container.querySelector(`[data-slot-id="${slotIndex}"]`);
        
        if (!slot) {
            console.error(`Элемент слота не найден для индекса: ${slotIndex}`);
            return;
        }
        
        const plant = this.plants[slotIndex];
        
        if (plant) {
            // Plant is present - show plant icon and progress
            slot.className = 'garden-slot occupied';
            slot.innerHTML = this.createPlantDisplay(plant);
        } else {
            // Slot is empty - show empty indicator
            slot.className = 'garden-slot';
            slot.innerHTML = '<span class="empty-indicator" style="color: #ccc; font-size: 1.5rem;">+</span>';
        }
    }
    
    /**
     * Create plant display HTML for a slot
     * @param {Plant} plant - Plant instance to display
     * @returns {string} HTML string for plant display
     */
    createPlantDisplay(plant) {
        const config = plant.getConfig();
        if (!config) {
            return '<span style="color: red;">❌</span>';
        }
        
        const progressPercent = plant.getProgressPercent();
        const sellPrice = plant.getSellPrice();
        
        return `
            <div class="plant-display" oncontextmenu="sellPlantFromSlot(this.querySelector('.sell-plant-btn')); return false;" title="Right-click to sell quickly!">
                <div class="plant-content">
                    <span class="plant-icon">${config.icon}</span>
                    <div class="plant-name">${config.name}</div>
                </div>
                <div class="growth-progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <button class="sell-plant-btn" onclick="sellPlantFromSlot(this)" title="Продать за: ${sellPrice.coins} монет, ${sellPrice.seeds} семян, ${sellPrice.water} воды">
                    💰 ПРОДАТЬ
                </button>
            </div>
        `;
    }

    /**
     * Get slot index from DOM element
     * @param {HTMLElement} element - Element within a slot
     * @returns {number} Slot index
     */
    getSlotIndexFromElement(element) {
        const slot = element.closest('[data-slot-id]');
        return slot ? parseInt(slot.dataset.slotId) : -1;
    }

    /**
     * Get plant from specified slot
     * @param {number} slotIndex - Index of slot to get plant from
     * @returns {Plant|null} Plant instance or null if empty
     */
    getPlant(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.totalSlots) {
            return null;
        }
        return this.plants[slotIndex];
    }
    
    /**
     * Update all plant displays (called during game loop)
     * Only updates progress bars, not full HTML
     */
    updateAllPlantDisplays() {
        for (let i = 0; i < this.totalSlots; i++) {
            const plant = this.plants[i];
            if (plant) {
                // Only update progress bar, not full slot HTML
                this.updatePlantProgressBar(i, plant);
            }
        }
    }
    
    /**
     * Update only the progress bar of a plant (lightweight update)
     * @param {number} slotIndex - Index of slot to update
     * @param {Plant} plant - Plant instance
     */
    updatePlantProgressBar(slotIndex, plant) {
        const container = document.getElementById(this.containerId);
        const slot = container.querySelector(`[data-slot-id="${slotIndex}"]`);
        
        if (!slot) return;
        
        const progressBar = slot.querySelector('.progress-bar');
        if (progressBar) {
            const progressPercent = plant.getProgressPercent();
            progressBar.style.width = `${progressPercent}%`;
        }
    }
    
    /**
     * Set the selected plant type for placement
     * @param {string} plantType - Plant type identifier
     */
    setSelectedPlantType(plantType) {
        this.selectedPlantType = plantType;
        this.updateSlotHoverStates();
    }
    
    /**
     * Clear the selected plant type
     */
    clearSelectedPlantType() {
        this.selectedPlantType = null;
        this.updateSlotHoverStates();
    }
    
    /**
     * Update hover states of empty slots based on selected plant type
     */
    updateSlotHoverStates() {
        const container = document.getElementById(this.containerId);
        const slots = container.querySelectorAll('.garden-slot');
        
        slots.forEach((slot, index) => {
            if (!this.plants[index]) {
                // Empty slot
                if (this.selectedPlantType) {
                    slot.classList.add('plantable');
                } else {
                    slot.classList.remove('plantable');
                }
            }
        });
    }
    
    /**
     * Get all planted plants
     * @returns {Plant[]} Array of planted plants (excluding null slots)
     */
    getAllPlants() {
        return this.plants.filter(plant => plant !== null);
    }
    
    /**
     * Get total number of planted plants
     * @returns {number} Count of planted plants
     */
    getPlantCount() {
        return this.plants.filter(plant => plant !== null).length;
    }
    
    /**
     * Get total income per second from all plants
     * @param {Object} upgrades - Current upgrade multipliers
     * @returns {number} Total income per second
     */
    getTotalIncomePerSecond(upgrades = {}) {
        return this.plants
            .filter(plant => plant !== null)
            .reduce((total, plant) => total + plant.getIncomePerSecond(upgrades), 0);
    }
    
    /**
     * Update all plants (called during game loop)
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     * @param {Object} upgrades - Current upgrade multipliers
     * @param {Object} prestigeMultipliers - Prestige multipliers
     * @param {number} fertilizerAmount - Current fertilizer amount
     * @returns {number} Total coins earned this update
     */
    updateAllPlants(deltaTime, upgrades = {}, prestigeMultipliers = {}, fertilizerAmount = 0) {
        let totalCoinsEarned = 0;
        
        for (let i = 0; i < this.totalSlots; i++) {
            const plant = this.plants[i];
            if (plant) {
                const coinsEarned = plant.update(deltaTime, upgrades, prestigeMultipliers, fertilizerAmount);
                if (coinsEarned > 0) {
                    totalCoinsEarned += coinsEarned;
                    
                    // Trigger harvest callback
                    if (this.onPlantHarvested) {
                        this.onPlantHarvested(plant.type);
                    }
                }
            }
        }
        
        // Update visual displays
        this.updateAllPlantDisplays();
        
        return totalCoinsEarned;
    }
    
    /**
     * Serialize garden state for saving
     * @returns {Object} Serialized garden data
     */
    serialize() {
        return {
            plants: this.plants.map(plant => plant ? plant.serialize() : null),
            rows: this.rows,
            cols: this.cols
        };
    }
    
    /**
     * Load garden state from serialized data
     * @param {Object} data - Serialized garden data
     */
    deserialize(data) {
        if (data.rows !== this.rows || data.cols !== this.cols) {
            console.warn('Размеры сада изменились, переинициализация сетки');
            this.rows = data.rows || this.rows;
            this.cols = data.cols || this.cols;
            this.totalSlots = this.rows * this.cols;
            this.initializeGrid();
        }
        
        // Clear current plants
        this.plants = new Array(this.totalSlots).fill(null);
        
        // Load plants from data
        if (data.plants && Array.isArray(data.plants)) {
            for (let i = 0; i < Math.min(data.plants.length, this.totalSlots); i++) {
                if (data.plants[i]) {
                    try {
                        this.plants[i] = Plant.deserialize(data.plants[i]);
                    } catch (error) {
                        console.error(`Не удалось десериализовать растение в слоте ${i}:`, error);
                        this.plants[i] = null;
                    }
                }
            }
        }
        
        // Update all displays
        for (let i = 0; i < this.totalSlots; i++) {
            this.updateSlotDisplay(i);
        }
    }
    
    /**
     * Calculate offline progress for all plants
     * @param {number} offlineTime - Time offline in milliseconds
     * @param {Object} upgrades - Current upgrade multipliers
     * @returns {number} Total coins earned while offline
     */
    calculateOfflineProgress(offlineTime, upgrades = {}) {
        let totalOfflineIncome = 0;
        
        for (let i = 0; i < this.totalSlots; i++) {
            const plant = this.plants[i];
            if (plant) {
                totalOfflineIncome += plant.calculateOfflineProgress(offlineTime, upgrades);
            }
        }
        
        return totalOfflineIncome;
    }
    
    /**
     * Clear all plants from the garden (used for reset)
     */
    clearAllPlants() {
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.plants[i]) {
                this.plants[i] = null;
                this.updateSlotDisplay(i);
            }
        }
        console.log('🌱 Все растения удалены из сада');
    }
    
    /**
     * Refresh the entire garden display (used after reset or major changes)
     */
    refreshDisplay() {
        // Update all slot displays
        for (let i = 0; i < this.totalSlots; i++) {
            this.updateSlotDisplay(i);
        }
        
        // Clear selected plant type
        this.clearSelectedPlantType();
        
        console.log('🌱 Отображение сада обновлено');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GardenGrid;
} else if (typeof window !== 'undefined') {
    window.GardenGrid = GardenGrid;
}