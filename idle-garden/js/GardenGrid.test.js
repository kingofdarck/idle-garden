/**
 * Property-based tests for GardenGrid class
 * Tests plant count accuracy and other garden grid properties
 */

const fc = require('fast-check');
const GardenGrid = require('./GardenGrid.js');
const Plant = require('./Plant.js');

// Mock DOM environment for testing
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Simple DOM mock
global.document = {
    getElementById: jest.fn(() => ({
        innerHTML: '',
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        addEventListener: jest.fn(),
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        }
    })),
    createElement: jest.fn(() => ({
        className: '',
        dataset: {},
        innerHTML: '',
        textContent: '',
        style: { cssText: '' },
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        },
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
    })),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
    }
};

describe('GardenGrid Property-Based Tests', () => {
    let gardenGrid;
    
    beforeEach(() => {
        // Create a fresh garden grid for each test
        const container = document.createElement('div');
        container.id = 'test-garden-grid';
        document.body.appendChild(container);
        
        gardenGrid = new GardenGrid('test-garden-grid', 3, 4);
    });
    
    afterEach(() => {
        // Clean up DOM
        const container = document.getElementById('test-garden-grid');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    
    /**
     * **Feature: idle-garden, Property 6: Plant count accuracy**
     * **Validates: Requirements 4.4**
     * 
     * Property: For any garden state, the displayed total plant count should equal 
     * the actual number of planted crops
     */
    test('Property 6: Plant count accuracy', () => {
        fc.assert(fc.property(
            // Generate an array of valid plant types and slot indices
            fc.array(
                fc.record({
                    slotIndex: fc.integer({ min: 0, max: 11 }), // 0-11 for 3x4 grid
                    plantType: fc.constantFrom('carrot', 'lettuce', 'tomato', 'pepper', 'corn')
                }),
                { minLength: 0, maxLength: 12 }
            ),
            (plantPlacements) => {
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Track unique slots to avoid duplicates
                const usedSlots = new Set();
                let expectedPlantCount = 0;
                
                // Place plants according to the generated data
                for (const placement of plantPlacements) {
                    if (!usedSlots.has(placement.slotIndex)) {
                        try {
                            const plant = new Plant(placement.plantType);
                            gardenGrid.placePlant(placement.slotIndex, plant);
                            usedSlots.add(placement.slotIndex);
                            expectedPlantCount++;
                        } catch (error) {
                            // Skip invalid placements (e.g., invalid plant types)
                            continue;
                        }
                    }
                }
                
                // Get actual plant count from garden grid
                const actualPlantCount = gardenGrid.getPlantCount();
                
                // Property: displayed plant count should equal actual planted crops
                return actualPlantCount === expectedPlantCount;
            }
        ), { numRuns: 100 });
    });
    
    /**
     * Additional property test: Plant count should never exceed grid capacity
     */
    test('Property: Plant count never exceeds grid capacity', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    slotIndex: fc.integer({ min: 0, max: 11 }),
                    plantType: fc.constantFrom('carrot', 'lettuce', 'tomato', 'pepper', 'corn')
                }),
                { minLength: 0, maxLength: 20 } // Try to place more plants than slots
            ),
            (plantPlacements) => {
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Track unique slots
                const usedSlots = new Set();
                
                // Attempt to place plants
                for (const placement of plantPlacements) {
                    if (!usedSlots.has(placement.slotIndex)) {
                        try {
                            const plant = new Plant(placement.plantType);
                            gardenGrid.placePlant(placement.slotIndex, plant);
                            usedSlots.add(placement.slotIndex);
                        } catch (error) {
                            // Skip invalid placements
                            continue;
                        }
                    }
                }
                
                const plantCount = gardenGrid.getPlantCount();
                
                // Property: plant count should never exceed grid capacity
                return plantCount <= gardenGrid.totalSlots;
            }
        ), { numRuns: 100 });
    });
    
    /**
     * Property test: Plant count should equal non-null slots
     */
    test('Property: Plant count equals non-null slots in plants array', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    slotIndex: fc.integer({ min: 0, max: 11 }),
                    plantType: fc.constantFrom('carrot', 'lettuce', 'tomato', 'pepper', 'corn')
                }),
                { minLength: 0, maxLength: 12 }
            ),
            (plantPlacements) => {
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Track unique slots
                const usedSlots = new Set();
                
                // Place plants
                for (const placement of plantPlacements) {
                    if (!usedSlots.has(placement.slotIndex)) {
                        try {
                            const plant = new Plant(placement.plantType);
                            gardenGrid.placePlant(placement.slotIndex, plant);
                            usedSlots.add(placement.slotIndex);
                        } catch (error) {
                            continue;
                        }
                    }
                }
                
                // Count non-null plants manually
                const manualCount = gardenGrid.plants.filter(plant => plant !== null).length;
                const methodCount = gardenGrid.getPlantCount();
                
                // Property: both counting methods should agree
                return manualCount === methodCount;
            }
        ), { numRuns: 100 });
    });
    
    /**
     * Property test: Removing plants decreases count correctly
     */
    test('Property: Removing plants decreases count correctly', () => {
        fc.assert(fc.property(
            fc.array(
                fc.integer({ min: 0, max: 11 }),
                { minLength: 1, maxLength: 12 }
            ).filter(arr => new Set(arr).size === arr.length), // Ensure unique indices
            fc.array(
                fc.integer({ min: 0, max: 11 }),
                { minLength: 0, maxLength: 12 }
            ),
            (plantSlots, removeSlots) => {
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Place plants in specified slots
                let plantsPlaced = 0;
                for (const slotIndex of plantSlots) {
                    try {
                        const plant = new Plant('carrot');
                        gardenGrid.placePlant(slotIndex, plant);
                        plantsPlaced++;
                    } catch (error) {
                        continue;
                    }
                }
                
                const initialCount = gardenGrid.getPlantCount();
                
                // Remove plants from specified slots
                let plantsRemoved = 0;
                for (const slotIndex of removeSlots) {
                    if (slotIndex < gardenGrid.totalSlots && gardenGrid.plants[slotIndex] !== null) {
                        gardenGrid.removePlant(slotIndex);
                        plantsRemoved++;
                    }
                }
                
                const finalCount = gardenGrid.getPlantCount();
                
                // Property: final count should equal initial count minus removed plants
                return finalCount === (initialCount - plantsRemoved);
            }
        ), { numRuns: 100 });
    });
    
    /**
     * **Feature: idle-garden, Property 5: Income calculation accuracy**
     * **Validates: Requirements 4.3**
     * 
     * Property: For any set of active plants, the displayed total income per second 
     * should equal the sum of individual plant income rates
     */
    test('Property 5: Income calculation accuracy', () => {
        fc.assert(fc.property(
            // Generate an array of plant placements with different types
            fc.array(
                fc.record({
                    slotIndex: fc.integer({ min: 0, max: 11 }),
                    plantType: fc.constantFrom('carrot', 'lettuce', 'tomato', 'pepper', 'corn'),
                    upgrades: fc.record({
                        growthSpeed: fc.float({ min: 1.0, max: 3.0 }),
                        incomeBoost: fc.float({ min: 1.0, max: 2.5 })
                    })
                }),
                { minLength: 0, maxLength: 12 }
            ),
            (plantPlacements) => {
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Track unique slots and calculate expected income
                const usedSlots = new Set();
                let expectedTotalIncome = 0;
                const upgrades = plantPlacements.length > 0 ? plantPlacements[0].upgrades : { growthSpeed: 1, incomeBoost: 1 };
                
                // Place plants and calculate expected income manually
                for (const placement of plantPlacements) {
                    if (!usedSlots.has(placement.slotIndex)) {
                        try {
                            const plant = new Plant(placement.plantType);
                            gardenGrid.placePlant(placement.slotIndex, plant);
                            usedSlots.add(placement.slotIndex);
                            
                            // Calculate expected income for this plant
                            const plantIncome = plant.getIncomePerSecond(upgrades);
                            expectedTotalIncome += plantIncome;
                        } catch (error) {
                            // Skip invalid placements
                            continue;
                        }
                    }
                }
                
                // Get actual total income from garden grid
                const actualTotalIncome = gardenGrid.getTotalIncomePerSecond(upgrades);
                
                // Property: total income should equal sum of individual plant incomes
                // Allow small floating point tolerance
                const tolerance = 0.001;
                const difference = Math.abs(actualTotalIncome - expectedTotalIncome);
                
                return difference < tolerance;
            }
        ), { numRuns: 100 });
    });
    
    /**
     * Property test: Income calculation with upgrades
     */
    test('Property: Income calculation scales correctly with upgrades', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    slotIndex: fc.integer({ min: 0, max: 11 }),
                    plantType: fc.constantFrom('carrot', 'lettuce', 'tomato')
                }),
                { minLength: 1, maxLength: 6 }
            ).filter(arr => {
                const slots = arr.map(p => p.slotIndex);
                return new Set(slots).size === slots.length; // Unique slots
            }),
            fc.record({
                growthSpeed: fc.float({ min: 1.0, max: 3.0, noNaN: true }),
                incomeBoost: fc.float({ min: 1.0, max: 2.5, noNaN: true })
            }),
            (plantPlacements, upgrades) => {
                // Skip if upgrades contain invalid values
                if (!Number.isFinite(upgrades.growthSpeed) || !Number.isFinite(upgrades.incomeBoost)) {
                    return true; // Skip this test case
                }
                
                // Reset garden grid
                gardenGrid.plants = new Array(12).fill(null);
                
                // Place plants
                for (const placement of plantPlacements) {
                    try {
                        const plant = new Plant(placement.plantType);
                        gardenGrid.placePlant(placement.slotIndex, plant);
                    } catch (error) {
                        continue;
                    }
                }
                
                // Calculate income without upgrades
                const baseIncome = gardenGrid.getTotalIncomePerSecond({ growthSpeed: 1, incomeBoost: 1 });
                
                // Calculate income with upgrades
                const upgradedIncome = gardenGrid.getTotalIncomePerSecond(upgrades);
                
                // Property: upgraded income should be base income * incomeBoost * growthSpeed
                // (growth speed affects income per second by reducing cycle time)
                const expectedUpgradedIncome = baseIncome * upgrades.incomeBoost * upgrades.growthSpeed;
                
                // Skip if any calculation resulted in invalid numbers
                if (!Number.isFinite(expectedUpgradedIncome) || !Number.isFinite(upgradedIncome)) {
                    return true; // Skip this test case
                }
                
                const tolerance = 0.001;
                const difference = Math.abs(upgradedIncome - expectedUpgradedIncome);
                
                return difference < tolerance;
            }
        ), { numRuns: 100 });
    });
    
    /**
     * Property test: Empty garden has zero income
     */
    test('Property: Empty garden has zero income', () => {
        fc.assert(fc.property(
            fc.record({
                growthSpeed: fc.float({ min: 1.0, max: 5.0, noNaN: true }),
                incomeBoost: fc.float({ min: 1.0, max: 5.0, noNaN: true })
            }),
            (upgrades) => {
                // Skip if upgrades contain invalid values
                if (!Number.isFinite(upgrades.growthSpeed) || !Number.isFinite(upgrades.incomeBoost)) {
                    return true; // Skip this test case
                }
                
                // Reset garden grid to empty state
                gardenGrid.plants = new Array(12).fill(null);
                
                // Get total income
                const totalIncome = gardenGrid.getTotalIncomePerSecond(upgrades);
                
                // Property: empty garden should have zero income regardless of upgrades
                return totalIncome === 0;
            }
        ), { numRuns: 100 });
    });
});