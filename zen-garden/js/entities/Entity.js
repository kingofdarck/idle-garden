/**
 * Базовый класс для всех объектов в Дзен Саду
 */
class Entity {
    constructor(x, y, size = 10) {
        this.position = { x, y };
        this.size = size;
        this.age = 0;
        this.active = true;
        this.type = 'entity';
        this.color = '#4caf50';
        this.opacity = 1.0;
        
        // Для анимации
        this.animationTime = 0;
        this.animationSpeed = 1;
    }

    /**
     * Обновление объекта
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.age += deltaTime;
        this.animationTime += deltaTime * this.animationSpeed;
    }

    /**
     * Отрисовка объекта
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Простая отрисовка круга по умолчанию
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Проверка столкновения с точкой
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @returns {boolean} True если точка внутри объекта
     */
    containsPoint(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size;
    }

    /**
     * Получение расстояния до другого объекта
     * @param {Entity} other - Другой объект
     * @returns {number} Расстояние
     */
    distanceTo(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Деактивация объекта
     */
    destroy() {
        this.active = false;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Entity;
}