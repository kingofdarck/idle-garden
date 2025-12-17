/**
 * Property-based tests for Shop class
 * Tests shop display, purchase logic, and affordability checking
 */

const fc = require('fast-check');
const Shop = require('./Shop.js');
const ResourceManager = require('./ResourceManager.js');
const { getPlantConfig, getAllPlantTypes } = require('./PlantConfig.js');

// Mock DOM elements for testing
const mockDOM = () => {
    const mockElement = {
        textContent: '',
        innerHTML: '',
        className: '',
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn()
        },
        querySelector: jest.fn(() => mockElement),
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        dataset: {},
        disabled: false,
        getBoundingClientRect: () => ({ right: 0, top: 0 })
    };
    
    global.document = {
        getElementById: jest.fn(() => mockElement),
        createElement: jest.fn(() => mockElement),
        dispatchEvent: jest.fn(),
        body: {
            appendChild: jest.fn(),
            removeChild: jest.fn()
        }
    };
    
    global.setTimeout = jest.fn((fn) => fn());
    global.CustomEvent = jest.fn().mockImplementation((type, options) => ({
        type,
        detail: options?.detail
    }));
    
    return mockElement;
};

describe('Shop Property Tests', () => {
    let mockContainer;
    
    beforeEach(() => {
        mockContainer = mockDOM();
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
                
                const resourceManager = new ResourceManager(initialResources);
                const shop = new Shop(resourceManager, mockContainer);
                
                // Check affordability using Shop
                const shopAffordability = shop.isAffordable(plantType);
                
                // Check affordability using ResourceManager directly
                const resourceAffordability = resourceManager.canAfford(plantConfig.cost);
                
                // Both should agree
                expect(shopAffordability).toBe(resourceAffordability);
                
                // Manually calculate affordability for verification
                const manualAffordabilityCheck = 
                    initialResources.coins >= plantConfig.cost.coins &&
                    initialResources.seeds >= plantConfig.cost.seeds &&
                    initialResources.water >= plantConfig.cost.water;
                
                // Shop affordability should match manual calculation
                expect(shopAffordability).toBe(manualAffordabilityCheck);
                
                // Test plant display info includes correct affordability
                const displayInfo = shop.getPlantDisplayInfo(plantType);
                expect(displayInfo.affordable).toBe(shopAffordability);
                
                // Test edge cases
                if (plantConfig.cost.coins > 0 || plantConfig.cost.seeds > 0 || plantConfig.cost.water > 0) {
                    // Test with exactly sufficient resources
                    const exactResourceManager = new ResourceManager(plantConfig.cost);
                    const exactShop = new Shop(exactResourceManager, mockContainer);
                    expect(exactShop.isAffordable(plantType)).toBe(true);
                    
                    // Test with one resource short (if possible)
                    if (plantConfig.cost.coins > 0) {
                        const shortResources = { ...plantConfig.cost, coins: plantConfig.cost.coins - 1 };
                        const shortResourceManager = new ResourceManager(shortResources);
                        const shortShop = new Shop(shortResourceManager, mockContainer);
                        expect(shortShop.isAffordable(plantType)).toBe(false);
                    }
                }
            }
        ), { numRuns: 100 });
    });

    /**
     * Additional test: Shop purchase logic consistency
     * Verifies that purchase attempts match affordability checks
     */
    test('Shop purchase logic consistency', () => {
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
                
                const resourceManager = new ResourceManager(initialResources);
                const shop = new Shop(resourceManager, mockContainer);
                
                // Check if plant is affordable
                const isAffordable = shop.isAffordable(plantType);
                
                // Record resources before any operations
                const resourcesBefore = resourceManager.getAllResources();
                
                if (isAffordable) {
                    // Select the plant type (should succeed)
                    shop.selectPlantType(plantType);
                    expect(shop.getSelectedPlantType()).toBe(plantType);
                    
                    // Attempt purchase (should succeed)
                    const purchaseResult = shop.purchaseSelectedPlant();
                    expect(purchaseResult).not.toBeNull();
                    expect(purchaseResult.success).toBe(true);
                    expect(purchaseResult.plantType).toBe(plantType);
                    
                    // Resources should be deducted
                    const resourcesAfter = resourceManager.getAllResources();
                    expect(resourcesAfter.coins).toBe(resourcesBefore.coins - plantConfig.cost.coins);
                    expect(resourcesAfter.seeds).toBe(resourcesBefore.seeds - plantConfig.cost.seeds);
                    expect(resourcesAfter.water).toBe(resourcesBefore.water - plantConfig.cost.water);
                } else {
                    // Select the plant type (should fail due to insufficient resources)
                    shop.selectPlantType(plantType);
                    expect(shop.getSelectedPlantType()).toBeNull(); // Should not be selected
                    
                    // Attempt purchase (should return null due to no selection)
                    const purchaseResult = shop.purchaseSelectedPlant();
                    expect(purchaseResult).toBeNull();
                    
                    // Resources should be unchanged
                    const resourcesAfter = resourceManager.getAllResources();
                    expect(resourcesAfter).toEqual(resourcesBefore);
                }
            }
        ), { numRuns: 100 });
    });

    /**
     * **Feature: idle-garden, Property 14: Shop information completeness**
     * **Validates: Requirements 3.5**
     * 
     * For any plant type in the shop, the display should include name, icon, cost breakdown, and income per growth cycle
     */
    test('Property 14: Shop information completeness', () => {
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
                
                const resourceManager = new ResourceManager(initialResources);
                const shop = new Shop(resourceManager, mockContainer);
                
                // Get display information
                const displayInfo = shop.getPlantDisplayInfo(plantType);
                
                // Verify all required information is present as per Requirements 3.5
                expect(displayInfo).not.toBeNull();
                
                // Verify name is present and matches config
                expect(displayInfo.name).toBeDefined();
                expect(typeof displayInfo.name).toBe('string');
                expect(displayInfo.name).toBe(plantConfig.name);
                
                // Verify icon is present and matches config
                expect(displayInfo.icon).toBeDefined();
                expect(typeof displayInfo.icon).toBe('string');
                expect(displayInfo.icon).toBe(plantConfig.icon);
                
                // Verify cost breakdown includes all resource types
                expect(displayInfo.cost).toBeDefined();
                expect(displayInfo.cost).toHaveProperty('coins');
                expect(displayInfo.cost).toHaveProperty('seeds');
                expect(displayInfo.cost).toHaveProperty('water');
                expect(typeof displayInfo.cost.coins).toBe('number');
                expect(typeof displayInfo.cost.seeds).toBe('number');
                expect(typeof displayInfo.cost.water).toBe('number');
                expect(displayInfo.cost).toEqual(plantConfig.cost);
                
                // Verify income per growth cycle is present
                expect(displayInfo.income).toBeDefined();
                expect(typeof displayInfo.income).toBe('number');
                expect(displayInfo.income).toBe(plantConfig.income);
                expect(displayInfo.income).toBeGreaterThan(0);
                
                // Verify additional required information
                expect(displayInfo.type).toBe(plantType);
                expect(displayInfo.description).toBe(plantConfig.description);
                expect(typeof displayInfo.affordable).toBe('boolean');
                
                // Verify cost values are non-negative
                expect(displayInfo.cost.coins).toBeGreaterThanOrEqual(0);
                expect(displayInfo.cost.seeds).toBeGreaterThanOrEqual(0);
                expect(displayInfo.cost.water).toBeGreaterThanOrEqual(0);
                
                // Test that getAllPlantsDisplayInfo includes this plant with complete info
                const allPlantsInfo = shop.getAllPlantsDisplayInfo();
                const thisPlantInfo = allPlantsInfo.find(info => info.type === plantType);
                expect(thisPlantInfo).toBeDefined();
                expect(thisPlantInfo).toEqual(displayInfo);
            }
        ), { numRuns: 100 });
    });
});