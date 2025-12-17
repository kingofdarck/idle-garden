/**
 * Система отрисовки игры
 * Космический Защитник
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Настройка контекста для лучшего качества
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Параметры для звездного фона
        this.stars = this.generateStars(100);
    }

    /**
     * Генерация звезд для фона
     * @param {number} count - Количество звезд
     * @returns {Array} Массив звезд
     */
    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        return stars;
    }

    /**
     * Очистка canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Отрисовка фона
     * @param {number} time - Текущее время для анимации
     */
    renderBackground(time) {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#004e92');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Отрисовка звезд
        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    /**
     * Проверка видимости объекта в области просмотра
     * @param {Object} entity - Игровой объект
     * @returns {boolean} True если объект видим
     */
    isEntityVisible(entity) {
        const bounds = entity.getBounds();
        return bounds.right >= 0 && 
               bounds.left <= this.width && 
               bounds.bottom >= 0 && 
               bounds.top <= this.height;
    }

    /**
     * Отрисовка всех игровых объектов
     * @param {Array} entities - Массив игровых объектов
     */
    renderEntities(entities) {
        let renderedCount = 0;
        entities.forEach(entity => {
            if (entity.active && this.isEntityVisible(entity)) {
                entity.render(this.ctx);
                renderedCount++;
            }
        });
        
        // Сохранение статистики для отладки
        this.lastRenderedCount = renderedCount;
    }

    /**
     * Отрисовка эффектов частиц
     * @param {Array} particles - Массив частиц
     */
    renderParticles(particles) {
        if (!particles || particles.length === 0) return;
        
        this.ctx.save();
        
        particles.forEach(particle => {
            if (!particle.active || particle.alpha <= 0) return;
            
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'star') {
                // Отрисовка звезд как точек с мерцанием
                const twinkle = Math.sin(Date.now() * 0.005 + particle.x) * 0.3 + 0.7;
                this.ctx.globalAlpha = particle.alpha * twinkle;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (particle.type === 'engine') {
                // Отрисовка частиц двигателя с размытием
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            } else if (particle.type === 'explosion') {
                // Отрисовка частиц взрыва с градиентом
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Обычные частицы
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.restore();
    }

    /**
     * Отрисовка отладочной информации
     * @param {Object} debugInfo - Информация для отладки
     */
    renderDebugInfo(debugInfo) {
        if (!debugInfo || !debugInfo.enabled) return;
        
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        
        let y = 20;
        const lineHeight = 15;
        
        if (debugInfo.fps) {
            this.ctx.fillText(`FPS: ${debugInfo.fps}`, 10, y);
            y += lineHeight;
        }
        
        if (debugInfo.entityCount !== undefined) {
            this.ctx.fillText(`Entities: ${debugInfo.entityCount} (rendered: ${this.lastRenderedCount || 0})`, 10, y);
            y += lineHeight;
        }
        
        if (debugInfo.collisions !== undefined) {
            this.ctx.fillText(`Collisions: ${debugInfo.collisions}`, 10, y);
            y += lineHeight;
        }
        
        if (debugInfo.particleCount !== undefined) {
            this.ctx.fillText(`Particles: ${debugInfo.particleCount}`, 10, y);
            y += lineHeight;
        }
        
        if (debugInfo.poolStats) {
            this.ctx.fillText('Object Pools:', 10, y);
            y += lineHeight;
            
            for (const [type, stats] of Object.entries(debugInfo.poolStats)) {
                if (stats) {
                    this.ctx.fillText(`  ${type}: ${stats.inUse}/${stats.available + stats.inUse} (reuse: ${stats.reuseRatio})`, 10, y);
                    y += lineHeight;
                }
            }
        }
        
        this.ctx.restore();
    }

    /**
     * Отрисовка границ объектов (для отладки)
     * @param {Array} entities - Массив объектов
     */
    renderBounds(entities) {
        this.ctx.save();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 1;
        
        entities.forEach(entity => {
            if (entity.active) {
                const bounds = entity.getBounds();
                this.ctx.strokeRect(
                    bounds.left, 
                    bounds.top, 
                    bounds.right - bounds.left, 
                    bounds.bottom - bounds.top
                );
            }
        });
        
        this.ctx.restore();
    }

    /**
     * Основной метод отрисовки
     * @param {Object} gameData - Данные игры для отрисовки
     */
    render(gameData) {
        // Очистка canvas
        this.clear();
        
        // Отрисовка фона
        this.renderBackground(gameData.time || 0);
        
        // Отрисовка игровых объектов
        if (gameData.entities) {
            this.renderEntities(gameData.entities);
        }
        
        // Отрисовка эффектов
        if (gameData.particles) {
            this.renderParticles(gameData.particles);
        }
        
        // Отрисовка отладочной информации
        if (gameData.debug) {
            this.renderDebugInfo(gameData.debug);
            
            // Отрисовка границ объектов в режиме отладки
            if (gameData.debug.showBounds && gameData.entities) {
                this.renderBounds(gameData.entities);
            }
        }
    }

    /**
     * Изменение размера canvas
     * @param {number} width - Новая ширина
     * @param {number} height - Новая высота
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        
        // Перегенерация звезд для нового размера
        this.stars = this.generateStars(100);
    }

    /**
     * Получение контекста canvas
     * @returns {CanvasRenderingContext2D} Контекст для отрисовки
     */
    getContext() {
        return this.ctx;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}