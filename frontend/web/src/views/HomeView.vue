<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <h1 class="text-4xl font-bold mb-4">Welcome, {{ username }}!</h1>
      <p class="text-gray-400">This is the Concord home page.</p>
      <button
        @click="logout"
        class="mt-6 bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref(localStorage.getItem('username') || 'User')

const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
