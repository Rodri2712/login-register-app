<template>
  <div class="form recover-mode">
    <h1>{{ $t('recovery.title') }}</h1>

    <form @submit.prevent="handleRecovery">
      <div class="input-group">
        <div class="input-box">
          <input
              type="text"
              v-model="formData.username"
              name="username"
              autocomplete="username"
              required
              :class="{ 'input-error': errors.username }"
              @focus="clearError('username')"
          >
          <label>{{ $t('recovery.username') }}</label>
          <i class="fas fa-user"></i>
          <transition name="error-shake">
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              type="email"
              v-model="formData.email"
              name="email"
              autocomplete="email"
              required
              :class="{ 'input-error': errors.email }"
              @focus="clearError('email')"
          >
          <label>{{ $t('recovery.email') }}</label>
          <i class="fas fa-envelope"></i>
          <transition name="error-shake">
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="formData.newPassword"
              name="new-password"
              autocomplete="new-password"
              required
              :class="{ 'input-error': errors.newPassword }"
              @focus="clearError('newPassword')"
          >
          <label>{{ $t('recovery.new_password') }}</label>
          <div class="password-toggle" @click="toggleNewPassword">
            <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </div>
          <transition name="error-shake">
            <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              name="confirm-password"
              autocomplete="off"
              required
              :class="{ 'input-error': errors.confirmPassword }"
              @focus="clearError('confirmPassword')"
          >
          <label>{{ $t('recovery.confirm_password') }}</label>
          <div class="password-toggle" @click="toggleConfirmPassword">
            <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </div>
          <transition name="error-shake">
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </transition>
        </div>

        <div v-if="formData.newPassword" class="password-strength">
          <span class="strength-text" :class="strengthClass">{{ strengthText }}</span>
        </div>
      </div>

      <button class="btn" :disabled="loading || !isFormValid">
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        {{ loading ? $t('recovery.changing') : $t('recovery.button') }}
      </button>

      <div class="form-links">
        <a href="#" @click.prevent="$emit('back')">
          ← {{ $t('recovery.back_to_login') }}
        </a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['back', 'recovery-success', 'password-changed', 'show-message'])

const formData = reactive({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

const errors = reactive({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

const strengthClass = computed(() => {
  const score = getPasswordStrength(formData.newPassword)
  if (score < 2) return 'weak'
  if (score < 4) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const score = getPasswordStrength(formData.newPassword)
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

const isFormValid = computed(() => {
  return formData.username &&
      formData.email &&
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword &&
      formData.newPassword.length >= 6 &&
      !errors.username &&
      !errors.email &&
      !errors.newPassword &&
      !errors.confirmPassword
})

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const clearError = (field) => {
  errors[field] = ''
}

const validateForm = () => {
  let isValid = true

  if (!formData.username.trim()) {
    errors.username = t('errors.username_required')
    isValid = false
  } else if (formData.username.length < 3) {
    errors.username = t('errors.username_min')
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    errors.email = t('errors.email_required')
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = t('errors.email_invalid')
    isValid = false
  }

  if (!formData.newPassword) {
    errors.newPassword = t('errors.password_required')
    isValid = false
  } else if (formData.newPassword.length < 6) {
    errors.newPassword = t('errors.password_min')
    isValid = false
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = t('errors.confirm_password_required')
    isValid = false
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = t('errors.password_mismatch')
    isValid = false
  }

  return isValid
}

const handleRecovery = async () => {
  if (!validateForm()) return

  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  const userIndex = props.users.findIndex(
      u => u.username === formData.username && u.email === formData.email
  )

  if (userIndex === -1) {
    errors.username = t('errors.user_not_found')
    loading.value = false
    return
  }

  const updatedUser = {
    ...props.users[userIndex],
    password: formData.newPassword
  }

  emit('password-changed', { index: userIndex, user: updatedUser })
  emit('recovery-success', formData.username)

  formData.username = ''
  formData.email = ''
  formData.newPassword = ''
  formData.confirmPassword = ''

  loading.value = false
  emit('back')
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