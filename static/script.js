class CreativeGenerator {
    constructor() {
        this.form = document.getElementById('generatorForm');
        this.generateBtn = document.getElementById('generateBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.outputCard = document.getElementById('outputCard');
        this.errorCard = document.getElementById('errorCard');
        this.btnLoader = document.getElementById('btnLoader');
        
        this.lastRequest = null;
        this.isGenerating = false;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.regenerateBtn.addEventListener('click', () => this.handleRegenerate());
        
        // Advanced options toggle
        const advancedToggle = document.getElementById('advancedToggle');
        const advancedOptions = document.getElementById('advancedOptions');
        advancedToggle.addEventListener('click', () => this.toggleAdvancedOptions());
        
        // Style selection change
        const styleSelect = document.getElementById('style');
        styleSelect.addEventListener('change', () => this.handleStyleChange());
        
        // Content type change
        const contentTypeRadios = document.querySelectorAll('input[name="contentType"]');
        contentTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleContentTypeChange());
        });
        
        // Add input animations
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                e.target.parentElement.classList.remove('focused');
            });
        });
    }

    toggleAdvancedOptions() {
        const toggleBtn = document.getElementById('advancedToggle');
        const advancedOptions = document.getElementById('advancedOptions');
        
        if (advancedOptions.classList.contains('hidden')) {
            advancedOptions.classList.remove('hidden');
            setTimeout(() => {
                advancedOptions.classList.add('show');
            }, 10);
            toggleBtn.classList.add('active');
        } else {
            advancedOptions.classList.remove('show');
            toggleBtn.classList.remove('active');
            setTimeout(() => {
                advancedOptions.classList.add('hidden');
            }, 300);
        }
    }

    handleStyleChange() {
        const styleSelect = document.getElementById('style');
        const customStyleGroup = document.getElementById('customStyleGroup');
        
        if (styleSelect.value === 'custom') {
            customStyleGroup.style.display = 'flex';
            customStyleGroup.style.flexDirection = 'column';
            customStyleGroup.style.gap = '0.5rem';
        } else {
            customStyleGroup.style.display = 'none';
        }
    }

    handleContentTypeChange() {
        const contentType = document.querySelector('input[name="contentType"]:checked').value;
        const lengthLabel = document.getElementById('lengthLabel');
        const lengthHelp = document.getElementById('lengthHelp');
        const authorLabel = document.getElementById('authorLabel');
        const authorHelp = document.getElementById('authorHelp');
        const lengthInput = document.getElementById('length');
        
        if (contentType === 'poem') {
            lengthLabel.textContent = 'Number of Lines';
            lengthHelp.textContent = 'Recommended: 12-16 lines for poems';
            lengthInput.placeholder = '12';
            lengthInput.min = '4';
            lengthInput.max = '50';
            lengthInput.step = '1';
            
            authorLabel.textContent = 'Poet Style';
            authorHelp.textContent = 'Write in the style of this poet';
        } else {
            lengthLabel.textContent = 'Number of Words';
            lengthHelp.textContent = 'Recommended: 150-200 words for stories';
            lengthInput.placeholder = '150';
            lengthInput.min = '50';
            lengthInput.max = '1000';
            lengthInput.step = '10';
            
            authorLabel.textContent = 'Author Style';
            authorHelp.textContent = 'Write in the style of this author';
        }
    }

    async handleGenerate(event) {
        event.preventDefault();
        
        if (this.isGenerating) return;
        
        const formData = new FormData(this.form);
        
        // Get basic fields
        let style = formData.get('style');
        if (style === 'custom') {
            const customStyle = formData.get('customStyle');
            if (!customStyle || !customStyle.trim()) {
                this.showError('Please enter a custom style');
                return;
            }
            style = customStyle.trim();
        }
        
        // Handle length field - convert to integer or null
        const lengthValue = formData.get('length');
        const length = lengthValue && lengthValue.trim() ? parseInt(lengthValue) : null;
        
        // Handle author field - convert empty string to null
        const authorValue = formData.get('author');
        const author = authorValue && authorValue.trim() ? authorValue.trim() : null;
        
        const request = {
            topic: formData.get('topic').trim(),
            style: style,
            content_type: formData.get('contentType'),
            // Advanced options
            language: formData.get('language') || 'english',
            length: length,
            author: author
        };

        // Validate required fields
        if (!request.topic || !request.style || !request.content_type) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.lastRequest = request;
        await this.generateContent(request);
    }

    async handleRegenerate() {
        if (!this.lastRequest || this.isGenerating) return;
        await this.generateContent(this.lastRequest);
    }

    async generateContent(request) {
        this.setLoadingState(true);
        this.hideCards();

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (response.status === 422) {
                        // Handle validation errors
                        if (errorData.detail && Array.isArray(errorData.detail)) {
                            errorMessage = errorData.detail.map(err => err.msg).join(', ');
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else {
                            errorMessage = 'Validation error. Please check your input values.';
                        }
                    } else {
                        errorMessage = errorData.detail || errorMessage;
                    }
                } catch (e) {
                    // If we can't parse the error response, use the status
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            this.showOutput(data);
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.isGenerating = loading;
        
        if (loading) {
            this.generateBtn.classList.add('loading');
            this.generateBtn.disabled = true;
            this.regenerateBtn.disabled = true;
        } else {
            this.generateBtn.classList.remove('loading');
            this.generateBtn.disabled = false;
            this.regenerateBtn.disabled = false;
        }
    }

    showOutput(data) {
        // Update content
        document.getElementById('outputContent').textContent = data.content;
        document.getElementById('outputTitle').textContent = 
            `Your ${data.content_type.charAt(0).toUpperCase() + data.content_type.slice(1)}`;
        document.getElementById('outputMeta').textContent = 
            `${this.getStyleEmoji(data.style)} ${data.style.charAt(0).toUpperCase() + data.style.slice(1)} ${data.content_type} about "${data.topic}"`;

        // Show card with animation
        this.outputCard.classList.remove('hidden');
        setTimeout(() => {
            this.outputCard.classList.add('show');
        }, 100);

        // Add typewriter effect for content
        this.typewriterEffect(document.getElementById('outputContent'), data.content);
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.errorCard.classList.remove('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.errorCard.classList.add('hidden');
        }, 5000);
    }

    hideCards() {
        this.outputCard.classList.remove('show');
        this.errorCard.classList.add('hidden');
        
        setTimeout(() => {
            this.outputCard.classList.add('hidden');
        }, 300);
    }

    getErrorMessage(error) {
        if (error.message.includes('API key')) {
            return 'API key not configured. Please check your Gemini API key.';
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        if (error.message.includes('500')) {
            return 'Server error. Please try again in a moment.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    getStyleEmoji(style) {
        const emojis = {
            funny: '😄',
            scary: '👻',
            romantic: '💕',
            mysterious: '🔍',
            adventurous: '⚡',
            heartwarming: '🌟'
        };
        return emojis[style] || '✨';
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        
        const typeChar = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, 20);
            }
        };
        
        typeChar();
    }
}

// Utility functions for enhanced UX
function addParticleEffect() {
    const generateBtn = document.getElementById('generateBtn');
    
    generateBtn.addEventListener('click', function(e) {
        if (this.disabled) return;
        
        // Create particle effect
        for (let i = 0; i < 6; i++) {
            createParticle(e.clientX, e.clientY);
        }
    });
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: #667eea;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${x}px;
        top: ${y}px;
    `;
    
    document.body.appendChild(particle);
    
    // Animate particle
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const duration = 800 + Math.random() * 400;
    
    particle.animate([
        { 
            transform: 'translate(0, 0) scale(1)',
            opacity: 1 
        },
        { 
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
            opacity: 0 
        }
    ], {
        duration: duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => {
        document.body.removeChild(particle);
    };
}

// Add floating animation to cards
function addFloatingAnimation() {
    const cards = document.querySelectorAll('.input-section, .output-card');
    
    cards.forEach((card, index) => {
        card.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    });
}

// Add CSS for floating animation
const floatingCSS = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
`;

const style = document.createElement('style');
style.textContent = floatingCSS;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CreativeGenerator();
    addParticleEffect();
    
    // Add some delay for the floating animation to make it more noticeable
    setTimeout(addFloatingAnimation, 1000);
    
    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.form-group').forEach(el => {
        observer.observe(el);
    });
});

// Add fadeInUp animation CSS
const fadeInUpCSS = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const fadeStyle = document.createElement('style');
fadeStyle.textContent = fadeInUpCSS;
document.head.appendChild(fadeStyle);
