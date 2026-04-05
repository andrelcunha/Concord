import { create } from 'zustand'

import {
  createOrGetDmConversationRequest,
  getDmConversationRequest,
  hideDmConversationRequest,
  listDmConversationsRequest,
  listDmMessagesRequest,
  listFriendsRequest,
} from '@/features/dm/api'

export const useDmStore = create((set, get) => ({
  conversations: [],
  conversationsById: {},
  isLoadingConversations: false,
  conversationsError: '',
  friends: [],
  isLoadingFriends: false,
  friendsError: '',
  isCreatingConversation: false,
  hidingConversationId: null,
  messagesByConversationId: {},
  loadingByConversationId: {},
  errorByConversationId: {},
  connectionStateByConversationId: {},

  fetchConversations: async () => {
    if (get().isLoadingConversations) {
      return
    }

    set({
      isLoadingConversations: true,
      conversationsError: '',
    })

    try {
      const data = await listDmConversationsRequest()
      const conversations = data.conversations ?? []

      set({
        conversations,
        conversationsById: conversations.reduce((accumulator, conversation) => {
          accumulator[String(conversation.id)] = conversation
          return accumulator
        }, {}),
        isLoadingConversations: false,
      })
    } catch (error) {
      set({
        isLoadingConversations: false,
        conversationsError: error.response?.data?.error ?? 'Failed to load direct messages',
      })
    }
  },

  fetchConversation: async (conversationId) => {
    if (!conversationId) {
      return null
    }

    const key = String(conversationId)
    const existing = get().conversationsById[key]
    if (existing) {
      return existing
    }

    try {
      const conversation = await getDmConversationRequest(conversationId)
      set((state) => ({
        conversationsById: {
          ...state.conversationsById,
          [key]: conversation,
        },
        conversations: state.conversations.some((item) => String(item.id) === key)
          ? state.conversations
          : [...state.conversations, conversation],
      }))
      return conversation
    } catch (_error) {
      return null
    }
  },

  fetchFriends: async () => {
    if (get().isLoadingFriends) {
      return
    }

    set({
      isLoadingFriends: true,
      friendsError: '',
    })

    try {
      const data = await listFriendsRequest()
      set({
        friends: data.friends ?? [],
        isLoadingFriends: false,
      })
    } catch (error) {
      set({
        isLoadingFriends: false,
        friendsError: error.response?.data?.error ?? 'Failed to load friends',
      })
    }
  },

  createOrGetConversation: async (otherUserId) => {
    if (!otherUserId || get().isCreatingConversation) {
      return null
    }

    set({
      isCreatingConversation: true,
      conversationsError: '',
      friendsError: '',
    })

    try {
      const conversation = await createOrGetDmConversationRequest(otherUserId)
      set((state) => {
        const key = String(conversation.id)
        const filtered = state.conversations.filter((item) => String(item.id) !== key)

        return {
          conversations: [conversation, ...filtered],
          conversationsById: {
            ...state.conversationsById,
            [key]: conversation,
          },
          isCreatingConversation: false,
        }
      })
      return conversation
    } catch (error) {
      set({
        isCreatingConversation: false,
        friendsError: error.response?.data?.error ?? 'Failed to start the conversation',
      })
      return null
    }
  },

  hideConversation: async (conversationId) => {
    if (!conversationId || get().hidingConversationId) {
      return false
    }

    set({
      hidingConversationId: conversationId,
      conversationsError: '',
    })

    try {
      await hideDmConversationRequest(conversationId)
      set((state) => {
        const key = String(conversationId)
        const nextConversations = state.conversations.filter((item) => String(item.id) !== key)
        const nextById = { ...state.conversationsById }
        delete nextById[key]

        return {
          conversations: nextConversations,
          conversationsById: nextById,
          hidingConversationId: null,
        }
      })
      return true
    } catch (error) {
      set({
        hidingConversationId: null,
        conversationsError: error.response?.data?.error ?? 'Failed to hide the conversation',
      })
      return false
    }
  },

  fetchMessagesForConversation: async (conversationId) => {
    if (!conversationId) {
      return
    }

    const key = String(conversationId)
    if (get().loadingByConversationId[key]) {
      return
    }

    set((state) => ({
      loadingByConversationId: {
        ...state.loadingByConversationId,
        [key]: true,
      },
      errorByConversationId: {
        ...state.errorByConversationId,
        [key]: '',
      },
    }))

    try {
      const data = await listDmMessagesRequest(conversationId)
      set((state) => ({
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [key]: data ?? [],
        },
        loadingByConversationId: {
          ...state.loadingByConversationId,
          [key]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        loadingByConversationId: {
          ...state.loadingByConversationId,
          [key]: false,
        },
        errorByConversationId: {
          ...state.errorByConversationId,
          [key]: error.response?.data?.error ?? 'Failed to load direct messages',
        },
      }))
    }
  },

  addOptimisticMessage: (conversationId, message) =>
    set((state) => {
      const key = String(conversationId)
      const existingMessages = state.messagesByConversationId[key] ?? []

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [key]: [...existingMessages, message],
        },
      }
    }),

  markOptimisticMessageFailed: (conversationId, optimisticId) =>
    set((state) => {
      const key = String(conversationId)
      const existingMessages = state.messagesByConversationId[key] ?? []

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [key]: existingMessages.map((message) =>
            message.id === optimisticId
              ? {
                  ...message,
                  optimisticState: 'failed',
                }
              : message,
          ),
        },
      }
    }),

  reconcileIncomingMessage: (conversationId, message, currentUsername) =>
    set((state) => {
      const key = String(conversationId)
      const existingMessages = state.messagesByConversationId[key] ?? []
      const optimisticIndex = existingMessages.findIndex(
        (item) =>
          String(item.id).startsWith('optimistic-') &&
          item.content === message.content &&
          item.username === currentUsername,
      )

      const updatedConversations = state.conversations.map((conversation) =>
        String(conversation.id) === key
          ? {
              ...conversation,
              last_message: message.content,
              last_message_at: message.created_at,
            }
          : conversation,
      )

      if (optimisticIndex >= 0) {
        const nextMessages = [...existingMessages]
        nextMessages[optimisticIndex] = message

        return {
          messagesByConversationId: {
            ...state.messagesByConversationId,
            [key]: nextMessages,
          },
          conversations: updatedConversations,
          conversationsById: {
            ...state.conversationsById,
            [key]: {
              ...(state.conversationsById[key] ?? {}),
              last_message: message.content,
              last_message_at: message.created_at,
            },
          },
        }
      }

      const alreadyPresent = existingMessages.some((item) => item.id === message.id)
      if (alreadyPresent) {
        return state
      }

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [key]: [...existingMessages, message],
        },
        conversations: updatedConversations,
        conversationsById: {
          ...state.conversationsById,
          [key]: {
            ...(state.conversationsById[key] ?? {}),
            last_message: message.content,
            last_message_at: message.created_at,
          },
        },
      }
    }),

  setConnectionState: (conversationId, connectionState) =>
    set((state) => ({
      connectionStateByConversationId: {
        ...state.connectionStateByConversationId,
        [String(conversationId)]: connectionState,
      },
    })),

  clearDms: () =>
    set({
      conversations: [],
      conversationsById: {},
      isLoadingConversations: false,
      conversationsError: '',
      friends: [],
      isLoadingFriends: false,
      friendsError: '',
      isCreatingConversation: false,
      hidingConversationId: null,
      messagesByConversationId: {},
      loadingByConversationId: {},
      errorByConversationId: {},
      connectionStateByConversationId: {},
    }),
}))
