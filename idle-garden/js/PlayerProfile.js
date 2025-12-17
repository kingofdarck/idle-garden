/**
 * PlayerProfile class - Manages player identity and profile data
 * Provides simple player identification without requiring external authentication
 */
class PlayerProfile {
    /**
     * Create a new PlayerProfile instance
     */
    constructor() {
        this.playerId = null;
        this.playerName = null;
        this.createdAt = null;
        this.lastPlayed = null;
        
        this.initialize();
    }
    
    /**
     * Initialize player profile (load or create)
     */
    initialize() {
        const savedProfile = this.loadProfile();
        
        if (savedProfile) {
            this.playerId = savedProfile.playerId;
            this.playerName = savedProfile.playerName;
            this.createdAt = savedProfile.createdAt;
            this.lastPlayed = Date.now();
            this.saveProfile();
        } else {
            this.createNewProfile();
        }
    }
    
    /**
     * Create a new player profile
     */
    createNewProfile() {
        // Generate unique player ID
        this.playerId = this.generatePlayerId();
        this.playerName = this.generateDefaultName();
        this.createdAt = Date.now();
        this.lastPlayed = Date.now();
        
        this.saveProfile();
        
        console.log('🎮 New player profile created:', this.playerName);
    }
    
    /**
     * Generate a unique player ID
     * @returns {string} Unique player ID
     */
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Generate a default player name
     * @returns {string} Default player name
     */
    generateDefaultName() {
        const adjectives = ['Happy', 'Lucky', 'Green', 'Sunny', 'Mighty', 'Swift', 'Wise', 'Brave'];
        const nouns = ['Gardener', 'Farmer', 'Grower', 'Planter', 'Harvester', 'Cultivator'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 1000);
        
        return `${adj}${noun}${num}`;
    }
    
    /**
     * Save player profile to localStorage
     */
    saveProfile() {
        const profile = {
            playerId: this.playerId,
            playerName: this.playerName,
            createdAt: this.createdAt,
            lastPlayed: this.lastPlayed
        };
        
        try {
            localStorage.setItem('idle_garden_player_profile', JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to save player profile:', error);
        }
    }
    
    /**
     * Load player profile from localStorage
     * @returns {Object|null} Player profile or null if not found
     */
    loadProfile() {
        try {
            const profileData = localStorage.getItem('idle_garden_player_profile');
            if (profileData) {
                return JSON.parse(profileData);
            }
        } catch (error) {
            console.error('Failed to load player profile:', error);
        }
        return null;
    }
    
    /**
     * Update player name
     * @param {string} newName - New player name
     */
    setPlayerName(newName) {
        if (newName && newName.trim().length > 0) {
            this.playerName = newName.trim();
            this.saveProfile();
            console.log('✅ Player name updated:', this.playerName);
            return true;
        }
        return false;
    }
    
    /**
     * Get player display info
     * @returns {Object} Player display information
     */
    getDisplayInfo() {
        return {
            playerId: this.playerId,
            playerName: this.playerName,
            createdAt: this.createdAt,
            lastPlayed: this.lastPlayed,
            daysSincePlaying: Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24))
        };
    }
    
    /**
     * Reset player profile (create new identity)
     */
    reset() {
        localStorage.removeItem('idle_garden_player_profile');
        this.createNewProfile();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerProfile;
} else if (typeof window !== 'undefined') {
    window.PlayerProfile = PlayerProfile;
}
