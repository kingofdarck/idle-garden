/**
 * Property-based tests for PlayerShip class
 * Космический Защитник
 */

const fc = require('fast-check');
const Entity = require('./Entity.js');
const PlayerShip = require('./PlayerShip.js');

// Mock InputManager for testing
class MockInputManager {
  constructor(pressedKeys = []) {
    this.pressedKeys = new Set(pressedKeys);
  }
  
  isKeyPressed(key) {
    return this.pressedKeys.has(key);
  }
}

describe('PlayerShip Property Tests', () => {
  
  /**
   * **Feature: space-defender, Property 1: Player Ship Movement Response**
   * **Validates: Requirements 1.1**
   * 
   * For any valid directional input, the Player Ship position should change in the corresponding direction within one game update cycle
   */
  test('Property 1: Player Ship Movement Response', () => {
    fc.assert(fc.property(
      fc.record({
        initialX: fc.float({ min: Math.fround(50), max: Math.fround(750) }).filter(x => !isNaN(x)),
        initialY: fc.float({ min: Math.fround(50), max: Math.fround(550) }).filter(y => !isNaN(y)),
        deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1) }).filter(dt => !isNaN(dt)),
        direction: fc.constantFrom('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown')
      }),
      (params) => {
        // Create player ship
        const ship = new PlayerShip(params.initialX, params.initialY);
        
        // Store initial position
        const initialX = ship.position.x;
        const initialY = ship.position.y;
        
        // Create input manager with pressed key
        const inputManager = new MockInputManager([params.direction]);
        
        // Update ship
        ship.update(params.deltaTime, inputManager);
        
        // Check that position changed in the correct direction
        let positionChangedCorrectly = false;
        
        switch (params.direction) {
          case 'ArrowLeft':
            positionChangedCorrectly = ship.position.x < initialX;
            break;
          case 'ArrowRight':
            positionChangedCorrectly = ship.position.x > initialX;
            break;
          case 'ArrowUp':
            positionChangedCorrectly = ship.position.y < initialY;
            break;
          case 'ArrowDown':
            positionChangedCorrectly = ship.position.y > initialY;
            break;
        }
        
        return positionChangedCorrectly;
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: space-defender, Property 2: Projectile Creation**
   * **Validates: Requirements 1.2**
   * 
   * For any game state where the Player Ship is active, pressing the fire key should result in a new Projectile being added to the game entities
   */
  test('Property 2: Projectile Creation', () => {
    fc.assert(fc.property(
      fc.record({
        shipX: fc.float({ min: Math.fround(50), max: Math.fround(750) }).filter(x => !isNaN(x)),
        shipY: fc.float({ min: Math.fround(50), max: Math.fround(550) }).filter(y => !isNaN(y)),
        currentTime: fc.float({ min: Math.fround(1000), max: Math.fround(10000) }).filter(t => !isNaN(t))
      }),
      (params) => {
        // Create active player ship
        const ship = new PlayerShip(params.shipX, params.shipY);
        ship.active = true;
        
        // Attempt to fire
        const projectileDataArray = ship.tryFire(params.currentTime);
        
        // Should create projectile data when ship is active and enough time has passed
        const projectileCreated = projectileDataArray !== null && Array.isArray(projectileDataArray);
        const hasCorrectType = projectileCreated ? projectileDataArray[0].type === 'projectile' : true;
        const hasValidPosition = projectileCreated ? 
          (typeof projectileDataArray[0].x === 'number' && typeof projectileDataArray[0].y === 'number') : true;
        
        return projectileCreated && hasCorrectType && hasValidPosition;
      }
    ), { numRuns: 100 });
  });

  test('PlayerShip responds to input correctly', () => {
    const ship = new PlayerShip(100, 100);
    const deltaTime = 0.016; // ~60 FPS
    
    // Test left movement
    let inputManager = new MockInputManager(['ArrowLeft']);
    const initialX = ship.position.x;
    ship.update(deltaTime, inputManager);
    expect(ship.position.x).toBeLessThan(initialX);
    
    // Reset position
    ship.position.x = 100;
    ship.position.y = 100;
    
    // Test right movement
    inputManager = new MockInputManager(['ArrowRight']);
    const initialX2 = ship.position.x;
    ship.update(deltaTime, inputManager);
    expect(ship.position.x).toBeGreaterThan(initialX2);
  });

  test('PlayerShip fire rate limiting works', () => {
    const ship = new PlayerShip(100, 100);
    
    // First shot should work (after fireRate time has passed)
    const projectile1 = ship.tryFire(300);
    expect(projectile1).not.toBeNull();
    expect(Array.isArray(projectile1)).toBe(true);
    expect(projectile1[0].type).toBe('projectile');
    
    // Immediate second shot should be blocked
    const projectile2 = ship.tryFire(400); // 100ms later, less than fireRate
    expect(projectile2).toBeNull();
    
    // Shot after fire rate should work
    const projectile3 = ship.tryFire(700); // 400ms later, more than fireRate
    expect(projectile3).not.toBeNull();
    expect(Array.isArray(projectile3)).toBe(true);
  });

  test('PlayerShip screen bounds are enforced', () => {
    const ship = new PlayerShip(0, 0);
    ship.setScreenBounds(800, 600);
    
    // Test left boundary
    ship.position.x = -10;
    ship.enforceScreenBounds();
    expect(ship.position.x).toBe(0);
    
    // Test right boundary
    ship.position.x = 800;
    ship.enforceScreenBounds();
    expect(ship.position.x).toBe(800 - ship.size.width);
    
    // Test top boundary
    ship.position.y = -10;
    ship.enforceScreenBounds();
    expect(ship.position.y).toBe(0);
    
    // Test bottom boundary
    ship.position.y = 600;
    ship.enforceScreenBounds();
    expect(ship.position.y).toBe(600 - ship.size.height);
  });
}); 
 /**
   * **Feature: space-defender, Property 3: Screen Boundary Enforcement**
   * **Validates: Requirements 1.3**
   * 
   * For any Player Ship position, the ship should never be positioned outside the Game Canvas boundaries
   */
  test('Property 3: Screen Boundary Enforcement', () => {
    fc.assert(fc.property(
      fc.record({
        screenWidth: fc.float({ min: Math.fround(100), max: Math.fround(1200) }).filter(w => !isNaN(w)),
        screenHeight: fc.float({ min: Math.fround(100), max: Math.fround(800) }).filter(h => !isNaN(h)),
        shipX: fc.float({ min: Math.fround(-200), max: Math.fround(1400) }).filter(x => !isNaN(x)),
        shipY: fc.float({ min: Math.fround(-200), max: Math.fround(1000) }).filter(y => !isNaN(y))
      }),
      (params) => {
        // Create player ship at potentially out-of-bounds position
        const ship = new PlayerShip(params.shipX, params.shipY);
        ship.setScreenBounds(params.screenWidth, params.screenHeight);
        
        // Force boundary enforcement
        ship.enforceScreenBounds();
        
        // Check that ship is within screen boundaries
        const withinLeftBound = ship.position.x >= 0;
        const withinRightBound = ship.position.x + ship.size.width <= params.screenWidth;
        const withinTopBound = ship.position.y >= 0;
        const withinBottomBound = ship.position.y + ship.size.height <= params.screenHeight;
        
        return withinLeftBound && withinRightBound && withinTopBound && withinBottomBound;
      }
    ), { numRuns: 100 });
  });