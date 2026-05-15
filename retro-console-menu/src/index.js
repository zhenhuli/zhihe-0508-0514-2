import './style.css';

class RetroMenu {
    constructor() {
        this.menuItems = document.querySelectorAll('.menu-item');
        this.menuList = document.getElementById('menuList');
        this.feedback = document.getElementById('actionFeedback');
        this.currentIndex = 0;
        this.isAnimating = false;
        this.isSettingsOpen = false;
        this.isHelpOpen = false;
        this.volume = 80;
        this.soundStyle = 'gameboy';
        this.settings = {
            music: true,
            sfx: true,
            difficulty: 'normal',
            fullscreen: false,
            scanlines: true,
            soundStyle: 'gameboy'
        };
        
        this.soundStyles = {
            '8bit': {
                wave: 'square',
                baseFreq: 523,
                moveFreq: 440,
                selectFreq: 880,
                errorFreq: 220,
                duty: 0.5,
                name: '8-BIT NES'
            },
            '16bit': {
                wave: 'sawtooth',
                baseFreq: 659,
                moveFreq: 554,
                selectFreq: 1108,
                errorFreq: 277,
                duty: 0.3,
                name: '16-BIT SNES'
            },
            'gameboy': {
                wave: 'square',
                baseFreq: 440,
                moveFreq: 370,
                selectFreq: 740,
                errorFreq: 185,
                duty: 0.25,
                name: 'GAME BOY'
            },
            'c64': {
                wave: 'triangle',
                baseFreq: 392,
                moveFreq: 330,
                selectFreq: 660,
                errorFreq: 165,
                duty: 0.4,
                name: 'COMMODORE 64'
            },
            'atari': {
                wave: 'sawtooth',
                baseFreq: 349,
                moveFreq: 294,
                selectFreq: 587,
                errorFreq: 147,
                duty: 0.6,
                name: 'ATARI 2600'
            }
        };
        
        this.init();
    }
    
    init() {
        this.selectItem(0);
        this.bindEvents();
        this.playSound('start');
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        this.menuItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.currentIndex = index;
                this.selectItem(index);
                this.confirmSelection();
            });
            
            item.addEventListener('mouseenter', () => {
                this.currentIndex = index;
                this.selectItem(index);
            });
        });
        
        this.bindSettingsEvents();
    }
    
    bindSettingsEvents() {
        const closeSettingsBtn = document.getElementById('closeSettings');
        closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        
        const closeHelpBtn = document.getElementById('closeHelp');
        closeHelpBtn.addEventListener('click', () => this.closeHelp());
        
        const volUp = document.querySelector('[data-action="vol-up"]');
        const volDown = document.querySelector('[data-action="vol-down"]');
        volUp.addEventListener('click', () => this.adjustVolume(10));
        volDown.addEventListener('click', () => this.adjustVolume(-10));
        
        const toggles = [
            { id: 'musicToggle', label: 'musicLabel', key: 'music' },
            { id: 'sfxToggle', label: 'sfxLabel', key: 'sfx' },
            { id: 'fullscreenToggle', label: 'fullscreenLabel', key: 'fullscreen' },
            { id: 'scanlinesToggle', label: 'scanlinesLabel', key: 'scanlines' }
        ];
        
        toggles.forEach(({ id, label, key }) => {
            const toggle = document.getElementById(id);
            const labelEl = document.getElementById(label);
            toggle.addEventListener('change', () => {
                this.settings[key] = toggle.checked;
                labelEl.textContent = toggle.checked ? 'ON' : 'OFF';
                this.playSound('select');
                
                if (key === 'scanlines') {
                    document.querySelector('.scanlines').style.display = toggle.checked ? 'block' : 'none';
                }
                
                if (key === 'fullscreen') {
                    if (toggle.checked) {
                        document.documentElement.requestFullscreen?.();
                    } else {
                        document.exitFullscreen?.();
                    }
                }
            });
        });
        
        const difficultySelect = document.getElementById('difficultySelect');
        difficultySelect.addEventListener('change', () => {
            this.settings.difficulty = difficultySelect.value;
            this.playSound('select');
        });
        
        const soundStyleSelect = document.getElementById('soundStyleSelect');
        soundStyleSelect.addEventListener('change', () => {
            this.soundStyle = soundStyleSelect.value;
            this.settings.soundStyle = this.soundStyle;
            this.playSound('select');
            this.showFeedback(`SOUND: ${this.soundStyles[this.soundStyle].name}`);
        });
        
        document.querySelectorAll('.test-sound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const soundType = btn.dataset.sound;
                this.playSound(soundType);
            });
        });
    }
    
    handleKeydown(e) {
        if (e.key === 'Escape') {
            if (this.isSettingsOpen) {
                this.closeSettings();
            } else if (this.isHelpOpen) {
                this.closeHelp();
            }
            return;
        }
        
        if (this.isAnimating || this.isSettingsOpen || this.isHelpOpen) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.navigateUp();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDown();
                break;
            case 'Enter':
                e.preventDefault();
                this.confirmSelection();
                break;
            case ' ':
                e.preventDefault();
                this.confirmSelection();
                break;
        }
    }
    
    navigateUp() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.selectItem(this.currentIndex);
            this.playSound('move');
        } else {
            this.shakeScreen();
        }
    }
    
    navigateDown() {
        if (this.currentIndex < this.menuItems.length - 1) {
            this.currentIndex++;
            this.selectItem(this.currentIndex);
            this.playSound('move');
        } else {
            this.shakeScreen();
        }
    }
    
    selectItem(index) {
        this.menuItems.forEach(item => item.classList.remove('selected'));
        this.menuItems[index].classList.add('selected');
        
        const selectedItem = this.menuItems[index];
        const container = selectedItem.parentElement;
        const containerRect = container.getBoundingClientRect();
        const itemRect = selectedItem.getBoundingClientRect();
        
        if (itemRect.bottom > containerRect.bottom || itemRect.top < containerRect.top) {
            selectedItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
        
        selectedItem.style.transform = 'translateX(10px) scale(1.02)';
        setTimeout(() => {
            selectedItem.style.transform = 'translateX(10px)';
        }, 100);
    }
    
    confirmSelection() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const selectedItem = this.menuItems[this.currentIndex];
        const menuText = selectedItem.querySelector('.menu-text').textContent;
        
        this.playSound('select');
        
        selectedItem.style.transform = 'translateX(10px) scale(0.95)';
        setTimeout(() => {
            selectedItem.style.transform = 'translateX(10px)';
        }, 150);
        
        if (menuText === 'SETTINGS') {
            this.openSettings();
        } else if (menuText === 'HELP') {
            this.openHelp();
        } else {
            this.showFeedback(menuText);
        }
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }
    
    openSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.classList.add('show');
        this.isSettingsOpen = true;
    }
    
    closeSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.classList.remove('show');
        this.isSettingsOpen = false;
        this.playSound('select');
        this.showFeedback('SETTINGS SAVED');
    }
    
    openHelp() {
        const helpPanel = document.getElementById('helpPanel');
        helpPanel.classList.add('show');
        this.isHelpOpen = true;
    }
    
    closeHelp() {
        const helpPanel = document.getElementById('helpPanel');
        helpPanel.classList.remove('show');
        this.isHelpOpen = false;
        this.playSound('select');
    }
    
    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(100, this.volume + delta));
        const volumeValue = document.getElementById('volumeValue');
        volumeValue.textContent = `${this.volume}%`;
        this.playSound('select');
    }
    
    showFeedback(text) {
        if (text.includes('SAVED')) {
            this.feedback.textContent = text;
        } else {
            this.feedback.textContent = `${text} SELECTED!`;
        }
        this.feedback.classList.add('show');
        
        setTimeout(() => {
            this.feedback.classList.remove('show');
        }, 800);
    }
    
    shakeScreen() {
        const screen = document.querySelector('.crt-screen');
        screen.style.transform = 'translateX(5px)';
        
        setTimeout(() => {
            screen.style.transform = 'translateX(-5px)';
        }, 50);
        
        setTimeout(() => {
            screen.style.transform = 'translateX(0)';
        }, 100);
        
        this.playSound('error');
    }
    
    playSound(type) {
        if (!this.settings.sfx) return;
        
        const style = this.soundStyles[this.soundStyle];
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const volumeMultiplier = this.volume / 100;
        
        switch(type) {
            case 'move':
                this.playTone(audioContext, style.moveFreq, style.wave, 0.08 * volumeMultiplier, 0.06);
                break;
            case 'select':
                this.playChord(audioContext, style.selectFreq, style.wave, 0.12 * volumeMultiplier);
                break;
            case 'error':
                this.playErrorSound(audioContext, style.errorFreq, style.wave, 0.1 * volumeMultiplier);
                break;
            case 'start':
                this.playArpeggio(audioContext, style.baseFreq, style.wave, 0.1 * volumeMultiplier);
                break;
        }
    }
    
    playTone(audioContext, frequency, waveType, volume, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = waveType;
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    playChord(audioContext, baseFreq, waveType, volume) {
        const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
        const duration = 0.15;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = waveType;
                gainNode.gain.value = volume * 0.6;
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + duration);
            }, index * 30);
        });
    }
    
    playErrorSound(audioContext, baseFreq, waveType, volume) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = baseFreq;
        oscillator.type = waveType;
        
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.value = 15;
        lfoGain.gain.value = baseFreq * 0.3;
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.12);
        lfo.stop(audioContext.currentTime + 0.12);
    }
    
    playArpeggio(audioContext, baseFreq, waveType, volume) {
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = waveType;
                gainNode.gain.value = volume * 0.7;
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.12);
            }, index * 80);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RetroMenu();
});
