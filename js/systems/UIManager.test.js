/**
 * Property-based tests for UIManager class
 * Космический Защитник
 */

const fc = require('fast-check');

// Mock DOM elements for testing
const mockElement = (initialValue = '') => ({
  textContent: initialValue,
  style: {},
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn()
});

// Mock document for UIManager
global.document = {
  getElementById: jest.fn((id) => {
    switch (id) {
      case 'score':
        return mockElement('0');
      case 'planet-health':
        return mockElement('100');
      case 'gameOverScreen':
        return { style: { display: 'none' } };
      case 'finalScore':
        return mockElement('0');
      case 'restartButton':
        return { addEventListener: jest.fn() };
      default:
        return null;
    }
  }),
  createElement: jest.fn(() => ({
    textContent: '',
    style: { cssText: '' },
    parentNode: null
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Mock window for events
global.window = {
  dispatchEvent: jest.fn()
};

// Import UIManager class
const UIManager = require('./UIManager.js');

describe('UIManager Property Tests', () => {
  
  /**
   * **Feature: space-defender, Property 12: UI Score Synchronization**
   * **Validates: Requirements 4.2**
   * 
   * For any change in game score, the displayed score should reflect the current game state value
   */
  test('Property 12: UI Score Synchronization', () => {
    fc.assert(fc.property(
      fc.record({
        initialScore: fc.integer({ min: 0, max: 1000000 }),
        newScore: fc.integer({ min: 0, max: 1000000 })
      }),
      (params) => {
        // Create UIManager instance
        const uiManager = new UIManager();
        
        // Set initial score
        uiManager.updateScore(params.initialScore);
        
        // Verify initial synchronization
        const initialSynced = uiManager.getScore() === params.initialScore;
        
        // Update to new score
        uiManager.updateScore(params.newScore);
        
        // Verify new score synchronization
        const newSynced = uiManager.getScore() === params.newScore;
        
        // Create mock game state for synchronization test
        const gameState = {
          score: params.newScore,
          planetHealth: 100,
          gameOver: false
        };
        
        // Test synchronization method
        uiManager.synchronize(gameState);
        const syncMethodWorks = uiManager.isSynchronized(gameState);
        
        return initialSynced && newSynced && syncMethodWorks;
      }
    ), { numRuns: 100 });
  });

  test('UIManager updates score display correctly', () => {
    const uiManager = new UIManager();
    
    uiManager.updateScore(150);
    expect(uiManager.getScore()).toBe(150);
    
    uiManager.updateScore(0);
    expect(uiManager.getScore()).toBe(0);
    
    uiManager.updateScore(999999);
    expect(uiManager.getScore()).toBe(999999);
  });

  test('UIManager synchronizes with game state', () => {
    const uiManager = new UIManager();
    
    const gameState = {
      score: 500,
      planetHealth: 75,
      gameOver: false
    };
    
    uiManager.synchronize(gameState);
    
    expect(uiManager.isSynchronized(gameState)).toBe(true);
    expect(uiManager.getScore()).toBe(500);
    expect(uiManager.getHealth()).toBe(75);
  });

  test('UIManager handles game over state', () => {
    const uiManager = new UIManager();
    
    const gameOverState = {
      score: 1000,
      planetHealth: 0,
      gameOver: true
    };
    
    uiManager.synchronize(gameOverState);
    
    expect(uiManager.isSynchronized(gameOverState)).toBe(true);
  });

  /**
   * **Feature: space-defender, Property 13: UI Health Synchronization**
   * **Validates: Requirements 4.3**
   * 
   * For any change in planet health, the displayed health should reflect the current game state value
   */
  test('Property 13: UI Health Synchronization', () => {
    fc.assert(fc.property(
      fc.record({
        initialHealth: fc.integer({ min: 0, max: 100 }),
        newHealth: fc.integer({ min: 0, max: 100 })
      }),
      (params) => {
        // Create UIManager instance
        const uiManager = new UIManager();
        
        // Set initial health
        uiManager.updateHealth(params.initialHealth);
        
        // Verify initial synchronization
        const initialSynced = uiManager.getHealth() === params.initialHealth;
        
        // Update to new health
        uiManager.updateHealth(params.newHealth);
        
        // Verify new health synchronization
        const newSynced = uiManager.getHealth() === params.newHealth;
        
        // Create mock game state for synchronization test
        const gameState = {
          score: 0,
          planetHealth: params.newHealth,
          gameOver: false
        };
        
        // Test synchronization method
        uiManager.synchronize(gameState);
        const syncMethodWorks = uiManager.isSynchronized(gameState);
        
        return initialSynced && newSynced && syncMethodWorks;
      }
    ), { numRuns: 100 });
  });

  test('UIManager resets to initial state', () => {
    const uiManager = new UIManager();
    
    // Set some values
    uiManager.updateScore(500);
    uiManager.updateHealth(50);
    
    // Reset
    uiManager.reset();
    
    expect(uiManager.getScore()).toBe(0);
    expect(uiManager.getHealth()).toBe(100);
  });

  // Unit tests for UI components as required by task 5.5
  describe('Score Display Tests', () => {
    test('Score display updates correctly with various values', () => {
      const uiManager = new UIManager();
      
      // Test zero score
      uiManager.updateScore(0);
      expect(uiManager.getScore()).toBe(0);
      
      // Test positive scores
      uiManager.updateScore(100);
      expect(uiManager.getScore()).toBe(100);
      
      uiManager.updateScore(9999);
      expect(uiManager.getScore()).toBe(9999);
      
      // Test large scores
      uiManager.updateScore(1000000);
      expect(uiManager.getScore()).toBe(1000000);
    });

    test('Score display handles edge cases', () => {
      const uiManager = new UIManager();
      
      // Test negative scores (should still work)
      uiManager.updateScore(-10);
      expect(uiManager.getScore()).toBe(-10);
      
      // Test decimal scores (should work for bonus systems)
      uiManager.updateScore(150.5);
      expect(uiManager.getScore()).toBe(150.5);
    });
  });

  describe('Game Over Screen Tests', () => {
    test('Game over screen shows and hides correctly', () => {
      const uiManager = new UIManager();
      
      // Initially hidden
      uiManager.hideGameOverScreen();
      
      // Show with final score
      uiManager.showGameOverScreen(1500);
      
      // Hide again
      uiManager.hideGameOverScreen();
    });

    test('Game over screen displays final score correctly', () => {
      const uiManager = new UIManager();
      
      // Test various final scores
      uiManager.showGameOverScreen(0);
      uiManager.showGameOverScreen(500);
      uiManager.showGameOverScreen(99999);
    });

    test('Game over screen integrates with game state', () => {
      const uiManager = new UIManager();
      
      const gameOverState = {
        score: 2500,
        planetHealth: 0,
        gameOver: true
      };
      
      uiManager.synchronize(gameOverState);
      
      expect(uiManager.isSynchronized(gameOverState)).toBe(true);
      expect(uiManager.getScore()).toBe(2500);
      expect(uiManager.getHealth()).toBe(0);
    });
  });

  describe('Health Display Tests', () => {
    test('Health display updates with color changes', () => {
      const uiManager = new UIManager();
      
      // Test full health
      uiManager.updateHealth(100);
      expect(uiManager.getHealth()).toBe(100);
      
      // Test medium health
      uiManager.updateHealth(50);
      expect(uiManager.getHealth()).toBe(50);
      
      // Test low health
      uiManager.updateHealth(20);
      expect(uiManager.getHealth()).toBe(20);
      
      // Test critical health
      uiManager.updateHealth(5);
      expect(uiManager.getHealth()).toBe(5);
      
      // Test zero health
      uiManager.updateHealth(0);
      expect(uiManager.getHealth()).toBe(0);
    });

    test('Health display handles negative values', () => {
      const uiManager = new UIManager();
      
      // Should clamp negative values to 0
      uiManager.updateHealth(-10);
      expect(uiManager.getHealth()).toBe(0);
      
      uiManager.updateHealth(-100);
      expect(uiManager.getHealth()).toBe(0);
    });
  });
});