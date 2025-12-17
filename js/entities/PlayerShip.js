/**
 * Класс корабля игрока
 * Космический Защитник
 */

// Import Entity for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    const Entity = require('./Entity.js');
    global.Entity = Entity;
}

class PlayerShip extends Entity {
    constructor(x, y) {
        super(x, y, 40, 30);
        this.type = 'playerShip';
        this.speed = 0.3; // пикселей за миллисекунду
        this.fireRate = 300; // миллисекунд между выстрелами
        this.lastFireTime = 0;
        this.screenWidth = 800;
        this.screenHeight = 600;
    }

    /**
     * Обновление корабля игрока
     * @param {number} deltaTime - Время с последнего обновления
     * @param {InputManager} inputManager - Менеджер ввода
     */
    update(deltaTime, inputManager) {
        if (!this.active) return;

        // Обработка движения
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (inputManager && inputManager.isKeyPressed) {
            if (inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('KeyA')) {
                this.velocity.x = -this.speed;
            }
            if (inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('KeyD')) {
                this.velocity.x = this.speed;
            }
            if (inputManager.isKeyPressed('ArrowUp') || inputManager.isKeyPressed('KeyW')) {
                this.velocity.y = -this.speed;
            }
            if (inputManager.isKeyPressed('ArrowDown') || inputManager.isKeyPressed('KeyS')) {
                this.velocity.y = this.speed;
            }
        }

        // Обновление позиции
        super.update(deltaTime);

        // Ограничение движения в пределах экрана
        this.enforceScreenBounds();
    }

    /**
     * Ограничение движения корабля в пределах экрана
     */
    enforceScreenBounds() {
        if (this.position.x < 0) {
            this.position.x = 0;
        }
        if (this.position.x + this.size.width > this.screenWidth) {
            this.position.x = this.screenWidth - this.size.width;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        }
        if (this.position.y + this.size.height > this.screenHeight) {
            this.position.y = this.screenHeight - this.size.height;
        }
    }

    /**
     * Попытка выстрела
     * @param {number} currentTime - Текущее время
     * @returns {Array|null} Массив данных для создания снарядов или null
     */
    tryFire(currentTime) {
        if (currentTime - this.lastFireTime >= this.fireRate) {
            this.lastFireTime = currentTime;
            
            const projectiles = [];
            const shotCount = this.multiShot || 1;
            const centerX = this.position.x + this.size.width / 2;
            
            if (shotCount === 1) {
                // Одиночный выстрел
                projectiles.push({
                    x: centerX - 2,
                    y: this.position.y,
                    type: 'projectile'
                });
            } else {
                // Мультивыстрел
                const spread = 20; // Расстояние между снарядами
                const startX = centerX - (spread * (shotCount - 1)) / 2;
                
                for (let i = 0; i < shotCount; i++) {
                    projectiles.push({
                        x: startX + (i * spread) - 2,
                        y: this.position.y,
                        type: 'projectile'
                    });
                }
            }
            
            return projectiles;
        }
        return null;
    }

    /**
     * Установка размеров экрана для ограничения движения
     * @param {number} width - Ширина экрана
     * @param {number} height - Высота экрана
     */
    setScreenBounds(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    /**
     * Отрисовка корабля игрока
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        
        // Создание градиента для корабля
        const gradient = ctx.createLinearGradient(
            centerX, this.position.y,
            centerX, this.position.y + this.size.height
        );
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.5, '#00cc66');
        gradient.addColorStop(1, '#008844');
        
        // Отрисовка основного корпуса корабля
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(this.position.x + 5, this.position.y + this.size.height);
        ctx.lineTo(this.position.x + this.size.width - 5, this.position.y + this.size.height);
        ctx.closePath();
        ctx.fill();

        // Отрисовка крыльев
        ctx.fillStyle = '#0088ff';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y + this.size.height * 0.6);
        ctx.lineTo(this.position.x + 8, this.position.y + this.size.height * 0.8);
        ctx.lineTo(this.position.x + 5, this.position.y + this.size.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.position.x + this.size.width, this.position.y + this.size.height * 0.6);
        ctx.lineTo(this.position.x + this.size.width - 8, this.position.y + this.size.height * 0.8);
        ctx.lineTo(this.position.x + this.size.width - 5, this.position.y + this.size.height);
        ctx.closePath();
        ctx.fill();

        // Добавление светящейся обводки
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(this.position.x + 5, this.position.y + this.size.height);
        ctx.lineTo(this.position.x + this.size.width - 5, this.position.y + this.size.height);
        ctx.closePath();
        ctx.stroke();

        // Отрисовка кокпита
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + this.size.height * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerShip;
}