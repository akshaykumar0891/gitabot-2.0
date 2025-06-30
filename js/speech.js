/**
 * Speech Manager
 * Handles text-to-speech functionality with advanced controls
 */

class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isSupported = 'speechSynthesis' in window;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.autoSpeak = false;
        this.elements = {};
        
        // Default settings
        this.settings = {
            rate: 1,
            pitch: 1,
            volume: 1,
            voice: null,
            lang: 'en-US'
        };
        
        // Load saved settings
        this.loadSettings();
        
        // Voice loading state
        this.voicesLoaded = false;
        this.availableVoices = [];
        
        // Initialize voices
        this.initVoices();
    }

    /**
     * Initialize speech manager
     */
    init() {
        if (!this.isSupported) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current settings
        this.updateUI();
        
        console.log('Speech Manager initialized');
    }

    /**
     * Set DOM elements reference
     */
    setElements(elements) {
        this.elements = elements;
        this.updateUI();
    }

    /**
     * Initialize voices
     */
    initVoices() {
        if (!this.isSupported) return;
        
        // Get voices
        this.availableVoices = this.synth.getVoices();
        
        // If no voices loaded yet, wait for voiceschanged event
        if (this.availableVoices.length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.availableVoices = this.synth.getVoices();
                this.voicesLoaded = true;
                this.selectDefaultVoice();
            });
        } else {
            this.voicesLoaded = true;
            this.selectDefaultVoice();
        }
    }

    /**
     * Select default voice
     */
    selectDefaultVoice() {
        if (!this.voicesLoaded || this.availableVoices.length === 0) return;
        
        // Try to find a good English voice
        const preferredVoices = [
            'Google US English',
            'Microsoft Zira',
            'Alex',
            'Samantha',
            'Daniel'
        ];
        
        let selectedVoice = null;
        
        // First try to find preferred voices
        for (const voiceName of preferredVoices) {
            selectedVoice = this.availableVoices.find(voice => 
                voice.name.includes(voiceName) && voice.lang.startsWith('en')
            );
            if (selectedVoice) break;
        }
        
        // If no preferred voice found, use any English voice
        if (!selectedVoice) {
            selectedVoice = this.availableVoices.find(voice => 
                voice.lang.startsWith('en')
            );
        }
        
        // If still no voice, use the first available
        if (!selectedVoice && this.availableVoices.length > 0) {
            selectedVoice = this.availableVoices[0];
        }
        
        if (selectedVoice) {
            this.settings.voice = selectedVoice;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.isSupported) return;
        
        // Listen for speech synthesis events
        this.synth.addEventListener('voiceschanged', () => {
            this.initVoices();
        });
    }

    /**
     * Speak text
     */
    speak(text, options = {}) {
        if (!this.isSupported || !text.trim()) {
            console.warn('Cannot speak: speech not supported or empty text');
            return Promise.reject(new Error('Speech not supported or empty text'));
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Stop any current speech
                this.stop();
                
                // Clean text for speech
                const cleanText = this.cleanTextForSpeech(text);
                
                // Create utterance
                this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
                
                // Apply settings
                this.currentUtterance.rate = options.rate || this.settings.rate;
                this.currentUtterance.pitch = options.pitch || this.settings.pitch;
                this.currentUtterance.volume = options.volume || this.settings.volume;
                this.currentUtterance.lang = options.lang || this.settings.lang;
                
                // Set voice if available
                if (this.settings.voice) {
                    this.currentUtterance.voice = this.settings.voice;
                }
                
                // Set up event handlers
                this.currentUtterance.onstart = () => {
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.updatePlayingState();
                };
                
                this.currentUtterance.onend = () => {
                    this.isPlaying = false;
                    this.isPaused = false;
                    this.currentUtterance = null;
                    this.updatePlayingState();
                    resolve();
                };
                
                this.currentUtterance.onerror = (event) => {
                    this.isPlaying = false;
                    this.isPaused = false;
                    this.currentUtterance = null;
                    this.updatePlayingState();
                    console.error('Speech synthesis error:', event.error);
                    reject(new Error(`Speech synthesis error: ${event.error}`));
                };
                
                this.currentUtterance.onpause = () => {
                    this.isPaused = true;
                    this.updatePlayingState();
                };
                
                this.currentUtterance.onresume = () => {
                    this.isPaused = false;
                    this.updatePlayingState();
                };
                
                // Speak
                this.synth.speak(this.currentUtterance);
                
            } catch (error) {
                console.error('Error in speech synthesis:', error);
                reject(error);
            }
        });
    }

    /**
     * Stop speech
     */
    stop() {
        if (!this.isSupported) return;
        
        this.synth.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.updatePlayingState();
    }

    /**
     * Pause speech
     */
    pause() {
        if (!this.isSupported || !this.isPlaying) return;
        
        this.synth.pause();
    }

    /**
     * Resume speech
     */
    resume() {
        if (!this.isSupported || !this.isPaused) return;
        
        this.synth.resume();
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying && !this.isPaused) {
            this.pause();
        } else if (this.isPaused) {
            this.resume();
        }
    }

    /**
     * Set speech rate
     */
    setRate(rate) {
        this.settings.rate = Math.max(0.1, Math.min(10, rate));
        this.saveSettings();
        this.updateUI();
    }

    /**
     * Set speech pitch
     */
    setPitch(pitch) {
        this.settings.pitch = Math.max(0, Math.min(2, pitch));
        this.saveSettings();
        this.updateUI();
    }

    /**
     * Set speech volume
     */
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        this.updateUI();
    }

    /**
     * Set voice
     */
    setVoice(voice) {
        if (voice && this.availableVoices.includes(voice)) {
            this.settings.voice = voice;
            this.saveSettings();
        }
    }

    /**
     * Enable/disable auto-speak
     */
    setAutoSpeak(enabled) {
        this.autoSpeak = enabled;
        this.saveSettings();
    }

    /**
     * Check if auto-speak is enabled
     */
    isAutoSpeakEnabled() {
        return this.autoSpeak;
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings, autoSpeak: this.autoSpeak };
    }

    /**
     * Check if speech is supported
     */
    isSupported() {
        return this.isSupported;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.isPlaying;
    }

    /**
     * Check if currently paused
     */
    isPaused() {
        return this.isPaused;
    }

    /**
     * Get available voices
     */
    getVoices() {
        return this.availableVoices;
    }

    /**
     * Clean text for speech synthesis
     */
    cleanTextForSpeech(text) {
        return text
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove special characters that might cause issues
            .replace(/[🕉️🙏🌟💫⚖️🌺💕🎯💝🧘]/g, '')
            // Clean up extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (this.elements.speechRate) {
            this.elements.speechRate.value = this.settings.rate;
        }
        
        if (this.elements.speechPitch) {
            this.elements.speechPitch.value = this.settings.pitch;
        }
    }

    /**
     * Update playing state UI
     */
    updatePlayingState() {
        // Dispatch custom event for other components to listen
        document.dispatchEvent(new CustomEvent('speechStateChanged', {
            detail: {
                isPlaying: this.isPlaying,
                isPaused: this.isPaused,
                isSupported: this.isSupported
            }
        }));
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('gita-gpt-speech-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
                this.autoSpeak = parsed.autoSpeak || false;
            }
        } catch (error) {
            console.error('Error loading speech settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const toSave = {
                ...this.settings,
                autoSpeak: this.autoSpeak,
                // Don't save the voice object, just the name
                voice: this.settings.voice ? this.settings.voice.name : null
            };
            localStorage.setItem('gita-gpt-speech-settings', JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving speech settings:', error);
        }
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.settings = {
            rate: 1,
            pitch: 1,
            volume: 1,
            voice: null,
            lang: 'en-US'
        };
        this.autoSpeak = false;
        this.selectDefaultVoice();
        this.saveSettings();
        this.updateUI();
    }

    /**
     * Export settings
     */
    exportSettings() {
        return {
            settings: this.getSettings(),
            isSupported: this.isSupported,
            voicesAvailable: this.availableVoices.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import settings
     */
    importSettings(data) {
        if (data && typeof data === 'object' && data.settings) {
            try {
                this.settings = { ...this.settings, ...data.settings };
                this.autoSpeak = data.settings.autoSpeak || false;
                
                // Re-select voice by name if provided
                if (data.settings.voice && typeof data.settings.voice === 'string') {
                    const voice = this.availableVoices.find(v => v.name === data.settings.voice);
                    if (voice) {
                        this.settings.voice = voice;
                    }
                }
                
                this.saveSettings();
                this.updateUI();
                return true;
            } catch (error) {
                console.error('Error importing speech settings:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Test speech with sample text
     */
    test() {
        const testText = "Namaste, dear seeker. This is a test of the speech synthesis system. Om Shanti.";
        return this.speak(testText);
    }

    /**
     * Get speech status
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            voicesLoaded: this.voicesLoaded,
            voiceCount: this.availableVoices.length,
            currentVoice: this.settings.voice ? this.settings.voice.name : 'None',
            settings: this.getSettings()
        };
    }
}

// Create global speech manager instance
const speechManager = new SpeechManager();

// Export for use in other modules
window.speechManager = speechManager;
