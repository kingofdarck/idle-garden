/**
 * Класс рыбки в Дзен Саду
 */
class Fish extends Entity {
    constructor(x, y) {
        super(x, y, 8);
        this.type = 'fish';
        this.velocity = { x: 0, y: 0 };
        this.maxSpeed = 0.02;
        this.direction = Math.random() * Math.PI * 2;
        this.turnSpeed = 0.001;
        
        // Визуальные свойства
        this.bodyColor = this.getRandomFishColor();
        this.finColor = this.darkenColor(this.bodyColor);
        this.tailOffset = 0;
        this.finOffset = 0;
        
        // Поведение
        this.wanderAngle = 0;
        this.wanderRadius = 50;
        this.wanderDistance = 30;
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 2000 + Math.random() * 3000;
        
        // Границы движения (будут установлены позже)
        this.bounds = { left: 50, right: 950, top: 400, bottom: 650 };
        
        this.updateVelocity();
    }

    /**
     * Обновление рыбки
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.active) return;
        
        // Обновление таймера смены направления
        this.changeDirectionTimer += deltaTime;
        
        // Случайная смена направления
        if (this.changeDirectionTimer >= this.changeDirectionInterval) {
            this.changeDirection();
            this.changeDirectionTimer = 0;
            this.changeDirectionInterval = 2000 + Math.random() * 3000;
        }
        
        // Избегание границ
        this.avoidBounds();
        
        // Обновление позиции
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Ограничение в пределах границ
        this.position.x = Math.max(this.bounds.left, Math.min(this.bounds.right, this.position.x));
        this.position.y = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.position.y));
        
        // Обновление анимации
        this.tailOffset = Math.sin(this.animationTime * 0.005) * 0.3;
        this.finOffset = Math.cos(this.animationTime * 0.003) * 0.2;
    }

    /**
     * Смена направления движения
     */
    changeDirection() {
        // Случайное изменение направления
        this.direction += (Math.random() - 0.5) * Math.PI * 0.5;
        this.updateVelocity();
    }

    /**
     * Избегание границ
     */
    avoidBounds() {
        const margin = 30;
        let needTurn = false;
        
        if (this.position.x < this.bounds.left + margin) {
            this.direction = Math.abs(this.direction) < Math.PI / 2 ? 0 : Math.PI;
            needTurn = true;
        } else if (this.position.x > this.bounds.right - margin) {
            this.direction = Math.PI;
            needTurn = true;
        }
        
        if (this.position.y < this.bounds.top + margin) {
            this.direction = Math.PI / 2;
            needTurn = true;
        } else if (this.position.y > this.bounds.bottom - margin) {
            this.direction = -Math.PI / 2;
            needTurn = true;
        }
        
        if (needTurn) {
            this.direction += (Math.random() - 0.5) * Math.PI * 0.3;
            this.updateVelocity();
        }
    }

    /**
     * Обновление скорости на основе направления
     */
    updateVelocity() {
        const speed = this.maxSpeed * (0.5 + Math.random() * 0.5);
        this.velocity.x = Math.cos(this.direction) * speed;
        this.velocity.y = Math.sin(this.direction) * speed;
    }

    /**
     * Получение случайного цвета рыбки
     */
    getRandomFishColor() {
        const colors = [
            '#ff9800', // Оранжевый
            '#2196f3', // Синий
            '#e91e63', // Розовый
            '#9c27b0', // Фиолетовый
            '#4caf50', // Зеленый
            '#ff5722', // Красно-оранжевый
            '#ffeb3b', // Желтый
            '#00bcd4'  // Циан
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Затемнение цвета для плавников
     */
    darkenColor(color) {
        // Простое затемнение путем уменьшения яркости
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Установка границ движения
     */
    setBounds(left, right, top, bottom) {
        this.bounds = { left, right, top, bottom };
    }

    /**
     * Отрисовка рыбки
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Поворот в направлении движения
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.direction);
        
        // Тело рыбки
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Хвост
        ctx.fillStyle = this.finColor;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size * 1.8, -this.size * 0.5 + this.tailOffset);
        ctx.lineTo(-this.size * 1.8, this.size * 0.5 + this.tailOffset);
        ctx.closePath();
        ctx.fill();
        
        // Верхний плавник
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.3, -this.size * 0.6);
        ctx.lineTo(-this.size * 0.1, -this.size * 1.2 + this.finOffset);
        ctx.lineTo(this.size * 0.3, -this.size * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Нижний плавник
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.3, this.size * 0.6);
        ctx.lineTo(-this.size * 0.1, this.size * 1.2 - this.finOffset);
        ctx.lineTo(this.size * 0.3, this.size * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.size * 0.3, -this.size * 0.2, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Зрачок
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Блик в глазу
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.size * 0.45, -this.size * 0.25, this.size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Реакция на клик (рыбка пугается и уплывает)
     */
    scare(x, y) {
        const dx = this.position.x - x;
        const dy = this.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            // Направление от точки клика
            this.direction = Math.atan2(dy, dx);
            this.maxSpeed = 0.05; // Увеличиваем скорость
            this.updateVelocity();
            
            // Возвращаем нормальную скорость через некоторое время
            setTimeout(() => {
                this.maxSpeed = 0.02;
            }, 2000);
            
            return true;
        }
        return false;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Fish;
}