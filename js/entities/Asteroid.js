/**
 * Класс астероида
 * Космический Защитник
 */

// Import Entity for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    const Entity = require('./Entity.js');
    global.Entity = Entity;
}

class Asteroid extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.type = 'asteroid';
        this.speed = 0.1; // пикселей за миллисекунду
        this.velocity.y = this.speed;
        this.rotationSpeed = 0.002; // радиан за миллисекунду
        this.rotation = 0;
        this.screenHeight = 600;
    }

    /**
     * Обновление астероида
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        if (!this.active) return;

        // Обновление позиции
        super.update(deltaTime);

        // Обновление вращения
        this.rotation += this.rotationSpeed * deltaTime;

        // Проверка выхода за нижнюю границу экрана
        if (this.position.y > this.screenHeight) {
            this.destroy();
        }
    }

    /**
     * Установка высоты экрана для проверки границ
     * @param {number} height - Высота экрана
     */
    setScreenHeight(height) {
        this.screenHeight = height;
    }

    /**
     * Проверка достижения нижней границы экрана
     * @returns {boolean} True если астероид достиг нижней границы
     */
    hasReachedBottom() {
        return this.position.y + this.size.height >= this.screenHeight;
    }

    /**
     * Отрисовка астероида
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // Перемещение к центру астероида для вращения
        const centerX = this.position.x + this.size.width / 2;
        const centerY = this.position.y + this.size.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Отрисовка астероида в виде многоугольника
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        
        const radius = this.size.width / 2;
        const sides = 8;
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const variance = 0.7 + Math.sin(angle * 3) * 0.3; // Неровные края
            const x = Math.cos(angle) * radius * variance;
            const y = Math.sin(angle) * radius * variance;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();

        // Добавление обводки
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Добавление деталей
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(radius * 0.2, radius * 0.3, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Import Entity for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    const Entity = require('./Entity.js');
    global.Entity = Entity;
    module.exports = Asteroid;
}