/**
 * Система управления звуком
 * Космический Защитник
 */
class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.3;
        this.effectsVolume = 0.5;
        this.muted = false;
        this.backgroundMusic = null;
        this.audioContext = null;
        
        // Инициализация Web Audio API для лучшего контроля
        this.initializeAudioContext();
        
        // Создание звуковых эффектов программно
        this.createSoundEffects();
    }

    /**
     * Инициализация Audio Context
     */
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API не поддерживается:', error);
        }
    }

    /**
     * Создание звуковых эффектов программно
     */
    createSoundEffects() {
        // Звук выстрела
        this.sounds.set('shoot', this.createShootSound());
        
        // Звук взрыва
        this.sounds.set('explosion', this.createExplosionSound());
        
        // Звук урона планете
        this.sounds.set('planetDamage', this.createPlanetDamageSound());
        
        // Звук окончания игры
        this.sounds.set('gameOver', this.createGameOverSound());
        
        // Фоновая музыка
        this.createBackgroundMusic();
    }

    /**
     * Создание звука выстрела
     */
    createShootSound() {
        if (!this.audioContext) return null;
        
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Настройка звука выстрела
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    /**
     * Создание звука взрыва
     */
    createExplosionSound() {
        if (!this.audioContext) return null;
        
        return () => {
            // Основной взрыв
            const oscillator1 = this.audioContext.createOscillator();
            const gainNode1 = this.audioContext.createGain();
            
            oscillator1.connect(gainNode1);
            gainNode1.connect(this.audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
            
            gainNode1.gain.setValueAtTime(this.effectsVolume * 0.5, this.audioContext.currentTime);
            gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 0.3);
            
            // Высокочастотный компонент
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode2 = this.audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(this.audioContext.destination);
            
            oscillator2.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
            
            gainNode2.gain.setValueAtTime(this.effectsVolume * 0.2, this.audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator2.start(this.audioContext.currentTime);
            oscillator2.stop(this.audioContext.currentTime + 0.15);
        };
    }

    /**
     * Создание звука урона планете
     */
    createPlanetDamageSound() {
        if (!this.audioContext) return null;
        
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(this.effectsVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }

    /**
     * Создание звука окончания игры
     */
    createGameOverSound() {
        if (!this.audioContext) return null;
        
        return () => {
            // Последовательность нот для мелодии окончания игры
            const notes = [220, 196, 174, 146, 130];
            const noteDuration = 0.4;
            
            notes.forEach((frequency, index) => {
                const startTime = this.audioContext.currentTime + index * noteDuration;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, startTime);
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.3, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + noteDuration);
            });
        };
    }

    /**
     * Создание фоновой музыки
     */
    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        // Простая мелодия для фоновой музыки
        this.backgroundMusicData = {
            notes: [
                { freq: 220, duration: 0.5 }, // A3
                { freq: 246, duration: 0.5 }, // B3
                { freq: 277, duration: 0.5 }, // C#4
                { freq: 293, duration: 0.5 }, // D4
                { freq: 329, duration: 1.0 }, // E4
                { freq: 293, duration: 0.5 }, // D4
                { freq: 277, duration: 0.5 }, // C#4
                { freq: 246, duration: 1.0 }, // B3
            ],
            currentNote: 0,
            nextNoteTime: 0,
            isPlaying: false
        };
    }

    /**
     * Воспроизведение звукового эффекта
     * @param {string} soundName - Название звука
     */
    playSound(soundName) {
        if (this.muted || !this.sounds.has(soundName)) return;
        
        const soundFunction = this.sounds.get(soundName);
        if (soundFunction) {
            try {
                soundFunction();
            } catch (error) {
                console.warn(`Ошибка воспроизведения звука ${soundName}:`, error);
            }
        }
    }

    /**
     * Запуск фоновой музыки
     */
    startBackgroundMusic() {
        if (this.muted || !this.audioContext || !this.backgroundMusicData) return;
        
        this.backgroundMusicData.isPlaying = true;
        this.backgroundMusicData.nextNoteTime = this.audioContext.currentTime;
        this.scheduleNextNote();
    }

    /**
     * Остановка фоновой музыки
     */
    stopBackgroundMusic() {
        if (this.backgroundMusicData) {
            this.backgroundMusicData.isPlaying = false;
        }
    }

    /**
     * Планирование следующей ноты фоновой музыки
     */
    scheduleNextNote() {
        if (!this.backgroundMusicData.isPlaying || this.muted) return;
        
        const noteData = this.backgroundMusicData.notes[this.backgroundMusicData.currentNote];
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(noteData.freq, this.backgroundMusicData.nextNoteTime);
        
        gainNode.gain.setValueAtTime(0, this.backgroundMusicData.nextNoteTime);
        gainNode.gain.linearRampToValueAtTime(
            this.musicVolume * 0.1, 
            this.backgroundMusicData.nextNoteTime + 0.05
        );
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, 
            this.backgroundMusicData.nextNoteTime + noteData.duration
        );
        
        oscillator.start(this.backgroundMusicData.nextNoteTime);
        oscillator.stop(this.backgroundMusicData.nextNoteTime + noteData.duration);
        
        // Переход к следующей ноте
        this.backgroundMusicData.nextNoteTime += noteData.duration;
        this.backgroundMusicData.currentNote = 
            (this.backgroundMusicData.currentNote + 1) % this.backgroundMusicData.notes.length;
        
        // Планирование следующей ноты
        setTimeout(() => {
            if (this.backgroundMusicData.isPlaying) {
                this.scheduleNextNote();
            }
        }, noteData.duration * 1000);
    }

    /**
     * Установка громкости музыки
     * @param {number} volume - Громкость от 0 до 1
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Установка громкости эффектов
     * @param {number} volume - Громкость от 0 до 1
     */
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Включение/выключение звука
     * @param {boolean} muted - Состояние звука
     */
    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            this.stopBackgroundMusic();
        } else if (this.backgroundMusicData && !this.backgroundMusicData.isPlaying) {
            this.startBackgroundMusic();
        }
    }

    /**
     * Получение состояния звука
     * @returns {boolean} True если звук выключен
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Возобновление Audio Context (требуется для некоторых браузеров)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}