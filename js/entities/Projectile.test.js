/**
 * Property-based tests for Projectile class
 * Космический Защитник
 */

const fc = require('fast-check');
const Entity = require('./Entity.js');
const Projectile = require('./Projectile.js');

describe('Projectile Property Tests', () => {
  
  /**
   * **Feature: space-defender, Property 11: Projectile Movement Consistency**
   * **Validates: Requirements 3.4**
   * 
   * For any active Projectile, its Y position should decrease (move upward) with each game update cycle
   */
  test('Property 11: Projectile Movement Consistency', () => {
    fc.assert(fc.property(
      fc.record({
        initialX: fc.float({ min: Math.fround(0), max: Math.fround(800) }).filter(x => !isNaN(x)),
        initialY: fc.float({ min: Math.fround(50), max: Math.fround(600) }).filter(y => !isNaN(y)),
        deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1) }).filter(dt => !isNaN(dt) && dt > 0)
      }),
      (params) => {
        // Create projectile
        const projectile = new Projectile(params.initialX, params.initialY);
        
        // Store initial Y position
        const initialY = projectile.position.y;
        
        // Update projectile
        projectile.update(params.deltaTime);
        
        // Y position should decrease (move upward) if projectile is still active
        if (projectile.active) {
          return projectile.position.y < initialY;
        }
        
        // If projectile was destroyed (went off screen), that's also valid behavior
        return true;
      }
    ), { numRuns: 100 });
  });

  test('Projectile moves upward consistently', () => {
    const projectile = new Projectile(100, 300);
    const initialY = projectile.position.y;
    const deltaTime = 0.016; // ~60 FPS
    
    projectile.update(deltaTime);
    
    expect(projectile.position.y).toBeLessThan(initialY);
    expect(projectile.velocity.y).toBeLessThan(0); // Negative velocity means upward movement
  });

  test('Projectile is destroyed when reaching top boundary', () => {
    const projectile = new Projectile(100, 5); // Close to top
    
    // Move projectile past the top boundary
    projectile.position.y = -20;
    projectile.update(0.016);
    
    expect(projectile.active).toBe(false);
  });

  test('Projectile hasReachedTop method works correctly', () => {
    const projectile = new Projectile(100, 100);
    
    // Initially not at top
    expect(projectile.hasReachedTop()).toBe(false);
    
    // Move to top boundary
    projectile.position.y = -projectile.size.height - 1;
    expect(projectile.hasReachedTop()).toBe(true);
  });
});

  /**
   * **Feature: space-defender, Property 10: Projectile Cleanup**
   * **Validates: Requirements 3.3**
   * 
   * For any Projectile that reaches the top screen boundary, it should be removed from the game entities
   */
  test('Property 10: Projectile Cleanup', () => {
    fc.assert(fc.property(
      fc.record({
        initialX: fc.float({ min: Math.fround(0), max: Math.fround(800) }).filter(x => !isNaN(x)),
        initialY: fc.float({ min: Math.fround(-50), max: Math.fround(50) }).filter(y => !isNaN(y)), // Near or above top boundary
        deltaTime: fc.float({ min: Math.fround(0.001), max: Math.fround(0.1) }).filter(dt => !isNaN(dt) && dt > 0)
      }),
      (params) => {
        // Create projectile near or above top boundary
        const projectile = new Projectile(params.initialX, params.initialY);
        
        // If projectile starts above the screen (y + height < 0), it should be destroyed after update
        const startsAboveScreen = projectile.position.y + projectile.size.height < 0;
        
        // Update projectile
        projectile.update(params.deltaTime);
        
        // If projectile started above screen or moved above screen, it should be inactive
        if (startsAboveScreen || projectile.position.y + projectile.size.height < 0) {
          return !projectile.active;
        }
        
        // If projectile is still on screen, it should remain active
        return projectile.active;
      }
    ), { numRuns: 100 });
  });