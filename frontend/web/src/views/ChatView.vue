<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/axios'

const route = useRoute()
const authStore = useAuthStore()
const messages = ref([])
const content = ref('')
let ws = null

const channelId = route.params.id // e.g., '1'

async function fetchMessages() {
  try {
    const response = await axios.get(`/api/channels/${channelId}/messages`)
    messages.value = response.data
  } catch (error) {
    console.error('Fetch messages error:', error)
  }
}

function connectWebSocket() {
  const wsUrl = `${import.meta.env.VITE_WS_URL}/api/ws?channel_id=${channelId}`
  ws = new WebSocket(wsUrl, ['Bearer', authStore.accessToken])

  ws.onopen = () => {
    console.log('WebSocket connected')
  }

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    messages.value.push(message)
  }

  ws.onclose = () => {
    console.log('WebSocket closed')
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

async function sendMessage() {
  if (!content.value.trim()) return
  const message = { content: content.value }
  ws.send(JSON.stringify(message))
  content.value = ''
}

onMounted(() => {
  fetchMessages()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>

<template>
  <div class="chat">
    <h2>Channel #{{ channelId }}</h2>
    <div class="messages">
      <div v-for="message in messages" :key="message.id" class="message">
        <span class="user">{{ message.user_id }}</span>: {{ message.content }}
      </div>
    </div>
    <form @submit.prevent="sendMessage">
      <input v-model="content" placeholder="Type a message..." />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<style scoped>
.chat { padding: 20px; }
.messages { height: 400px; overflow-y: auto; margin-bottom: 20px; }
.message { margin: 5px 0; }
.user { font-weight: bold; }
input { width: 80%; padding: 10px; }
button { padding: 10px; }
</style>