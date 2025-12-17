/**
 * Property-based tests for CollisionSystem class
 * Космический Защитник
 */

const fc = require('fast-check');
const Entity = require('../entities/Entity.js');
const Projectile = require('../entities/Projectile.js');
const Asteroid = require('../entities/Asteroid.js');

const CollisionSystem = require('./CollisionSystem.js');

describe('CollisionSystem Property Tests', () => {
  
  /**
   * **Feature: space-defender, Property 8: Collision Detection and Cleanup**
   * **Validates: Requirements 3.1**
   * 
   * For any Projectile-Asteroid collision, both objects should be removed from the game entities list
   */
  test('Property 8: Collision Detection and Cleanup', () => {
    fc.assert(fc.property(
      fc.record({
        projectileX: fc.float({ min: Math.fround(0), max: Math.fround(400) }).filter(x => !isNaN(x)),
        projectileY: fc.float({ min: Math.fround(0), max: Math.fround(300) }).filter(y => !isNaN(y)),
        asteroidX: fc.float({ min: Math.fround(0), max: Math.fround(400) }).filter(x => !isNaN(x)),
        asteroidY: fc.float({ min: Math.fround(0), max: Math.fround(300) }).filter(y => !isNaN(y))
      }),
      (params) => {
        // Create collision system
        const collisionSystem = new CollisionSystem();
        
        // Create projectile and asteroid at overlapping positions
        const projectile = new Projectile(params.projectileX, params.projectileY);
        const asteroid = new Asteroid(params.asteroidX, params.asteroidY);
        
        // Ensure both entities are active
        projectile.active = true;
        asteroid.active = true;
        
        // Position them to overlap (force collision)
        asteroid.position.x = projectile.position.x;
        asteroid.position.y = projectile.position.y;
        
        const entities = [projectile, asteroid];
        
        // Check for collisions
        const collisions = collisionSystem.checkCollisions(entities);
        
        // Process collisions
        const gameState = { score: 0, planetHealth: 100 };
        const result = collisionSystem.processCollisions(collisions, gameState);
        
        // Verify collision was detected and both entities are marked for destruction
        const collisionDetected = collisions.length > 0;
        const bothEntitiesDestroyed = result.destroyedEntities.length === 2;
        const projectileDestroyed = !projectile.active;
        const asteroidDestroyed = !asteroid.active;
        const scoreIncreased = result.scoreIncrease > 0;
        
        return collisionDetected && bothEntitiesDestroyed && projectileDestroyed && asteroidDestroyed && scoreIncreased;
      }
    ), { numRuns: 100 });
  });

  test('CollisionSystem AABB detection works correctly', () => {
    const collisionSystem = new CollisionSystem();
    
    // Test overlapping entities
    const entity1 = new Entity(10, 10, 20, 20);
    const entity2 = new Entity(15, 15, 20, 20);
    
    expect(collisionSystem.checkAABB(entity1, entity2)).toBe(true);
    
    // Test non-overlapping entities
    const entity3 = new Entity(50, 50, 20, 20);
    expect(collisionSystem.checkAABB(entity1, entity3)).toBe(false);
  });

  test('CollisionSystem processes projectile-asteroid collisions correctly', () => {
    const collisionSystem = new CollisionSystem();
    
    const projectile = new Projectile(100, 100);
    const asteroid = new Asteroid(100, 100);
    
    const entities = [projectile, asteroid];
    const collisions = collisionSystem.checkCollisions(entities);
    
    expect(collisions.length).toBe(1);
    expect(collisions[0].type).toBe('asteroid-projectile');
    
    const gameState = { score: 0, planetHealth: 100 };
    const result = collisionSystem.processCollisions(collisions, gameState);
    
    expect(result.destroyedEntities.length).toBe(2);
    expect(result.scoreIncrease).toBe(10);
    expect(projectile.active).toBe(false);
    expect(asteroid.active).toBe(false);
  });
});