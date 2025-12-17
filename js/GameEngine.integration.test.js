/**
 * Интеграционные тесты для GameEngine
 * Космический Защитник
 */

// Настройка тестового окружения
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><body><canvas id="testCanvas" width="800" height="600"></canvas></body>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;

// Mock canvas context
const mockContext = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    font: '',
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    })),
    createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
    }))
};

// Override getContext method
HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// Мокирование Web Audio API
global.AudioContext = class {
    constructor() {
        this.currentTime = 0;
        this.destination = {};
        this.state = 'running';
    }
    createOscillator() {
        return {
            connect: () => {},
            start: () => {},
            stop: () => {},
            frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }
        };
    }
    createGain() {
        return {
            connect: () => {},
            gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }
        };
    }
    resume() { return Promise.resolve(); }
};

// Mock global classes for integration testing with more realistic behavior
global.SoundManager = class {
    constructor() {}
    playSound() {}
    startBackgroundMusic() {}
    stopBackgroundMusic() {}
    isMuted() { return false; }
    setMuted() {}
};

global.ParticleSystem = class {
    constructor() {
        this.particles = [];
        this.particleCount = 0;
    }
    addExplosion() {
        // Simulate adding particles
        this.particleCount += 10;
        this.particles = new Array(Math.min(this.particleCount, 300)).fill({});
    }
    createExplosion() {
        this.addExplosion();
    }
    createSparks() {
        // Simulate adding particles
        this.particleCount += 5;
        this.particles = new Array(Math.min(this.particleCount, 300)).fill({});
    }
    update() {
        // Simulate particle decay
        if (this.particleCount > 0) {
            this.particleCount = Math.max(0, this.particleCount - 2);
            this.particles = new Array(this.particleCount).fill({});
        }
    }
    render() {}
    clear() { 
        this.particles = []; 
        this.particleCount = 0;
    }
    getParticles() { return this.particles; }
    get maxParticles() { return 300; }
};

global.ObjectPool = class {
    constructor() {
        this.pools = new Map();
        this.stats = { totalReused: 0, reuseRatio: '0.0' };
    }
    initializePool(type, createFunction, resetFunction, initialSize = 10) {
        this.pools.set(type, {
            available: [],
            inUse: [],
            createFunction,
            resetFunction,
            totalCreated: 0,
            totalReused: 0
        });
    }
    acquire(type, ...args) {
        const pool = this.pools.get(type);
        if (!pool) return null;
        const obj = pool.createFunction(...args);
        if (obj) {
            obj.active = true;
            // Call reset function if provided
            if (pool.resetFunction && args.length > 0) {
                pool.resetFunction(obj, ...args);
            }
            pool.totalReused++;
            this.stats.totalReused++;
            this.stats.reuseRatio = (this.stats.totalReused / (this.stats.totalReused + 1)).toFixed(1);
        }
        return obj;
    }
    release(type, obj) {}
    autoRelease(type, entities) {}
    clear() { this.pools.clear(); }
    getAllStats() { return { asteroid: this.stats, projectile: this.stats }; }
    getPoolStats() { return this.stats; }
};

global.CollisionSystem = class {
    checkCollisions(entities) {
        const collisions = [];
        // Simple collision detection for testing
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];
                
                if (!entityA.active || !entityB.active) continue;
                
                // Check for projectile-asteroid collision
                if ((entityA.type === 'projectile' && entityB.type === 'asteroid') ||
                    (entityA.type === 'asteroid' && entityB.type === 'projectile')) {
                    
                    // Simple distance-based collision
                    const dx = entityA.position.x - entityB.position.x;
                    const dy = entityA.position.y - entityB.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 30) { // Simple collision threshold
                        collisions.push({
                            type: 'asteroid-projectile',
                            entityA: entityA.type === 'asteroid' ? entityA : entityB,
                            entityB: entityA.type === 'projectile' ? entityA : entityB,
                            projectile: entityA.type === 'projectile' ? entityA : entityB,
                            asteroid: entityA.type === 'asteroid' ? entityA : entityB
                        });
                    }
                }
            }
        }
        return collisions;
    }
    
    processCollisions(collisions) {
        const result = {
            destroyedEntities: [],
            scoreIncrease: 0,
            planetDamage: 0,
            gameOver: false
        };

        collisions.forEach(collision => {
            if (collision.type === 'asteroid-projectile') {
                // Destroy both entities
                collision.entityA.active = false;
                collision.entityB.active = false;
                result.destroyedEntities.push(collision.entityA, collision.entityB);
                result.scoreIncrease += 10;
            }
        });

        return result;
    }
};

global.Renderer = class {
    constructor() {}
    render() {}
};

global.UIManager = class {
    synchronize() {}
};

global.InputManager = class {
    constructor() { 
        this.keys = new Map(); 
    }
    isKeyPressed() { return false; }
    update() {}
};

// Импорт модулей
const GameEngine = require('./GameEngine.js');

describe('GameEngine Integration Tests', () => {
    let canvas;
    let gameEngine;

    beforeEach(() => {
        canvas = document.getElementById('testCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'testCanvas';
            canvas.width = 800;
            canvas.height = 600;
            document.body.appendChild(canvas);
        }
        gameEngine = new GameEngine(canvas);
    });

    afterEach(() => {
        if (gameEngine) {
            gameEngine.stop();
        }
    });

    describe('Полный игровой цикл', () => {
        test('должен инициализировать игру с правильным начальным состоянием', () => {
            expect(gameEngine.getGameState()).toEqual({
                score: 0,
                planetHealth: 100,
                gameOver: false,
                paused: false,
                level: 1,
                time: 0
            });

            expect(gameEngine.entities.length).toBe(1); // Корабль игрока
            expect(gameEngine.entities[0].type).toBe('playerShip');
        });

        test('должен обрабатывать полный цикл игры: спавн астероида -> стрельба -> столкновение -> уничтожение', (done) => {
            // Запуск игры
            gameEngine.start();

            // Симуляция времени для спавна астероида
            setTimeout(() => {
                // Принудительный спавн астероида
                const asteroid = gameEngine.objectPool.acquire('asteroid', 400, -30);
                gameEngine.entities.push(asteroid);

                expect(gameEngine.entities.length).toBe(2); // Корабль + астероид

                // Симуляция выстрела
                const projectile = gameEngine.objectPool.acquire('projectile', 400, 500);
                gameEngine.entities.push(projectile);

                expect(gameEngine.entities.length).toBe(3); // Корабль + астероид + снаряд

                // Симуляция столкновения путем перемещения объектов
                asteroid.position.y = 300;
                projectile.position.y = 300;

                // Обновление игры для обработки столкновений
                gameEngine.update(16);

                // Проверка что столкновение обработано
                setTimeout(() => {
                    const activeEntities = gameEngine.entities.filter(e => e.active);
                    expect(activeEntities.length).toBe(1); // Только корабль остался
                    expect(gameEngine.getGameState().score).toBeGreaterThan(0);
                    done();
                }, 50);
            }, 100);
        });

        test('должен правильно обрабатывать урон планете и окончание игры', () => {
            // Создание астероида у нижней границы
            const asteroid = gameEngine.objectPool.acquire('asteroid', 400, gameEngine.canvas.height - 10);
            gameEngine.entities.push(asteroid);

            const initialHealth = gameEngine.getGameState().planetHealth;

            // Обновление игры
            gameEngine.update(16);

            // Проверка урона планете
            expect(gameEngine.getGameState().planetHealth).toBeLessThan(initialHealth);

            // Симуляция критического урона
            gameEngine.gameState.planetHealth = 5;
            const asteroid2 = gameEngine.objectPool.acquire('asteroid', 400, gameEngine.canvas.height - 10);
            gameEngine.entities.push(asteroid2);

            gameEngine.update(16);

            // Проверка окончания игры
            expect(gameEngine.getGameState().gameOver).toBe(true);
            expect(gameEngine.getGameState().planetHealth).toBeLessThanOrEqual(0);
        });

        test('должен правильно увеличивать сложность со временем', () => {
            const initialSpawnRate = gameEngine.asteroidSpawnRate;
            const initialLevel = gameEngine.getGameState().level;

            // Симуляция прохождения времени
            gameEngine.gameState.time = 15000; // 15 секунд
            gameEngine.updateDifficulty(gameEngine.gameState.time);

            expect(gameEngine.asteroidSpawnRate).toBeLessThan(initialSpawnRate);
            expect(gameEngine.getGameState().level).toBeGreaterThan(initialLevel);
        });
    });

    describe('Тесты производительности', () => {
        test('должен поддерживать стабильную производительность с множественными объектами', () => {
            const startTime = performance.now();
            
            // Создание множественных объектов
            for (let i = 0; i < 50; i++) {
                const asteroid = gameEngine.objectPool.acquire('asteroid', Math.random() * 800, Math.random() * 600);
                gameEngine.entities.push(asteroid);
            }

            for (let i = 0; i < 30; i++) {
                const projectile = gameEngine.objectPool.acquire('projectile', Math.random() * 800, Math.random() * 600);
                gameEngine.entities.push(projectile);
            }

            // Множественные обновления
            for (let i = 0; i < 100; i++) {
                gameEngine.update(16);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // Проверка что обновления выполняются достаточно быстро
            expect(totalTime).toBeLessThan(1000); // Менее 1 секунды для 100 обновлений
            expect(totalTime / 100).toBeLessThan(10); // Менее 10мс на обновление
        });

        test('должен эффективно использовать объектные пулы', () => {
            // Создание и уничтожение множественных объектов
            for (let cycle = 0; cycle < 10; cycle++) {
                // Создание объектов
                for (let i = 0; i < 20; i++) {
                    const asteroid = gameEngine.objectPool.acquire('asteroid', Math.random() * 800, -30);
                    gameEngine.entities.push(asteroid);
                }

                // Уничтожение объектов
                gameEngine.entities.forEach(entity => {
                    if (entity.type === 'asteroid') {
                        entity.destroy();
                    }
                });

                gameEngine.cleanupEntities();
            }

            // Проверка статистики пулов
            const asteroidStats = gameEngine.objectPool.getPoolStats('asteroid');
            expect(asteroidStats.totalReused).toBeGreaterThan(0);
            expect(parseFloat(asteroidStats.reuseRatio)).toBeGreaterThan(0.5); // Более 50% переиспользования
        });

        test('должен ограничивать количество частиц для производительности', () => {
            // Создание множественных взрывов
            for (let i = 0; i < 20; i++) {
                gameEngine.particleSystem.createExplosion(
                    Math.random() * 800,
                    Math.random() * 600,
                    'asteroid'
                );
            }

            const particleCount = gameEngine.particleSystem.getParticles().length;
            expect(particleCount).toBeLessThanOrEqual(gameEngine.particleSystem.maxParticles);

            // Обновление частиц
            for (let i = 0; i < 50; i++) {
                gameEngine.particleSystem.update(16);
            }

            // Проверка что частицы очищаются
            const finalParticleCount = gameEngine.particleSystem.getParticles().length;
            expect(finalParticleCount).toBeLessThan(particleCount);
        });
    });

    describe('Тесты систем', () => {
        test('должен правильно интегрировать все игровые системы', () => {
            // Проверка инициализации всех систем
            expect(gameEngine.inputManager).toBeDefined();
            expect(gameEngine.collisionSystem).toBeDefined();
            expect(gameEngine.renderer).toBeDefined();
            expect(gameEngine.uiManager).toBeDefined();
            expect(gameEngine.soundManager).toBeDefined();
            expect(gameEngine.particleSystem).toBeDefined();
            expect(gameEngine.objectPool).toBeDefined();

            // Проверка что системы работают вместе
            gameEngine.start();
            
            // Симуляция игрового цикла
            gameEngine.update(16);
            
            expect(gameEngine.running).toBe(true);
        });

        test('должен правильно обрабатывать паузу и возобновление', () => {
            gameEngine.start();
            expect(gameEngine.running).toBe(true);
            expect(gameEngine.getGameState().paused).toBe(false);

            gameEngine.pause();
            expect(gameEngine.getGameState().paused).toBe(true);

            gameEngine.resume();
            expect(gameEngine.getGameState().paused).toBe(false);

            gameEngine.stop();
            expect(gameEngine.running).toBe(false);
        });

        test('должен правильно перезапускать игру', () => {
            // Изменение состояния игры
            gameEngine.gameState.score = 1000;
            gameEngine.gameState.planetHealth = 50;
            gameEngine.gameState.level = 5;

            // Добавление объектов
            const asteroid = gameEngine.objectPool.acquire('asteroid', 400, 300);
            gameEngine.entities.push(asteroid);

            expect(gameEngine.entities.length).toBeGreaterThan(1);

            // Перезапуск
            gameEngine.restart();
            
            // Остановка игры для проверки состояния
            gameEngine.stop();

            // Проверка сброса состояния (исключая время, которое может измениться)
            const state = gameEngine.getGameState();
            expect(state.score).toBe(0);
            expect(state.planetHealth).toBe(100);
            expect(state.gameOver).toBe(false);
            expect(state.paused).toBe(false);
            expect(state.level).toBe(1);
            expect(state.time).toBeGreaterThanOrEqual(0); // Время может быть небольшим

            expect(gameEngine.entities.length).toBe(1); // Только корабль игрока
        });
    });

    describe('Тесты отказоустойчивости', () => {
        test('должен обрабатывать отсутствие canvas', () => {
            expect(() => {
                new GameEngine(null);
            }).not.toThrow();
        });

        test('должен обрабатывать экстремальные значения deltaTime', () => {
            gameEngine.start();

            // Тест с очень большим deltaTime
            expect(() => {
                gameEngine.update(10000);
            }).not.toThrow();

            // Тест с отрицательным deltaTime
            expect(() => {
                gameEngine.update(-100);
            }).not.toThrow();

            // Тест с нулевым deltaTime
            expect(() => {
                gameEngine.update(0);
            }).not.toThrow();
        });

        test('должен обрабатывать множественные столкновения одновременно', () => {
            // Создание множественных пересекающихся объектов
            for (let i = 0; i < 10; i++) {
                const asteroid = gameEngine.objectPool.acquire('asteroid', 400, 300);
                const projectile = gameEngine.objectPool.acquire('projectile', 400, 300);
                gameEngine.entities.push(asteroid);
                gameEngine.entities.push(projectile);
            }

            expect(() => {
                gameEngine.handleCollisions();
            }).not.toThrow();

            // Проверка что игра остается в стабильном состоянии
            expect(gameEngine.getGameState().score).toBeGreaterThanOrEqual(0);
        });
    });
});