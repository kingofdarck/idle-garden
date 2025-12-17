/**
 * UpgradeSystem class tests - Unit and Property-based tests
 */

const UpgradeSystem = require('./UpgradeSystem.js');
const ResourceManager = require('./ResourceManager.js');
const Plant = require('./Plant.js');
const { getAllPlantTypes } = require('./PlantConfig.js');
const fc = require('fast-check');

describe('UpgradeSystem Class', () => {
    let resourceManager;
    let upgradeSystem;

    beforeEach(() => {
        // Create a resource manager with plenty of resources for testing
        resourceManager = new ResourceManager({ coins: 10000, seeds: 1000, water: 1000 });
        upgradeSystem = new UpgradeSystem(resourceManager);
    });

    describe('Unit Tests', () => {
        test('should initialize with default upgrade levels', () => {
            expect(upgradeSystem.getUpgradeLevel('growthSpeed')).toBe(1);
            expect(upgradeSystem.getUpgradeLevel('incomeBoost')).toBe(1);
            expect(upgradeSystem.getUpgradeLevel('waterEfficiency')).toBe(1);
            expect(upgradeSystem.getUpgradeLevel('seedProduction')).toBe(1);
        });

        test('should throw error for invalid upgrade type', () => {
            expect(() => upgradeSystem.getUpgradeLevel('invalid')).toThrow('Invalid upgrade type: invalid');
        });

        test('should calculate upgrade costs correctly', () => {
            const cost = upgradeSystem.getUpgradeCost('growthSpeed');
            expect(cost).toEqual({ coins: 100, seeds: 0, water: 0 });
            
            // Purchase one level and check cost increase
            upgradeSystem.purchaseUpgrade('growthSpeed');
            const newCost = upgradeSystem.getUpgradeCost('growthSpeed');
            expect(newCost.coins).toBeGreaterThan(cost.coins);
        });

        test('should return null cost when at max level', () => {
            const config = upgradeSystem.getUpgradeConfig('growthSpeed');
            
            // Set to max level
            upgradeSystem.upgrades.growthSpeed = config.maxLevel;
            
            const cost = upgradeSystem.getUpgradeCost('growthSpeed');
            expect(cost).toBeNull();
        });

        test('should purchase upgrades successfully', () => {
            const initialLevel = upgradeSystem.getUpgradeLevel('growthSpeed');
            const success = upgradeSystem.purchaseUpgrade('growthSpeed');
            
            expect(success).toBe(true);
            expect(upgradeSystem.getUpgradeLevel('growthSpeed')).toBe(initialLevel + 1);
        });

        test('should fail to purchase when insufficient resources', () => {
            // Create resource manager with no coins
            const poorResourceManager = new ResourceManager({ coins: 0, seeds: 0, water: 0 });
            const poorUpgradeSystem = new UpgradeSystem(poorResourceManager);
            
            const success = poorUpgradeSystem.purchaseUpgrade('growthSpeed');
            expect(success).toBe(false);
        });

        test('should serialize and deserialize correctly', () => {
            upgradeSystem.purchaseUpgrade('growthSpeed');
            upgradeSystem.purchaseUpgrade('incomeBoost');
            
            const serialized = upgradeSystem.serialize();
            const newUpgradeSystem = new UpgradeSystem(resourceManager);
            newUpgradeSystem.deserialize(serialized);
            
            expect(newUpgradeSystem.getUpgradeLevel('growthSpeed')).toBe(2);
            expect(newUpgradeSystem.getUpgradeLevel('incomeBoost')).toBe(2);
        });
    });

    describe('Property-Based Tests', () => {
        /**
         * **Feature: idle-garden, Property 7: Upgrade effect application**
         * **Validates: Requirements 5.2**
         * 
         * For any upgrade that affects plant performance, purchasing the upgrade 
         * should immediately apply the improvement to all applicable plants
         */
        test('Property 7: Upgrade effect application', () => {
            fc.assert(fc.property(
                fc.constantFrom('growthSpeed', 'incomeBoost'),
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1, max: 5 }), // Number of upgrade levels to purchase
                (upgradeType, plantType, upgradeLevels) => {
                    // Create a fresh upgrade system with plenty of resources
                    const testResourceManager = new ResourceManager({ coins: 100000, seeds: 10000, water: 10000 });
                    const testUpgradeSystem = new UpgradeSystem(testResourceManager);
                    
                    // Create a plant to test effects on
                    const plant = new Plant(plantType);
                    
                    // Get initial effect multipliers
                    const initialMultipliers = testUpgradeSystem.getEffectMultipliers();
                    
                    // Purchase upgrades
                    for (let i = 0; i < upgradeLevels; i++) {
                        const canPurchase = testUpgradeSystem.canPurchaseUpgrade(upgradeType);
                        if (canPurchase) {
                            testUpgradeSystem.purchaseUpgrade(upgradeType);
                        }
                    }
                    
                    // Get new effect multipliers
                    const newMultipliers = testUpgradeSystem.getEffectMultipliers();
                    
                    // The relevant multiplier should have increased
                    if (upgradeType === 'growthSpeed') {
                        expect(newMultipliers.growthSpeed).toBeGreaterThan(initialMultipliers.growthSpeed);
                        
                        // Test that plant actually benefits from the upgrade
                        const config = plant.getConfig();
                        const baseIncomePerSecond = config.income / (config.growthTime / 1000);
                        const upgradedIncomePerSecond = plant.getIncomePerSecond(newMultipliers);
                        
                        expect(upgradedIncomePerSecond).toBeGreaterThan(baseIncomePerSecond);
                    } else if (upgradeType === 'incomeBoost') {
                        expect(newMultipliers.incomeBoost).toBeGreaterThan(initialMultipliers.incomeBoost);
                        
                        // Test that plant income is actually boosted
                        const config = plant.getConfig();
                        const baseIncome = config.income;
                        const timeToComplete = config.growthTime;
                        
                        const coinsEarned = plant.update(timeToComplete, newMultipliers);
                        const expectedIncome = baseIncome * newMultipliers.incomeBoost;
                        
                        expect(coinsEarned).toBeCloseTo(expectedIncome, 2);
                    }
                }
            ), { numRuns: 100 });
        });

        /**
         * **Feature: idle-garden, Property 8: Growth speed upgrade consistency**
         * **Validates: Requirements 5.3**
         * 
         * For any growth speed upgrade, all current and future plants should have 
         * their growth times reduced by the upgrade multiplier
         */
        test('Property 8: Growth speed upgrade consistency', () => {
            fc.assert(fc.property(
                fc.array(fc.constantFrom(...getAllPlantTypes()), { minLength: 1, maxLength: 5 }),
                fc.integer({ min: 1, max: 3 }), // Number of growth speed upgrades
                (plantTypes, upgradeCount) => {
                    // Create upgrade system with plenty of resources
                    const testResourceManager = new ResourceManager({ coins: 100000, seeds: 10000, water: 10000 });
                    const testUpgradeSystem = new UpgradeSystem(testResourceManager);
                    
                    // Create plants before upgrade
                    const plantsBeforeUpgrade = plantTypes.map(type => new Plant(type));
                    
                    // Get initial growth multiplier
                    const initialMultiplier = testUpgradeSystem.getEffectMultipliers().growthSpeed;
                    
                    // Purchase growth speed upgrades
                    for (let i = 0; i < upgradeCount; i++) {
                        if (testUpgradeSystem.canPurchaseUpgrade('growthSpeed')) {
                            testUpgradeSystem.purchaseUpgrade('growthSpeed');
                        }
                    }
                    
                    // Get new growth multiplier
                    const newMultiplier = testUpgradeSystem.getEffectMultipliers().growthSpeed;
                    
                    // Create plants after upgrade
                    const plantsAfterUpgrade = plantTypes.map(type => new Plant(type));
                    
                    // All plants (before and after upgrade) should benefit equally from the multiplier
                    const allPlants = [...plantsBeforeUpgrade, ...plantsAfterUpgrade];
                    
                    allPlants.forEach(plant => {
                        const config = plant.getConfig();
                        
                        // Calculate expected income per second with upgrade
                        const baseIncomePerSecond = config.income / (config.growthTime / 1000);
                        const upgradedIncomePerSecond = baseIncomePerSecond * newMultiplier;
                        
                        // Test that plant's getIncomePerSecond reflects the upgrade
                        const actualIncomePerSecond = plant.getIncomePerSecond(testUpgradeSystem.getEffectMultipliers());
                        expect(actualIncomePerSecond).toBeCloseTo(upgradedIncomePerSecond, 2);
                        
                        // Test that plant update actually uses the multiplier
                        const timeForOneCycle = config.growthTime;
                        const coinsEarned = plant.update(timeForOneCycle, testUpgradeSystem.getEffectMultipliers());
                        
                        // Should earn base income (income boost is separate from growth speed)
                        expect(coinsEarned).toBeCloseTo(config.income, 2);
                        
                        // Growth should be complete or nearly complete due to speed boost
                        expect(plant.growthProgress).toBeGreaterThanOrEqual(0);
                    });
                    
                    // Verify the multiplier actually increased
                    if (upgradeCount > 0) {
                        expect(newMultiplier).toBeGreaterThan(initialMultiplier);
                    }
                }
            ), { numRuns: 100 });
        });

        /**
         * **Feature: idle-garden, Property 9: Income upgrade consistency**
         * **Validates: Requirements 5.4**
         * 
         * For any income upgrade, all plants should have their coin generation 
         * increased by the upgrade multiplier immediately
         */
        test('Property 9: Income upgrade consistency', () => {
            fc.assert(fc.property(
                fc.array(fc.constantFrom(...getAllPlantTypes()), { minLength: 1, maxLength: 5 }),
                fc.integer({ min: 1, max: 3 }), // Number of income upgrades
                (plantTypes, upgradeCount) => {
                    // Create upgrade system with plenty of resources
                    const testResourceManager = new ResourceManager({ coins: 100000, seeds: 10000, water: 10000 });
                    const testUpgradeSystem = new UpgradeSystem(testResourceManager);
                    
                    // Create plants before upgrade
                    const plantsBeforeUpgrade = plantTypes.map(type => new Plant(type));
                    
                    // Get initial income multiplier
                    const initialMultiplier = testUpgradeSystem.getEffectMultipliers().incomeBoost;
                    
                    // Purchase income boost upgrades
                    for (let i = 0; i < upgradeCount; i++) {
                        if (testUpgradeSystem.canPurchaseUpgrade('incomeBoost')) {
                            testUpgradeSystem.purchaseUpgrade('incomeBoost');
                        }
                    }
                    
                    // Get new income multiplier
                    const newMultiplier = testUpgradeSystem.getEffectMultipliers().incomeBoost;
                    
                    // Create plants after upgrade
                    const plantsAfterUpgrade = plantTypes.map(type => new Plant(type));
                    
                    // All plants (before and after upgrade) should benefit equally from the multiplier
                    const allPlants = [...plantsBeforeUpgrade, ...plantsAfterUpgrade];
                    
                    allPlants.forEach(plant => {
                        const config = plant.getConfig();
                        
                        // Test that plant's income per second reflects the upgrade
                        const baseIncomePerSecond = config.income / (config.growthTime / 1000);
                        const expectedUpgradedIncomePerSecond = baseIncomePerSecond * newMultiplier;
                        const actualIncomePerSecond = plant.getIncomePerSecond(testUpgradeSystem.getEffectMultipliers());
                        
                        expect(actualIncomePerSecond).toBeCloseTo(expectedUpgradedIncomePerSecond, 2);
                        
                        // Test that plant update actually generates boosted income
                        const timeForOneCycle = config.growthTime;
                        const coinsEarned = plant.update(timeForOneCycle, testUpgradeSystem.getEffectMultipliers());
                        const expectedIncome = config.income * newMultiplier;
                        
                        expect(coinsEarned).toBeCloseTo(expectedIncome, 2);
                    });
                    
                    // Verify the multiplier actually increased
                    if (upgradeCount > 0) {
                        expect(newMultiplier).toBeGreaterThan(initialMultiplier);
                    }
                }
            ), { numRuns: 100 });
        });
    });
});