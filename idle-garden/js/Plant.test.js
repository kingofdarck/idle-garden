/**
 * Plant class tests - Unit and Property-based tests
 */

const Plant = require('./Plant.js');
const { PLANT_CONFIGS, getAllPlantTypes } = require('./PlantConfig.js');
const fc = require('fast-check');

describe('Plant Class', () => {
    describe('Unit Tests', () => {
        test('should create plant with valid type', () => {
            const plant = new Plant('carrot');
            expect(plant.type).toBe('carrot');
            expect(plant.level).toBe(1);
            expect(plant.planted).toBe(true);
            expect(plant.growthProgress).toBe(0);
        });

        test('should throw error for invalid plant type', () => {
            expect(() => new Plant('invalid')).toThrow('Invalid plant type: invalid');
        });

        test('should serialize and deserialize correctly', () => {
            const plant = new Plant('tomato', 2, 0.5);
            plant.totalEarned = 100;
            
            const serialized = plant.serialize();
            const deserialized = Plant.deserialize(serialized);
            
            expect(deserialized.type).toBe(plant.type);
            expect(deserialized.level).toBe(plant.level);
            expect(deserialized.growthProgress).toBe(plant.growthProgress);
            expect(deserialized.totalEarned).toBe(plant.totalEarned);
        });

        test('should calculate income per second correctly', () => {
            const plant = new Plant('carrot');
            const config = plant.getConfig();
            const expectedIncomePerSecond = config.income / (config.growthTime / 1000);
            
            expect(plant.getIncomePerSecond()).toBeCloseTo(expectedIncomePerSecond, 2);
        });

        test('should return progress as percentage', () => {
            const plant = new Plant('carrot', 1, 0.75);
            expect(plant.getProgressPercent()).toBe(75);
        });
    });

    describe('Property-Based Tests', () => {
        /**
         * **Feature: idle-garden, Property 3: Growth cycle income generation**
         * **Validates: Requirements 2.1**
         * 
         * For any plant that completes its growth cycle, the player's coin balance 
         * should increase by exactly the plant's income amount
         */
        test('Property 3: Growth cycle income generation', () => {
            fc.assert(fc.property(
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1, max: 10 }),
                fc.double({ min: 0, max: 0.99 }).filter(x => !isNaN(x) && isFinite(x)),
                fc.record({
                    growthSpeed: fc.double({ min: 0.1, max: 10 }).filter(x => !isNaN(x) && isFinite(x) && x > 0),
                    incomeBoost: fc.double({ min: 0.1, max: 10 }).filter(x => !isNaN(x) && isFinite(x) && x > 0)
                }),
                (plantType, level, initialProgress, upgrades) => {
                    const plant = new Plant(plantType, level, initialProgress);
                    const config = plant.getConfig();
                    
                    // Calculate time needed to complete one full cycle
                    const remainingProgress = 1.0 - initialProgress;
                    const timeToComplete = (remainingProgress * config.growthTime) / upgrades.growthSpeed;
                    
                    // Add a small buffer to ensure completion
                    const deltaTime = timeToComplete + 100;
                    
                    const coinsEarned = plant.update(deltaTime, upgrades);
                    const expectedIncome = config.income * upgrades.incomeBoost;
                    
                    // The plant should earn exactly the expected income when completing a cycle
                    expect(coinsEarned).toBeCloseTo(expectedIncome, 2);
                    
                    // Growth progress should reset to start new cycle
                    expect(plant.growthProgress).toBeGreaterThanOrEqual(0);
                    expect(plant.growthProgress).toBeLessThan(1);
                }
            ), { numRuns: 100 });
        });

        /**
         * **Feature: idle-garden, Property 4: Growth cycle continuity**
         * **Validates: Requirements 2.3**
         * 
         * For any plant that finishes growing, the growth cycle should immediately 
         * restart without gaps or delays
         */
        test('Property 4: Growth cycle continuity', () => {
            fc.assert(fc.property(
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1, max: 10 }),
                fc.double({ min: 0.8, max: 0.99 }).filter(x => !isNaN(x) && isFinite(x)), // Start near completion
                fc.record({
                    growthSpeed: fc.double({ min: 0.5, max: 5 }).filter(x => !isNaN(x) && isFinite(x) && x > 0),
                    incomeBoost: fc.double({ min: 0.5, max: 5 }).filter(x => !isNaN(x) && isFinite(x) && x > 0)
                }),
                (plantType, level, initialProgress, upgrades) => {
                    const plant = new Plant(plantType, level, initialProgress);
                    const config = plant.getConfig();
                    
                    // Calculate time to complete current cycle plus a bit more for next cycle
                    const remainingProgress = 1.0 - initialProgress;
                    const timeToComplete = (remainingProgress * config.growthTime) / upgrades.growthSpeed;
                    const extraTime = (config.growthTime * 0.3) / upgrades.growthSpeed; // 30% into next cycle
                    const totalTime = timeToComplete + extraTime;
                    
                    const coinsEarned = plant.update(totalTime, upgrades);
                    
                    // Should have earned income (completed at least one cycle)
                    expect(coinsEarned).toBeGreaterThan(0);
                    
                    // Growth should have restarted and be in progress for next cycle
                    // The new progress should be greater than 0 since we gave extra time
                    expect(plant.growthProgress).toBeGreaterThan(0);
                    expect(plant.growthProgress).toBeLessThan(1);
                    
                    // The new progress should correspond to the extra time given
                    const expectedNewProgress = extraTime / (config.growthTime / upgrades.growthSpeed);
                    expect(plant.growthProgress).toBeCloseTo(expectedNewProgress, 1);
                }
            ), { numRuns: 100 });
        });

        /**
         * **Feature: idle-garden, Property 11: Offline progress calculation**
         * **Validates: Requirements 6.4**
         * 
         * For any saved game with elapsed offline time, loading should award coins 
         * equal to the total income that would have been generated during that time
         */
        test('Property 11: Offline progress calculation', () => {
            fc.assert(fc.property(
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1, max: 10 }),
                fc.double({ min: 0, max: 0.99 }).filter(x => !isNaN(x) && isFinite(x)),
                fc.record({
                    growthSpeed: fc.double({ min: 0.5, max: 5 }).filter(x => !isNaN(x) && isFinite(x) && x > 0),
                    incomeBoost: fc.double({ min: 0.5, max: 5 }).filter(x => !isNaN(x) && isFinite(x) && x > 0)
                }),
                fc.integer({ min: 1000, max: 3600000 }), // 1 second to 1 hour offline time
                (plantType, level, initialProgress, upgrades, offlineTime) => {
                    const plant = new Plant(plantType, level, initialProgress);
                    const config = plant.getConfig();
                    
                    // Store initial state
                    const initialGrowthProgress = plant.growthProgress;
                    const initialTotalEarned = plant.totalEarned;
                    
                    // Calculate offline progress
                    const offlineIncome = plant.calculateOfflineProgress(offlineTime, upgrades);
                    
                    // Verify offline income is non-negative
                    expect(offlineIncome).toBeGreaterThanOrEqual(0);
                    
                    // Calculate expected income manually
                    const effectiveGrowthTime = config.growthTime / upgrades.growthSpeed;
                    const remainingGrowthTime = (1 - initialProgress) * effectiveGrowthTime;
                    
                    let expectedIncome = 0;
                    let remainingTime = offlineTime;
                    
                    // If enough time to complete current cycle
                    if (remainingTime >= remainingGrowthTime) {
                        expectedIncome += config.income * upgrades.incomeBoost;
                        remainingTime -= remainingGrowthTime;
                        
                        // Add complete cycles
                        const completeCycles = Math.floor(remainingTime / effectiveGrowthTime);
                        expectedIncome += completeCycles * config.income * upgrades.incomeBoost;
                    }
                    
                    // Verify calculated income matches expected
                    expect(offlineIncome).toBeCloseTo(expectedIncome, 2);
                    
                    // Verify total earned was updated
                    expect(plant.totalEarned).toBeCloseTo(initialTotalEarned + offlineIncome, 2);
                    
                    // Verify growth progress is valid (between 0 and 1)
                    expect(plant.growthProgress).toBeGreaterThanOrEqual(0);
                    expect(plant.growthProgress).toBeLessThan(1);
                    
                    // Verify growth progress changed appropriately
                    if (offlineTime >= remainingGrowthTime) {
                        // Should have completed at least one cycle and started a new one
                        const remainingCycleTime = (offlineTime - remainingGrowthTime) % effectiveGrowthTime;
                        const expectedNewProgress = remainingCycleTime / effectiveGrowthTime;
                        expect(plant.growthProgress).toBeCloseTo(expectedNewProgress, 5);
                    } else {
                        // Should have progressed but not completed current cycle
                        const expectedProgress = initialProgress + (offlineTime / effectiveGrowthTime);
                        expect(plant.growthProgress).toBeCloseTo(expectedProgress, 5);
                    }
                }
            ), { numRuns: 100 });
        });

        test('Property: Offline progress with zero time should not change state', () => {
            fc.assert(fc.property(
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1, max: 10 }),
                fc.double({ min: 0, max: 0.99 }).filter(x => !isNaN(x) && isFinite(x)),
                (plantType, level, initialProgress) => {
                    const plant = new Plant(plantType, level, initialProgress);
                    
                    const initialGrowthProgress = plant.growthProgress;
                    const initialTotalEarned = plant.totalEarned;
                    
                    // Calculate offline progress with zero time
                    const offlineIncome = plant.calculateOfflineProgress(0, {});
                    
                    // Should earn nothing
                    expect(offlineIncome).toBe(0);
                    
                    // State should be unchanged
                    expect(plant.growthProgress).toBe(initialGrowthProgress);
                    expect(plant.totalEarned).toBe(initialTotalEarned);
                }
            ), { numRuns: 50 });
        });

        test('Property: Offline progress with unplanted plant should earn nothing', () => {
            fc.assert(fc.property(
                fc.constantFrom(...getAllPlantTypes()),
                fc.integer({ min: 1000, max: 3600000 }), // 1 second to 1 hour
                (plantType, offlineTime) => {
                    const plant = new Plant(plantType);
                    plant.planted = false; // Unplant the plant
                    
                    const offlineIncome = plant.calculateOfflineProgress(offlineTime, {});
                    
                    // Unplanted plants should earn nothing
                    expect(offlineIncome).toBe(0);
                }
            ), { numRuns: 50 });
        });
    });
});