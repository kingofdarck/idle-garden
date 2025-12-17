/**
 * Базовый класс для всех игровых объектов
 * Космический Защитник
 */
class Entity {
    constructor(x, y, width, height) {
        this.position = { x: x || 0, y: y || 0 };
        this.velocity = { x: 0, y: 0 };
        this.size = { width: width || 32, height: height || 32 };
        this.active = true;
        this.type = 'entity';
    }

    /**
     * Обновление состояния объекта
     * @param {number} deltaTime - Время с последнего обновления в миллисекундах
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Обновление позиции на основе скорости
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    /**
     * Отрисовка объекта
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas для отрисовки
     */
    render(ctx) {
        if (!this.active) return;
        
        // Базовая отрисовка - прямоугольник
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    /**
     * Получение границ объекта для определения столкновений
     * @returns {Object} Объект с координатами границ
     */
    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.size.width,
            top: this.position.y,
            bottom: this.position.y + this.size.height,
            centerX: this.position.x + this.size.width / 2,
            centerY: this.position.y + this.size.height / 2
        };
    }

    /**
     * Проверка, находится ли объект в пределах экрана
     * @param {number} screenWidth - Ширина экрана
     * @param {number} screenHeight - Высота экрана
     * @returns {boolean} True если объект в пределах экрана
     */
    isOnScreen(screenWidth, screenHeight) {
        const bounds = this.getBounds();
        return bounds.right >= 0 && bounds.left <= screenWidth && 
               bounds.bottom >= 0 && bounds.top <= screenHeight;
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