<template>
  <div class="w-60 bg-discord-card p-4">
    <h3 class="text-gray-400 text-sm uppercase tracking-wide mb-2">Channels</h3>
    <ul class="space-y-2">
      <li v-for="channel in channels" :key="channel.Id" class="text-gray-300 hover:text-white cursor-pointer">
        # {{ channel.Name }}
      </li>
    </ul>
    <button @click="showForm = true" class="mt-4 bg-discord-blurple text-white p-2 rounded-md hover:bg-discord-blurple-hover">
      Add Channel
    </button>
    <div v-if="showForm" class="mt-4">
      <input v-model="newChannelName" class="w-full p-2 bg-discord-input text-white rounded-md" placeholder="Channel name" />
      <button @click="createChannel" class="mt-2 bg-discord-blurple text-white p-2 rounded-md hover:bg-discord-blurple-hover">
        Create
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const channels = ref([])
const showForm = ref(false)
const newChannelName = ref('')

const fetchChannels = async () => {
  try {
    const response = await api.get('/api/channels')
    channels.value = response.data
  } catch (err) {
    console.error('Failed to fetch channels:', err)
  }
}

const createChannel = async () => {
  try {
    await api.post('/api/channels', { name: newChannelName.value })
    newChannelName.value = ''
    showForm.value = false
    fetchChannels()
  } catch (err) {
    console.error('Failed to create channel:', err)
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    authStore.logout()
    router.push('/login')
  } else {
    fetchChannels()
  }
})
</script>