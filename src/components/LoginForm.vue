<template>
  <div class="form">
    <h1>{{ $t('login.title') }}</h1>

    <form @submit.prevent="handleLogin">
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
          <label>{{ $t('login.username') }}</label>
          <i class="fas fa-user"></i>
          <transition name="error-shake">
            <span v-if="errors.user" class="error-message">{{ errors.user }}</span>
          </transition>
        </div>

        <div class="input-box">
          <input
              :type="showPassword ? 'text' : 'password'"
              v-model="pass"
              name="password"
              autocomplete="current-password"
              required
              :class="{ 'input-error': errors.pass }"
              @focus="clearError('pass')"
          >
          <label>{{ $t('login.password') }}</label>
          <div class="password-toggle" @click="togglePassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </div>
          <transition name="error-shake">
            <span v-if="errors.pass" class="error-message">{{ errors.pass }}</span>
          </transition>
        </div>
      </div>

      <div class="form-links">
        <a href="#" @click.prevent="$emit('go-recovery')">{{ $t('login.forgot_password') }}</a>
      </div>

      <button class="btn" :disabled="loading">
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        {{ loading ? $t('login.logging_in') : $t('login.button') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  transferCredentials: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['go-register', 'go-recovery', 'login-success', 'show-message'])

const user = ref('')
const pass = ref('')
const showPassword = ref(false)
const loading = ref(false)

const errors = ref({
  user: '',
  pass: ''
})

// Escuchar credenciales transferidas desde RegisterForm
watch(() => props.transferCredentials, (newCredentials) => {
  if (newCredentials && newCredentials.username && newCredentials.password) {
    user.value = newCredentials.username
    pass.value = newCredentials.password
  }
}, { immediate: true, deep: true })

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

  if (!pass.value) {
    errors.value.pass = t('errors.password_required')
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 600))

  const foundUser = props.users.find(u => u.username === user.value)

  if (!foundUser) {
    errors.value.user = t('errors.username_not_found')
    loading.value = false
    return
  }

  if (foundUser.password !== pass.value) {
    errors.value.pass = t('errors.password_incorrect')
    loading.value = false
    return
  }

  emit('login-success', user.value)
  user.value = ''
  pass.value = ''

  loading.value = false
}
</script>

<style scoped>
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