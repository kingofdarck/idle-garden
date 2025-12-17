/**
 * Система определения столкновений
 * Космический Защитник
 */
class CollisionSystem {
    constructor() {
        this.collisionCallbacks = new Map();
    }

    /**
     * Проверка столкновений между всеми объектами
     * @param {Array} entities - Массив всех игровых объектов
     * @returns {Array} Массив обнаруженных столкновений
     */
    checkCollisions(entities) {
        const collisions = [];
        
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];
                
                if (!entityA.active || !entityB.active) continue;
                
                if (this.checkAABB(entityA, entityB)) {
                    collisions.push({
                        entityA: entityA,
                        entityB: entityB,
                        type: this.getCollisionType(entityA.type, entityB.type)
                    });
                }
            }
        }
        
        return collisions;
    }

    /**
     * Проверка столкновения методом AABB (Axis-Aligned Bounding Box)
     * @param {Entity} entity1 - Первый объект
     * @param {Entity} entity2 - Второй объект
     * @returns {boolean} True если объекты сталкиваются
     */
    checkAABB(entity1, entity2) {
        const bounds1 = entity1.getBounds();
        const bounds2 = entity2.getBounds();
        
        return bounds1.left < bounds2.right &&
               bounds1.right > bounds2.left &&
               bounds1.top < bounds2.bottom &&
               bounds1.bottom > bounds2.top;
    }

    /**
     * Определение типа столкновения
     * @param {string} typeA - Тип первого объекта
     * @param {string} typeB - Тип второго объекта
     * @returns {string} Тип столкновения
     */
    getCollisionType(typeA, typeB) {
        const types = [typeA, typeB].sort();
        
        if (types[0] === 'asteroid' && types[1] === 'projectile') {
            return 'asteroid-projectile';
        }
        if (types[0] === 'asteroid' && types[1] === 'playerShip') {
            return 'asteroid-player';
        }
        
        return 'unknown';
    }

    /**
     * Обработка столкновений
     * @param {Array} collisions - Массив столкновений для обработки
     * @param {Object} gameState - Состояние игры
     * @returns {Object} Результат обработки столкновений
     */
    processCollisions(collisions, gameState) {
        const result = {
            destroyedEntities: [],
            scoreIncrease: 0,
            planetDamage: 0,
            gameOver: false
        };

        collisions.forEach(collision => {
            switch (collision.type) {
                case 'asteroid-projectile':
                    // Уничтожение астероида и снаряда
                    collision.entityA.destroy();
                    collision.entityB.destroy();
                    result.destroyedEntities.push(collision.entityA, collision.entityB);
                    result.scoreIncrease += 10;
                    break;
                    
                case 'asteroid-player':
                    // Столкновение с игроком - урон или окончание игры
                    collision.entityA.destroy();
                    collision.entityB.destroy();
                    result.destroyedEntities.push(collision.entityA, collision.entityB);
                    result.gameOver = true;
                    break;
            }
        });

        return result;
    }

    /**
     * Регистрация callback для определенного типа столкновения
     * @param {string} collisionType - Тип столкновения
     * @param {Function} callback - Функция обратного вызова
     */
    registerCollisionCallback(collisionType, callback) {
        if (!this.collisionCallbacks.has(collisionType)) {
            this.collisionCallbacks.set(collisionType, []);
        }
        this.collisionCallbacks.get(collisionType).push(callback);
    }

    /**
     * Проверка столкновения точки с объектом
     * @param {number} x - X координата точки
     * @param {number} y - Y координата точки
     * @param {Entity} entity - Объект для проверки
     * @returns {boolean} True если точка внутри объекта
     */
    pointInEntity(x, y, entity) {
        const bounds = entity.getBounds();
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollisionSystem;
}