<template>
  <div class="w-60 bg-discord-card p-4 h-screen flex flex-col">
    <h3 class="text-gray-400 text-sm uppercase tracking-wide mb-2">Channels</h3>
    <ul class="space-y-2 flex-1 overflow-y-auto">
      <li
        v-for="channel in channels"
        :key="channel.ID"
        class="text-gray-300 hover:text-white hover:bg-discord-hover p-2 rounded cursor-pointer"
        :class="{ 'bg-discord-selected text-white': $route.params.id == channel.ID }"
        @click="navigateToChannel(channel.ID)"
      >
        <span class="mr-2">📢</span> # {{ channel.Name }}
      </li>
    </ul>
    <div>
      <button
        @click="showForm = true"
        class="w-full mt-4 bg-discord-blurple text-white p-2 rounded-md hover:bg-discord-blurple-hover"
      >
        Add Channel
      </button>
      <div v-if="showForm" class="mt-4">
        <input
          v-model="newChannelName"
          class="w-full p-2 bg-discord-input text-white rounded-md"
          placeholder="Channel name"
        />
        <button
          @click="createChannel"
          class="w-full mt-2 bg-discord-blurple text-white p-2 rounded-md hover:bg-discord-blurple-hover"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
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

const navigateToChannel = (channelId) => {
  router.push(`/channels/${channelId}`)
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

<style scoped>
.bg-discord-card {
  background-color: #2f3136;
}
.bg-discord-hover {
  background-color: #35383e;
}
.bg-discord-selected {
  background-color: #40444b;
}
.bg-discord-blurple {
  background-color: #5865f2;
}
.bg-discord-blurple-hover {
  background-color: #4752c4;
}
.bg-discord-input {
  background-color: #202225;
}
</style>