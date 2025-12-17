/**
 * Система частиц для визуальных эффектов
 * Космический Защитник
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 300; // Уменьшено для лучшей производительности
        this.particlePool = []; // Пул для переиспользования частиц
    }

    /**
     * Получение частицы из пула или создание новой
     * @returns {Object} Частица
     */
    acquireParticle() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return {};
    }

    /**
     * Возврат частицы в пул
     * @param {Object} particle - Частица
     */
    releaseParticle(particle) {
        if (this.particlePool.length < 100) { // Ограничение размера пула
            this.particlePool.push(particle);
        }
    }

    /**
     * Создание взрыва
     * @param {number} x - X координата взрыва
     * @param {number} y - Y координата взрыва
     * @param {string} type - Тип взрыва ('asteroid', 'ship', 'planet')
     */
    createExplosion(x, y, type = 'asteroid') {
        const particleCount = type === 'asteroid' ? 12 : type === 'ship' ? 20 : 25; // Уменьшено количество
        const colors = this.getExplosionColors(type);
        
        for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = Math.random() * 0.2 + 0.1;
            const size = Math.random() * 4 + 2;
            const life = Math.random() * 600 + 300; // Уменьшено время жизни
            
            const particle = this.acquireParticle();
            Object.assign(particle, {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                life: life,
                maxLife: life,
                type: 'explosion',
                active: true
            });
            
            this.particles.push(particle);
        }
    }

    /**
     * Создание эффекта двигателя корабля
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {number} width - Ширина корабля
     */
    createEngineTrail(x, y, width) {
        // Создаем несколько частиц для эффекта двигателя
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + width / 2 + (Math.random() - 0.5) * width * 0.3,
                y: y + 30,
                vx: (Math.random() - 0.5) * 0.05,
                vy: Math.random() * 0.1 + 0.05,
                size: Math.random() * 3 + 1,
                maxSize: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#00aaff' : '#ffffff',
                alpha: 0.8,
                life: 200,
                maxLife: 200,
                type: 'engine',
                active: true
            });
        }
    }

    /**
     * Создание искр от попадания снаряда
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    createSparks(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.3 + 0.1;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                maxSize: Math.random() * 2 + 1,
                color: '#ffff00',
                alpha: 1.0,
                life: 300,
                maxLife: 300,
                type: 'spark',
                active: true
            });
        }
    }

    /**
     * Создание эффекта звезд на фоне
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    createStarField(x, y) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: Math.random() * 0.02 + 0.01,
            size: Math.random() * 1.5 + 0.5,
            maxSize: Math.random() * 1.5 + 0.5,
            color: '#ffffff',
            alpha: Math.random() * 0.8 + 0.2,
            life: 10000,
            maxLife: 10000,
            type: 'star',
            active: true
        });
    }

    /**
     * Получение цветов для взрыва по типу
     * @param {string} type - Тип взрыва
     * @returns {Array} Массив цветов
     */
    getExplosionColors(type) {
        switch (type) {
            case 'asteroid':
                return ['#ff6600', '#ff9900', '#ffcc00', '#ff3300', '#cc3300'];
            case 'ship':
                return ['#ff0000', '#ff3300', '#ff6600', '#ffff00', '#ffffff'];
            case 'planet':
                return ['#ff0000', '#cc0000', '#990000', '#660000', '#330000'];
            default:
                return ['#ffffff', '#ffff00', '#ff6600'];
        }
    }

    /**
     * Обновление всех частиц
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.active) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Обновление позиции
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Обновление времени жизни
            particle.life -= deltaTime;
            
            // Обновление альфа-канала
            particle.alpha = particle.life / particle.maxLife;
            
            // Обновление размера для некоторых типов
            if (particle.type === 'explosion') {
                const lifeRatio = particle.life / particle.maxLife;
                particle.size = particle.maxSize * (0.5 + lifeRatio * 0.5);
                
                // Добавление гравитации для частиц взрыва
                particle.vy += 0.0001 * deltaTime;
            }
            
            // Удаление мертвых частиц
            if (particle.life <= 0 || particle.alpha <= 0) {
                particle.active = false;
                this.particles.splice(i, 1);
                this.releaseParticle(particle);
            }
        }
        
        // Ограничение количества частиц
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    /**
     * Отрисовка всех частиц
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        ctx.save();
        
        for (const particle of this.particles) {
            if (!particle.active || particle.alpha <= 0) continue;
            
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            if (particle.type === 'star') {
                // Отрисовка звезд как точек
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (particle.type === 'engine') {
                // Отрисовка частиц двигателя с размытием
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Обычные частицы
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    /**
     * Очистка всех частиц
     */
    clear() {
        this.particles = [];
    }

    /**
     * Получение количества активных частиц
     * @returns {number} Количество частиц
     */
    getParticleCount() {
        return this.particles.filter(p => p.active).length;
    }

    /**
     * Получение всех частиц (для передачи в рендерер)
     * @returns {Array} Массив частиц
     */
    getParticles() {
        return this.particles.filter(p => p.active);
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}