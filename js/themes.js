/**
 * Theme Manager
 * Handles theme switching, persistence, and system theme detection
 */

class ThemeManager {
    constructor() {
        this.themes = ['light', 'dark', 'auto'];
        this.currentTheme = 'light';
        this.elements = {};
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Load saved theme
        this.loadSavedTheme();
    }

    /**
     * Initialize theme manager
     */
    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        this.mediaQuery.addListener((e) => {
            if (this.currentTheme === 'auto') {
                this.updateAutoTheme();
            }
        });
        
        // Add transition class for smooth theme changes
        this.addTransitionClass();
    }

    /**
     * Set DOM elements reference
     */
    setElements(elements) {
        this.elements = elements;
    }

    /**
     * Load theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('gita-gpt-theme');
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            // Default to auto theme for new users
            this.currentTheme = 'auto';
        }
    }

    /**
     * Save theme to localStorage
     */
    saveTheme() {
        localStorage.setItem('gita-gpt-theme', this.currentTheme);
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        const body = document.body;
        
        // Remove all theme classes
        this.themes.forEach(t => {
            body.classList.remove(`theme-${t}`);
        });
        
        // Add current theme class
        body.classList.add(`theme-${theme}`);
        
        // Update meta theme-color
        this.updateMetaThemeColor(theme);
        
        // Announce theme change to screen readers
        this.announceThemeChange(theme);
    }

    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme();
        
        // Update UI elements
        this.updateThemeUI();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        let nextTheme;
        
        switch (this.currentTheme) {
            case 'light':
                nextTheme = 'dark';
                break;
            case 'dark':
                nextTheme = 'auto';
                break;
            case 'auto':
                nextTheme = 'light';
                break;
            default:
                nextTheme = 'light';
        }
        
        this.setTheme(nextTheme);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get effective theme (resolves auto theme)
     */
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.mediaQuery.matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    /**
     * Update auto theme based on system preference
     */
    updateAutoTheme() {
        if (this.currentTheme === 'auto') {
            this.applyTheme('auto');
            this.updateThemeUI();
        }
    }

    /**
     * Update theme-related UI elements
     */
    updateThemeUI() {
        // Update theme toggle button
        this.updateThemeToggleButton();
        
        // Update theme options in menu
        this.updateThemeOptions();
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                theme: this.currentTheme,
                effectiveTheme: this.getEffectiveTheme()
            }
        }));
    }

    /**
     * Update theme toggle button appearance
     */
    updateThemeToggleButton() {
        const toggleButton = this.elements.themeToggle;
        if (!toggleButton) return;
        
        const effectiveTheme = this.getEffectiveTheme();
        
        // Update button title
        const titles = {
            light: 'Switch to dark mode',
            dark: 'Switch to auto mode', 
            auto: 'Switch to light mode'
        };
        
        toggleButton.title = titles[this.currentTheme] || 'Toggle theme';
        
        // Update ARIA label
        toggleButton.setAttribute('aria-label', toggleButton.title);
    }

    /**
     * Update theme options in settings menu
     */
    updateThemeOptions() {
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            const isActive = option.dataset.theme === this.currentTheme;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Update meta theme-color for mobile browsers
     */
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) return;
        
        const colors = {
            light: '#6366f1',
            dark: '#818cf8',
            auto: this.mediaQuery.matches ? '#818cf8' : '#6366f1'
        };
        
        metaThemeColor.setAttribute('content', colors[theme] || colors.light);
    }

    /**
     * Add transition class for smooth theme switching
     */
    addTransitionClass() {
        document.body.classList.add('theme-transition');
        
        // Remove transition class after animation completes
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 350);
    }

    /**
     * Announce theme change to screen readers
     */
    announceThemeChange(theme) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        
        const effectiveTheme = this.getEffectiveTheme();
        announcement.textContent = `Theme changed to ${effectiveTheme} mode`;
        
        document.body.appendChild(announcement);
        
        // Remove announcement after it's been read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Get theme preferences for external use
     */
    getThemePreferences() {
        return {
            current: this.currentTheme,
            effective: this.getEffectiveTheme(),
            available: [...this.themes],
            systemPreference: this.mediaQuery.matches ? 'dark' : 'light'
        };
    }

    /**
     * Check if current theme is dark
     */
    isDarkMode() {
        return this.getEffectiveTheme() === 'dark';
    }

    /**
     * Check if current theme is light
     */
    isLightMode() {
        return this.getEffectiveTheme() === 'light';
    }

    /**
     * Reset to default theme
     */
    resetTheme() {
        this.setTheme('auto');
    }

    /**
     * Get CSS custom property value for current theme
     */
    getCSSProperty(property) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(property)
            .trim();
    }

    /**
     * Export theme settings
     */
    exportSettings() {
        return {
            theme: this.currentTheme,
            systemPreference: this.mediaQuery.matches ? 'dark' : 'light',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import theme settings
     */
    importSettings(settings) {
        if (settings && typeof settings === 'object') {
            const { theme } = settings;
            if (theme && this.themes.includes(theme)) {
                this.setTheme(theme);
                return true;
            }
        }
        return false;
    }
}

// Create global theme manager instance
const themeManager = new ThemeManager();

// Export for use in other modules
window.themeManager = themeManager;
