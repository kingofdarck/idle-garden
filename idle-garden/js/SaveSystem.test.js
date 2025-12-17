/**
 * SaveSystem class tests - Unit and Property-based tests
 */

const SaveSystem = require('./SaveSystem.js');
const fc = require('fast-check');

// Mock localStorage for testing
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => store[key] = value.toString(),
        removeItem: (key) => delete store[key],
        clear: () => store = {},
        get length() { return Object.keys(store).length; },
        key: (index) => Object.keys(store)[index] || null
    };
})();

// Mock global localStorage
global.localStorage = localStorageMock;

describe('SaveSystem Class', () => {
    let saveSystem;
    let mockNotificationSystem;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        
        // Mock notification system
        mockNotificationSystem = {
            showSuccess: jest.fn(),
            showError: jest.fn(),
            showWarning: jest.fn(),
            showInfo: jest.fn()
        };
        
        saveSystem = new SaveSystem('test-save', mockNotificationSystem);
    });

    describe('Unit Tests', () => {
        test('should create SaveSystem with default parameters', () => {
            const defaultSaveSystem = new SaveSystem();
            expect(defaultSaveSystem.saveKey).toBe('idle-garden-save');
            expect(defaultSaveSystem.isSupported).toBe(true);
        });

        test('should save and load game state correctly', () => {
            const gameState = {
                resources: { coins: 100, seeds: 10, water: 5 },
                garden: { plants: [] },
                upgrades: { growthSpeed: 1, incomeBoost: 1 }
            };

            const saveSuccess = saveSystem.saveGame(gameState);
            expect(saveSuccess).toBe(true);

            const loadedState = saveSystem.loadGame();
            expect(loadedState).toEqual(gameState);
        });

        test('should return null when no save file exists', () => {
            const loadedState = saveSystem.loadGame();
            expect(loadedState).toBeNull();
        });

        test('should detect save file existence correctly', () => {
            expect(saveSystem.hasSaveFile()).toBe(false);

            const gameState = { test: 'data' };
            saveSystem.saveGame(gameState);

            expect(saveSystem.hasSaveFile()).toBe(true);
        });

        test('should delete save file correctly', () => {
            const gameState = { test: 'data' };
            saveSystem.saveGame(gameState);
            expect(saveSystem.hasSaveFile()).toBe(true);

            const deleteSuccess = saveSystem.deleteSave();
            expect(deleteSuccess).toBe(true);
            expect(saveSystem.hasSaveFile()).toBe(false);
        });

        test('should get save info correctly', () => {
            const gameState = { test: 'data' };
            const beforeSave = Date.now();
            saveSystem.saveGame(gameState);
            const afterSave = Date.now();

            const saveInfo = saveSystem.getSaveInfo();
            expect(saveInfo).toBeTruthy();
            expect(saveInfo.version).toBe('1.0.0');
            expect(saveInfo.timestamp).toBeGreaterThanOrEqual(beforeSave);
            expect(saveInfo.timestamp).toBeLessThanOrEqual(afterSave);
            expect(saveInfo.hasGameState).toBe(true);
        });

        test('should create and restore backup correctly', () => {
            const gameState = { test: 'original' };
            saveSystem.saveGame(gameState);

            const backupSuccess = saveSystem.createBackup();
            expect(backupSuccess).toBe(true);

            // Modify the save
            const newGameState = { test: 'modified' };
            saveSystem.saveGame(newGameState);

            // Restore from backup
            const restoreSuccess = saveSystem.restoreFromBackup();
            expect(restoreSuccess).toBe(true);

            const restoredState = saveSystem.loadGame();
            expect(restoredState).toEqual(gameState);
        });

        test('should export and import save correctly', () => {
            const gameState = { test: 'export-import' };
            saveSystem.saveGame(gameState);

            const exportedData = saveSystem.exportSave();
            expect(exportedData).toBeTruthy();

            // Clear save and import
            saveSystem.deleteSave();
            expect(saveSystem.hasSaveFile()).toBe(false);

            const importSuccess = saveSystem.importSave(exportedData);
            expect(importSuccess).toBe(true);

            const importedState = saveSystem.loadGame();
            expect(importedState).toEqual(gameState);
        });

        test('should handle corrupted save data gracefully', () => {
            // Manually set corrupted data
            localStorage.setItem('test-save', 'invalid json');

            const loadedState = saveSystem.loadGame();
            expect(loadedState).toBeNull();
            expect(mockNotificationSystem.showError).toHaveBeenCalled();
        });

        test('should handle invalid import data gracefully', () => {
            const importSuccess = saveSystem.importSave('invalid json');
            expect(importSuccess).toBe(false);
            expect(mockNotificationSystem.showError).toHaveBeenCalled();
        });
    });

    describe('Property-Based Tests', () => {
        /**
         * **Feature: idle-garden, Property 10: Save/load state preservation**
         * **Validates: Requirements 6.3**
         * 
         * For any game state, saving and then loading should restore all plants, 
         * resources, and upgrades to their exact previous values
         */
        test('Property 10: Save/load state preservation', () => {
            fc.assert(fc.property(
                // Generate arbitrary game state
                fc.record({
                    resources: fc.record({
                        coins: fc.integer({ min: 0, max: 1000000 }),
                        seeds: fc.integer({ min: 0, max: 10000 }),
                        water: fc.integer({ min: 0, max: 10000 })
                    }),
                    garden: fc.record({
                        plants: fc.array(
                            fc.record({
                                type: fc.constantFrom('carrot', 'tomato', 'corn', 'potato', 'lettuce'),
                                level: fc.integer({ min: 1, max: 10 }),
                                planted: fc.boolean(),
                                growthProgress: fc.double({ min: 0, max: 1 }).filter(x => !isNaN(x) && isFinite(x)),
                                lastUpdate: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
                                totalEarned: fc.integer({ min: 0, max: 1000000 })
                            }),
                            { minLength: 0, maxLength: 12 }
                        )
                    }),
                    upgrades: fc.record({
                        growthSpeed: fc.double({ min: 1, max: 10 }).filter(x => !isNaN(x) && isFinite(x)),
                        incomeBoost: fc.double({ min: 1, max: 10 }).filter(x => !isNaN(x) && isFinite(x)),
                        waterEfficiency: fc.double({ min: 1, max: 5 }).filter(x => !isNaN(x) && isFinite(x)),
                        seedProduction: fc.double({ min: 1, max: 5 }).filter(x => !isNaN(x) && isFinite(x))
                    }),
                    timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() })
                }),
                (gameState) => {
                    // Clear any existing save
                    saveSystem.deleteSave();
                    
                    // Save the game state
                    const saveSuccess = saveSystem.saveGame(gameState);
                    expect(saveSuccess).toBe(true);
                    
                    // Load the game state
                    const loadedState = saveSystem.loadGame();
                    expect(loadedState).toBeTruthy();
                    
                    // Verify all properties are preserved exactly
                    expect(loadedState.resources).toEqual(gameState.resources);
                    expect(loadedState.garden).toEqual(gameState.garden);
                    expect(loadedState.upgrades).toEqual(gameState.upgrades);
                    expect(loadedState.timestamp).toEqual(gameState.timestamp);
                    
                    // Verify nested plant data is preserved
                    if (gameState.garden && gameState.garden.plants) {
                        expect(loadedState.garden.plants).toHaveLength(gameState.garden.plants.length);
                        
                        gameState.garden.plants.forEach((originalPlant, index) => {
                            const loadedPlant = loadedState.garden.plants[index];
                            expect(loadedPlant.type).toBe(originalPlant.type);
                            expect(loadedPlant.level).toBe(originalPlant.level);
                            expect(loadedPlant.planted).toBe(originalPlant.planted);
                            expect(loadedPlant.growthProgress).toBeCloseTo(originalPlant.growthProgress, 10);
                            expect(loadedPlant.lastUpdate).toBe(originalPlant.lastUpdate);
                            expect(loadedPlant.totalEarned).toBe(originalPlant.totalEarned);
                        });
                    }
                }
            ), { numRuns: 100 });
        });

        test('Property: Save/load round trip with multiple operations', () => {
            fc.assert(fc.property(
                fc.array(
                    fc.record({
                        resources: fc.record({
                            coins: fc.integer({ min: 0, max: 100000 }),
                            seeds: fc.integer({ min: 0, max: 1000 }),
                            water: fc.integer({ min: 0, max: 1000 })
                        }),
                        upgrades: fc.record({
                            growthSpeed: fc.double({ min: 1, max: 5 }).filter(x => !isNaN(x) && isFinite(x)),
                            incomeBoost: fc.double({ min: 1, max: 5 }).filter(x => !isNaN(x) && isFinite(x))
                        })
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
                (gameStates) => {
                    // Clear any existing save
                    saveSystem.deleteSave();
                    
                    // Save and load each state in sequence
                    let lastLoadedState = null;
                    
                    gameStates.forEach((gameState, index) => {
                        // Save current state
                        const saveSuccess = saveSystem.saveGame(gameState);
                        expect(saveSuccess).toBe(true);
                        
                        // Load and verify
                        const loadedState = saveSystem.loadGame();
                        expect(loadedState).toEqual(gameState);
                        
                        lastLoadedState = loadedState;
                    });
                    
                    // Final verification - the last loaded state should match the last saved state
                    expect(lastLoadedState).toEqual(gameStates[gameStates.length - 1]);
                }
            ), { numRuns: 50 });
        });

        test('Property: Save file existence consistency', () => {
            fc.assert(fc.property(
                fc.record({
                    resources: fc.record({
                        coins: fc.integer({ min: 0, max: 10000 }),
                        seeds: fc.integer({ min: 0, max: 100 }),
                        water: fc.integer({ min: 0, max: 100 })
                    })
                }),
                (gameState) => {
                    // Clear any existing save
                    saveSystem.deleteSave();
                    expect(saveSystem.hasSaveFile()).toBe(false);
                    
                    // Save game state
                    const saveSuccess = saveSystem.saveGame(gameState);
                    expect(saveSuccess).toBe(true);
                    expect(saveSystem.hasSaveFile()).toBe(true);
                    
                    // Delete save
                    const deleteSuccess = saveSystem.deleteSave();
                    expect(deleteSuccess).toBe(true);
                    expect(saveSystem.hasSaveFile()).toBe(false);
                }
            ), { numRuns: 50 });
        });
    });
});