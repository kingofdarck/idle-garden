/**
 * SoundManager class - Handles audio settings and sound effects
 * Manages sound enable/disable functionality and audio feedback control
 */
class SoundManager {
    /**
     * Create a new SoundManager instance
     * @param {Object} settings - Initial sound settings
     */
    constructor(settings = {}) {
        this.settings = {
            soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
            volume: settings.volume !== undefined ? settings.volume : 0.5
        };
        
        // Audio context for sound effects (optional)
        this.audioContext = null;
        this.sounds = {};
        
        // Initialize audio context if available
        this.initializeAudioContext();
        
        // Load default sounds
        this.loadDefaultSounds();
    }
    
    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            // Check if Web Audio API is supported
            if (typeof AudioContext !== 'undefined') {
                this.audioContext = new AudioContext();
            } else if (typeof webkitAudioContext !== 'undefined') {
                this.audioContext = new webkitAudioContext();
            } else {
                console.warn('Web Audio API not supported');
                this.audioContext = null;
            }
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
            this.audioContext = null;
        }
    }
    
    /**
     * Load default sound effects
     */
    loadDefaultSounds() {
        // For now, we'll use simple beep sounds generated programmatically
        // In a real implementation, you would load actual audio files
        this.sounds = {
            click: this.createBeepSound(800, 0.1, 0.1),
            success: this.createBeepSound(600, 0.2, 0.15),
            error: this.createBeepSound(300, 0.3, 0.2),
            income: this.createBeepSound(1000, 0.1, 0.05),
            purchase: this.createBeepSound(700, 0.15, 0.1)
        };
    }
    
    /**
     * Create a simple beep sound using Web Audio API
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume (0-1)
     * @returns {Function} Function to play the sound
     */
    createBeepSound(frequency, duration, volume) {
        return () => {
            if (!this.audioContext || !this.settings.soundEnabled) {
                return;
            }
            
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume * this.settings.volume, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Failed to play sound:', error);
            }
        };
    }
    
    /**
     * Play a sound effect by name
     * @param {string} soundName - Name of the sound to play
     */
    playSound(soundName) {
        if (!this.settings.soundEnabled) {
            return;
        }
        
        const sound = this.sounds[soundName];
        if (sound && typeof sound === 'function') {
            sound();
        } else {
            console.warn(`Sound not found: ${soundName}`);
        }
    }
    
    /**
     * Toggle sound on/off
     * @returns {boolean} New sound enabled state
     */
    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        console.log(`Звук ${this.settings.soundEnabled ? 'включен' : 'выключен'}`);
        return this.settings.soundEnabled;
    }
    
    /**
     * Enable sound
     */
    enableSound() {
        this.settings.soundEnabled = true;
        console.log('Звук включен');
    }
    
    /**
     * Disable sound
     */
    disableSound() {
        this.settings.soundEnabled = false;
        console.log('Звук выключен');
    }
    
    /**
     * Check if sound is enabled
     * @returns {boolean} True if sound is enabled
     */
    isSoundEnabled() {
        return this.settings.soundEnabled;
    }
    
    /**
     * Set volume level
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (volume < 0 || volume > 1) {
            throw new Error('Volume must be between 0 and 1');
        }
        
        this.settings.volume = volume;
        console.log(`Громкость установлена на ${Math.round(volume * 100)}%`);
    }
    
    /**
     * Get current volume level
     * @returns {number} Current volume (0-1)
     */
    getVolume() {
        return this.settings.volume;
    }
    
    /**
     * Play click sound for UI interactions
     */
    playClickSound() {
        this.playSound('click');
    }
    
    /**
     * Play success sound for positive actions
     */
    playSuccessSound() {
        this.playSound('success');
    }
    
    /**
     * Play error sound for negative actions
     */
    playErrorSound() {
        this.playSound('error');
    }
    
    /**
     * Play income sound for earning coins
     */
    playIncomeSound() {
        this.playSound('income');
    }
    
    /**
     * Play purchase sound for buying items
     */
    playPurchaseSound() {
        this.playSound('purchase');
    }
    
    /**
     * Resume audio context (required for some browsers)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('Аудио контекст возобновлен');
            }).catch(error => {
                console.warn('Не удалось возобновить аудио контекст:', error);
            });
        }
    }
    
    /**
     * Serialize sound settings for saving
     * @returns {Object} Serialized sound settings
     */
    serialize() {
        return {
            soundEnabled: this.settings.soundEnabled,
            volume: this.settings.volume
        };
    }
    
    /**
     * Load sound settings from serialized data
     * @param {Object} data - Serialized sound settings
     */
    deserialize(data) {
        if (data) {
            this.settings.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            this.settings.volume = data.volume !== undefined ? data.volume : 0.5;
        }
    }
    
    /**
     * Reset sound settings to defaults
     */
    reset() {
        this.settings = {
            soundEnabled: true,
            volume: 0.5
        };
        console.log('Настройки звука сброшены на значения по умолчанию');
    }
    
    /**
     * Update UI elements to reflect current sound state
     */
    updateSoundToggleUI() {
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            const icon = this.settings.soundEnabled ? '🔊' : '🔇';
            const text = this.settings.soundEnabled ? 'Звук' : 'Выкл';
            soundToggle.innerHTML = `${icon} ${text}`;
            
            // Add visual feedback for sound state
            if (this.settings.soundEnabled) {
                soundToggle.classList.remove('sound-disabled');
                soundToggle.classList.add('sound-enabled');
            } else {
                soundToggle.classList.remove('sound-enabled');
                soundToggle.classList.add('sound-disabled');
            }
        }
    }
    
    /**
     * Get current settings for display
     * @returns {Object} Current sound settings
     */
    getSettings() {
        return {
            soundEnabled: this.settings.soundEnabled,
            volume: this.settings.volume,
            volumePercent: Math.round(this.settings.volume * 100)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
} else if (typeof window !== 'undefined') {
    window.SoundManager = SoundManager;
}