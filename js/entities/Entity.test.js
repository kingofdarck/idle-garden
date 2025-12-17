/**
 * Property-based tests for Entity class
 * Космический Защитник
 */

const fc = require('fast-check');

// Import Entity class - we need to handle ES6 modules in Node.js test environment
const Entity = require('./Entity.js');

describe('Entity Property Tests', () => {
  
  /**
   * **Feature: space-defender, Property 14: Entity Position Updates**
   * **Validates: Requirements 5.1**
   * 
   * For any game entity with non-zero velocity, its position should change during each game loop update
   */
  test('Property 14: Entity Position Updates', () => {
    fc.assert(fc.property(
      fc.record({
        x: fc.float({ min: Math.fround(-1000), max: Math.fround(1000) }),
        y: fc.float({ min: Math.fround(-1000), max: Math.fround(1000) }),
        width: fc.float({ min: Math.fround(1), max: Math.fround(100) }),
        height: fc.float({ min: Math.fround(1), max: Math.fround(100) }),
        velocityX: fc.float({ min: Math.fround(-500), max: Math.fround(500) }).filter(v => Math.abs(v) > 0.01), // Non-zero velocity
        velocityY: fc.float({ min: Math.fround(-500), max: Math.fround(500) }).filter(v => Math.abs(v) > 0.01), // Non-zero velocity
        deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1) }) // Reasonable delta time values
      }),
      (params) => {
        // Create entity with initial position
        const entity = new Entity(params.x, params.y, params.width, params.height);
        
        // Set non-zero velocity
        entity.velocity.x = params.velocityX;
        entity.velocity.y = params.velocityY;
        
        // Store initial position
        const initialX = entity.position.x;
        const initialY = entity.position.y;
        
        // Update entity
        entity.update(params.deltaTime);
        
        // Position should have changed for non-zero velocity
        const positionChanged = (entity.position.x !== initialX) || (entity.position.y !== initialY);
        
        return positionChanged;
      }
    ), { numRuns: 100 });
  });

  test('Entity position updates correctly with velocity', () => {
    const entity = new Entity(100, 100, 32, 32);
    entity.velocity.x = 50;
    entity.velocity.y = -30;
    
    const initialX = entity.position.x;
    const initialY = entity.position.y;
    const deltaTime = 0.016; // ~60 FPS
    
    entity.update(deltaTime);
    
    expect(entity.position.x).toBe(initialX + 50 * deltaTime);
    expect(entity.position.y).toBe(initialY - 30 * deltaTime);
  });

  test('Entity getBounds returns correct boundaries', () => {
    const entity = new Entity(50, 75, 40, 60);
    const bounds = entity.getBounds();
    
    expect(bounds.left).toBe(50);
    expect(bounds.right).toBe(90);
    expect(bounds.top).toBe(75);
    expect(bounds.bottom).toBe(135);
    expect(bounds.centerX).toBe(70);
    expect(bounds.centerY).toBe(105);
  });
});