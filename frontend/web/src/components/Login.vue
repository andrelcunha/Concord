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
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const form = ref({
  username: '',
  password: ''
})
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  try {
    const endpoint = isLogin.value ? '/login' : '/register'
    const response = await axios.post(`http://localhost:3000${endpoint}`, {
      username: form.value.username,
      password: form.value.password
    })

    if (isLogin.value) {
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('username', form.value.username)
      router.push('/home')
    } else {
      isLogin.value = true
      form.value.username = ''
      form.value.password = ''
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'An error occurred'
  }
}
</script>