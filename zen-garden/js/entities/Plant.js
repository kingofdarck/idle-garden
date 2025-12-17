/**
 * Класс растения в Дзен Саду
 */
class Plant extends Entity {
    constructor(x, y) {
        super(x, y, 5);
        this.type = 'plant';
        this.growthStage = 0; // 0 = семя, 1 = росток, 2 = молодое, 3 = взрослое, 4 = цветущее
        this.maxGrowthStage = 4;
        this.growthTime = 0;
        this.growthRate = 0.0001; // Очень медленный рост
        this.waterLevel = 50;
        this.maxWaterLevel = 100;
        this.waterConsumption = 0.01;
        
        // Визуальные свойства
        this.stemHeight = 0;
        this.leafCount = 0;
        this.flowerColor = this.getRandomFlowerColor();
        this.swayOffset = Math.random() * Math.PI * 2;
        
        this.updateAppearance();
    }

    /**
     * Обновление растения
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.active) return;
        
        // Потребление воды
        this.waterLevel = Math.max(0, this.waterLevel - this.waterConsumption * deltaTime);
        
        // Рост только если есть вода
        if (this.waterLevel > 10 && this.growthStage < this.maxGrowthStage) {
            this.growthTime += deltaTime * this.growthRate;
            
            // Переход на следующую стадию роста
            const stageThreshold = (this.growthStage + 1) * 10000; // 10 секунд на стадию
            if (this.growthTime >= stageThreshold) {
                this.growthStage++;
                this.updateAppearance();
            }
        }
        
        // Увядание при недостатке воды
        if (this.waterLevel <= 0) {
            this.opacity = Math.max(0.3, this.opacity - 0.0001 * deltaTime);
        } else if (this.opacity < 1.0) {
            this.opacity = Math.min(1.0, this.opacity + 0.0005 * deltaTime);
        }
    }

    /**
     * Обновление внешнего вида в зависимости от стадии роста
     */
    updateAppearance() {
        switch (this.growthStage) {
            case 0: // Семя
                this.size = 3;
                this.color = '#8d6e63';
                this.stemHeight = 0;
                this.leafCount = 0;
                break;
            case 1: // Росток
                this.size = 5;
                this.color = '#4caf50';
                this.stemHeight = 10;
                this.leafCount = 2;
                break;
            case 2: // Молодое растение
                this.size = 8;
                this.color = '#388e3c';
                this.stemHeight = 20;
                this.leafCount = 4;
                break;
            case 3: // Взрослое растение
                this.size = 12;
                this.color = '#2e7d32';
                this.stemHeight = 35;
                this.leafCount = 6;
                break;
            case 4: // Цветущее растение
                this.size = 15;
                this.color = '#1b5e20';
                this.stemHeight = 45;
                this.leafCount = 8;
                break;
        }
    }

    /**
     * Полив растения
     * @param {number} amount - Количество воды
     */
    water(amount = 30) {
        this.waterLevel = Math.min(this.maxWaterLevel, this.waterLevel + amount);
        
        // Создаем эффект полива
        return {
            type: 'water',
            x: this.position.x,
            y: this.position.y - this.stemHeight,
            particles: 5
        };
    }

    /**
     * Получение случайного цвета цветка
     */
    getRandomFlowerColor() {
        const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#ff9800', '#ff5722'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Отрисовка растения
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Легкое покачивание на ветру
        const sway = Math.sin(this.animationTime * 0.001 + this.swayOffset) * 2;
        
        if (this.growthStage > 0) {
            // Рисуем стебель
            ctx.strokeStyle = this.color;
            ctx.lineWidth = Math.max(1, this.growthStage);
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + sway, this.position.y - this.stemHeight);
            ctx.stroke();
            
            // Рисуем листья
            ctx.fillStyle = this.color;
            for (let i = 0; i < this.leafCount; i++) {
                const leafY = this.position.y - (this.stemHeight * (i + 1) / (this.leafCount + 1));
                const leafX = this.position.x + sway * (i + 1) / (this.leafCount + 1);
                const leafSize = this.size * 0.3;
                const side = i % 2 === 0 ? 1 : -1;
                
                ctx.beginPath();
                ctx.ellipse(leafX + side * leafSize, leafY, leafSize, leafSize * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Рисуем цветок на последней стадии
            if (this.growthStage === 4) {
                const flowerX = this.position.x + sway;
                const flowerY = this.position.y - this.stemHeight;
                
                ctx.fillStyle = this.flowerColor;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const petalX = flowerX + Math.cos(angle) * 6;
                    const petalY = flowerY + Math.sin(angle) * 6;
                    
                    ctx.beginPath();
                    ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Центр цветка
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath();
                ctx.arc(flowerX, flowerY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Рисуем основание (семя или корни)
        ctx.fillStyle = this.growthStage === 0 ? '#8d6e63' : '#5d4037';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Индикатор уровня воды (только если мало воды)
        if (this.waterLevel < 30) {
            ctx.fillStyle = `rgba(33, 150, 243, ${this.waterLevel / 100})`;
            ctx.beginPath();
            ctx.arc(this.position.x - 15, this.position.y - 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    /**
     * Получение информации о растении
     */
    getInfo() {
        const stages = ['Семя', 'Росток', 'Молодое', 'Взрослое', 'Цветущее'];
        return {
            stage: stages[this.growthStage],
            water: Math.round(this.waterLevel),
            age: Math.round(this.age / 1000)
        };
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Plant;
}