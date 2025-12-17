/**
 * Property-based tests for ResourceManager
 * Tests resource management, validation, and transaction methods
 */

const fc = require('fast-check');
const ResourceManager = require('./ResourceManager.js');
const { getPlantConfig, getAllPlantTypes } = require('./PlantConfig.js');

// Mock DOM elements for testing
const mockDOM = () => {
    global.document = {
        getElementById: jest.fn(() => ({
            textContent: '',
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            },
            getBoundingClientRect: () => ({ right: 0, top: 0 })
        })),
        createElement: jest.fn(() => ({
            style: {},
            classList: { add: jest.fn() }
        })),
        body: {
            appendChild: jest.fn(),
            removeChild: jest.fn()
        }
    };
    global.setTimeout = jest.fn((fn) => fn());
};

describe('ResourceManager Property Tests', () => {
    beforeEach(() => {
        mockDOM();
    });

    /**
     * **Feature: idle-garden, Property 1: Plant placement resource deduction**
     * **Validates: Requirements 1.3, 3.4**
     * 
     * For any plant type and resource state, when a plant is successfully planted,
     * the player's resources should be reduced by exactly the plant's cost
     */
    test('Property 1: Plant placement resource deduction', () => {
        fc.assert(fc.property(
            // Generate arbitrary plant type
            fc.constantFrom(...getAllPlantTypes()),
            // Generate arbitrary starting resources (ensure sufficient for any plant)
            fc.record({
                coins: fc.integer({ min: 0, max: 1000 }),
                seeds: fc.integer({ min: 0, max: 100 }),
                water: fc.integer({ min: 0, max: 100 })
            }),
            (plantType, initialResources) => {
                const plantConfig = getPlantConfig(plantType);
                if (!plantConfig) return true; // Skip invalid plant types
                
                const plantCost = plantConfig.cost;
                
                // Ensure we have enough resources for the test
                const sufficientResources = {
                    coins: Math.max(initialResources.coins, plantCost.coins),
                    seeds: Math.max(initialResources.seeds, plantCost.seeds),
                    water: Math.max(initialResources.water, plantCost.water)
                };
                
                const resourceManager = new ResourceManager(sufficientResources);
                
                // Record resources before planting
                const resourcesBefore = resourceManager.getAllResources();
                
                // Attempt to deduct plant cost (simulating plant placement)
                const success = resourceManager.deductResources(plantCost);
                
                // Should succeed since we ensured sufficient resources
                expect(success).toBe(true);
                
                // Verify exact deduction amounts
                const resourcesAfter = resourceManager.getAllResources();
                
                expect(resourcesAfter.coins).toBe(resourcesBefore.coins - plantCost.coins);
                expect(resourcesAfter.seeds).toBe(resourcesBefore.seeds - plantCost.seeds);
                expect(resourcesAfter.water).toBe(resourcesBefore.water - plantCost.water);
            }
        ), { numRuns: 100 });
    });

    /**
     * **Feature: idle-garden, Property 2: Resource sufficiency validation**
     * **Validates: Requirements 1.2, 1.5**
     * 
     * For any plant type and resource state, planting should be allowed if and only if
     * the player has sufficient resources for that plant's cost
     */
    test('Property 2: Resource sufficiency validation', () => {
        fc.assert(fc.property(
            // Generate arbitrary plant type
            fc.constantFrom(...getAllPlantTypes()),
            // Generate arbitrary starting resources
            fc.record({
                coins: fc.integer({ min: 0, max: 200 }),
                seeds: fc.integer({ min: 0, max: 20 }),
                water: fc.integer({ min: 0, max: 20 })
            }),
            (plantType, initialResources) => {
                const plantConfig = getPlantConfig(plantType);
                if (!plantConfig) return true; // Skip invalid plant types
                
                const plantCost = plantConfig.cost;
                const resourceManager = new ResourceManager(initialResources);
                
                // Check if resources are sufficient
                const canAfford = resourceManager.canAfford(plantCost);
                
                // Manually verify sufficiency
                const hasEnoughCoins = initialResources.coins >= plantCost.coins;
                const hasEnoughSeeds = initialResources.seeds >= plantCost.seeds;
                const hasEnoughWater = initialResources.water >= plantCost.water;
                const shouldBeAffordable = hasEnoughCoins && hasEnoughSeeds && hasEnoughWater;
                
                // canAfford should match manual calculation
                expect(canAfford).toBe(shouldBeAffordable);
                
                // Attempt to deduct resources
                const deductionSuccess = resourceManager.deductResources(plantCost);
                
                // Deduction should succeed if and only if affordable
                expect(deductionSuccess).toBe(canAfford);
                
                // If deduction failed, resources should be unchanged
                if (!deductionSuccess) {
                    const resourcesAfter = resourceManager.getAllResources();
                    expect(resourcesAfter).toEqual(initialResources);
                }
            }
        ), { numRuns: 100 });
    });

    /**
     * **Feature: idle-garden, Property 12: Affordability display accuracy**
     * **Validates: Requirements 3.2, 3.3**
     * 
     * For any shop item and resource state, the item should be marked as affordable
     * if and only if the player has sufficient resources
     */
    test('Property 12: Affordability display accuracy', () => {
        fc.assert(fc.property(
            // Generate arbitrary plant type
            fc.constantFrom(...getAllPlantTypes()),
            // Generate arbitrary starting resources
            fc.record({
                coins: fc.integer({ min: 0, max: 200 }),
                seeds: fc.integer({ min: 0, max: 20 }),
                water: fc.integer({ min: 0, max: 20 })
            }),
            (plantType, initialResources) => {
                const plantConfig = getPlantConfig(plantType);
                if (!plantConfig) return true; // Skip invalid plant types
                
                const plantCost = plantConfig.cost;
                const resourceManager = new ResourceManager(initialResources);
                
                // Check affordability using ResourceManager
                const isAffordable = resourceManager.canAfford(plantCost);
                
                // Manually calculate affordability for verification
                const manualAffordabilityCheck = 
                    initialResources.coins >= plantCost.coins &&
                    initialResources.seeds >= plantCost.seeds &&
                    initialResources.water >= plantCost.water;
                
                // ResourceManager affordability should match manual calculation
                expect(isAffordable).toBe(manualAffordabilityCheck);
                
                // Test edge case: exactly sufficient resources
                const exactResources = { ...plantCost };
                const exactResourceManager = new ResourceManager(exactResources);
                expect(exactResourceManager.canAfford(plantCost)).toBe(true);
                
                // Test edge case: one resource short
                if (plantCost.coins > 0) {
                    const shortOnCoins = { ...plantCost, coins: plantCost.coins - 1 };
                    const shortResourceManager = new ResourceManager(shortOnCoins);
                    expect(shortResourceManager.canAfford(plantCost)).toBe(false);
                }
            }
        ), { numRuns: 100 });
    });

    /**
     * **Feature: idle-garden, Property 13: Resource display completeness**
     * **Validates: Requirements 4.1**
     * 
     * For any game state, the resource display should show current values for all resource types (coins, seeds, water)
     */
    test('Property 13: Resource display completeness', () => {
        fc.assert(fc.property(
            // Generate arbitrary resource amounts
            fc.record({
                coins: fc.integer({ min: 0, max: 10000 }),
                seeds: fc.integer({ min: 0, max: 1000 }),
                water: fc.integer({ min: 0, max: 1000 })
            }),
            (resourceAmounts) => {
                const resourceManager = new ResourceManager(resourceAmounts);
                
                // Get all resources from the manager
                const allResources = resourceManager.getAllResources();
                
                // Verify all required resource types are present
                expect(allResources).toHaveProperty('coins');
                expect(allResources).toHaveProperty('seeds');
                expect(allResources).toHaveProperty('water');
                
                // Verify resource values match what was set
                expect(allResources.coins).toBe(resourceAmounts.coins);
                expect(allResources.seeds).toBe(resourceAmounts.seeds);
                expect(allResources.water).toBe(resourceAmounts.water);
                
                // Verify individual resource getters work
                expect(resourceManager.getResource('coins')).toBe(resourceAmounts.coins);
                expect(resourceManager.getResource('seeds')).toBe(resourceAmounts.seeds);
                expect(resourceManager.getResource('water')).toBe(resourceAmounts.water);
                
                // Verify all resource values are numbers
                expect(typeof allResources.coins).toBe('number');
                expect(typeof allResources.seeds).toBe('number');
                expect(typeof allResources.water).toBe('number');
                
                // Verify all resource values are non-negative (after validation)
                resourceManager.validateResources();
                const validatedResources = resourceManager.getAllResources();
                expect(validatedResources.coins).toBeGreaterThanOrEqual(0);
                expect(validatedResources.seeds).toBeGreaterThanOrEqual(0);
                expect(validatedResources.water).toBeGreaterThanOrEqual(0);
                
                // Test that display elements are properly initialized (if DOM is available)
                if (resourceManager.displayElements) {
                    // Verify display elements structure exists
                    expect(resourceManager.displayElements).toHaveProperty('coins');
                    expect(resourceManager.displayElements).toHaveProperty('seeds');
                    expect(resourceManager.displayElements).toHaveProperty('water');
                }
            }
        ), { numRuns: 100 });
    });
});