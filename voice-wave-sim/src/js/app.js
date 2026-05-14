(function() {
  'use strict';

  const config = {
    complexity: 50,
    speed: 50,
    colorScheme: 'neon',
    pitch: 1,
    rate: 1,
    voice: null
  };

  const colorSchemes = {
    neon: {
      primary: '#00d4ff',
      secondary: '#7b2ff7',
      accent: '#f107a3',
      glow: 'rgba(0, 212, 255, 0.3)'
    },
    fire: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ff0000',
      glow: 'rgba(255, 107, 53, 0.3)'
    },
    ocean: {
      primary: '#00b4d8',
      secondary: '#0077b6',
      accent: '#90e0ef',
      glow: 'rgba(0, 180, 216, 0.3)'
    },
    sunset: {
      primary: '#ff6b9d',
      secondary: '#c44569',
      accent: '#f8b500',
      glow: 'rgba(255, 107, 157, 0.3)'
    },
    forest: {
      primary: '#2d6a4f',
      secondary: '#40916c',
      accent: '#95d5b2',
      glow: 'rgba(45, 106, 79, 0.3)'
    }
  };

  let audioContext, analyser, dataArray;
  let isSpeaking = false;
  let animationId = null;
  let canvas, ctx;
  let time = 0;
  let speechStartTime = 0;
  let simulatedAudioData = [];
  let textCharacterCount = 0;

  const elements = {
    textInput: document.getElementById('textInput'),
    speakBtn: document.getElementById('speakBtn'),
    stopBtn: document.getElementById('stopBtn'),
    complexity: document.getElementById('complexity'),
    complexityValue: document.getElementById('complexityValue'),
    speed: document.getElementById('speed'),
    speedValue: document.getElementById('speedValue'),
    colorScheme: document.getElementById('colorScheme'),
    voiceType: document.getElementById('voiceType'),
    pitch: document.getElementById('pitch'),
    pitchValue: document.getElementById('pitchValue'),
    rate: document.getElementById('rate'),
    rateValue: document.getElementById('rateValue'),
    statusText: document.getElementById('statusText'),
    waveCanvas: document.getElementById('waveCanvas')
  };

  function init() {
    setupCanvas();
    setupAudioContext();
    loadVoices();
    setupEventListeners();
    startIdleAnimation();
  }

  function setupCanvas() {
    canvas = elements.waveCanvas;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function setupAudioContext() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }

  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    populateVoiceList(voices);
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = function() {
        const voices = speechSynthesis.getVoices();
        populateVoiceList(voices);
      };
    }
  }

  function populateVoiceList(voices) {
    elements.voiceType.innerHTML = '';
    
    const chineseVoices = voices.filter(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    );
    
    const englishVoices = voices.filter(voice => 
      voice.lang.includes('en')
    );
    
    const otherVoices = voices.filter(voice => 
      !voice.lang.includes('zh') && !voice.lang.includes('CN') && !voice.lang.includes('en')
    );
    
    const allVoices = [...chineseVoices, ...englishVoices, ...otherVoices];
    
    allVoices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.textContent = `${voice.name} (${voice.lang})`;
      option.value = index;
      option.setAttribute('data-name', voice.name);
      elements.voiceType.appendChild(option);
    });
    
    if (chineseVoices.length > 0) {
      config.voice = chineseVoices[0];
    } else if (voices.length > 0) {
      config.voice = voices[0];
    }
  }

  function setupEventListeners() {
    elements.speakBtn.addEventListener('click', speak);
    elements.stopBtn.addEventListener('click', stopSpeech);
    
    elements.complexity.addEventListener('input', function() {
      config.complexity = parseInt(this.value);
      elements.complexityValue.textContent = this.value;
    });
    
    elements.speed.addEventListener('input', function() {
      config.speed = parseInt(this.value);
      elements.speedValue.textContent = this.value;
    });
    
    elements.colorScheme.addEventListener('change', function() {
      config.colorScheme = this.value;
    });
    
    elements.voiceType.addEventListener('change', function() {
      const voices = speechSynthesis.getVoices();
      config.voice = voices[this.value] || voices[0];
    });
    
    elements.pitch.addEventListener('input', function() {
      config.pitch = parseFloat(this.value);
      elements.pitchValue.textContent = this.value;
    });
    
    elements.rate.addEventListener('input', function() {
      config.rate = parseFloat(this.value);
      elements.rateValue.textContent = this.value;
    });
  }

  let currentUtterance = null;
  let isSpeakingInternal = false;

  function speak() {
    const text = elements.textInput.value.trim();
    
    if (!text) {
      updateStatus('请输入要朗读的文字');
      return;
    }
    
    if (isSpeakingInternal || isSpeaking) {
      forceStopSpeech();
      setTimeout(() => {
        doSpeak(text);
      }, 150);
      return;
    }
    
    doSpeak(text);
  }
  
  function doSpeak(text) {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    try {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;
      
      if (config.voice) {
        utterance.voice = config.voice;
      }
      
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      
      utterance.onstart = function() {
        isSpeakingInternal = true;
        isSpeaking = true;
        speechStartTime = Date.now();
        textCharacterCount = text.length;
        updateStatus('正在朗读...');
        startWaveAnimation();
      };
      
      utterance.onend = function() {
        isSpeakingInternal = false;
        isSpeaking = false;
        currentUtterance = null;
        updateStatus('朗读完成');
      };
      
      utterance.onerror = function(event) {
        console.log('Speech event:', event);
        isSpeakingInternal = false;
        isSpeaking = false;
        currentUtterance = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          updateStatus('朗读出错');
        }
      };
      
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech error:', e);
      updateStatus('朗读出错');
      isSpeakingInternal = false;
      isSpeaking = false;
      currentUtterance = null;
    }
  }
  
  function forceStopSpeech() {
    isSpeakingInternal = false;
    isSpeaking = false;
    currentUtterance = null;
    try {
      speechSynthesis.cancel();
    } catch (e) {
      console.log('Cancel error:', e);
    }
  }

  function stopSpeech() {
    forceStopSpeech();
    updateStatus('已停止');
    stopWaveAnimation();
    startIdleAnimation();
  }

  function updateStatus(text) {
    elements.statusText.textContent = text;
  }

  function generateSimulatedAudioData(text) {
    const data = [];
    const charCount = text.length;
    
    for (let i = 0; i < 128; i++) {
      let value = 0;
      
      const baseNoise = Math.random() * 0.3;
      
      const syllableRhythm = Math.sin(i * 0.1 + time * 10) * 0.3 + 0.5;
      
      const wordPause = Math.sin(i * 0.05 + time * 5) * 0.2 + 0.8;
      
      const toneVariation = Math.sin(i * 0.2 + time * 15) * 0.15;
      
      value = baseNoise + syllableRhythm * wordPause + toneVariation;
      value = Math.max(0, Math.min(1, value));
      
      data[i] = value;
    }
    
    return data;
  }

  function getSpeechProgress() {
    if (!isSpeaking) return 0;
    const elapsed = (Date.now() - speechStartTime) / 1000;
    const estimatedDuration = textCharacterCount * 0.08 / config.rate;
    return Math.min(1, elapsed / estimatedDuration);
  }

  function startWaveAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    animateWave();
  }

  function stopWaveAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function startIdleAnimation() {
    time = 0;
    startWaveAnimation();
  }

  function animateWave() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const colors = colorSchemes[config.colorScheme];
    const complexityFactor = config.complexity / 50;
    const speedFactor = config.speed / 50;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    if (isSpeaking) {
      simulatedAudioData = generateSimulatedAudioData(elements.textInput.value);
    }
    
    const waveCount = isSpeaking 
      ? Math.floor(5 * complexityFactor) 
      : Math.floor(3 * complexityFactor);
    
    for (let w = 0; w < waveCount; w++) {
      drawWave(width, height, colors, w, waveCount, complexityFactor, speedFactor);
    }
    
    time += 0.02 * speedFactor * (isSpeaking ? 1.5 : 1);
    
    animationId = requestAnimationFrame(animateWave);
  }

  function drawWave(width, height, colors, waveIndex, waveCount, complexityFactor, speedFactor) {
    ctx.beginPath();
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = isSpeaking ? 4 - (waveIndex * 0.5) : 3 - (waveIndex * 0.5);
    ctx.shadowBlur = isSpeaking ? 25 : 15;
    ctx.shadowColor = colors.glow;
    
    const baseAmplitude = isSpeaking ? (height / 3) : (height / 4);
    const amplitude = baseAmplitude * (1 - waveIndex / waveCount * 0.5);
    const frequency = 0.02 * complexityFactor + waveIndex * 0.005;
    const phase = waveIndex * 0.5 + time * speedFactor * 2;
    
    const step = 2;
    
    for (let x = 0; x <= width; x += step) {
      let y = height / 2;
      
      const waveLayers = Math.floor((isSpeaking ? 5 : 3) * complexityFactor);
      
      for (let i = 1; i <= waveLayers; i++) {
        let layerAmplitude = amplitude / i;
        const layerFrequency = frequency * (1 + i * 0.3);
        const layerPhase = phase * (1 + i * 0.2);
        
        if (isSpeaking && simulatedAudioData && i < simulatedAudioData.length / 10) {
          const audioInfluence = simulatedAudioData[i * 10] || 0;
          layerAmplitude *= (1 + audioInfluence * 2);
          
          const randomJitter = (Math.random() - 0.5) * (height * 0.02) * audioInfluence;
          y += Math.sin(x * layerFrequency + layerPhase) * layerAmplitude + randomJitter;
        } else if (isSpeaking) {
          const speechModulation = 1 + Math.sin(time * 20 + i) * 0.5;
          y += Math.sin(x * layerFrequency + layerPhase) * layerAmplitude * speechModulation;
        } else {
          y += Math.sin(x * layerFrequency + layerPhase) * layerAmplitude;
        }
      }
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
