/**
 * SaveSystem class - Handles game state persistence using localStorage
 * Manages serialization, deserialization, and save/load operations
 */
class SaveSystem {
    /**
     * Create a new SaveSystem instance
     * @param {string} saveKey - Key to use for localStorage (default: 'idle-garden-save')
     * @param {Object} notificationSystem - Notification system for user feedback
     */
    constructor(saveKey = 'idle-garden-save', notificationSystem = null) {
        this.saveKey = saveKey;
        this.notificationSystem = notificationSystem;
        this.isSupported = this.checkLocalStorageSupport();
        
        if (!this.isSupported) {
            console.warn('localStorage is not supported - save/load functionality will be disabled');
        }
    }
    
    /**
     * Check if localStorage is supported and available
     * @returns {boolean} True if localStorage is supported
     */
    checkLocalStorageSupport() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Save game state to localStorage
     * @param {Object} gameState - Complete game state to save
     * @returns {boolean} True if save was successful
     */
    saveGame(gameState) {
        if (!this.isSupported) {
            console.error('Невозможно сохранить: localStorage не поддерживается');
            if (this.notificationSystem) {
                this.notificationSystem.showError('Сохранение не удалось: Хранилище недоступно');
            }
            return false;
        }
        
        try {
            // Add save metadata
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                gameState: gameState
            };
            
            // Serialize and save to localStorage
            const serializedData = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, serializedData);
            
            console.log('🔄 Игра успешно сохранена');
            
            // Show save confirmation
            if (this.notificationSystem) {
                this.notificationSystem.showSuccess('Игра сохранена!', 2000);
            }
            
            return true;
            
        } catch (error) {
            console.error('Не удалось сохранить игру:', error);
            
            // Handle quota exceeded error specifically
            if (error.name === 'QuotaExceededError') {
                if (this.notificationSystem) {
                    this.notificationSystem.showError('Сохранение не удалось: Превышена квота хранилища');
                }
            } else {
                if (this.notificationSystem) {
                    this.notificationSystem.showError('Сохранение не удалось: ' + error.message);
                }
            }
            
            return false;
        }
    }
    
    /**
     * Load game state from localStorage
     * @returns {Object|null} Loaded game state or null if no save exists
     */
    loadGame() {
        if (!this.isSupported) {
            console.error('Невозможно загрузить: localStorage не поддерживается');
            return null;
        }
        
        try {
            const serializedData = localStorage.getItem(this.saveKey);
            
            if (!serializedData) {
                console.log('Сохраненная игра не найдена');
                return null;
            }
            
            const saveData = JSON.parse(serializedData);
            
            // Validate save data structure
            if (!saveData.gameState || !saveData.timestamp) {
                console.warn('Неверная структура данных сохранения');
                return null;
            }
            
            // Check save version compatibility (for future use)
            if (saveData.version && !this.isVersionCompatible(saveData.version)) {
                console.warn(`Версия сохранения ${saveData.version} может быть несовместима`);
                if (this.notificationSystem) {
                    this.notificationSystem.showWarning('Файл сохранения может быть из старой версии');
                }
            }
            
            console.log('🔄 Игра успешно загружена');
            
            return saveData.gameState;
            
        } catch (error) {
            console.error('Не удалось загрузить игру:', error);
            
            if (this.notificationSystem) {
                this.notificationSystem.showError('Загрузка не удалась: Поврежденные данные сохранения');
            }
            
            return null;
        }
    }
    
    /**
     * Check if a save file exists
     * @returns {boolean} True if save file exists
     */
    hasSaveFile() {
        if (!this.isSupported) {
            return false;
        }
        
        try {
            const saveData = localStorage.getItem(this.saveKey);
            return saveData !== null;
        } catch (error) {
            console.error('Ошибка при проверке файла сохранения:', error);
            return false;
        }
    }
    
    /**
     * Get save file information without loading the full game state
     * @returns {Object|null} Save file metadata or null if no save exists
     */
    getSaveInfo() {
        if (!this.isSupported) {
            return null;
        }
        
        try {
            const serializedData = localStorage.getItem(this.saveKey);
            
            if (!serializedData) {
                return null;
            }
            
            const saveData = JSON.parse(serializedData);
            
            return {
                version: saveData.version || 'unknown',
                timestamp: saveData.timestamp,
                saveDate: new Date(saveData.timestamp),
                hasGameState: !!saveData.gameState
            };
            
        } catch (error) {
            console.error('Ошибка при чтении информации о сохранении:', error);
            return null;
        }
    }
    
    /**
     * Delete the current save file
     * @returns {boolean} True if deletion was successful
     */
    deleteSave() {
        if (!this.isSupported) {
            console.error('Невозможно удалить сохранение: localStorage не поддерживается');
            return false;
        }
        
        try {
            localStorage.removeItem(this.saveKey);
            console.log('🗑️ Файл сохранения удален');
            
            if (this.notificationSystem) {
                this.notificationSystem.showInfo('Файл сохранения удален');
            }
            
            return true;
            
        } catch (error) {
            console.error('Не удалось удалить сохранение:', error);
            
            if (this.notificationSystem) {
                this.notificationSystem.showError('Не удалось удалить файл сохранения');
            }
            
            return false;
        }
    }
    
    /**
     * Create a backup of the current save
     * @returns {boolean} True if backup was successful
     */
    createBackup() {
        if (!this.isSupported) {
            return false;
        }
        
        try {
            const currentSave = localStorage.getItem(this.saveKey);
            
            if (!currentSave) {
                console.log('Нет файла сохранения для резервного копирования');
                return false;
            }
            
            const backupKey = this.saveKey + '_backup';
            localStorage.setItem(backupKey, currentSave);
            
            console.log('🔄 Резервная копия сохранения создана');
            return true;
            
        } catch (error) {
            console.error('Не удалось создать резервную копию:', error);
            return false;
        }
    }
    
    /**
     * Restore from backup save
     * @returns {boolean} True if restore was successful
     */
    restoreFromBackup() {
        if (!this.isSupported) {
            return false;
        }
        
        try {
            const backupKey = this.saveKey + '_backup';
            const backupSave = localStorage.getItem(backupKey);
            
            if (!backupSave) {
                console.log('Файл резервной копии не найден');
                if (this.notificationSystem) {
                    this.notificationSystem.showWarning('Файл резервной копии не найден');
                }
                return false;
            }
            
            localStorage.setItem(this.saveKey, backupSave);
            
            console.log('🔄 Сохранение восстановлено из резервной копии');
            if (this.notificationSystem) {
                this.notificationSystem.showSuccess('Сохранение восстановлено из резервной копии');
            }
            
            return true;
            
        } catch (error) {
            console.error('Не удалось восстановить из резервной копии:', error);
            
            if (this.notificationSystem) {
                this.notificationSystem.showError('Не удалось восстановить из резервной копии');
            }
            
            return false;
        }
    }
    
    /**
     * Check if save version is compatible with current game version
     * @param {string} saveVersion - Version string from save file
     * @returns {boolean} True if compatible
     */
    isVersionCompatible(saveVersion) {
        // For now, accept all versions
        // In the future, this could implement version migration logic
        return true;
    }
    
    /**
     * Export save data as downloadable file
     * @returns {string|null} Save data as JSON string or null if failed
     */
    exportSave() {
        if (!this.isSupported) {
            return null;
        }
        
        try {
            const saveData = localStorage.getItem(this.saveKey);
            
            if (!saveData) {
                if (this.notificationSystem) {
                    this.notificationSystem.showWarning('Нет файла сохранения для экспорта');
                }
                return null;
            }
            
            return saveData;
            
        } catch (error) {
            console.error('Не удалось экспортировать сохранение:', error);
            
            if (this.notificationSystem) {
                this.notificationSystem.showError('Не удалось экспортировать сохранение');
            }
            
            return null;
        }
    }
    
    /**
     * Import save data from JSON string
     * @param {string} saveDataString - JSON string containing save data
     * @returns {boolean} True if import was successful
     */
    importSave(saveDataString) {
        if (!this.isSupported) {
            return false;
        }
        
        try {
            // Validate JSON format
            const saveData = JSON.parse(saveDataString);
            
            if (!saveData.gameState || !saveData.timestamp) {
                if (this.notificationSystem) {
                    this.notificationSystem.showError('Неверный формат файла сохранения');
                }
                return false;
            }
            
            // Create backup of current save before importing
            this.createBackup();
            
            // Import the new save
            localStorage.setItem(this.saveKey, saveDataString);
            
            console.log('🔄 Сохранение успешно импортировано');
            if (this.notificationSystem) {
                this.notificationSystem.showSuccess('Сохранение успешно импортировано');
            }
            
            return true;
            
        } catch (error) {
            console.error('Не удалось импортировать сохранение:', error);
            
            if (this.notificationSystem) {
                this.notificationSystem.showError('Не удалось импортировать сохранение: Неверный формат');
            }
            
            return false;
        }
    }
    
    /**
     * Get storage usage information
     * @returns {Object} Storage usage statistics
     */
    getStorageInfo() {
        if (!this.isSupported) {
            return { supported: false };
        }
        
        try {
            const saveData = localStorage.getItem(this.saveKey);
            const saveSize = saveData ? new Blob([saveData]).size : 0;
            
            // Estimate total localStorage usage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            return {
                supported: true,
                saveSize: saveSize,
                totalStorageUsed: totalSize,
                hasSave: !!saveData
            };
            
        } catch (error) {
            console.error('Ошибка при получении информации о хранилище:', error);
            return { supported: true, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveSystem;
} else if (typeof window !== 'undefined') {
    window.SaveSystem = SaveSystem;
}