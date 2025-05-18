<template>
  <div class="min-h-screen bg-discord-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="bg-discord-card p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg text-center">
      <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Welcome, {{ username }}!</h1>
      <p class="text-gray-400 text-sm mb-6">You're now logged into Concord.</p>
      <button
        @click="logout"
        class="bg-discord-blurple text-white p-3 rounded-md hover:bg-discord-blurple-hover focus:outline-none focus:ring-2 focus:ring-discord-blurple transition font-medium"
      >
        Log Out
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