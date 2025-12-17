/**
 * Класс частицы для эффектов в Дзен Саду
 */
class Particle extends Entity {
    constructor(x, y, type = 'water') {
        super(x, y, 2);
        this.type = 'particle';
        this.particleType = type;
        this.velocity = { x: 0, y: 0 };
        this.gravity = 0.0001;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.decay = 0.001;
        
        this.setupParticleType();
    }

    /**
     * Настройка свойств в зависимости от типа частицы
     */
    setupParticleType() {
        switch (this.particleType) {
            case 'water':
                this.color = '#2196f3';
                this.velocity.x = (Math.random() - 0.5) * 0.02;
                this.velocity.y = -0.05 - Math.random() * 0.03;
                this.gravity = 0.0002;
                this.decay = 0.002;
                this.size = 1 + Math.random() * 2;
                break;
                
            case 'pollen':
                this.color = '#ffeb3b';
                this.velocity.x = (Math.random() - 0.5) * 0.01;
                this.velocity.y = -0.01 - Math.random() * 0.01;
                this.gravity = -0.00005; // Пыльца поднимается
                this.decay = 0.0005;
                this.size = 0.5 + Math.random();
                break;
                
            case 'leaf':
                this.color = '#4caf50';
                this.velocity.x = (Math.random() - 0.5) * 0.03;
                this.velocity.y = 0.01 + Math.random() * 0.02;
                this.gravity = 0.00005;
                this.decay = 0.0003;
                this.size = 2 + Math.random() * 3;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.002;
                break;
                
            case 'bubble':
                this.color = 'rgba(255, 255, 255, 0.6)';
                this.velocity.x = (Math.random() - 0.5) * 0.005;
                this.velocity.y = -0.02 - Math.random() * 0.01;
                this.gravity = -0.00001; // Пузыри поднимаются
                this.decay = 0.001;
                this.size = 3 + Math.random() * 5;
                break;
                
            case 'sparkle':
                this.color = '#ffffff';
                this.velocity.x = (Math.random() - 0.5) * 0.01;
                this.velocity.y = (Math.random() - 0.5) * 0.01;
                this.gravity = 0;
                this.decay = 0.003;
                this.size = 1 + Math.random();
                break;
        }
    }

    /**
     * Обновление частицы
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.active) return;
        
        // Обновление скорости с учетом гравитации
        this.velocity.y += this.gravity * deltaTime;
        
        // Обновление позиции
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Обновление поворота (для листьев)
        if (this.rotationSpeed) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        
        // Уменьшение жизни
        this.life -= this.decay * deltaTime;
        this.opacity = this.life;
        
        // Деактивация при окончании жизни
        if (this.life <= 0) {
            this.active = false;
        }
    }

    /**
     * Отрисовка частицы
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        switch (this.particleType) {
            case 'water':
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'pollen':
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Легкое свечение
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'leaf':
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'bubble':
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
                ctx.stroke();
                
                // Блик на пузыре
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(
                    this.position.x - this.size * 0.3, 
                    this.position.y - this.size * 0.3, 
                    this.size * 0.2, 
                    0, Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'sparkle':
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 5;
                
                // Рисуем звездочку
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y - this.size);
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = i % 2 === 0 ? this.size : this.size * 0.4;
                    ctx.lineTo(
                        this.position.x + Math.cos(angle) * radius,
                        this.position.y + Math.sin(angle) * radius
                    );
                }
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }

    /**
     * Создание эффекта воды
     */
    static createWaterEffect(x, y, count = 5) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 5,
                'water'
            );
            particles.push(particle);
        }
        return particles;
    }

    /**
     * Создание эффекта пыльцы
     */
    static createPollenEffect(x, y, count = 3) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                'pollen'
            );
            particles.push(particle);
        }
        return particles;
    }

    /**
     * Создание эффекта падающих листьев
     */
    static createLeafEffect(x, y, count = 2) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + (Math.random() - 0.5) * 30,
                y - 20 - Math.random() * 10,
                'leaf'
            );
            particles.push(particle);
        }
        return particles;
    }

    /**
     * Создание пузырей в воде
     */
    static createBubbleEffect(x, y, count = 3) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + (Math.random() - 0.5) * 15,
                y + Math.random() * 10,
                'bubble'
            );
            particles.push(particle);
        }
        return particles;
    }

    /**
     * Создание магических искр
     */
    static createSparkleEffect(x, y, count = 4) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + (Math.random() - 0.5) * 25,
                y + (Math.random() - 0.5) * 25,
                'sparkle'
            );
            particles.push(particle);
        }
        return particles;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Particle;
}