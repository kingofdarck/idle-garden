/**
 * Основной игровой движок
 * Космический Защитник
 */

// Import classes for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    // Only import if not already defined globally (for testing)
    if (!global.Entity) {
        const Entity = require('./entities/Entity.js');
        const PlayerShip = require('./entities/PlayerShip.js');
        const Asteroid = require('./entities/Asteroid.js');
        const Projectile = require('./entities/Projectile.js');
        global.Entity = Entity;
        global.PlayerShip = PlayerShip;
        global.Asteroid = Asteroid;
        global.Projectile = Projectile;
        
        // Import upgrade system classes
        try {
            const UpgradeSystem = require('./systems/UpgradeSystem.js');
            const UpgradeUI = require('./systems/UpgradeUI.js');
            global.UpgradeSystem = UpgradeSystem;
            global.UpgradeUI = UpgradeUI;
        } catch (error) {
            // Fallback to mocks if files don't exist
            console.warn('UpgradeSystem files not found, using mocks');
        }
    }
    
    if (!global.InputManager) {
        // Create mock classes for testing if they don't exist
        global.InputManager = class {
            constructor() { this.keys = new Map(); }
            isKeyPressed() { return false; }
            update() {}
        };
        
        global.CollisionSystem = class {
            checkCollisions() { return []; }
            processCollisions() { return { destroyedEntities: [], scoreIncrease: 0, planetDamage: 0, gameOver: false }; }
        };
        
        global.Renderer = class {
            constructor() {}
            render() {}
        };
        
        global.UIManager = class {
            synchronize() {}
        };
        
        global.SoundManager = class {
            playSound() {}
            startBackgroundMusic() {}
            stopBackgroundMusic() {}
            setMuted() {}
            isMuted() { return false; }
            resumeAudioContext() {}
        };
        
        global.ParticleSystem = class {
            createExplosion() {}
            createEngineTrail() {}
            createSparks() {}
            update() {}
            getParticles() { return []; }
            clear() {}
        };
        
        global.ObjectPool = class {
            constructor() {
                this.createdEntities = [];
            }
            initializePool() {}
            acquire(type, x, y) { 
                const entity = { 
                    position: {x: x || 0, y: y || 0}, 
                    size: {width: 30, height: 30}, 
                    type: type || 'test', 
                    active: true, 
                    destroy: function() { this.active = false; }, 
                    update: () => {}, 
                    hasReachedBottom: () => false 
                };
                this.createdEntities.push(entity);
                return entity;
            }
            release() {}
            autoRelease(type, entities) {
                // Remove inactive entities from the entities array
                for (let i = entities.length - 1; i >= 0; i--) {
                    if (entities[i].type === type && !entities[i].active) {
                        entities.splice(i, 1);
                    }
                }
            }
            getPoolStats() { return { available: 0, inUse: 0, totalCreated: 0, totalReused: 0, reuseRatio: '0.00' }; }
            getAllStats() { return {}; }
            clear() {}
        };

        global.UpgradeSystem = class {
            constructor() {}
            getAllUpgrades() { return []; }
            getUpgradeEffect() { return 1; }
            purchaseUpgrade() { return { success: false, message: 'Test mode' }; }
            resetUpgrades() {}
            saveProgress() {}
            loadProgress() {}
        };

        global.UpgradeUI = class {
            constructor() {}
            show() {}
            hide() {}
            isOpen() { return false; }
        };
    }
}

class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.running = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // Игровые системы
        this.inputManager = new ((typeof global !== 'undefined' && global.InputManager) || InputManager)();
        this.collisionSystem = new ((typeof global !== 'undefined' && global.CollisionSystem) || CollisionSystem)();
        this.renderer = new ((typeof global !== 'undefined' && global.Renderer) || Renderer)(canvas);
        this.uiManager = new ((typeof global !== 'undefined' && global.UIManager) || UIManager)();
        this.soundManager = new ((typeof global !== 'undefined' && global.SoundManager) || SoundManager)();
        this.particleSystem = new ((typeof global !== 'undefined' && global.ParticleSystem) || ParticleSystem)();
        this.objectPool = new ((typeof global !== 'undefined' && global.ObjectPool) || ObjectPool)();
        this.upgradeSystem = new ((typeof global !== 'undefined' && global.UpgradeSystem) || UpgradeSystem)();
        this.upgradeUI = new ((typeof global !== 'undefined' && global.UpgradeUI) || UpgradeUI)(this.upgradeSystem);
        
        // Игровые объекты
        this.entities = [];
        this.particles = [];
        
        // Состояние игры
        this.gameState = {
            score: 0,
            planetHealth: 100,
            gameOver: false,
            paused: false,
            level: 1,
            time: 0
        };
        
        // Параметры спавна астероидов
        this.asteroidSpawnRate = 2000; // миллисекунд между спавнами
        this.lastAsteroidSpawn = 0;
        this.difficultyIncreaseRate = 10000; // каждые 10 секунд
        this.lastDifficultyIncrease = 0;
        
        // Отладочная информация
        this.debug = {
            enabled: false,
            fps: 0,
            entityCount: 0,
            collisions: 0,
            showBounds: false
        };
        
        this.setupEventListeners();
        this.initializeObjectPools();
        this.initializeGame();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка перезапуска игры
        window.addEventListener('gameRestart', () => {
            this.restart();
        });
        
        // Обработка потери фокуса
        window.addEventListener('blur', () => {
            this.pause();
        });
        
        // Обработка получения фокуса
        window.addEventListener('focus', () => {
            if (this.gameState.paused && !this.gameState.gameOver) {
                this.resume();
            }
        });
        
        // Отладочные клавиши и управление звуком
        document.addEventListener('keydown', (event) => {
            if (event.code === 'F1') {
                event.preventDefault();
                this.debug.enabled = !this.debug.enabled;
            }
            if (event.code === 'F2') {
                event.preventDefault();
                this.debug.showBounds = !this.debug.showBounds;
            }
            if (event.code === 'KeyM') {
                event.preventDefault();
                this.soundManager.setMuted(!this.soundManager.isMuted());
            }
            if (event.code === 'KeyU') {
                event.preventDefault();
                if (this.upgradeUI.isOpen()) {
                    this.upgradeUI.hide();
                    this.resume();
                } else {
                    this.pause();
                    this.upgradeUI.show(this.gameState.score);
                }
            }
        });
        
        // Возобновление аудио контекста при первом взаимодействии
        const resumeAudio = () => {
            this.soundManager.resumeAudioContext();
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);

        // Обработка покупки улучшений
        window.addEventListener('upgradePurchased', (event) => {
            const { upgradeId, cost } = event.detail;
            this.gameState.score -= cost;
            this.applyUpgrade(upgradeId);
            this.upgradeUI.updateUI(this.gameState.score);
        });

        // Обработка закрытия панели улучшений
        window.addEventListener('upgradeUIClosed', () => {
            if (this.gameState.paused && !this.gameState.gameOver) {
                this.resume();
            }
        });
    }

    /**
     * Инициализация объектных пулов
     */
    initializeObjectPools() {
        const AsteroidClass = (typeof global !== 'undefined' && global.Asteroid) || Asteroid;
        const ProjectileClass = (typeof global !== 'undefined' && global.Projectile) || Projectile;
        
        // Инициализация пула астероидов
        this.objectPool.initializePool(
            'asteroid',
            () => new AsteroidClass(0, 0),
            (obj, x, y) => {
                obj.position.x = x;
                obj.position.y = y;
                obj.velocity.x = 0;
                obj.velocity.y = obj.speed;
                obj.rotation = 0;
                obj.setScreenHeight(this.canvas.height);
            },
            15 // Начальный размер пула
        );
        
        // Инициализация пула снарядов
        this.objectPool.initializePool(
            'projectile',
            () => new ProjectileClass(0, 0),
            (obj, x, y) => {
                obj.position.x = x;
                obj.position.y = y;
                obj.velocity.x = 0;
                obj.velocity.y = -obj.speed;
            },
            20 // Начальный размер пула
        );
    }

    /**
     * Инициализация игры
     */
    initializeGame() {
        // Проверка наличия canvas
        if (!this.canvas) {
            console.warn('Canvas не найден, игра не может быть инициализирована');
            return;
        }
        
        // Создание корабля игрока
        const PlayerShipClass = (typeof global !== 'undefined' && global.PlayerShip) || PlayerShip;
        const playerShip = new PlayerShipClass(
            this.canvas.width / 2 - 20,
            this.canvas.height - 60
        );
        playerShip.setScreenBounds(this.canvas.width, this.canvas.height);
        this.entities.push(playerShip);
        
        // Инициализация базовых значений для улучшений
        this.initializeUpgradeValues();
        
        // Загрузка сохраненного прогресса улучшений
        this.upgradeSystem.loadProgress();
        
        // Применение всех активных улучшений
        this.applyAllUpgrades();
        
        // Синхронизация UI
        this.uiManager.synchronize(this.gameState);
        
        // Запуск фоновой музыки
        this.soundManager.startBackgroundMusic();
    }

    /**
     * Запуск игры
     */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    /**
     * Остановка игры
     */
    stop() {
        this.running = false;
    }

    /**
     * Пауза игры
     */
    pause() {
        this.gameState.paused = true;
    }

    /**
     * Возобновление игры
     */
    resume() {
        this.gameState.paused = false;
        this.lastTime = performance.now();
    }

    /**
     * Перезапуск игры
     */
    restart() {
        // Сброс состояния игры
        this.gameState = {
            score: 0,
            planetHealth: 100,
            gameOver: false,
            paused: false,
            level: 1,
            time: 0
        };
        
        // Очистка объектов
        this.entities = [];
        this.particleSystem.clear();
        this.objectPool.clear();
        
        // Сброс параметров сложности
        this.asteroidSpawnRate = 2000;
        this.lastAsteroidSpawn = 0;
        this.lastDifficultyIncrease = 0;
        
        // Повторная инициализация
        this.initializeGame();
        
        // Запуск если не запущен
        if (!this.running) {
            this.start();
        }
        
        // Перезапуск фоновой музыки если звук не выключен
        if (!this.soundManager.isMuted()) {
            this.soundManager.startBackgroundMusic();
        }
    }

    /**
     * Основной игровой цикл
     */
    gameLoop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        // Ограничение максимального deltaTime для стабильности
        const clampedDeltaTime = Math.min(deltaTime, this.frameTime * 2);
        
        if (!this.gameState.paused && !this.gameState.gameOver) {
            this.update(clampedDeltaTime);
        }
        
        this.render(currentTime);
        
        // Обновление отладочной информации
        this.updateDebugInfo(deltaTime);
        
        this.lastTime = currentTime;
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Обновление игры
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        this.gameState.time += deltaTime;
        
        // Обновление менеджера ввода
        this.inputManager.update();
        
        // Обработка ввода для стрельбы
        this.handleShooting();
        
        // Спавн астероидов
        this.spawnAsteroids(this.gameState.time);
        
        // Обновление прогрессивной сложности
        this.updateDifficulty(this.gameState.time);
        
        // Обновление всех объектов
        this.updateEntities(deltaTime);
        
        // Обновление системы частиц
        this.particleSystem.update(deltaTime);
        
        // Проверка столкновений
        this.handleCollisions();
        
        // Очистка неактивных объектов
        this.cleanupEntities();
        
        // Создание эффекта двигателя для корабля игрока
        this.createEngineEffects();
        
        // Проверка условий окончания игры
        this.checkGameOver();
        
        // Синхронизация UI
        this.uiManager.synchronize(this.gameState);
    }

    /**
     * Обработка стрельбы
     */
    handleShooting() {
        if (this.inputManager.isKeyPressed('Space')) {
            const playerShip = this.entities.find(e => e.type === 'playerShip');
            if (playerShip) {
                const projectileDataArray = playerShip.tryFire(this.gameState.time);
                if (projectileDataArray) {
                    let projectilesCreated = 0;
                    
                    projectileDataArray.forEach(projectileData => {
                        const projectile = this.objectPool.acquire('projectile', projectileData.x, projectileData.y);
                        if (projectile) {
                            this.entities.push(projectile);
                            projectilesCreated++;
                        }
                    });
                    
                    // Воспроизведение звука выстрела если хотя бы один снаряд создан
                    if (projectilesCreated > 0) {
                        this.soundManager.playSound('shoot');
                    }
                }
            }
        }
    }

    /**
     * Спавн астероидов
     * @param {number} currentTime - Текущее время
     */
    spawnAsteroids(currentTime) {
        if (currentTime - this.lastAsteroidSpawn >= this.asteroidSpawnRate) {
            const x = Math.random() * (this.canvas.width - 30);
            const asteroid = this.objectPool.acquire('asteroid', x, -30);
            if (asteroid) {
                this.entities.push(asteroid);
                this.lastAsteroidSpawn = currentTime;
            }
        }
    }

    /**
     * Обновление сложности игры
     * @param {number} currentTime - Текущее время
     */
    updateDifficulty(currentTime) {
        if (currentTime - this.lastDifficultyIncrease >= this.difficultyIncreaseRate) {
            this.asteroidSpawnRate = Math.max(500, this.asteroidSpawnRate * 0.9);
            this.gameState.level++;
            this.lastDifficultyIncrease = currentTime;
        }
    }

    /**
     * Обновление всех объектов
     * @param {number} deltaTime - Время с последнего обновления
     */
    updateEntities(deltaTime) {
        this.entities.forEach(entity => {
            if (entity && entity.type === 'playerShip') {
                entity.update(deltaTime, this.inputManager);
            } else if (entity && entity.update) {
                entity.update(deltaTime);
            }
        });
    }

    /**
     * Обработка столкновений
     */
    handleCollisions() {
        const collisions = this.collisionSystem.checkCollisions(this.entities);
        const result = this.collisionSystem.processCollisions(collisions, this.gameState);
        
        // Обновление счета и создание эффектов взрыва
        if (result.scoreIncrease > 0) {
            this.gameState.score += result.scoreIncrease;
            // Воспроизведение звука взрыва при уничтожении астероида
            this.soundManager.playSound('explosion');
        }
        
        // Создание эффектов взрыва для уничтоженных объектов
        collisions.forEach(collision => {
            if (collision.projectile && collision.asteroid) {
                // Взрыв астероида
                this.particleSystem.createExplosion(
                    collision.asteroid.position.x + collision.asteroid.size.width / 2,
                    collision.asteroid.position.y + collision.asteroid.size.height / 2,
                    'asteroid'
                );
                // Искры от попадания снаряда
                this.particleSystem.createSparks(
                    collision.projectile.position.x + collision.projectile.size.width / 2,
                    collision.projectile.position.y + collision.projectile.size.height / 2
                );
            }
        });
        
        // Обработка урона планете
        if (result.planetDamage > 0) {
            this.gameState.planetHealth -= result.planetDamage;
            // Воспроизведение звука урона планете
            this.soundManager.playSound('planetDamage');
        }
        
        // Проверка астероидов, достигших нижней границы
        this.entities.forEach(entity => {
            if (entity && entity.type === 'asteroid' && entity.hasReachedBottom && entity.hasReachedBottom()) {
                // Создание эффекта взрыва на планете
                this.particleSystem.createExplosion(
                    entity.position.x + entity.size.width / 2,
                    this.canvas.height - 20,
                    'planet'
                );
                entity.destroy();
                this.gameState.planetHealth -= 10;
                // Воспроизведение звука урона планете
                this.soundManager.playSound('planetDamage');
            }
        });
        
        // Проверка окончания игры
        if (result.gameOver || this.gameState.planetHealth <= 0) {
            if (!this.gameState.gameOver) {
                // Воспроизведение звука окончания игры
                this.soundManager.playSound('gameOver');
                this.soundManager.stopBackgroundMusic();
            }
            this.gameState.gameOver = true;
        }
        
        this.debug.collisions = collisions.length;
    }

    /**
     * Очистка неактивных объектов
     */
    cleanupEntities() {
        // Автоматическое освобождение объектов из пулов
        this.objectPool.autoRelease('asteroid', this.entities);
        this.objectPool.autoRelease('projectile', this.entities);
        
        // Фильтрация активных объектов
        this.entities = this.entities.filter(entity => entity.active);
    }

    /**
     * Создание эффектов двигателя
     */
    createEngineEffects() {
        const playerShip = this.entities.find(e => e.type === 'playerShip');
        if (playerShip && playerShip.active) {
            // Создаем эффект двигателя только если корабль движется или стреляет
            if (Math.abs(playerShip.velocity.x) > 0 || Math.abs(playerShip.velocity.y) > 0) {
                this.particleSystem.createEngineTrail(
                    playerShip.position.x,
                    playerShip.position.y,
                    playerShip.size.width
                );
            }
        }
    }

    /**
     * Проверка условий окончания игры
     */
    checkGameOver() {
        if (this.gameState.planetHealth <= 0) {
            if (!this.gameState.gameOver) {
                // Воспроизведение звука окончания игры
                this.soundManager.playSound('gameOver');
                this.soundManager.stopBackgroundMusic();
            }
            this.gameState.gameOver = true;
        }
    }

    /**
     * Отрисовка игры
     * @param {number} currentTime - Текущее время
     */
    render(currentTime) {
        const renderData = {
            entities: this.entities,
            particles: this.particleSystem.getParticles(),
            time: currentTime,
            debug: this.debug.enabled ? this.debug : null
        };
        
        this.renderer.render(renderData);
    }

    /**
     * Обновление отладочной информации
     * @param {number} deltaTime - Время кадра
     */
    updateDebugInfo(deltaTime) {
        this.debug.fps = Math.round(1000 / deltaTime);
        this.debug.entityCount = this.entities.length;
        this.debug.particleCount = this.particleSystem.getParticles().length;
        this.debug.poolStats = this.objectPool.getAllStats();
    }

    /**
     * Получение текущего состояния игры
     * @returns {Object} Состояние игры
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * Применение улучшения к игровым объектам
     * @param {string} upgradeId - ID улучшения
     */
    applyUpgrade(upgradeId) {
        const playerShip = this.entities.find(e => e.type === 'playerShip');
        if (!playerShip) return;

        switch (upgradeId) {
            case 'fireRate':
                const fireRateMultiplier = this.upgradeSystem.getUpgradeEffect('fireRate');
                playerShip.fireRate = playerShip.baseFireRate * fireRateMultiplier;
                break;

            case 'damage':
                const damageMultiplier = this.upgradeSystem.getUpgradeEffect('damage');
                playerShip.damage = playerShip.baseDamage * damageMultiplier;
                break;

            case 'speed':
                const speedMultiplier = this.upgradeSystem.getUpgradeEffect('speed');
                playerShip.speed = playerShip.baseSpeed * speedMultiplier;
                break;

            case 'planetHealth':
                const healthBonus = this.upgradeSystem.getUpgradeEffect('planetHealth');
                this.gameState.planetHealth = Math.min(
                    this.gameState.planetHealth + healthBonus,
                    100 + healthBonus
                );
                break;

            case 'multiShot':
                const shotCount = this.upgradeSystem.getUpgradeEffect('multiShot');
                playerShip.multiShot = shotCount;
                break;
        }
    }

    /**
     * Инициализация базовых значений для улучшений
     */
    initializeUpgradeValues() {
        const playerShip = this.entities.find(e => e.type === 'playerShip');
        if (playerShip) {
            // Сохраняем базовые значения если они еще не сохранены
            if (!playerShip.baseFireRate) {
                playerShip.baseFireRate = playerShip.fireRate || 300;
                playerShip.baseDamage = playerShip.damage || 1;
                playerShip.baseSpeed = playerShip.speed || 0.3;
                playerShip.multiShot = 1;
            }
        }
    }

    /**
     * Применение всех активных улучшений
     */
    applyAllUpgrades() {
        const upgrades = ['fireRate', 'damage', 'speed', 'planetHealth', 'multiShot'];
        upgrades.forEach(upgradeId => {
            this.applyUpgrade(upgradeId);
        });
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}