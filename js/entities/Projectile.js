/**
 * Класс снаряда
 * Космический Защитник
 */

// Import Entity for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    const Entity = require('./Entity.js');
    global.Entity = Entity;
}

class Projectile extends Entity {
    constructor(x, y) {
        super(x, y, 4, 12);
        this.type = 'projectile';
        this.speed = 0.5; // пикселей за миллисекунду
        this.velocity.y = -this.speed; // движение вверх
    }

    /**
     * Обновление снаряда
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        if (!this.active) return;

        // Обновление позиции
        super.update(deltaTime);

        // Проверка выхода за верхнюю границу экрана
        if (this.position.y + this.size.height < 0) {
            this.destroy();
        }
    }

    /**
     * Проверка выхода за верхнюю границу экрана
     * @returns {boolean} True если снаряд вышел за верхнюю границу
     */
    hasReachedTop() {
        return this.position.y + this.size.height < 0;
    }

    /**
     * Отрисовка снаряда
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        
        // Создание радиального градиента для снаряда
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.size.width
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#00ffff');
        gradient.addColorStop(0.7, '#0080ff');
        gradient.addColorStop(1, 'transparent');

        // Отрисовка основного снаряда с свечением
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.size.width / 2, this.size.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Отрисовка яркого центра
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.size.width / 4, this.size.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Добавление энергетического следа
        ctx.shadowBlur = 0;
        const trailGradient = ctx.createLinearGradient(
            centerX, this.position.y + this.size.height,
            centerX, this.position.y + this.size.height + 8
        );
        trailGradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
        trailGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = trailGradient;
        ctx.fillRect(
            centerX - this.size.width / 4, 
            this.position.y + this.size.height, 
            this.size.width / 2, 
            8
        );

        ctx.restore();
    }
}

// Import Entity for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    const Entity = require('./Entity.js');
    global.Entity = Entity;
    module.exports = Projectile;
}