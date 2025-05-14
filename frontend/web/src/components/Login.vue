<template>
    <div class="min-h-screen bg-gray-900 flex items-center justify-center">
      <div class="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold text-white text-center mb-6">{{ isLogin ? 'Login' : 'Register' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-gray-300 mb-2" for="username">Username</label>
            <input
              v-model="form.username"
              type="text"
              id="username"
              class="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-gray-300 mb-2" for="password">Password</label>
            <input
              v-model="form.password"
              type="password"
              id="password"
              class="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div v-if="error" class="text-red-500 text-center mb-4">{{ error }}</div>
          <button
            type="submit"
            class="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
          >
            {{ isLogin ? 'Login' : 'Register' }}
          </button>
        </form>
        <p class="text-gray-400 text-center mt-4">
          {{ isLogin ? 'Need an account?' : 'Already have an account?' }}
          <a
            href="#"
            class="text-indigo-400 hover:underline"
            @click.prevent="isLogin = !isLogin"
          >
            {{ isLogin ? 'Register' : 'Login' }}
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
        // Store tokens
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
        localStorage.setItem('username', form.value.username)
        router.push('/home')
      } else {
        // After register, switch to login
        isLogin.value = true
        form.value.username = ''
        form.value.password = ''
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'An error occurred'
    }
  }
  </script>