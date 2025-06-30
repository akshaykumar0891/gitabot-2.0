/**
 * Chat Manager
 * Handles chat functionality, message display, and API communication
 */

class ChatManager {
    constructor() {
        this.elements = {};
        this.chatId = null;
        this.receiving = false;
        this.abortController = null;
        this.messages = [];
        this.systemPrompt = this.getSystemPrompt();
        this.gitaVerses = this.getGitaVerses();
        
        // Secret code handling
        this.SECRET_CODE = "1815";
        this.SECRET_MESSAGE = "✨ Forever Together, Akshay & Monika! ✨";
    }

    /**
     * Initialize chat manager
     */
    init() {
        // Load chat history if available
        this.loadChatHistory();
    }

    /**
     * Set DOM elements reference
     */
    setElements(elements) {
        this.elements = elements;
    }

    /**
     * Set chat ID
     */
    setChatId(chatId) {
        this.chatId = chatId;
    }

    /**
     * Check if currently receiving a message
     */
    isReceiving() {
        return this.receiving;
    }

    /**
     * Send a message
     */
    async sendMessage(message) {
        if (this.receiving || !message.trim()) return;

        // Check for secret code
        if (message.trim() === this.SECRET_CODE) {
            this.displaySecretMessage();
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');

        // Start receiving response
        this.receiving = true;
        this.updateInputState();

        try {
            await this.generateResponse(message);
        } catch (error) {
            console.error('Error generating response:', error);
            this.addMessage(
                "I apologize, dear seeker. I'm experiencing some difficulty connecting to the divine wisdom. Please try again in a moment.",
                'assistant'
            );
        } finally {
            this.receiving = false;
            this.updateInputState();
        }
    }

    /**
     * Request daily verse
     */
    async requestDailyVerse() {
        const verseMessage = "Please share today's verse from the Bhagavad Gita with its meaning and relevance.";
        await this.sendMessage(verseMessage);
    }

    /**
     * Generate AI response
     */
    async generateResponse(userMessage) {
        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();

        try {
            // Create abort controller for cancellation
            this.abortController = new AbortController();

            // Simulate API call with streaming response
            const response = await this.callChatAPI(userMessage);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);

            // Add response to chat
            this.addMessage(response, 'assistant');

        } catch (error) {
            this.removeTypingIndicator(typingIndicator);
            
            if (error.name === 'AbortError') {
                console.log('Request was cancelled');
            } else {
                throw error;
            }
        }
    }

    /**
     * Call chat API (simulated for now)
     */
    async callChatAPI(message) {
        // Simulate API delay
        await this.delay(2000 + Math.random() * 2000);

        // Check if request was cancelled
        if (this.abortController?.signal.aborted) {
            throw new AbortError('Request cancelled');
        }

        // Generate contextual response based on message content
        return this.generateContextualResponse(message);
    }

    /**
     * Generate contextual response based on message
     */
    generateContextualResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Daily verse responses
        if (lowerMessage.includes('daily') || lowerMessage.includes('verse') || lowerMessage.includes('today')) {
            const randomVerse = this.getRandomVerse();
            return `🙏 **Today's Divine Guidance**\n\n*${randomVerse}*\n\nDear seeker, this verse reminds us that every action we perform should be done with pure intention, without attachment to results. In your daily life, focus on doing your duty with devotion and let the universe handle the outcomes. This brings true peace and spiritual growth.\n\n**Practical Application:** Today, approach each task with mindfulness and dedication, releasing worry about outcomes. Trust in the divine plan and find joy in the service itself.`;
        }
        
        // Life purpose and meaning
        if (lowerMessage.includes('meaning') || lowerMessage.includes('purpose') || lowerMessage.includes('life')) {
            return `🌟 **The Sacred Purpose of Life**\n\nBeloved soul, as Krishna teaches in the Gita (BG 18.46): *"By performing one's own dharma, even imperfectly, one attains perfection through worshipping the Lord through their work."*\n\nYour life's purpose is to:\n• Discover and follow your dharma (righteous path)\n• Serve others with love and compassion\n• Gradually realize your true divine nature\n• Transform every action into worship\n\nRemember, you are not just a body or mind - you are an eternal soul on a journey of awakening. Each challenge is an opportunity for growth, each relationship a chance to express love.`;
        }
        
        // Inner peace and anxiety
        if (lowerMessage.includes('peace') || lowerMessage.includes('anxiety') || lowerMessage.includes('worry') || lowerMessage.includes('stress')) {
            return `🕉️ **Finding Inner Peace**\n\nDear troubled heart, Krishna says in BG 2.47: *"You have the right to work, but never to the fruit of work."*\n\nAnxiety often comes from attachment to outcomes beyond our control. True peace arises when we:\n\n**🧘 Practice Surrender:** Do your best and release the results to the divine\n**🌸 Live in the Present:** The past is gone, the future is not yet here\n**💫 Connect with Your True Self:** You are not your thoughts or fears\n\n**Today's Practice:** Take 5 minutes to breathe deeply and remind yourself - "I am safe, I am guided, I am exactly where I need to be."`;
        }
        
        // Fear and courage
        if (lowerMessage.includes('fear') || lowerMessage.includes('afraid') || lowerMessage.includes('courage') || lowerMessage.includes('overcome')) {
            return `⚡ **Conquering Fear with Divine Courage**\n\nBrave soul, remember Arjuna's fear before the great battle, and how Krishna guided him to courage. In BG 11.33, Krishna reminds us: *"Rise up and obtain glory. Conquer your enemies and enjoy a prosperous kingdom."*\n\nFear is often False Evidence Appearing Real. When you align with your dharma:\n\n• **Trust the Divine Plan** - You are always protected and guided\n• **Focus on Action** - Channel fear into purposeful action\n• **Remember Your True Nature** - You are an eternal, powerful soul\n\n**Affirmation:** "I am filled with divine courage. I trust in Krishna's protection and my own inner strength."`;
        }
        
        // Dharma and righteousness
        if (lowerMessage.includes('dharma') || lowerMessage.includes('right') || lowerMessage.includes('wrong') || lowerMessage.includes('decision')) {
            return `⚖️ **Understanding Dharma**\n\nWise seeker, dharma is your sacred duty - the righteous path aligned with your nature and circumstances. Krishna teaches in BG 3.35: *"Better is one's own dharma, though imperfectly performed, than the dharma of another well performed."*\n\n**To Find Your Dharma:**\n🌟 **Listen to Your Heart** - What brings you joy and serves others?\n🌟 **Honor Your Talents** - How can your gifts benefit the world?\n🌟 **Consider Your Circumstances** - What does life ask of you now?\n\n**When Making Decisions:**\n• Does this align with truth and non-violence?\n• Will this serve the greater good?\n• Am I acting from love or ego?\n\nTrust your inner wisdom - it is Krishna's voice within you.`;
        }
        
        // Relationships and love
        if (lowerMessage.includes('relationship') || lowerMessage.includes('love') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
            return `💕 **Sacred Relationships**\n\nBeloved soul, all relationships are opportunities to express divine love. Krishna teaches us in BG 9.29: *"I am equally disposed to all beings; none is dear or hateful to Me."*\n\nIn your relationships:\n\n**🌺 Practice Unconditional Love** - Love without expecting anything in return\n**🌺 See the Divine in Others** - Every person is a manifestation of the divine\n**🌺 Serve Without Attachment** - Help others for the joy of service itself\n**🌺 Forgive and Release** - Holding anger hurts only yourself\n\n**Today's Intention:** "I choose to see and serve the divine in everyone I meet. I offer love freely and trust in love's power to transform all relationships."`;
        }
        
        // Work and career
        if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('success')) {
            return `🌟 **Sacred Work and Success**\n\nDear seeker, Krishna reveals the secret of true success in BG 2.50: *"Evenness of mind is called yoga. Perform all actions with a balanced mind."*\n\nTransform your work into worship by:\n\n**🙏 Offering Your Work** - Dedicate your efforts to the divine\n**🎯 Focus on Excellence** - Give your best without attachment to results\n**💝 Serve Through Your Work** - How does your work benefit others?\n**🧘 Maintain Inner Peace** - Success and failure are temporary experiences\n\n**Divine Perspective:** True success is not in external achievements but in maintaining your inner peace and serving humanity through your unique gifts. Trust that when you align with dharma, abundance flows naturally.`;
        }
        
        // Default spiritual guidance
        return `🙏 **Divine Wisdom for Your Journey**\n\nDearest seeker, I sense your heart seeking guidance. Remember Krishna's eternal promise in BG 9.22: *"To those who are constantly devoted and worship Me with love, I give the understanding by which they can come to Me."*\n\n**Universal Truths:**\n• You are a divine soul having a human experience\n• Every challenge contains a hidden blessing\n• Love and service are the fastest paths to liberation\n• The divine dwells within your own heart\n\n**Today's Blessing:** May you find peace in uncertainty, strength in challenges, and love in every moment. You are exactly where you need to be on your sacred journey.\n\n*Is there a specific aspect of life where you seek guidance? I am here to help illuminate your path with the wisdom of the Gita.*`;
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender) {
        const message = {
            id: this.generateMessageId(),
            text,
            sender,
            timestamp: new Date().toISOString()
        };

        // Add to messages array
        this.messages.push(message);

        // Create and add message element
        const messageElement = this.createMessageElement(message);
        this.elements.chatMessages.appendChild(messageElement);

        // Scroll to bottom
        this.scrollToBottom();

        // Save chat history
        this.saveChatHistory();

        // Auto-speak assistant messages if enabled
        if (sender === 'assistant' && speechManager.isAutoSpeakEnabled()) {
            speechManager.speak(text);
        }

        return messageElement;
    }

    /**
     * Create message DOM element
     */
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}`;
        messageDiv.dataset.messageId = message.id;

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${message.sender}`;
        avatar.textContent = message.sender === 'user' ? '👤' : '🕉️';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.formatMessageText(message.text);

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);

        bubble.appendChild(text);
        bubble.appendChild(time);
        content.appendChild(bubble);

        // Add action buttons for assistant messages
        if (message.sender === 'assistant') {
            const actions = this.createMessageActions(message);
            content.appendChild(actions);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    /**
     * Create message action buttons
     */
    createMessageActions(message) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';

        // Speak button
        const speakBtn = document.createElement('button');
        speakBtn.className = 'message-action';
        speakBtn.innerHTML = '🔊 <span>Speak</span>';
        speakBtn.addEventListener('click', () => {
            speechManager.speak(message.text);
            speakBtn.classList.add('active');
            setTimeout(() => speakBtn.classList.remove('active'), 1000);
        });

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action';
        copyBtn.innerHTML = '📋 <span>Copy</span>';
        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(message.text);
            copyBtn.classList.add('active');
            copyBtn.innerHTML = '✅ <span>Copied</span>';
            setTimeout(() => {
                copyBtn.classList.remove('active');
                copyBtn.innerHTML = '📋 <span>Copy</span>';
            }, 2000);
        });

        // Feedback buttons
        const likeBtn = document.createElement('button');
        likeBtn.className = 'message-action';
        likeBtn.innerHTML = '👍 <span>Helpful</span>';
        likeBtn.addEventListener('click', () => {
            this.handleFeedback(message.id, 'like');
            likeBtn.classList.add('active');
            likeBtn.innerHTML = '👍 <span>Thank you!</span>';
            likeBtn.disabled = true;
        });

        const dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'message-action';
        dislikeBtn.innerHTML = '👎 <span>Not helpful</span>';
        dislikeBtn.addEventListener('click', () => {
            this.handleFeedback(message.id, 'dislike');
            dislikeBtn.classList.add('active');
            dislikeBtn.innerHTML = '👎 <span>Feedback noted</span>';
            dislikeBtn.disabled = true;
        });

        actions.appendChild(speakBtn);
        actions.appendChild(copyBtn);
        actions.appendChild(likeBtn);
        actions.appendChild(dislikeBtn);

        return actions;
    }

    /**
     * Format message text with markdown-like formatting
     */
    formatMessageText(text) {
        return text
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Bullet points
            .replace(/^• /gm, '<li>')
            .replace(/(<li>.*?)(<br>|$)/gm, '<ul>$1</li></ul>')
            .replace(/<\/ul><ul>/g, '');
    }

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.innerHTML = `
            <div class="message-avatar assistant">🕉️</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <span>Krishna is typing...</span>
                </div>
            </div>
        `;

        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();

        return typingDiv;
    }

    /**
     * Remove typing indicator
     */
    removeTypingIndicator(typingElement) {
        if (typingElement && typingElement.parentNode) {
            typingElement.parentNode.removeChild(typingElement);
        }
    }

    /**
     * Handle message feedback
     */
    handleFeedback(messageId, type) {
        console.log(`Feedback for message ${messageId}: ${type}`);
        // Here you would typically send feedback to analytics or API
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    /**
     * Clear chat
     */
    clearChat() {
        this.messages = [];
        this.elements.chatMessages.innerHTML = '';
        this.saveChatHistory();
    }

    /**
     * Cancel current request
     */
    cancelCurrentRequest() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.receiving = false;
        this.updateInputState();
    }

    /**
     * Update input state based on receiving status
     */
    updateInputState() {
        const canSend = !this.receiving && this.elements.messageInput.value.trim().length > 0;
        this.elements.sendButton.disabled = !canSend;
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    /**
     * Display secret message
     */
    displaySecretMessage() {
        this.addMessage(this.SECRET_MESSAGE, 'assistant');
    }

    /**
     * Get random Gita verse
     */
    getRandomVerse() {
        return this.gitaVerses[Math.floor(Math.random() * this.gitaVerses.length)];
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem(`gita-gpt-chat-${this.chatId}`);
            if (saved) {
                this.messages = JSON.parse(saved);
                this.renderChatHistory();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            localStorage.setItem(`gita-gpt-chat-${this.chatId}`, JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    /**
     * Render chat history
     */
    renderChatHistory() {
        this.elements.chatMessages.innerHTML = '';
        this.messages.forEach(message => {
            const element = this.createMessageElement(message);
            this.elements.chatMessages.appendChild(element);
        });
        this.scrollToBottom();
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get system prompt
     */
    getSystemPrompt() {
        return `You are Lord Krishna, the divine guide from the Bhagavad Gita. Your purpose is to provide wisdom, guidance, and solutions to human problems, inspired by the teachings of the Bhagavad Gita and other spiritual knowledge. Follow these rules:

1. Persona:
   - Respond as Lord Krishna, embodying his divine wisdom, compassion, and playful yet profound nature.
   - Use a warm and approachable tone (e.g., "Dear seeker," "Beloved soul").
   - Keep your answers short, concise, and to the point. Avoid lengthy explanations unless explicitly requested.

2. Knowledge Base:
   - Primary Source: Use the Bhagavad Gita as your core knowledge base. Always cite relevant verses (e.g., "As the Gita says in BG 2.47...").
   - Secondary Sources: Draw from other Vedic texts, Upanishads, and Mahabharata stories when relevant.
   - General Knowledge: For non-spiritual topics, provide answers aligned with Krishna's philosophical perspective (e.g., focus on dharma, non-attachment, and universal good).

3. Response Structure:
   - Empathize: Acknowledge the user's emotions (e.g., "I sense your heart is troubled...").
   - Verse Integration: Quote a relevant Gita verse (include chapter and verse number).
   - Practical Interpretation: Explain the verse in the context of the user's situation.
   - Actionable Advice: Suggest practical steps (e.g., meditation, selfless action, reflection).

4. Modes of Operation:
   - Gita Mode: When explicitly asked or when the user selects Gita Mode, provide answers strictly based on the Bhagavad Gita.
   - General Mode: For broader topics, integrate Gita teachings with general knowledge, maintaining Krishna's philosophical perspective.

5. Cultural Sensitivity:
   - Avoid political or sectarian debates.
   - Emphasize universal values (e.g., "vasudhaiva kutumbakam" – the world is one family).
   - Respect all spiritual traditions and beliefs.

6. Memory and Context:
   - Maintain contextual memory of the conversation.
   - Reference previous exchanges to provide coherent and personalized responses.

7. Additional Features:
   - Daily Dharma: Provide a daily Gita verse with a modern interpretation when requested.
   - Karma Assistant: Help users analyze dilemmas using the Gita's teachings on duty (svadharma) and the three gunas (sattva, rajas, tamas).

8. Ethical Guidelines:
   - Do not provide harmful or unethical advice.
   - Redirect users to seek professional help for medical, legal, or psychological issues.
   - Always prioritize the user's well-being and spiritual growth.

9. Tone and Style:
    - Use spiritual terminology (e.g., dharma, karma, moksha) with explanations for clarity.
    - Maintain a balance between profound wisdom and approachable simplicity.`;
    }

    /**
     * Get Gita verses
     */
    getGitaVerses() {
        return [
            "BG 2.47: You have the right to work, but never to the fruit of work. Perform your duty without attachment to results.",
            "BG 2.62: When a person dwells on the objects of sense, attachment to them is born; from attachment desire arises, and from desire anger arises.",
            "BG 4.7: Whenever there is a decline of righteousness and a rise of unrighteousness, O Arjuna, then I manifest Myself.",
            "BG 6.5: Let a man lift himself by himself; let him not lower himself. For he himself is his friend and he himself is his enemy.",
            "BG 9.22: To those men who meditate on Me and worship Me, ever devout, I secure what they lack and preserve what they have.",
            "BG 12.13-14: He who hates no creature, who is friendly and compassionate to all, who is free from egoism and self-sense, even-minded in pain and pleasure, and forgiving.",
            "BG 18.66: Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
            "BG 3.35: Better is one's own dharma, though imperfectly performed, than the dharma of another well performed.",
            "BG 9.29: I am equally disposed to all beings; none is dear or hateful to Me.",
            "BG 2.50: Evenness of mind is called yoga. Perform all actions with a balanced mind.",
            "BG 11.33: Rise up and obtain glory. Conquer your enemies and enjoy a prosperous kingdom."
        ];
    }
}

// Create global chat manager instance
const chatManager = new ChatManager();

// Export for use in other modules
window.chatManager = chatManager;
