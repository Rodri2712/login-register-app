<template>
  <div :class="['container', { active: isRegister, recoveryActive: isRecovery }]">

    <!-- LOGIN -->
    <div class="form-container login">
      <LoginForm
          @go-register="goRegister"
          @go-recovery="goRecovery"
          @login-success="handleLoginSuccess"
          :users="users"
          :transferCredentials="credentialsToTransfer"
      />
    </div>

    <!-- REGISTER -->
    <div class="form-container register">
      <RegisterForm
          @go-login="goLogin"
          @register-success="handleRegisterSuccess"
          @user-registered="handleUserRegistered"
          @transfer-credentials="handleTransferCredentials"
          @show-message="showInlineMessage"
      />
    </div>

    <!-- RECOVERY -->
    <div class="form-container recovery">
      <RecoveryForm
          @back="backLogin"
          @recovery-success="handleRecoverySuccess"
          @password-changed="handlePasswordChanged"
          @show-message="showInlineMessage"
          :users="users"
      />
    </div>

    <!-- OVERLAY -->
    <div class="overlay-container">
      <div class="overlay">

        <div class="overlay-panel overlay-left">
          <template v-if="!isRecovery">
            <h1>{{ $t('login.welcome_back') }}</h1>
            <p>{{ $t('login.welcome_back_message') }}</p>
            <button class="ghost" @click="goLogin">{{ $t('login.login_button') }}</button>
          </template>

          <template v-else>
            <h1>{{ $t('recovery.need_help') }}</h1>
            <p>{{ $t('recovery.need_help_message') }}</p>
            <button class="ghost" @click="backLogin">{{ $t('recovery.back_button') }}</button>
          </template>
        </div>

        <div class="overlay-panel overlay-right">
          <template v-if="!isRecovery">
            <h1>{{ $t('register.hello_welcome') }}</h1>
            <p>{{ $t('register.hello_welcome_message') }}</p>
            <button class="ghost" @click="goRegister">{{ $t('register.register_button') }}</button>
          </template>

          <template v-else>
            <h1>{{ $t('recovery.password_reset') }}</h1>
            <p>{{ $t('recovery.password_reset_message') }}</p>
          </template>
        </div>

      </div>
    </div>

    <!-- INLINE MESSAGE -->
    <transition name="message-fade">
      <div v-if="inlineMessage.show" class="inline-message" :class="inlineMessage.type">
        <i :class="inlineMessage.icon"></i>
        <span>{{ inlineMessage.text }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import RecoveryForm from './components/RecoveryForm.vue'

const { t } = useI18n()

// Estado
const isRegister = ref(false)
const isRecovery = ref(false)

// Base de datos de usuarios
const users = ref([])

// Credenciales para transferir
const credentialsToTransfer = ref(null)

// Mensaje inline
const inlineMessage = reactive({
  show: false,
  text: '',
  type: 'success',
  icon: ''
})

let messageTimeout = null

const showInlineMessage = (text, type = 'success') => {
  if (messageTimeout) clearTimeout(messageTimeout)

  inlineMessage.text = text
  inlineMessage.type = type
  inlineMessage.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
  inlineMessage.show = true

  messageTimeout = setTimeout(() => {
    inlineMessage.show = false
  }, 3000)
}

// Datos de recuperación
const recoveryData = reactive({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})

// Cargar usuarios
onMounted(() => {
  const savedUsers = localStorage.getItem('app_users')
  if (savedUsers) {
    users.value = JSON.parse(savedUsers)
  }

  if (users.value.length === 0) {
    users.value.push({
      id: Date.now(),
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123'
    })
    saveUsers()
  }
})

const saveUsers = () => {
  localStorage.setItem('app_users', JSON.stringify(users.value))
}

const isRecoveryValid = computed(() => {
  return recoveryData.username &&
      recoveryData.email &&
      recoveryData.newPassword &&
      recoveryData.confirmPassword &&
      recoveryData.newPassword === recoveryData.confirmPassword &&
      recoveryData.newPassword.length >= 6
})

const goRegister = () => {
  isRecovery.value = false
  isRegister.value = true
}

const goLogin = () => {
  isRecovery.value = false
  isRegister.value = false
}

const goRecovery = () => {
  isRecovery.value = true
}

const backLogin = () => {
  isRecovery.value = false
  recoveryData.username = ''
  recoveryData.email = ''
  recoveryData.newPassword = ''
  recoveryData.confirmPassword = ''
}

const handleTransferCredentials = (credentials) => {
  credentialsToTransfer.value = credentials
}

const handleUserRegistered = (newUser) => {
  const userExists = users.value.some(u => u.username === newUser.username || u.email === newUser.email)

  if (userExists) {
    showInlineMessage(t('errors.username_exists'), 'error')
    return false
  }

  users.value.push(newUser)
  saveUsers()
  showInlineMessage(t('toast.register_success', { username: newUser.username }), 'success')
  return true
}

const handleRegisterSuccess = (username) => {
  showInlineMessage(t('toast.register_success_login', { username }), 'success')
  setTimeout(() => {
    goLogin()
  }, 1500)
}

const handleLoginSuccess = (username) => {
  showInlineMessage(t('toast.login_success', { username }), 'success')
}

const handleRecoverySuccess = (username) => {
  showInlineMessage(t('toast.password_changed_for', { username }), 'success')
}

const handlePasswordChanged = ({ index, user }) => {
  users.value[index] = user
  saveUsers()
}
</script>

<style scoped>
.inline-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  border-radius: 60px;
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(20px);
  letter-spacing: 0.3px;
}

.inline-message.success {
  background: linear-gradient(135deg, #00d4a0, #00b894);
  color: white;
}

.inline-message.error {
  background: linear-gradient(135deg, #ff7675, #d63031);
  color: white;
}

.inline-message i {
  font-size: 16px;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>