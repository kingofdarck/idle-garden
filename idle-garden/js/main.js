// Idle Garden - Main Entry Point
// Classes will be available globally after script loading

// Game state
let gameState = {
    playerProfile: null,
    resourceManager: null,
    shop: null,
    gardenGrid: null,
    upgradeSystem: null,
    prestigeSystem: null,
    crystalUpgrades: null,
    saveSystem: null,
    gameEngine: null,
    notificationSystem: null,
    uiFeedback: null,
    soundManager: null,
    selectedPlantType: null
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 Idle Garden initialized');
    
    // Initialize game directly since scripts are loaded via HTML
    initializeGame();
});

// Scripts are now loaded via HTML script tags

/**
 * Initialize the game after all scripts are loaded
 */
function initializeGame() {
    try {
        // Initialize player profile first
        gameState.playerProfile = new window.PlayerProfile();
        updatePlayerNameDisplay();
        
        // Initialize notification system
        gameState.notificationSystem = new window.NotificationSystem();
        
        // Initialize UI feedback system
        gameState.uiFeedback = new window.UIFeedback();
        
        // Initialize sound manager
        gameState.soundManager = new window.SoundManager();
        
        // Initialize save system
        gameState.saveSystem = new window.SaveSystem('idle-garden-save', gameState.notificationSystem);
        
        // Initialize resource manager
        gameState.resourceManager = new window.ResourceManager({}, gameState.uiFeedback);
        
        // Initialize upgrade system
        gameState.upgradeSystem = new window.UpgradeSystem(gameState.resourceManager);
        
        // Initialize prestige system
        gameState.prestigeSystem = new window.PrestigeSystem(gameState.resourceManager);
        
        // Initialize crystal upgrades system
        gameState.crystalUpgrades = new window.CrystalUpgrades(gameState.resourceManager);
        
        // Initialize shop (don't refresh yet, wait for GameEngine)
        gameState.shop = new window.Shop(gameState.resourceManager);
        
        // Initialize garden grid
        gameState.gardenGrid = new window.GardenGrid('garden-grid', 3, 4);
        
        // Set up garden grid callbacks
        setupGardenCallbacks();
        
        // Set up shop callbacks
        setupShopCallbacks();
        
        // Set up upgrade callbacks
        setupUpgradeCallbacks();
        
        // Initialize upgrade UI
        initializeUpgradeUI();
        
        // Initialize prestige UI
        initializePrestigeUI();
        
        // Initialize crystal upgrades UI
        initializeCrystalUpgradesUI();
        
        // Add basic event listeners for UI elements
        setupBasicEventListeners();
        
        // Initialize and start game engine
        initializeGameEngine();
        
        // Try to load saved game
        tryLoadSavedGame();
        
        // Initialize sound toggle UI
        if (gameState.soundManager) {
            gameState.soundManager.updateSoundToggleUI();
        }
        
        // Force update crystal upgrades UI after everything is loaded
        setTimeout(() => {
            if (typeof initializeCrystalUpgradesUI === 'function') {
                initializeCrystalUpgradesUI();
            }
        }, 100);
        
        // Initialize mobile optimizations
        initializeMobileOptimizations();
        
        console.log('🌱 Game initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

/**
 * Set up callbacks for garden grid interactions
 */
function setupGardenCallbacks() {
    // Handle plant placement attempts
    gameState.gardenGrid.onPlantPlaced = (slotIndex, plantType) => {
        return attemptPlantPlacement(slotIndex, plantType);
    };
    
    // Handle slot clicks for feedback
    gameState.gardenGrid.onSlotClicked = (slotIndex, plant) => {
        if (plant) {
            // Show plant info or allow harvesting in future
            console.log(`Нажато на растение в слоте ${slotIndex}:`, plant.type);
        } else if (gameState.selectedPlantType) {
            // Attempt to place selected plant
            console.log(`Попытка посадить ${gameState.selectedPlantType} в слот ${slotIndex}`);
        } else {
            console.log(`Пустой слот ${slotIndex} нажат, растение не выбрано`);
        }
    };
    
    // Handle plant harvests for progression tracking
    gameState.gardenGrid.onPlantHarvested = (plantType) => {
        if (gameState.gameEngine) {
            gameState.gameEngine.recordHarvest(plantType);
        }
    };
}

/**
 * Set up callbacks for shop interactions
 */
function setupShopCallbacks() {
    // Listen for shop notifications
    document.addEventListener('shop-notification', (event) => {
        const { message, type } = event.detail;
        showNotification(message, type);
    });
    
    // Monitor shop selection changes
    const checkShopSelection = () => {
        const selectedType = gameState.shop.getSelectedPlantType();
        if (selectedType !== gameState.selectedPlantType) {
            gameState.selectedPlantType = selectedType;
            gameState.gardenGrid.setSelectedPlantType(selectedType);
            console.log(`Выбран тип растения: ${selectedType}`);
        }
    };
    
    // Check selection periodically (could be improved with events)
    setInterval(checkShopSelection, 100);
}

/**
 * Attempt to place a plant in the garden
 * @param {number} slotIndex - Index of the slot to place plant in
 * @param {string} plantType - Type of plant to place
 * @returns {boolean} True if placement was successful
 */
function attemptPlantPlacement(slotIndex, plantType) {
    try {
        // Get plant configuration
        const config = window.getPlantConfig(plantType);
        if (!config) {
            console.error(`Неверный тип растения: ${plantType}`);
            return false;
        }
        
        // Apply water efficiency upgrade to cost
        let modifiedCost = gameState.upgradeSystem.applyWaterEfficiency(config.cost);
        
        // Apply prestige resource efficiency if available
        if (gameState.prestigeSystem) {
            const prestigeMultipliers = gameState.prestigeSystem.getPrestigeMultipliers();
            if (prestigeMultipliers.resourceEfficiency !== 1) {
                const finalCost = {};
                for (const [resource, amount] of Object.entries(modifiedCost)) {
                    finalCost[resource] = Math.ceil(amount * prestigeMultipliers.resourceEfficiency);
                }
                modifiedCost = finalCost;
            }
        }
        
        // Check if player can afford the plant safely
        if (!gameState.resourceManager.canAffordSafely(modifiedCost, true)) {
            console.log(`Не могу позволить ${plantType} безопасно:`, modifiedCost);
            
            // Play error sound
            if (gameState.soundManager) {
                gameState.soundManager.playErrorSound();
            }
            
            if (gameState.resourceManager.canAfford(modifiedCost)) {
                showNotification(`Нельзя посадить ${config.name} - нужно сохранить ресурсы для базовых растений!`, 'warning');
            } else {
                showNotification(`Недостаточно ресурсов для ${config.name}!`, 'error');
            }
            return false;
        }
        
        // Deduct resources safely
        if (!gameState.resourceManager.deductResourcesSafely(modifiedCost, true)) {
            console.error('Не удалось безопасно вычесть ресурсы');
            return false;
        }
        
        // Create and place the plant
        const plant = new window.Plant(plantType);
        gameState.gardenGrid.placePlant(slotIndex, plant);
        
        // Add visual feedback for plant placement
        if (gameState.uiFeedback) {
            const slotElement = document.querySelector(`[data-slot-id="${slotIndex}"]`);
            if (slotElement) {
                gameState.uiFeedback.animatePlantPlacement(slotElement);
            }
        }
        
        // Play purchase sound
        if (gameState.soundManager) {
            gameState.soundManager.playPurchaseSound();
        }
        
        // Show success notification
        showNotification(`Посажено ${config.name}! 🌱`, 'success');
        
        // Clear selection after successful placement
        gameState.selectedPlantType = null;
        gameState.gardenGrid.clearSelectedPlantType();
        
        return true;
        
    } catch (error) {
        console.error('Ошибка при посадке растения:', error);
        showNotification('Не удалось посадить растение!', 'error');
        return false;
    }
}



/**
 * Initialize and start the game engine
 */
function initializeGameEngine() {
    // Create game engine instance
    gameState.gameEngine = new window.GameEngine();
    
    // Initialize with all systems
    gameState.gameEngine.initialize({
        resourceManager: gameState.resourceManager,
        shop: gameState.shop,
        gardenGrid: gameState.gardenGrid,
        upgradeSystem: gameState.upgradeSystem,
        prestigeSystem: gameState.prestigeSystem,
        crystalUpgrades: gameState.crystalUpgrades,
        saveSystem: gameState.saveSystem,
        notificationSystem: gameState.notificationSystem,
        uiFeedback: gameState.uiFeedback,
        soundManager: gameState.soundManager
    });
    
    // Link game engine to shop for unlock checking
    if (gameState.shop) {
        gameState.shop.gameEngine = gameState.gameEngine;
        gameState.shop.refresh(); // Refresh to show only unlocked plants
    }
    
    // Start the game engine
    gameState.gameEngine.start();
}

/**
 * Try to load saved game on startup
 */
function tryLoadSavedGame() {
    if (gameState.gameEngine && gameState.gameEngine.hasSaveFile()) {
        console.log('🔄 Найдено сохранение, загрузка...');
        gameState.gameEngine.loadGame();
        
        // Refresh UI after loading
        if (gameState.shop) {
            gameState.shop.refresh();
        }
        initializeUpgradeUI();
        initializeCrystalUpgradesUI();
        initializePrestigeUI();
    } else {
        console.log('🌱 Сохранение не найдено, начинаем заново');
    }
}

/**
 * Show a notification to the player
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    if (gameState.notificationSystem) {
        gameState.notificationSystem.showNotification(message, type);
    } else {
        // Fallback for when notification system isn't initialized yet
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Perform complete game reset - clears all progress and saved data
 */
function performGameReset() {
    try {
        console.log('🔄 Начинается сброс игры...');
        
        // Stop the game engine to prevent updates during reset
        if (gameState.gameEngine) {
            gameState.gameEngine.stop();
        }
        
        // Clear saved data from localStorage
        if (gameState.saveSystem) {
            gameState.saveSystem.deleteSave();
        }
        
        // Reset all game systems to initial state
        if (gameState.gameEngine) {
            gameState.gameEngine.reset();
            // Restart the game engine after reset
            gameState.gameEngine.start();
        }
        
        // Reset resource manager to initial values
        if (gameState.resourceManager) {
            gameState.resourceManager.reset();
        }
        
        // Reset upgrade system
        if (gameState.upgradeSystem) {
            gameState.upgradeSystem.reset();
        }
        
        // Clear garden grid
        if (gameState.gardenGrid) {
            gameState.gardenGrid.clearAllPlants();
        }
        
        // Clear shop selection
        if (gameState.shop) {
            gameState.shop.clearSelection();
            gameState.shop.refresh();
        }
        
        // Clear selected plant type
        gameState.selectedPlantType = null;
        
        // Refresh all UI elements
        refreshAllUI();
        
        // Restart the game engine
        if (gameState.gameEngine) {
            gameState.gameEngine.start();
        }
        
        // Show success notification
        showNotification('Игра сброшена! Начинаем заново 🌱', 'success');
        
        console.log('🔄 Сброс игры успешно завершен');
        
    } catch (error) {
        console.error('Ошибка при сбросе игры:', error);
        showNotification('Сброс не удался - пожалуйста, обновите страницу', 'error');
    }
}

/**
 * Refresh all UI elements after reset
 */
function refreshAllUI() {
    try {
        // Refresh shop display
        if (gameState.shop) {
            gameState.shop.refresh();
        }
        
        // Refresh upgrade UI
        initializeUpgradeUI();
        
        // Refresh crystal upgrades UI
        initializeCrystalUpgradesUI();
        
        // Refresh prestige UI
        initializePrestigeUI();
        
        // Clear garden grid display
        if (gameState.gardenGrid) {
            gameState.gardenGrid.refreshDisplay();
        }
        
        // Update resource displays (should show initial values)
        // This will be handled automatically by the resource manager's reset
        
        console.log('🔄 Обновление UI завершено');
        
    } catch (error) {
        console.error('Ошибка при обновлении UI после сброса:', error);
    }
}

/**
 * Initialize mobile-specific optimizations
 */
function initializeMobileOptimizations() {
    try {
        // Detect if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile || isTouchDevice) {
            document.body.classList.add('mobile-device');
            console.log('📱 Обнаружено мобильное устройство, применяются оптимизации');
            
            // Add touch event listeners for better mobile interaction
            addMobileTouchHandlers();
            
            // Optimize viewport for mobile
            optimizeViewportForMobile();
            
            // Add mobile-specific UI enhancements
            addMobileUIEnhancements();
        }
        
        // Add orientation change handler
        window.addEventListener('orientationchange', handleOrientationChange);
        
        // Add resize handler for responsive adjustments
        window.addEventListener('resize', handleWindowResize);
        
        console.log('📱 Мобильные оптимизации инициализированы');
        
    } catch (error) {
        console.error('Ошибка при инициализации мобильных оптимизаций:', error);
    }
}

/**
 * Add mobile touch handlers for better interaction
 */
function addMobileTouchHandlers() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button, .garden-slot, .shop-item, .upgrade-item');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            // Trigger click after a short delay to provide visual feedback
            setTimeout(() => {
                this.click();
            }, 50);
        });
    });
    
    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
        const interactiveElements = document.querySelectorAll('.garden-slot, .shop-purchase-btn, .upgrade-purchase-btn, .control-btn');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                // Short vibration for tactile feedback
                navigator.vibrate(10);
            });
        });
    }
    
    // Improve scroll behavior on mobile
    document.body.style.overscrollBehavior = 'contain';
    
    console.log('📱 Добавлены обработчики касаний для мобильных устройств');
}

/**
 * Optimize viewport settings for mobile
 */
function optimizeViewportForMobile() {
    // Ensure viewport meta tag is properly set
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    
    // Set optimal viewport settings for the game
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Add iOS-specific meta tags for better mobile experience
    const iosMetaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Idle Garden' }
    ];
    
    iosMetaTags.forEach(tag => {
        let meta = document.querySelector(`meta[name="${tag.name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        }
    });
    
    console.log('📱 Viewport оптимизирован для мобильных устройств');
}

/**
 * Add mobile-specific UI enhancements
 */
function addMobileUIEnhancements() {
    // Add swipe gestures for navigation (basic implementation)
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only process significant swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - could be used for navigation
                console.log('📱 Обнаружен свайп влево');
            } else {
                // Swipe right - could be used for navigation
                console.log('📱 Обнаружен свайп вправо');
            }
        }
        
        startX = 0;
        startY = 0;
    });
    
    // Add pull-to-refresh prevention
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch zoom
        }
    }, { passive: false });
    
    console.log('📱 Добавлены улучшения UI для мобильных устройств');
}

/**
 * Handle orientation change events
 */
function handleOrientationChange() {
    // Add a small delay to allow the browser to update dimensions
    setTimeout(() => {
        console.log('📱 Ориентация изменена, настройка макета');
        
        // Refresh garden grid layout if needed
        if (gameState.gardenGrid) {
            gameState.gardenGrid.refreshDisplay();
        }
        
        // Update any size-dependent UI elements
        updateResponsiveElements();
        
    }, 100);
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        console.log('📱 Размер окна изменен, обновление адаптивных элементов');
        updateResponsiveElements();
    }, 250);
}

/**
 * Update responsive UI elements
 */
function updateResponsiveElements() {
    // Update garden grid if it exists
    if (gameState.gardenGrid) {
        const container = document.getElementById('garden-grid');
        if (container) {
            // Recalculate grid layout based on current screen size
            const containerWidth = container.offsetWidth;
            const isMobile = window.innerWidth <= 768;
            const isSmallMobile = window.innerWidth <= 480;
            
            if (isSmallMobile) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else if (isMobile) {
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                container.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }
    }
    
    // Update notification positioning
    const notifications = document.getElementById('notifications');
    if (notifications) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            notifications.style.left = '10px';
            notifications.style.right = '10px';
            notifications.style.maxWidth = 'none';
        } else {
            notifications.style.left = 'auto';
            notifications.style.right = '20px';
            notifications.style.maxWidth = '300px';
        }
    }
}

/**
 * Set up callbacks for upgrade interactions
 */
function setupUpgradeCallbacks() {
    // This will be handled by the upgrade UI event listeners
    console.log('Настроены обратные вызовы для улучшений');
}

/**
 * Initialize the upgrade UI
 */
function initializeUpgradeUI() {
    const upgradeContainer = document.getElementById('upgrade-items');
    if (!upgradeContainer) {
        console.warn('Контейнер улучшений не найден');
        return;
    }
    
    // Clear existing content
    upgradeContainer.innerHTML = '';
    
    // Get all upgrades and create UI elements
    const upgrades = gameState.upgradeSystem.getAllUpgradesDisplayInfo();
    
    upgrades.forEach(upgrade => {
        createUpgradeItem(upgrade, upgradeContainer);
    });
}

/**
 * Create a single upgrade item UI element
 * @param {Object} upgrade - Upgrade display information
 * @param {HTMLElement} container - Container to append the upgrade item to
 */
function createUpgradeItem(upgrade, container) {
    const upgradeItem = document.createElement('div');
    upgradeItem.className = 'upgrade-item';
    upgradeItem.dataset.upgradeType = upgrade.type;
    
    // Upgrade header with icon and name
    const header = document.createElement('div');
    header.className = 'upgrade-header';
    header.innerHTML = `
        <span class="upgrade-icon">${upgrade.icon}</span>
        <span class="upgrade-name">${upgrade.name}</span>
    `;
    
    // Upgrade description
    const description = document.createElement('div');
    description.className = 'upgrade-description';
    description.textContent = upgrade.description;
    
    // Current level and effect
    const levelInfo = document.createElement('div');
    levelInfo.className = 'upgrade-level-info';
    levelInfo.innerHTML = `
        <div class="upgrade-level">Уровень: ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
        <div class="upgrade-effect">Текущий: ${upgrade.currentEffect}</div>
    `;
    
    // Cost and purchase button
    const purchaseSection = document.createElement('div');
    purchaseSection.className = 'upgrade-purchase-section';
    
    if (upgrade.isMaxLevel) {
        purchaseSection.innerHTML = `
            <div class="upgrade-max-level">✅ Достигнут максимальный уровень</div>
        `;
    } else {
        const costDisplay = document.createElement('div');
        costDisplay.className = 'upgrade-cost';
        costDisplay.innerHTML = `
            <div class="cost-label">Стоимость следующего уровня:</div>
            <div class="cost-breakdown">
                ${upgrade.cost && upgrade.cost.coins > 0 ? `<span class="cost-item">🪙 ${upgrade.cost.coins}</span>` : ''}
                ${upgrade.cost && upgrade.cost.seeds > 0 ? `<span class="cost-item">🌰 ${upgrade.cost.seeds}</span>` : ''}
                ${upgrade.cost && upgrade.cost.water > 0 ? `<span class="cost-item">💧 ${upgrade.cost.water}</span>` : ''}
            </div>
        `;
        
        const purchaseButton = document.createElement('button');
        purchaseButton.className = 'upgrade-purchase-btn';
        purchaseButton.textContent = 'Купить улучшение';
        purchaseButton.disabled = !upgrade.canPurchase;
        
        purchaseButton.addEventListener('click', () => {
            purchaseUpgrade(upgrade.type);
        });
        
        purchaseSection.appendChild(costDisplay);
        purchaseSection.appendChild(purchaseButton);
    }
    
    // Affordability indicator
    const affordabilityIndicator = document.createElement('div');
    affordabilityIndicator.className = 'affordability-indicator';
    
    if (upgrade.isMaxLevel) {
        affordabilityIndicator.textContent = '✅ Завершено';
        affordabilityIndicator.className += ' max-level';
    } else if (upgrade.affordable) {
        affordabilityIndicator.textContent = '✅ Доступно';
        affordabilityIndicator.className += ' affordable';
        upgradeItem.classList.add('affordable');
    } else {
        affordabilityIndicator.textContent = '❌ Слишком дорого';
        affordabilityIndicator.className += ' unaffordable';
        upgradeItem.classList.add('unaffordable');
    }
    
    // Assemble upgrade item
    upgradeItem.appendChild(header);
    upgradeItem.appendChild(description);
    upgradeItem.appendChild(levelInfo);
    upgradeItem.appendChild(affordabilityIndicator);
    upgradeItem.appendChild(purchaseSection);
    
    container.appendChild(upgradeItem);
}

/**
 * Purchase an upgrade
 * @param {string} upgradeType - Type of upgrade to purchase
 */
function purchaseUpgrade(upgradeType) {
    try {
        const upgradeElement = document.querySelector(`[data-upgrade-type="${upgradeType}"]`);
        const purchaseButton = upgradeElement ? upgradeElement.querySelector('.upgrade-purchase-btn') : null;
        
        const success = gameState.upgradeSystem.purchaseUpgrade(upgradeType);
        
        if (success) {
            const config = gameState.upgradeSystem.getUpgradeConfig(upgradeType);
            
            // Play success sound
            if (gameState.soundManager) {
                gameState.soundManager.playSuccessSound();
            }
            
            showNotification(`Куплено улучшение ${config.name}! ⚡`, 'success');
            
            // Add visual feedback
            if (gameState.uiFeedback) {
                if (purchaseButton) {
                    gameState.uiFeedback.buttonFeedback(purchaseButton, 'success');
                }
                if (upgradeElement) {
                    gameState.uiFeedback.animateUpgradePurchase(upgradeElement);
                }
            }
            
            // Refresh upgrade UI
            initializeUpgradeUI();
            
            // Update shop affordability (in case water efficiency changed costs)
            gameState.shop.updateAffordabilityDisplay();
        } else {
            // Play error sound
            if (gameState.soundManager) {
                gameState.soundManager.playErrorSound();
            }
            
            showNotification('Невозможно купить улучшение - недостаточно ресурсов или достигнут максимальный уровень!', 'error');
            
            // Add error feedback
            if (gameState.uiFeedback && purchaseButton) {
                gameState.uiFeedback.buttonFeedback(purchaseButton, 'error');
            }
        }
    } catch (error) {
        console.error('Ошибка при покупке улучшения:', error);
        showNotification('Не удалось купить улучшение!', 'error');
    }
}



function setupBasicEventListeners() {
    // Save button
    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => {
        if (gameState.uiFeedback) {
            gameState.uiFeedback.buttonFeedback(saveBtn, 'info');
        }
        
        if (gameState.gameEngine) {
            const success = gameState.gameEngine.saveGame();
            if (success) {
                // Play success sound
                if (gameState.soundManager) {
                    gameState.soundManager.playSuccessSound();
                }
                console.log('Игра успешно сохранена');
            } else {
                // Play error sound
                if (gameState.soundManager) {
                    gameState.soundManager.playErrorSound();
                }
                console.log('Сохранение не удалось');
            }
        } else {
            console.warn('Игровой движок недоступен для сохранения');
        }
    });
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener('click', () => {
        if (gameState.uiFeedback) {
            gameState.uiFeedback.buttonFeedback(soundToggle, 'info');
        }
        
        if (gameState.soundManager) {
            // Resume audio context if needed (required for some browsers)
            gameState.soundManager.resumeAudioContext();
            
            // Toggle sound
            const soundEnabled = gameState.soundManager.toggleSound();
            
            // Update UI
            gameState.soundManager.updateSoundToggleUI();
            
            // Play feedback sound if enabled
            if (soundEnabled) {
                gameState.soundManager.playSuccessSound();
            }
            
            // Show notification
            const message = soundEnabled ? 'Звук включен 🔊' : 'Звук выключен 🔇';
            showNotification(message, 'info');
            
            console.log(`Звук переключен: ${soundEnabled ? 'включен' : 'выключен'}`);
        } else {
            console.warn('Менеджер звука недоступен');
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        if (gameState.uiFeedback) {
            gameState.uiFeedback.buttonFeedback(resetBtn, 'warning');
        }
        const modal = document.getElementById('reset-modal');
        modal.classList.remove('hidden');
    });
    
    // Reset modal handlers
    const confirmReset = document.getElementById('confirm-reset');
    const cancelReset = document.getElementById('cancel-reset');
    
    confirmReset.addEventListener('click', () => {
        if (gameState.uiFeedback) {
            gameState.uiFeedback.buttonFeedback(confirmReset, 'error');
        }
        console.log('Сброс игры подтвержден');
        document.getElementById('reset-modal').classList.add('hidden');
        
        // Perform game reset
        performGameReset();
    });
    
    cancelReset.addEventListener('click', () => {
        if (gameState.uiFeedback) {
            gameState.uiFeedback.buttonFeedback(cancelReset, 'info');
        }
        document.getElementById('reset-modal').classList.add('hidden');
    });
    
    // Close modal when clicking outside
    const modal = document.getElementById('reset-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

/**
 * Sell a plant from the specified slot (global function for onclick)
 * @param {HTMLElement} buttonElement - Button element that was clicked
 */
function sellPlantFromSlot(buttonElement) {
    try {
        // Find the slot index from the button's parent slot
        const slot = buttonElement.closest('[data-slot-id]');
        if (!slot) {
            showNotification('Не удалось найти слот для продажи!', 'error');
            return;
        }
        
        const slotIndex = parseInt(slot.dataset.slotId);
        
        // Get plant info before selling for notification
        const plant = gameState.gardenGrid.getPlant(slotIndex);
        const config = plant ? plant.getConfig() : null;
        const plantName = config ? config.name : 'Plant';
        
        const sellPrice = gameState.gardenGrid.sellPlant(slotIndex);
        
        if (sellPrice) {
            // Add resources back to player
            gameState.resourceManager.addResources(sellPrice);
            
            // Play success sound
            if (gameState.soundManager) {
                gameState.soundManager.playSuccessSound();
            }
            
            // Show notification with all resources
            const resourceText = [];
            if (sellPrice.coins > 0) resourceText.push(`${sellPrice.coins} coins`);
            if (sellPrice.seeds > 0) resourceText.push(`${sellPrice.seeds} seeds`);
            if (sellPrice.water > 0) resourceText.push(`${sellPrice.water} water`);
            
            showNotification(`Продано ${plantName} за ${resourceText.join(', ')}! 💰`, 'success');
            
            console.log(`Продано растение из слота ${slotIndex}:`, sellPrice);
        } else {
            showNotification('В этом слоте нет растения для продажи!', 'error');
        }
    } catch (error) {
        console.error('Ошибка при продаже растения:', error);
        showNotification('Не удалось продать растение!', 'error');
    }
}

// Make sellPlantFromSlot available globally
if (typeof window !== 'undefined') {
    window.sellPlantFromSlot = sellPlantFromSlot;
}


/**
 * Initialize prestige UI
 */
function initializePrestigeUI() {
    const prestigeContainer = document.getElementById('prestige-upgrades');
    if (!prestigeContainer) {
        console.warn('Prestige container not found');
        return;
    }
    
    // Clear existing content
    prestigeContainer.innerHTML = '';
    
    // Get all prestige upgrades and create UI elements
    const upgrades = gameState.prestigeSystem.getAllPrestigeUpgradesDisplayInfo();
    
    upgrades.forEach(upgrade => {
        createPrestigeUpgradeItem(upgrade, prestigeContainer);
    });
    
    // Update prestige info
    updatePrestigeInfo();
    
    // Set up prestige button
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', performPrestige);
    }
}

/**
 * Create a prestige upgrade item UI element
 */
function createPrestigeUpgradeItem(upgrade, container) {
    const upgradeItem = document.createElement('div');
    upgradeItem.className = 'prestige-upgrade-item';
    upgradeItem.dataset.upgradeType = upgrade.type;
    
    upgradeItem.innerHTML = `
        <div class="upgrade-header">
            <span class="upgrade-icon">${upgrade.icon}</span>
            <span class="upgrade-name">${upgrade.name}</span>
        </div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-level-info">
            <div class="upgrade-level">Уровень: ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
            <div class="upgrade-effect">Эффект: ${upgrade.currentEffect}</div>
        </div>
        <div class="upgrade-purchase-section">
            ${upgrade.isMaxLevel ? 
                '<div class="upgrade-max-level">✅ Максимальный уровень</div>' :
                `<div class="upgrade-cost">Стоимость: ${upgrade.cost} ⭐</div>
                 <button class="upgrade-purchase-btn" ${!upgrade.canPurchase ? 'disabled' : ''}>
                     Купить улучшение
                 </button>`
            }
        </div>
    `;
    
    if (upgrade.canPurchase && !upgrade.isMaxLevel) {
        upgradeItem.classList.add('affordable');
    }
    
    // Add click handler
    const purchaseBtn = upgradeItem.querySelector('.upgrade-purchase-btn');
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', () => purchasePrestigeUpgrade(upgrade.type));
    }
    
    container.appendChild(upgradeItem);
}

/**
 * Initialize crystal upgrades UI
 */
function initializeCrystalUpgradesUI() {
    const crystalContainer = document.getElementById('crystal-upgrades');
    if (!crystalContainer) {
        console.warn('Crystal upgrades container not found');
        return;
    }
    
    // Clear existing content
    crystalContainer.innerHTML = '';
    
    // Add current crystals display
    const currentGems = gameState.resourceManager.getResource('gems');
    const crystalsHeader = document.createElement('div');
    crystalsHeader.className = 'crystals-header';
    crystalsHeader.innerHTML = `
        <div class="current-crystals">
            <span class="crystals-icon">💎</span>
            <span class="crystals-label">Доступно кристаллов:</span>
            <span class="crystals-value">${currentGems}</span>
        </div>
    `;
    crystalContainer.appendChild(crystalsHeader);
    
    // Get all crystal upgrades and create UI elements
    const upgrades = gameState.crystalUpgrades.getAllCrystalUpgradesDisplayInfo();
    
    upgrades.forEach(upgrade => {
        createCrystalUpgradeItem(upgrade, crystalContainer);
    });
}

/**
 * Create a crystal upgrade item UI element (compact accordion style)
 */
function createCrystalUpgradeItem(upgrade, container) {
    const upgradeItem = document.createElement('div');
    upgradeItem.className = 'crystal-upgrade-item collapsed';
    upgradeItem.dataset.upgradeType = upgrade.type;
    
    // Create compact header
    const header = document.createElement('div');
    header.className = 'crystal-upgrade-header';
    header.innerHTML = `
        <div class="upgrade-header-content">
            <span class="upgrade-icon">${upgrade.icon}</span>
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-level-badge">Ур. ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
        </div>
        <div class="upgrade-status">
            ${upgrade.isMaxLevel ? 
                '<span class="max-level-badge">✅ МАКС</span>' :
                upgrade.canPurchase ? 
                    '<span class="affordable-badge">💎 ' + upgrade.cost + '</span>' :
                    '<span class="expensive-badge">💎 ' + upgrade.cost + '</span>'
            }
        </div>
        <span class="expand-arrow">▼</span>
    `;
    
    // Create expandable content
    const content = document.createElement('div');
    content.className = 'crystal-upgrade-content';
    content.innerHTML = `
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-effect-info">
            <strong>Текущий эффект:</strong> ${upgrade.currentEffect}
        </div>
        ${!upgrade.isMaxLevel ? `
            <div class="upgrade-purchase-section">
                <button class="crystal-upgrade-purchase-btn" ${!upgrade.canPurchase ? 'disabled' : ''}>
                    💎 Купить за ${upgrade.cost} кристаллов
                </button>
            </div>
        ` : ''}
    `;
    
    // Add classes for styling
    if (upgrade.canPurchase && !upgrade.isMaxLevel) {
        upgradeItem.classList.add('affordable');
    }
    
    if (upgrade.isMaxLevel) {
        upgradeItem.classList.add('max-level');
    }
    
    // Assemble the item
    upgradeItem.appendChild(header);
    upgradeItem.appendChild(content);
    
    // Add click handler for expansion
    header.addEventListener('click', () => {
        toggleCrystalUpgradeExpansion(upgradeItem);
    });
    
    // Add purchase button handler
    const purchaseBtn = content.querySelector('.crystal-upgrade-purchase-btn');
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header click
            purchaseCrystalUpgrade(upgrade.type);
        });
    }
    
    container.appendChild(upgradeItem);
}

/**
 * Toggle expansion of crystal upgrade item
 */
function toggleCrystalUpgradeExpansion(upgradeItem) {
    const isCollapsed = upgradeItem.classList.contains('collapsed');
    const arrow = upgradeItem.querySelector('.expand-arrow');
    
    if (isCollapsed) {
        upgradeItem.classList.remove('collapsed');
        upgradeItem.classList.add('expanded');
        arrow.textContent = '▲';
    } else {
        upgradeItem.classList.add('collapsed');
        upgradeItem.classList.remove('expanded');
        arrow.textContent = '▼';
    }
}

/**
 * Purchase prestige upgrade
 */
function purchasePrestigeUpgrade(upgradeType) {
    const success = gameState.prestigeSystem.purchasePrestigeUpgrade(upgradeType);
    
    if (success) {
        const config = gameState.prestigeSystem.prestigeUpgradeConfigs[upgradeType];
        
        if (gameState.soundManager) {
            gameState.soundManager.playSuccessSound();
        }
        
        showNotification(`Куплено престижное улучшение ${config.name}! ⭐`, 'success');
        
        // Refresh prestige UI
        initializePrestigeUI();
    } else {
        if (gameState.soundManager) {
            gameState.soundManager.playErrorSound();
        }
        
        showNotification('Недостаточно очков престижа!', 'error');
    }
}

/**
 * Purchase crystal upgrade
 */
function purchaseCrystalUpgrade(upgradeType) {
    const success = gameState.crystalUpgrades.purchaseCrystalUpgrade(upgradeType);
    
    if (success) {
        const config = gameState.crystalUpgrades.crystalUpgradeConfigs[upgradeType];
        
        if (gameState.soundManager) {
            gameState.soundManager.playSuccessSound();
        }
        
        showNotification(`Куплено кристальное улучшение ${config.name}! 💎`, 'success');
        
        // Refresh crystal upgrades UI
        initializeCrystalUpgradesUI();
    } else {
        if (gameState.soundManager) {
            gameState.soundManager.playErrorSound();
        }
        
        showNotification('Недостаточно кристаллов!', 'error');
    }
}

/**
 * Perform prestige
 */
function performPrestige() {
    const result = gameState.prestigeSystem.performPrestige();
    
    if (result.success) {
        if (gameState.soundManager) {
            gameState.soundManager.playSuccessSound();
        }
        
        showNotification(`🌟 Перерождение завершено! Получено ${result.pointsGained} очков престижа!`, 'success');
        
        // Reset garden and shop
        if (gameState.gardenGrid) {
            gameState.gardenGrid.clearAllPlants();
        }
        
        if (gameState.shop) {
            gameState.shop.clearSelection();
            gameState.shop.refresh();
        }
        
        // Reset upgrade system
        if (gameState.upgradeSystem) {
            gameState.upgradeSystem.reset();
        }
        
        // Refresh all UI
        initializeUpgradeUI();
        initializePrestigeUI();
        updatePrestigeInfo();
        
    } else {
        if (gameState.soundManager) {
            gameState.soundManager.playErrorSound();
        }
        
        showNotification(result.message, 'error');
    }
}

/**
 * Update prestige info display
 */
function updatePrestigeInfo() {
    const levelDisplay = document.getElementById('prestige-level-display');
    const pointsDisplay = document.getElementById('prestige-points-available');
    const requirementDisplay = document.getElementById('prestige-requirement');
    const prestigeBtn = document.getElementById('prestige-btn');
    
    if (levelDisplay) {
        levelDisplay.textContent = gameState.prestigeSystem.prestigeLevel;
    }
    
    if (pointsDisplay) {
        pointsDisplay.textContent = gameState.prestigeSystem.prestigePoints;
    }
    
    const requirements = gameState.prestigeSystem.getPrestigeRequirements();
    
    if (requirementDisplay) {
        requirementDisplay.innerHTML = `
            ${requirements.coinRequirement.toLocaleString()} монет, 
            ${requirements.cosmicOrchidRequirement} космических орхидей
        `;
    }
    
    if (prestigeBtn) {
        const canPrestige = requirements.canPrestige;
        prestigeBtn.disabled = !canPrestige;
        
        if (canPrestige) {
            const coins = gameState.resourceManager.getResource('coins');
            const pointsGained = gameState.prestigeSystem.calculatePrestigePoints(coins);
            prestigeBtn.innerHTML = `🌟 Перерождение (+${pointsGained} очков)`;
        } else {
            let statusText = '🌟 Перерождение (Требуется: ';
            if (!requirements.hasCoins) {
                statusText += `${requirements.coinRequirement.toLocaleString()} монет`;
            }
            if (!requirements.hasCosmicOrchids) {
                if (!requirements.hasCoins) statusText += ', ';
                statusText += `${requirements.cosmicOrchidRequirement} космических орхидей (${requirements.cosmicOrchidCount}/${requirements.cosmicOrchidRequirement})`;
            }
            statusText += ')';
            prestigeBtn.innerHTML = statusText;
        }
    }
}

/**
 * Update player name display
 */
function updatePlayerNameDisplay() {
    const playerNameElement = document.getElementById('player-name');
    if (playerNameElement && gameState.playerProfile) {
        playerNameElement.textContent = `👤 ${gameState.playerProfile.playerName}`;
    }
}

/**
 * Setup player name editing
 */
function setupPlayerNameEditing() {
    const editNameBtn = document.getElementById('edit-name-btn');
    if (editNameBtn) {
        editNameBtn.addEventListener('click', () => {
            const currentName = gameState.playerProfile.playerName;
            const newName = prompt('Введите ваше новое имя:', currentName);
            
            if (newName && newName.trim() !== currentName) {
                if (gameState.playerProfile.setPlayerName(newName)) {
                    updatePlayerNameDisplay();
                    if (gameState.notificationSystem) {
                        gameState.notificationSystem.showSuccess(`Имя изменено на: ${newName}`);
                    }
                }
            }
        });
    }
}

// Setup player name editing after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupPlayerNameEditing, 100);
});
