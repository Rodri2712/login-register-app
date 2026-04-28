<template>
  <div class="form">
    <h1>{{ $t('register.title') }}</h1>

    <form @submit.prevent="handleRegister">
      <div class="input-group">
        <div class="input-box">
          <input
              v-model="user"
              type="text"
              name="username"
              autocomplete="username"
              required
              :class="{ 'input-error': errors.user }"
              @focus="clearError('user')"
          >
          <label>{{ $t('register.username') }}</label>
          <i class="fas fa-user"></i>
          <transition name="error-shake">
            <span v-if="errors.user" class="error-message">{{ errors.user }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              required
              :class="{ 'input-error': errors.email }"
              @focus="clearError('email')"
          >
          <label>{{ $t('register.email') }}</label>
          <i class="fas fa-envelope"></i>
          <transition name="error-shake">
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              :type="showPassword ? 'text' : 'password'"
              v-model="pass"
              name="password"
              autocomplete="new-password"
              required
              :class="{ 'input-error': errors.pass }"
              @focus="clearError('pass')"
          >
          <label>{{ $t('register.password') }}</label>
          <div class="password-toggle" @click="togglePassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </div>
          <transition name="error-shake">
            <span v-if="errors.pass" class="error-message">{{ errors.pass }}</span>
          </transition>
        </div>

        <div v-if="pass" class="password-strength">
          <span class="strength-text" :class="strengthClass">{{ strengthText }}</span>
        </div>
      </div>

      <button class="btn" :disabled="loading">
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        {{ loading ? $t('register.creating') : $t('register.button') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['go-login', 'register-success', 'user-registered', 'transfer-credentials', 'show-message'])

const user = ref('')
const email = ref('')
const pass = ref('')
const showPassword = ref(false)
const loading = ref(false)

const errors = ref({
  user: '',
  email: '',
  pass: ''
})

const strengthClass = computed(() => {
  const score = getPasswordStrength(pass.value)
  if (score < 2) return 'weak'
  if (score < 4) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const score = getPasswordStrength(pass.value)
  if (score < 2) return t('password_strength.weak')
  if (score < 4) return t('password_strength.medium')
  return t('password_strength.strong')
})

const getPasswordStrength = (password) => {
  let score = 0
  if (password.length >= 8) score++
  if (password.match(/[a-z]/)) score++
  if (password.match(/[A-Z]/)) score++
  if (password.match(/[0-9]/)) score++
  if (password.match(/[^a-zA-Z0-9]/)) score++
  return score
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const clearError = (field) => {
  errors.value[field] = ''
}

const validateForm = () => {
  let isValid = true

  if (!user.value.trim()) {
    errors.value.user = t('errors.username_required')
    isValid = false
  } else if (user.value.length < 3) {
    errors.value.user = t('errors.username_min')
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.value.email = t('errors.email_required')
    isValid = false
  } else if (!emailRegex.test(email.value)) {
    errors.value.email = t('errors.email_invalid')
    isValid = false
  }

  if (!pass.value) {
    errors.value.pass = t('errors.password_required')
    isValid = false
  } else if (pass.value.length < 6) {
    errors.value.pass = t('errors.password_min')
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  const newUser = {
    id: Date.now(),
    username: user.value,
    email: email.value,
    password: pass.value
  }

  emit('transfer-credentials', {
    username: user.value,
    password: pass.value
  })

  const userRegistered = emit('user-registered', newUser)
  if (userRegistered !== false) {
    emit('register-success', user.value)

    user.value = ''
    email.value = ''
    pass.value = ''
  }

  loading.value = false
}
</script>

<style scoped>
.password-strength { margin-top: 2px; text-align: right; }
.strength-text { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }
.strength-text.weak { color: #ff6b6b; }
.strength-text.medium { color: #ffd93d; }
.strength-text.strong { color: #00d4a0; }

.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
.input-error { border-color: #ff6b6b !important; background: #fff8f8 !important; }
.error-message { position: absolute; bottom: -22px; left: 16px; font-size: 10px; font-weight: 600; color: #ff6b6b; letter-spacing: 0.2px; }
.error-shake-enter-active { animation: shake 0.25s ease; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }

.password-toggle {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 10;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle i {
  color: #cbd5e1;
  transition: color 0.2s ease;
  font-size: 16px;
  min-width: 16px;
  text-align: center;
  display: inline-block;
}

.password-toggle:hover i {
  color: #6c8edb;
}

.input-box input:focus ~ .password-toggle i {
  color: #6c8edb;
}
</style>