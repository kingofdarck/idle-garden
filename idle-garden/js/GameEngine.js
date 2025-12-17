/**
 * GameEngine class - Coordinates all game systems and manages the main game loop
 * Handles time-based updates, income calculation, and system coordination
 */
class GameEngine {
    /**
     * Create a new GameEngine instance
     * @param {Object} systems - Object containing all game systems
     */
    constructor(systems = {}) {
        this.systems = {
            resourceManager: systems.resourceManager || null,
            shop: systems.shop || null,
            gardenGrid: systems.gardenGrid || null,
            upgradeSystem: systems.upgradeSystem || null,
            notificationSystem: systems.notificationSystem || null,
            uiFeedback: systems.uiFeedback || null,
            saveSystem: systems.saveSystem || null,
            soundManager: systems.soundManager || null
        };
        
        this.isRunning = false;
        this.gameLoop = null;
        this.lastUpdate = Date.now();
        this.updateInterval = 16; // Target 60 FPS (16ms per frame)
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = Date.now();
        this.currentFPS = 0;
        
        // Auto-save functionality
        this.autoSaveInterval = 30000; // 30 seconds
        this.lastAutoSave = Date.now();
        
        // Plant progression tracking
        this.plantHarvests = {}; // Track harvests per plant type
        this.unlockedPlants = ['carrot']; // Start with carrot unlocked
        
        // Bind methods to preserve context
        this.update = this.update.bind(this);
    }
    
    /**
     * Initialize the game engine with all required systems
     * @param {Object} systems - Object containing all game systems
     */
    initialize(systems) {
        this.systems = {
            resourceManager: systems.resourceManager || this.systems.resourceManager,
            shop: systems.shop || this.systems.shop,
            gardenGrid: systems.gardenGrid || this.systems.gardenGrid,
            upgradeSystem: systems.upgradeSystem || this.systems.upgradeSystem,
            notificationSystem: systems.notificationSystem || this.systems.notificationSystem,
            uiFeedback: systems.uiFeedback || this.systems.uiFeedback,
            saveSystem: systems.saveSystem || this.systems.saveSystem,
            soundManager: systems.soundManager || this.systems.soundManager
        };
        
        // Validate required systems
        const requiredSystems = ['resourceManager', 'gardenGrid', 'upgradeSystem'];
        for (const systemName of requiredSystems) {
            if (!this.systems[systemName]) {
                throw new Error(`Required system not provided: ${systemName}`);
            }
        }
        
        console.log('🎮 Игровой движок инициализирован со всеми системами');
    }
    
    /**
     * Start the main game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('GameEngine is already running');
            return;
        }
        
        this.isRunning = true;
        this.lastUpdate = Date.now();
        this.lastAutoSave = Date.now();
        this.gameLoop = requestAnimationFrame(this.update);
        
        console.log('🎮 Игровой движок запущен');
    }
    
    /**
     * Stop the main game loop
     */
    stop() {
        if (!this.isRunning) {
            console.warn('GameEngine is not running');
            return;
        }
        
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        console.log('🎮 Игровой движок остановлен');
    }
    
    /**
     * Main game update loop
     */
    update() {
        if (!this.isRunning) {
            return;
        }
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdate;
        this.lastUpdate = currentTime;
        
        try {
            // Update all game systems
            this.updateSystems(deltaTime);
            
            // Handle auto-save
            this.handleAutoSave(currentTime);
            
            // Update performance metrics
            this.updatePerformanceMetrics(currentTime);
            
        } catch (error) {
            console.error('Error in game update loop:', error);
            // Continue running despite errors to maintain game stability
        }
        
        // Schedule next update
        this.gameLoop = requestAnimationFrame(this.update);
    }
    
    /**
     * Update all game systems
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     */
    updateSystems(deltaTime) {
        // Update upgrade system (for resource production)
        if (this.systems.upgradeSystem) {
            this.systems.upgradeSystem.updateSeedProduction(deltaTime);
            this.systems.upgradeSystem.updateWaterCollection(deltaTime);
            this.systems.upgradeSystem.updateGemMining(deltaTime);
            this.systems.upgradeSystem.updateFertilizerProduction(deltaTime);
        }
        
        // Get current upgrade effects
        const upgradeEffects = this.systems.upgradeSystem ? 
            this.systems.upgradeSystem.getEffectMultipliers() : {};
        
        // Update all plants and calculate income
        let totalCoinsEarned = 0;
        if (this.systems.gardenGrid) {
            totalCoinsEarned = this.systems.gardenGrid.updateAllPlants(deltaTime, upgradeEffects);
        }
        
        // Add earned coins to resources
        if (totalCoinsEarned > 0 && this.systems.resourceManager) {
            this.systems.resourceManager.addResource('coins', totalCoinsEarned);
            
            // Add visual feedback for income generation
            if (this.systems.uiFeedback) {
                const incomeDisplay = document.getElementById('income-display');
                if (incomeDisplay) {
                    this.systems.uiFeedback.animateIncomeGeneration(incomeDisplay);
                }
            }
            
            // Play income sound for significant earnings
            if (totalCoinsEarned >= 5 && this.systems.soundManager) {
                this.systems.soundManager.playIncomeSound();
            }
            
            // Update shop affordability when resources change
            if (this.systems.shop) {
                this.systems.shop.updateAffordabilityDisplay();
            }
            
            // Income notifications disabled to reduce spam
        }
        
        // Update UI elements that depend on game state
        this.updateUI();
    }
    
    /**
     * Update UI elements that need regular refreshing
     */
    updateUI() {
        // Update statistics display
        this.updateStatisticsDisplay();
        
        // Update upgrade affordability indicators
        this.updateUpgradeAffordability();
    }
    
    /**
     * Update statistics display (income per second and plant count)
     */
    updateStatisticsDisplay() {
        if (!this.systems.gardenGrid || !this.systems.upgradeSystem) {
            return;
        }
        
        const incomeDisplay = document.getElementById('income-display');
        const plantCountDisplay = document.getElementById('plant-count-display');
        
        if (incomeDisplay) {
            const totalIncome = this.systems.gardenGrid.getTotalIncomePerSecond(
                this.systems.upgradeSystem.getEffectMultipliers()
            );
            incomeDisplay.textContent = totalIncome.toFixed(1);
        }
        
        if (plantCountDisplay) {
            const plantCount = this.systems.gardenGrid.getPlantCount();
            plantCountDisplay.textContent = plantCount;
        }
    }
    
    /**
     * Update upgrade affordability indicators
     */
    updateUpgradeAffordability() {
        if (!this.systems.upgradeSystem || !this.systems.resourceManager) {
            return;
        }
        
        const upgradeItems = document.querySelectorAll('.upgrade-item');
        
        upgradeItems.forEach(item => {
            const upgradeType = item.dataset.upgradeType;
            if (!upgradeType) return;
            
            const canPurchase = this.systems.upgradeSystem.canPurchaseUpgrade(upgradeType);
            const upgradeInfo = this.systems.upgradeSystem.getUpgradeDisplayInfo(upgradeType);
            
            const affordabilityIndicator = item.querySelector('.affordability-indicator');
            const purchaseButton = item.querySelector('.upgrade-purchase-btn');
            
            if (upgradeInfo && upgradeInfo.isMaxLevel) {
                // Already handled in UI creation
                return;
            }
            
            if (canPurchase) {
                item.classList.remove('unaffordable');
                item.classList.add('affordable');
                if (affordabilityIndicator) {
                    affordabilityIndicator.textContent = '✅ Affordable';
                    affordabilityIndicator.className = 'affordability-indicator affordable';
                }
                if (purchaseButton) purchaseButton.disabled = false;
            } else {
                item.classList.remove('affordable');
                item.classList.add('unaffordable');
                if (affordabilityIndicator) {
                    affordabilityIndicator.textContent = '❌ Too expensive';
                    affordabilityIndicator.className = 'affordability-indicator unaffordable';
                }
                if (purchaseButton) purchaseButton.disabled = true;
            }
        });
    }
    
    /**
     * Handle auto-save functionality
     * @param {number} currentTime - Current timestamp
     */
    handleAutoSave(currentTime) {
        if (currentTime - this.lastAutoSave >= this.autoSaveInterval) {
            this.performAutoSave();
            this.lastAutoSave = currentTime;
        }
    }
    
    /**
     * Perform automatic save operation
     */
    performAutoSave() {
        try {
            if (!this.systems.saveSystem) {
                console.log('🔄 Auto-save triggered (save system not available)');
                return;
            }
            
            const gameState = this.getGameState();
            const success = this.systems.saveSystem.saveGame(gameState);
            
            if (success) {
                console.log('🔄 Автосохранение успешно завершено');
                // Show subtle auto-save notification (shorter duration)
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showInfo('Автосохранение', 1500);
                }
            } else {
                console.warn('🔄 Автосохранение не удалось');
                // Show error notification for failed auto-save
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showError('Автосохранение не удалось - сохраните вручную');
                }
            }
        } catch (error) {
            console.error('Автосохранение не удалось с ошибкой:', error);
            
            // Show error notification with specific error handling
            if (this.systems.notificationSystem) {
                let errorMessage = 'Автосохранение не удалось';
                
                // Provide specific error messages for common issues
                if (error.name === 'QuotaExceededError') {
                    errorMessage = 'Автосохранение не удалось: Хранилище заполнено';
                } else if (error.message) {
                    errorMessage = `Автосохранение не удалось: ${error.message}`;
                }
                
                this.systems.notificationSystem.showError(errorMessage);
            }
        }
    }
    
    /**
     * Update performance metrics
     * @param {number} currentTime - Current timestamp
     */
    updatePerformanceMetrics(currentTime) {
        this.frameCount++;
        
        // Update FPS every second
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            // Log performance warnings if FPS is too low
            if (this.currentFPS < 30) {
                console.warn(`Low FPS detected: ${this.currentFPS}`);
            }
        }
    }
    
    /**
     * Get current performance metrics
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            fps: this.currentFPS,
            isRunning: this.isRunning,
            systemsLoaded: Object.keys(this.systems).filter(key => this.systems[key] !== null).length
        };
    }
    
    /**
     * Record a plant harvest and check for unlocks
     * @param {string} plantType - Type of plant harvested
     */
    recordHarvest(plantType) {
        // Initialize harvest count if needed
        if (!this.plantHarvests[plantType]) {
            this.plantHarvests[plantType] = 0;
        }
        
        // Increment harvest count
        this.plantHarvests[plantType]++;
        
        // Check for new unlocks
        this.checkPlantUnlocks();
    }
    
    /**
     * Check if any new plants should be unlocked
     */
    checkPlantUnlocks() {
        const allPlants = window.getAllPlantTypes();
        
        for (const plantType of allPlants) {
            // Skip if already unlocked
            if (this.unlockedPlants.includes(plantType)) {
                continue;
            }
            
            const config = window.getPlantConfig(plantType);
            if (!config || !config.unlockRequirement) {
                // No requirement means always unlocked
                if (!this.unlockedPlants.includes(plantType)) {
                    this.unlockedPlants.push(plantType);
                }
                continue;
            }
            
            const req = config.unlockRequirement;
            const requiredHarvests = this.plantHarvests[req.plant] || 0;
            
            if (requiredHarvests >= req.harvests) {
                this.unlockedPlants.push(plantType);
                
                // Show notification
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showSuccess(
                        `🎉 Новое растение разблокировано: ${config.name} ${config.icon}!`
                    );
                }
                
                // Refresh shop to show new plant
                if (this.systems.shop) {
                    this.systems.shop.refresh();
                }
            }
        }
    }
    
    /**
     * Check if a plant is unlocked
     * @param {string} plantType - Type of plant to check
     * @returns {boolean} True if unlocked
     */
    isPlantUnlocked(plantType) {
        return this.unlockedPlants.includes(plantType);
    }
    
    /**
     * Get harvest count for a plant type
     * @param {string} plantType - Type of plant
     * @returns {number} Number of harvests
     */
    getHarvestCount(plantType) {
        return this.plantHarvests[plantType] || 0;
    }
    
    /**
     * Pause the game (stop updates but keep systems intact)
     */
    pause() {
        if (this.isRunning) {
            this.stop();
            console.log('🎮 Игра приостановлена');
        }
    }
    
    /**
     * Resume the game
     */
    resume() {
        if (!this.isRunning) {
            this.start();
            console.log('🎮 Игра возобновлена');
        }
    }
    
    /**
     * Reset the game engine and all systems
     */
    reset() {
        const wasRunning = this.isRunning;
        this.stop();
        
        // Reset all systems
        if (this.systems.resourceManager) {
            this.systems.resourceManager.reset();
        }
        
        if (this.systems.upgradeSystem) {
            this.systems.upgradeSystem.reset();
        }
        
        if (this.systems.gardenGrid) {
            // Clear all plants
            for (let i = 0; i < this.systems.gardenGrid.totalSlots; i++) {
                if (this.systems.gardenGrid.plants[i]) {
                    this.systems.gardenGrid.removePlant(i);
                }
            }
        }
        
        if (this.systems.shop) {
            this.systems.shop.clearSelection();
            this.systems.shop.refresh();
        }
        
        if (this.systems.soundManager) {
            this.systems.soundManager.reset();
            this.systems.soundManager.updateSoundToggleUI();
        }
        
        // Reset progression
        this.plantHarvests = {};
        this.unlockedPlants = ['carrot'];
        
        // Reset performance metrics
        this.frameCount = 0;
        this.currentFPS = 0;
        this.lastFPSUpdate = Date.now();
        
        console.log('🎮 Сброс игрового движка завершен');
        
        if (this.systems.notificationSystem) {
            this.systems.notificationSystem.showSuccess('Сброс игры завершен!');
        }
        
        // Restart the engine if it was running before reset
        if (wasRunning) {
            this.start();
        }
    }
    
    /**
     * Get current game state for saving
     * @returns {Object} Current game state
     */
    getGameState() {
        const state = {
            timestamp: Date.now(),
            resources: null,
            garden: null,
            upgrades: null,
            sound: null,
            progression: {
                plantHarvests: this.plantHarvests,
                unlockedPlants: this.unlockedPlants
            }
        };
        
        if (this.systems.resourceManager) {
            state.resources = this.systems.resourceManager.serialize();
        }
        
        if (this.systems.gardenGrid) {
            state.garden = this.systems.gardenGrid.serialize();
        }
        
        if (this.systems.upgradeSystem) {
            state.upgrades = this.systems.upgradeSystem.serialize();
        }
        
        if (this.systems.soundManager) {
            state.sound = this.systems.soundManager.serialize();
        }
        
        return state;
    }
    
    /**
     * Load game state
     * @param {Object} state - Game state to load
     */
    loadGameState(state) {
        if (!state) {
            console.warn('No game state provided for loading');
            return;
        }
        
        try {
            // Calculate offline progress if timestamp is available
            let offlineIncome = 0;
            let offlineTime = 0;
            
            if (state.timestamp) {
                offlineTime = Date.now() - state.timestamp;
                if (offlineTime > 0 && this.systems.gardenGrid && this.systems.upgradeSystem) {
                    // Load systems first to calculate offline progress
                    if (state.garden) {
                        this.systems.gardenGrid.deserialize(state.garden);
                    }
                    if (state.upgrades) {
                        this.systems.upgradeSystem.deserialize(state.upgrades);
                    }
                    
                    offlineIncome = this.systems.gardenGrid.calculateOfflineProgress(
                        offlineTime, 
                        this.systems.upgradeSystem.getEffectMultipliers()
                    );
                }
            }
            
            // Load resource state
            if (state.resources && this.systems.resourceManager) {
                this.systems.resourceManager.deserialize(state.resources);
                
                // Add offline income
                if (offlineIncome > 0) {
                    this.systems.resourceManager.addResource('coins', offlineIncome);
                    
                    if (this.systems.notificationSystem) {
                        this.systems.notificationSystem.showOfflineProgressNotification(offlineTime, offlineIncome);
                    }
                }
            }
            
            // Load sound settings
            if (state.sound && this.systems.soundManager) {
                this.systems.soundManager.deserialize(state.sound);
                this.systems.soundManager.updateSoundToggleUI();
            }
            
            // Load progression data
            if (state.progression) {
                this.plantHarvests = state.progression.plantHarvests || {};
                this.unlockedPlants = state.progression.unlockedPlants || ['carrot'];
            }
            
            // Refresh UI systems
            if (this.systems.shop) {
                this.systems.shop.refresh();
            }
            
            console.log('🎮 Состояние игры успешно загружено');
            
        } catch (error) {
            console.error('Не удалось загрузить состояние игры:', error);
            if (this.systems.notificationSystem) {
                this.systems.notificationSystem.showError('Не удалось загрузить сохраненную игру');
            }
        }
    }
    
    /**
     * Manually save the game
     * @returns {boolean} True if save was successful
     */
    saveGame() {
        try {
            if (!this.systems.saveSystem) {
                console.warn('Save system not available');
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showWarning('Save system not available');
                }
                return false;
            }
            
            const gameState = this.getGameState();
            const success = this.systems.saveSystem.saveGame(gameState);
            
            if (success) {
                console.log('🔄 Ручное сохранение успешно завершено');
            }
            
            return success;
            
        } catch (error) {
            console.error('Ручное сохранение не удалось:', error);
            if (this.systems.notificationSystem) {
                this.systems.notificationSystem.showError('Сохранение не удалось: ' + error.message);
            }
            return false;
        }
    }
    
    /**
     * Load saved game
     * @returns {boolean} True if load was successful
     */
    loadGame() {
        try {
            if (!this.systems.saveSystem) {
                console.warn('Save system not available');
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showWarning('Save system not available');
                }
                return false;
            }
            
            const gameState = this.systems.saveSystem.loadGame();
            
            if (gameState) {
                this.loadGameState(gameState);
                
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showSuccess('Игра успешно загружена!');
                }
                
                return true;
            } else {
                console.log('Сохраненная игра не найдена');
                if (this.systems.notificationSystem) {
                    this.systems.notificationSystem.showInfo('Сохраненная игра не найдена');
                }
                return false;
            }
            
        } catch (error) {
            console.error('Загрузка игры не удалась:', error);
            if (this.systems.notificationSystem) {
                this.systems.notificationSystem.showError('Загрузка не удалась: ' + error.message);
            }
            return false;
        }
    }
    
    /**
     * Check if a save file exists
     * @returns {boolean} True if save file exists
     */
    hasSaveFile() {
        if (!this.systems.saveSystem) {
            return false;
        }
        
        return this.systems.saveSystem.hasSaveFile();
    }
    
    /**
     * Manually trigger auto-save (useful for testing or immediate save needs)
     * @returns {boolean} True if auto-save was successful
     */
    triggerAutoSave() {
        this.performAutoSave();
        this.lastAutoSave = Date.now(); // Reset auto-save timer
        return true;
    }
    
    /**
     * Get auto-save status and timing information
     * @returns {Object} Auto-save status information
     */
    getAutoSaveStatus() {
        const currentTime = Date.now();
        const timeSinceLastSave = currentTime - this.lastAutoSave;
        const timeUntilNextSave = Math.max(0, this.autoSaveInterval - timeSinceLastSave);
        
        return {
            enabled: !!this.systems.saveSystem,
            interval: this.autoSaveInterval,
            lastSaveTime: this.lastAutoSave,
            timeSinceLastSave: timeSinceLastSave,
            timeUntilNextSave: timeUntilNextSave,
            nextSaveIn: Math.ceil(timeUntilNextSave / 1000) // seconds
        };
    }
    
    /**
     * Set auto-save interval
     * @param {number} intervalMs - New interval in milliseconds
     */
    setAutoSaveInterval(intervalMs) {
        if (intervalMs < 10000) { // Minimum 10 seconds
            console.warn('Интервал автосохранения слишком короткий, устанавливается 10 секунд');
            intervalMs = 10000;
        }
        
        this.autoSaveInterval = intervalMs;
        console.log(`🔄 Интервал автосохранения установлен на ${intervalMs / 1000} секунд`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
} else if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}