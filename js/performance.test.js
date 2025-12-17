/**
 * Тесты производительности
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

// Импорт модулей
const GameEngine = require('./GameEngine.js');
const ObjectPool = require('./systems/ObjectPool.js');
const ParticleSystem = require('./systems/ParticleSystem.js');

describe('Performance Tests', () => {
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

    describe('Бенчмарки игрового движка', () => {
        test('должен обновлять 100 объектов за разумное время', () => {
            // Создание 100 объектов
            for (let i = 0; i < 50; i++) {
                const asteroid = gameEngine.objectPool.acquire('asteroid', Math.random() * 800, Math.random() * 600);
                gameEngine.entities.push(asteroid);
            }

            for (let i = 0; i < 50; i++) {
                const projectile = gameEngine.objectPool.acquire('projectile', Math.random() * 800, Math.random() * 600);
                gameEngine.entities.push(projectile);
            }

            const iterations = 1000;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                gameEngine.update(16);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTimePerUpdate = totalTime / iterations;

            console.log(`Среднее время обновления: ${avgTimePerUpdate.toFixed(2)}мс`);
            console.log(`Общее время для ${iterations} обновлений: ${totalTime.toFixed(2)}мс`);

            // Проверка производительности (должно быть менее 5мс на обновление)
            expect(avgTimePerUpdate).toBeLessThan(5);
        });

        test('должен эффективно обрабатывать столкновения', () => {
            // Создание множественных пересекающихся объектов
            const objectCount = 30;
            
            for (let i = 0; i < objectCount; i++) {
                const asteroid = gameEngine.objectPool.acquire('asteroid', 400 + i * 2, 300 + i * 2);
                const projectile = gameEngine.objectPool.acquire('projectile', 400 + i * 2, 300 + i * 2);
                gameEngine.entities.push(asteroid);
                gameEngine.entities.push(projectile);
            }

            const iterations = 100;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                gameEngine.handleCollisions();
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTimePerCollisionCheck = totalTime / iterations;

            console.log(`Среднее время проверки столкновений: ${avgTimePerCollisionCheck.toFixed(2)}мс`);

            // Проверка производительности (должно быть менее 2мс на проверку)
            expect(avgTimePerCollisionCheck).toBeLessThan(2);
        });
    });

    describe('Бенчмарки объектного пула', () => {
        test('должен быстро создавать и освобождать объекты', () => {
            const pool = new ObjectPool();
            
            // Инициализация пула
            pool.initializePool(
                'test',
                () => ({ x: 0, y: 0, active: false }),
                (obj, x, y) => { obj.x = x; obj.y = y; obj.active = true; },
                10
            );

            const iterations = 10000;
            const startTime = performance.now();

            // Тест создания и освобождения
            for (let i = 0; i < iterations; i++) {
                const obj = pool.acquire('test', i, i);
                pool.release('test', obj);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTimePerOperation = totalTime / (iterations * 2); // *2 потому что acquire + release

            console.log(`Среднее время операции пула: ${avgTimePerOperation.toFixed(4)}мс`);

            // Проверка производительности (должно быть менее 0.01мс на операцию)
            expect(avgTimePerOperation).toBeLessThan(0.01);

            // Проверка эффективности переиспользования
            const stats = pool.getPoolStats('test');
            expect(parseFloat(stats.reuseRatio)).toBeGreaterThan(0.99); // Более 99% переиспользования
        });

        test('должен масштабироваться с увеличением количества объектов', () => {
            const pool = new ObjectPool();
            
            pool.initializePool(
                'scalability',
                () => ({ data: new Array(100).fill(0), active: false }),
                (obj) => { obj.active = true; },
                50
            );

            const testSizes = [100, 500, 1000, 2000];
            const results = [];

            testSizes.forEach(size => {
                const startTime = performance.now();
                const objects = [];

                // Создание объектов
                for (let i = 0; i < size; i++) {
                    objects.push(pool.acquire('scalability'));
                }

                // Освобождение объектов
                objects.forEach(obj => pool.release('scalability', obj));

                const endTime = performance.now();
                const timePerObject = (endTime - startTime) / size;
                results.push({ size, timePerObject });

                console.log(`${size} объектов: ${timePerObject.toFixed(4)}мс на объект`);
            });

            // Проверка что время не растет экспоненциально
            const firstResult = results[0];
            const lastResult = results[results.length - 1];
            const scalingFactor = lastResult.timePerObject / firstResult.timePerObject;

            expect(scalingFactor).toBeLessThan(5); // Не более чем в 5 раз медленнее
        });
    });

    describe('Бенчмарки системы частиц', () => {
        test('должен эффективно обновлять большое количество частиц', () => {
            const particleSystem = new ParticleSystem();

            // Создание множественных взрывов
            for (let i = 0; i < 20; i++) {
                particleSystem.createExplosion(
                    Math.random() * 800,
                    Math.random() * 600,
                    'asteroid'
                );
            }

            const initialParticleCount = particleSystem.getParticles().length;
            console.log(`Начальное количество частиц: ${initialParticleCount}`);

            const iterations = 1000;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                particleSystem.update(16);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTimePerUpdate = totalTime / iterations;

            console.log(`Среднее время обновления частиц: ${avgTimePerUpdate.toFixed(2)}мс`);

            // Проверка производительности (должно быть менее 1мс на обновление)
            expect(avgTimePerUpdate).toBeLessThan(1);

            // Проверка что частицы правильно очищаются
            const finalParticleCount = particleSystem.getParticles().length;
            expect(finalParticleCount).toBeLessThanOrEqual(initialParticleCount);
        });

        test('должен ограничивать количество частиц для предотвращения проблем с памятью', () => {
            const particleSystem = new ParticleSystem();
            const maxParticles = particleSystem.maxParticles;

            // Попытка создать больше частиц чем максимум
            for (let i = 0; i < maxParticles * 2; i++) {
                particleSystem.createExplosion(
                    Math.random() * 800,
                    Math.random() * 600,
                    'explosion'
                );
            }

            const particleCount = particleSystem.getParticles().length;
            console.log(`Количество частиц после превышения лимита: ${particleCount}`);

            expect(particleCount).toBeLessThanOrEqual(maxParticles);
        });
    });

    describe('Тесты памяти', () => {
        test('должен предотвращать утечки памяти при длительной игре', () => {
            // Симуляция длительной игры
            const cycles = 100;
            
            for (let cycle = 0; cycle < cycles; cycle++) {
                // Создание объектов
                for (let i = 0; i < 20; i++) {
                    const asteroid = gameEngine.objectPool.acquire('asteroid', Math.random() * 800, -30);
                    const projectile = gameEngine.objectPool.acquire('projectile', Math.random() * 800, 600);
                    gameEngine.entities.push(asteroid);
                    gameEngine.entities.push(projectile);
                }

                // Создание эффектов
                for (let i = 0; i < 5; i++) {
                    gameEngine.particleSystem.createExplosion(
                        Math.random() * 800,
                        Math.random() * 600,
                        'asteroid'
                    );
                }

                // Обновление игры
                for (let i = 0; i < 10; i++) {
                    gameEngine.update(16);
                }

                // Очистка
                gameEngine.entities.forEach(entity => {
                    if (entity.type !== 'playerShip') {
                        entity.destroy();
                    }
                });
                gameEngine.cleanupEntities();
            }

            // Проверка что объекты правильно очищены
            const activeEntities = gameEngine.entities.filter(e => e.active);
            expect(activeEntities.length).toBe(1); // Только корабль игрока

            // Проверка статистики пулов
            const asteroidStats = gameEngine.objectPool.getPoolStats('asteroid');
            const projectileStats = gameEngine.objectPool.getPoolStats('projectile');

            expect(asteroidStats.inUse).toBe(0);
            expect(projectileStats.inUse).toBe(0);
        });
    });

    describe('Стресс-тесты', () => {
        test('должен выдерживать экстремальную нагрузку', () => {
            // Создание экстремального количества объектов
            const extremeCount = 200;
            
            for (let i = 0; i < extremeCount; i++) {
                const asteroid = gameEngine.objectPool.acquire('asteroid', Math.random() * 800, Math.random() * 600);
                gameEngine.entities.push(asteroid);
            }

            // Создание множественных эффектов
            for (let i = 0; i < 50; i++) {
                gameEngine.particleSystem.createExplosion(
                    Math.random() * 800,
                    Math.random() * 600,
                    'asteroid'
                );
            }

            const startTime = performance.now();

            // Стресс-тест обновлений
            expect(() => {
                for (let i = 0; i < 100; i++) {
                    gameEngine.update(16);
                }
            }).not.toThrow();

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            console.log(`Время стресс-теста: ${totalTime.toFixed(2)}мс`);

            // Проверка что игра остается отзывчивой даже под нагрузкой
            expect(totalTime / 100).toBeLessThan(20); // Менее 20мс на обновление
        });
    });
});