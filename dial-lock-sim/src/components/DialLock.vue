<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const targetPassword = ref([20, 40, 60])
const enteredDigits = ref([])
const rotation = ref(0)
const smoothedRotation = ref(0)
const currentNumber = ref(0)
const isDragging = ref(false)
const lastAngle = ref(0)
const isUnlocked = ref(false)
const showClickWave = ref(false)
const showSuccess = ref(false)
const confettiPieces = ref([])
const direction = ref(1)
const lastDirectionChange = ref(0)
const statusMessage = ref('')
const statusType = ref('')

const dialWrapper = ref(null)
const NUMBERS_COUNT = 100

const numbers = computed(() => {
  return Array.from({ length: NUMBERS_COUNT }, (_, i) => i)
})

const getAngle = (event) => {
  const rect = dialWrapper.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
}

const startDrag = (event) => {
  if (isUnlocked.value) return
  isDragging.value = true
  lastAngle.value = getAngle(event)
}

const drag = (event) => {
  if (!isDragging.value || isUnlocked.value) return
  
  const currentAngle = getAngle(event)
  let angleDiff = currentAngle - lastAngle.value
  
  if (angleDiff > 180) angleDiff -= 360
  if (angleDiff < -180) angleDiff += 360
  
  const newDirection = angleDiff > 0 ? 1 : -1
  if (direction.value !== newDirection && Date.now() - lastDirectionChange.value > 500) {
    direction.value = newDirection
    lastDirectionChange.value = Date.now()
  }
  
  rotation.value += angleDiff
  
  const smoothFactor = 0.3
  smoothedRotation.value = smoothedRotation.value * (1 - smoothFactor) + rotation.value * smoothFactor
  
  const normalizedRotation = ((smoothedRotation.value % 360) + 360) % 360
  const degreesPerNumber = 360 / NUMBERS_COUNT
  const visualNumber = Math.round((360 - normalizedRotation) / degreesPerNumber) % NUMBERS_COUNT
  
  if (visualNumber !== currentNumber.value) {
    currentNumber.value = visualNumber
    showClickWave.value = true
    setTimeout(() => showClickWave.value = false, 300)
  }
  
  lastAngle.value = currentAngle
}

const endDrag = () => {
  isDragging.value = false
}

const confirmNumber = () => {
  if (isUnlocked.value) return
  
  enteredDigits.value.push(currentNumber.value)
  
  if (enteredDigits.value.length === targetPassword.value.length) {
    const isCorrect = enteredDigits.value.every(
      (digit, index) => Math.abs(digit - targetPassword.value[index]) <= 2
    )
    
    if (isCorrect) {
      isUnlocked.value = true
      showSuccess.value = true
      statusMessage.value = '解锁成功！'
      statusType.value = 'success'
      generateConfetti()
    } else {
      statusMessage.value = '密码错误，请重试'
      statusType.value = 'error'
      setTimeout(() => {
        enteredDigits.value = []
        statusMessage.value = ''
      }, 1500)
    }
  }
}

const resetLock = () => {
  enteredDigits.value = []
  rotation.value = 0
  smoothedRotation.value = 0
  currentNumber.value = 0
  isUnlocked.value = false
  showSuccess.value = false
  confettiPieces.value = []
  statusMessage.value = ''
}

const generateConfetti = () => {
  const colors = ['#4ecdc4', '#ff6b6b', '#ffe66d', '#95e1d3', '#f38181']
  confettiPieces.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2
  }))
}

const updatePassword = (index, value) => {
  const num = parseInt(value) || 0
  targetPassword.value[index] = Math.min(Math.max(num, 0), 99)
  resetLock()
}

onMounted(() => {
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('touchend', endDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', drag)
  window.removeEventListener('touchend', endDrag)
})
</script>

<template>
  <div class="container has-text-centered">
    <h1 class="title">转盘密码锁</h1>
    <p class="subtitle">Dial Lock Simulator</p>
    
    <div class="lock-container">
      <div :class="['shackle', { unlocked: isUnlocked }]"></div>
      
      <div class="lock-body">
        <div 
          ref="dialWrapper"
          class="dial-wrapper"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <div class="indicator"></div>
          
          <div 
            class="dial"
            :style="{ transform: `rotate(${rotation}deg)` }"
          >
            <div class="dial-face">
              <div 
                v-for="n in numbers" 
                :key="n"
                :class="['dial-number', { active: n === currentNumber }]"
                :style="{ transform: `rotate(${n * (360 / NUMBERS_COUNT)}deg)` }"
              >
                {{ n }}
              </div>
              
              <div 
                v-for="n in 40" 
                :key="'tick-' + n"
                :class="['dial-tick', { major: n % 4 === 0 }]"
                :style="{ transform: `rotate(${n * 9}deg)` }"
              ></div>
            </div>
            
            <div class="center-knob">
              {{ direction > 0 ? '→' : '←' }}
            </div>
          </div>
          
          <div class="dial-feedback">
            <div v-if="showClickWave" class="click-wave"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="password-display">
      <div class="current-number">{{ String(currentNumber).padStart(2, '0') }}</div>
      <div class="entered-code">
        <div 
          v-for="(_, index) in targetPassword" 
          :key="index"
          :class="['code-digit', { filled: enteredDigits[index] !== undefined }]"
        >
          {{ enteredDigits[index] !== undefined ? String(enteredDigits[index]).padStart(2, '0') : '--' }}
        </div>
      </div>
    </div>
    
    <div class="buttons is-centered" style="margin-top: 20px;">
      <button 
        class="button is-primary is-medium"
        @click="confirmNumber"
        :disabled="isUnlocked || enteredDigits.length >= targetPassword.length"
      >
        <span class="icon"><i>✓</i></span>
        <span>确认数字 ({{ enteredDigits.length }}/{{ targetPassword.length }})</span>
      </button>
      <button 
        class="button is-warning is-medium"
        @click="resetLock"
      >
        <span class="icon"><i>↻</i></span>
        <span>重置</span>
      </button>
    </div>
    
    <div class="instructions">
      <p>🔄 拖动转盘旋转 | 转到目标数字后点击"确认"</p>
      <p>💡 提示：机械密码锁需要精确对齐数字！</p>
    </div>
    
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>
    
    <div class="control-panel">
      <h3 class="is-size-5 has-text-white has-text-weight-bold mb-4">自定义密码</h3>
      <div class="password-inputs">
        <input 
          v-for="(_, index) in targetPassword"
          :key="'input-' + index"
          type="number"
          min="0"
          max="99"
          v-model="targetPassword[index]"
          @input="updatePassword(index, $event.target.value)"
          class="password-input"
        />
      </div>
      <p class="has-text-grey is-size-7">设置您的密码 (0-99)</p>
    </div>
    
    <div v-if="showSuccess" class="success-overlay" @click="showSuccess = false">
      <div class="success-content" @click.stop>
        <div class="success-icon">🔓</div>
        <h2 class="is-size-2 has-text-white has-text-weight-bold mb-4">解锁成功！</h2>
        <p class="is-size-5 has-text-white mb-5">密码正确，锁已打开</p>
        <button class="button is-primary is-large" @click="resetLock">
          <span class="icon"><i>🔒</i></span>
          <span>重新上锁</span>
        </button>
      </div>
      
      <div 
        v-for="piece in confettiPieces"
        :key="piece.id"
        class="confetti"
        :style="{
          left: piece.left + '%',
          backgroundColor: piece.color,
          animationDelay: piece.delay + 's',
          animationDuration: piece.duration + 's'
        }"
      ></div>
    </div>
  </div>
</template>
