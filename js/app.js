/**
 * Main Application Controller
 * Handles initialization, routing, and global app state
 */

class GitaGPTApp {
    constructor() {
        this.chatId = this.generateChatId();
        this.isInitialized = false;
        this.elements = {};
        
        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Cache DOM elements
            this.cacheElements();
            
            // Initialize modules
            this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize theme
            themeManager.init();
            
            // Initialize speech
            speechManager.init();
            
            // Initialize chat
            chatManager.init();
            
            // Hide loading screen after short delay
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showWelcomeScreen();
                this.isInitialized = true;
            }, 2000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            // Core elements
            app: document.getElementById('app'),
            loadingScreen: document.getElementById('loadingScreen'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatMessages: document.getElementById('chatMessages'),
            
            // Header elements
            themeToggle: document.getElementById('themeToggle'),
            menuButton: document.getElementById('menuButton'),
            
            // Input elements
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            charCount: document.getElementById('charCount'),
            
            // Action buttons
            dailyVerseButton: document.getElementById('dailyVerseButton'),
            dailyVerseWelcome: document.getElementById('dailyVerseWelcome'),
            clearChatButton: document.getElementById('clearChatButton'),
            
            // Menu elements
            menuOverlay: document.getElementById('menuOverlay'),
            closeMenu: document.getElementById('closeMenu'),
            
            // Settings elements
            speechRate: document.getElementById('speechRate'),
            speechPitch: document.getElementById('speechPitch')
        };
        
        // Validate critical elements
        const criticalElements = ['app', 'messageInput', 'sendButton', 'chatMessages'];
        for (const elementId of criticalElements) {
            if (!this.elements[elementId]) {
                throw new Error(`Critical element not found: ${elementId}`);
            }
        }
    }

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Initialize theme manager
        if (typeof themeManager !== 'undefined') {
            themeManager.setElements(this.elements);
        }
        
        // Initialize speech manager
        if (typeof speechManager !== 'undefined') {
            speechManager.setElements(this.elements);
        }
        
        // Initialize chat manager
        if (typeof chatManager !== 'undefined') {
            chatManager.setElements(this.elements);
            chatManager.setChatId(this.chatId);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => {
            themeManager.toggleTheme();
        });
        
        // Menu functionality
        this.elements.menuButton?.addEventListener('click', () => {
            this.showMenu();
        });
        
        this.elements.closeMenu?.addEventListener('click', () => {
            this.hideMenu();
        });
        
        this.elements.menuOverlay?.addEventListener('click', (e) => {
            if (e.target === this.elements.menuOverlay) {
                this.hideMenu();
            }
        });
        
        // Message input
        this.elements.messageInput?.addEventListener('input', (e) => {
            this.handleInputChange(e);
        });
        
        this.elements.messageInput?.addEventListener('keydown', (e) => {
            this.handleInputKeyDown(e);
        });
        
        // Send button
        this.elements.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Daily verse buttons
        this.elements.dailyVerseButton?.addEventListener('click', () => {
            this.requestDailyVerse();
        });
        
        this.elements.dailyVerseWelcome?.addEventListener('click', () => {
            this.requestDailyVerse();
            this.hideWelcomeScreen();
        });
        
        // Clear chat button
        this.elements.clearChatButton?.addEventListener('click', () => {
            this.confirmClearChat();
        });
        
        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.dataset.message;
                if (message) {
                    this.sendQuickMessage(message);
                }
            });
        });
        
        // Theme selection in menu
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                if (theme) {
                    themeManager.setTheme(theme);
                    this.updateThemeOptions();
                }
            });
        });
        
        // Speech settings
        this.elements.speechRate?.addEventListener('input', (e) => {
            speechManager.setRate(parseFloat(e.target.value));
        });
        
        this.elements.speechPitch?.addEventListener('input', (e) => {
            speechManager.setPitch(parseFloat(e.target.value));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Handle input field changes
     */
    handleInputChange(e) {
        const value = e.target.value;
        const length = value.length;
        const maxLength = parseInt(e.target.getAttribute('maxlength')) || 1000;
        
        // Update character count
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${length}/${maxLength}`;
            
            // Add visual feedback for approaching limit
            if (length > maxLength * 0.9) {
                this.elements.charCount.style.color = 'hsl(var(--error))';
            } else if (length > maxLength * 0.7) {
                this.elements.charCount.style.color = 'hsl(var(--warning))';
            } else {
                this.elements.charCount.style.color = 'hsl(var(--text-tertiary))';
            }
        }
        
        // Enable/disable send button
        const canSend = value.trim().length > 0 && !chatManager.isReceiving();
        this.elements.sendButton.disabled = !canSend;
        
        // Auto-resize textarea
        this.autoResizeTextarea(e.target);
    }

    /**
     * Handle input keydown events
     */
    handleInputKeyDown(e) {
        // Send message on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.elements.sendButton.disabled) {
                this.sendMessage();
            }
        }
        
        // Cancel current request on Escape
        if (e.key === 'Escape') {
            chatManager.cancelCurrentRequest();
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(e) {
        // Focus input on any typing (when not in input)
        if (e.target !== this.elements.messageInput && 
            e.key.length === 1 && 
            !e.ctrlKey && 
            !e.altKey && 
            !e.metaKey) {
            this.elements.messageInput.focus();
        }
        
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.elements.messageInput.focus();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (!this.elements.sendButton.disabled) {
                        this.sendMessage();
                    }
                    break;
                case 'd':
                    e.preventDefault();
                    this.requestDailyVerse();
                    break;
                case 'l':
                    e.preventDefault();
                    this.confirmClearChat();
                    break;
                case ',':
                    e.preventDefault();
                    this.showMenu();
                    break;
            }
        }
        
        // Theme toggle shortcut
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            themeManager.toggleTheme();
        }
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
        textarea.style.height = `${newHeight}px`;
    }

    /**
     * Send message from input
     */
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || chatManager.isReceiving()) return;
        
        // Clear input
        this.elements.messageInput.value = '';
        this.elements.charCount.textContent = '0/1000';
        this.elements.sendButton.disabled = true;
        this.autoResizeTextarea(this.elements.messageInput);
        
        // Hide welcome screen if visible
        this.hideWelcomeScreen();
        
        // Send message via chat manager
        await chatManager.sendMessage(message);
    }

    /**
     * Send quick message from welcome screen
     */
    async sendQuickMessage(message) {
        this.hideWelcomeScreen();
        await chatManager.sendMessage(message);
    }

    /**
     * Request daily verse
     */
    async requestDailyVerse() {
        this.hideWelcomeScreen();
        await chatManager.requestDailyVerse();
    }

    /**
     * Confirm and clear chat
     */
    confirmClearChat() {
        if (confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
            chatManager.clearChat();
            this.showWelcomeScreen();
        }
    }

    /**
     * Show/hide screens
     */
    showLoadingScreen() {
        this.elements.loadingScreen?.classList.remove('hidden');
    }

    hideLoadingScreen() {
        this.elements.loadingScreen?.classList.add('hidden');
    }

    showWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.remove('hidden');
            this.elements.welcomeScreen.classList.add('animate-fade-in');
        }
    }

    hideWelcomeScreen() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.add('hidden');
            this.elements.welcomeScreen.classList.remove('animate-fade-in');
        }
    }

    /**
     * Show/hide menu
     */
    showMenu() {
        this.elements.menuOverlay?.classList.add('active');
        this.updateThemeOptions();
        document.body.style.overflow = 'hidden';
    }

    hideMenu() {
        this.elements.menuOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Update theme option selection
     */
    updateThemeOptions() {
        const currentTheme = themeManager.getCurrentTheme();
        const themeOptions = document.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === currentTheme);
        });
    }

    /**
     * Handle visibility change (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause any ongoing speech
            speechManager.pause();
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create and show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: hsl(var(--error));
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: var(--z-toast);
            animation: slide-down 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'fade-out 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 5000);
    }

    /**
     * Generate unique chat ID
     */
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get application state
     */
    getState() {
        return {
            chatId: this.chatId,
            isInitialized: this.isInitialized,
            theme: themeManager?.getCurrentTheme(),
            speechSettings: speechManager?.getSettings()
        };
    }
}

// Initialize app
const app = new GitaGPTApp();

// Export for debugging
window.GitaGPTApp = app;
