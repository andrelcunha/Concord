<template>
  <div class="min-h-screen bg-discord-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="bg-discord-card p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg">
      <h2 class="text-2xl sm:text-3xl font-bold text-white text-center mb-6">{{ isLogin ? 'Welcome back!' : 'Create an account' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide" for="username">Username</label>
          <input
            v-model="form.username"
            type="text"
            id="username"
            class="w-full p-3 bg-discord-input text-white rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blurple transition"
            placeholder="Enter your username"
            required
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide" for="password">Password</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            class="w-full p-3 bg-discord-input text-white rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blurple transition"
            placeholder="Enter your password"
            required
          />
        </div>
        <div v-if="error" class="text-red-400 text-sm text-center mb-4">{{ error }}</div>
        <button
          type="submit"
          class="w-full bg-discord-blurple text-white p-3 rounded-md hover:bg-discord-blurple-hover focus:outline-none focus:ring-2 focus:ring-discord-blurple transition font-medium"
        >
          {{ isLogin ? 'Log In' : 'Register' }}
        </button>
      </form>
      <p class="text-gray-400 text-sm text-center mt-6">
        {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
        <a
          href="#"
          class="text-discord-blurple hover:underline"
          @click.prevent="isLogin = !isLogin"
        >
          {{ isLogin ? 'Register' : 'Log In' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const form = ref({
  username: '',
  password: ''
})
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  try {
    if (isLogin.value) {
      console.log('Attempting to login...')
      await authStore.login({
        username: form.value.username,
        password: form.value.password
      })
      console.log('Login successful, redirecting to /channels')
      await router.push('/channels')
    } else {
      console.log('Attempting to register...')
      const result = await authStore.register({
        username: form.value.username,
        password: form.value.password
      })
      console.log('Registration successful:', result)
      isLogin.value = true
      form.value.username = ''
      form.value.password = ''
      error.value = `Registered as ${result.username}! Please log in.`
    } 
  } catch (err) {
    console.error('Error:', err)
    error.value = err || 'An error occurred'
  }
}
</script>