/**
 * Класс камня в Дзен Саду
 */
class Stone extends Entity {
    constructor(x, y) {
        super(x, y, 15 + Math.random() * 10);
        this.type = 'stone';
        this.color = this.getRandomStoneColor();
        this.shape = Math.floor(Math.random() * 3); // 0 = круглый, 1 = овальный, 2 = неправильный
        this.rotation = Math.random() * Math.PI * 2;
        this.moss = 0; // Количество мха (растет со временем)
        this.maxMoss = 100;
        this.mossGrowthRate = 0.001;
        
        // Визуальные детали
        this.cracks = [];
        this.generateCracks();
        this.highlights = [];
        this.generateHighlights();
    }

    /**
     * Обновление камня
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.active) return;
        
        // Медленный рост мха
        if (this.moss < this.maxMoss) {
            this.moss += this.mossGrowthRate * deltaTime;
        }
    }

    /**
     * Получение случайного цвета камня
     */
    getRandomStoneColor() {
        const colors = [
            '#757575', // Серый
            '#8d6e63', // Коричневый
            '#607d8b', // Сине-серый
            '#795548', // Коричневый
            '#9e9e9e', // Светло-серый
            '#6d4c41'  // Темно-коричневый
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Генерация трещин на камне
     */
    generateCracks() {
        const crackCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < crackCount; i++) {
            this.cracks.push({
                startAngle: Math.random() * Math.PI * 2,
                length: this.size * (0.3 + Math.random() * 0.4),
                width: 1 + Math.random()
            });
        }
    }

    /**
     * Генерация бликов на камне
     */
    generateHighlights() {
        const highlightCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < highlightCount; i++) {
            this.highlights.push({
                x: (Math.random() - 0.5) * this.size * 0.6,
                y: (Math.random() - 0.5) * this.size * 0.6,
                size: 2 + Math.random() * 3,
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    }

    /**
     * Отрисовка камня
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Тень камня
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        if (this.shape === 0) {
            ctx.arc(2, 2, this.size, 0, Math.PI * 2);
        } else if (this.shape === 1) {
            ctx.ellipse(2, 2, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        } else {
            this.drawIrregularShape(ctx, 2, 2, this.size);
        }
        ctx.fill();
        
        // Основной камень
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.shape === 0) {
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        } else if (this.shape === 1) {
            ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        } else {
            this.drawIrregularShape(ctx, 0, 0, this.size);
        }
        ctx.fill();
        
        // Трещины
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.cracks.forEach(crack => {
            ctx.lineWidth = crack.width;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(crack.startAngle) * crack.length,
                Math.sin(crack.startAngle) * crack.length
            );
            ctx.stroke();
        });
        
        // Блики
        this.highlights.forEach(highlight => {
            ctx.fillStyle = `rgba(255, 255, 255, ${highlight.opacity})`;
            ctx.beginPath();
            ctx.arc(highlight.x, highlight.y, highlight.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Мох (если есть)
        if (this.moss > 10) {
            const mossOpacity = Math.min(0.6, this.moss / 100);
            ctx.fillStyle = `rgba(76, 175, 80, ${mossOpacity})`;
            
            // Рисуем мох пятнами
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + this.age * 0.0001;
                const distance = this.size * 0.7;
                const mossX = Math.cos(angle) * distance;
                const mossY = Math.sin(angle) * distance;
                const mossSize = 2 + Math.random() * 3;
                
                ctx.beginPath();
                ctx.arc(mossX, mossY, mossSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    /**
     * Рисование неправильной формы камня
     */
    drawIrregularShape(ctx, offsetX, offsetY, size) {
        const points = 8;
        ctx.moveTo(offsetX + size, offsetY);
        
        for (let i = 1; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = size * (0.7 + Math.random() * 0.3);
            const x = offsetX + Math.cos(angle) * radius;
            const y = offsetY + Math.sin(angle) * radius;
            ctx.lineTo(x, y);
        }
        
        ctx.closePath();
    }

    /**
     * Установка границ для рыбок (камни влияют на движение)
     */
    setBounds(left, right, top, bottom) {
        this.bounds = { left, right, top, bottom };
    }

    /**
     * Получение информации о камне
     */
    getInfo() {
        const shapes = ['Круглый', 'Овальный', 'Неправильный'];
        return {
            shape: shapes[this.shape],
            moss: Math.round(this.moss),
            age: Math.round(this.age / 1000)
        };
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stone;
}