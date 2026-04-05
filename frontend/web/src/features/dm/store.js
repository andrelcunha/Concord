import { create } from 'zustand'

import {
  acceptFriendRequestRequest,
  blockUserRequest,
  createOrGetDmConversationRequest,
  getDmConversationRequest,
  hideDmConversationRequest,
  listDmConversationsRequest,
  listDmMessagesRequest,
  listIncomingFriendRequestsRequest,
  listFriendsRequest,
  rejectFriendRequestRequest,
  removeFriendRequest,
  searchUsersRequest,
  sendFriendRequestRequest,
} from '@/features/dm/api'

export const useDmStore = create((set, get) => ({
  conversations: [],
  conversationsById: {},
  isLoadingConversations: false,
  hasLoadedConversations: false,
  conversationsError: '',
  friends: [],
  isLoadingFriends: false,
  hasLoadedFriends: false,
  friendsError: '',
  incomingRequests: [],
  isLoadingIncomingRequests: false,
  hasLoadedIncomingRequests: false,
  incomingRequestsError: '',
  requestActionById: {},
  searchedUsers: [],
  isSearchingUsers: false,
  searchUsersError: '',
  pendingRequestUserIds: {},
  friendActionByUserId: {},
  isCreatingConversation: false,
  hidingConversationId: null,
  messagesByConversationId: {},
  loadingByConversationId: {},
  errorByConversationId: {},
  connectionStateByConversationId: {},

  fetchConversations: async ({ silent = false } = {}) => {
    if (get().isLoadingConversations) {
      return
    }

    if (!silent) {
      set({
        isLoadingConversations: true,
        conversationsError: '',
      })
    }

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
        hasLoadedConversations: true,
        ...(silent ? {} : { conversationsError: '' }),
      })
    } catch (error) {
      set({
        isLoadingConversations: false,
        hasLoadedConversations: true,
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

  fetchFriends: async ({ silent = false } = {}) => {
    if (get().isLoadingFriends) {
      return
    }

    if (!silent) {
      set({
        isLoadingFriends: true,
        friendsError: '',
      })
    }

    try {
      const data = await listFriendsRequest()
      set({
        friends: data.friends ?? [],
        isLoadingFriends: false,
        hasLoadedFriends: true,
        ...(silent ? {} : { friendsError: '' }),
      })
    } catch (error) {
      set({
        isLoadingFriends: false,
        hasLoadedFriends: true,
        friendsError: error.response?.data?.error ?? 'Failed to load friends',
      })
    }
  },

  fetchIncomingRequests: async ({ silent = false } = {}) => {
    if (get().isLoadingIncomingRequests) {
      return
    }

    if (!silent) {
      set({
        isLoadingIncomingRequests: true,
        incomingRequestsError: '',
      })
    }

    try {
      const data = await listIncomingFriendRequestsRequest()
      set({
        incomingRequests: data.requests ?? [],
        isLoadingIncomingRequests: false,
        hasLoadedIncomingRequests: true,
        ...(silent ? {} : { incomingRequestsError: '' }),
      })
    } catch (error) {
      set({
        isLoadingIncomingRequests: false,
        hasLoadedIncomingRequests: true,
        incomingRequestsError: error.response?.data?.error ?? 'Failed to load incoming requests',
      })
    }
  },

  acceptFriendRequest: async (friendshipId) => {
    if (!friendshipId || get().requestActionById[String(friendshipId)]) {
      return false
    }

    set((state) => ({
      requestActionById: {
        ...state.requestActionById,
        [String(friendshipId)]: 'accepting',
      },
      incomingRequestsError: '',
    }))

    try {
      await acceptFriendRequestRequest(friendshipId)
      set((state) => ({
        incomingRequests: state.incomingRequests.filter((request) => request.id !== friendshipId),
        requestActionById: {
          ...state.requestActionById,
          [String(friendshipId)]: '',
        },
      }))
      await get().fetchFriends()
      return true
    } catch (error) {
      set((state) => ({
        requestActionById: {
          ...state.requestActionById,
          [String(friendshipId)]: '',
        },
        incomingRequestsError: error.response?.data?.error ?? 'Failed to accept the request',
      }))
      return false
    }
  },

  rejectFriendRequest: async (friendshipId) => {
    if (!friendshipId || get().requestActionById[String(friendshipId)]) {
      return false
    }

    set((state) => ({
      requestActionById: {
        ...state.requestActionById,
        [String(friendshipId)]: 'rejecting',
      },
      incomingRequestsError: '',
    }))

    try {
      await rejectFriendRequestRequest(friendshipId)
      set((state) => ({
        incomingRequests: state.incomingRequests.filter((request) => request.id !== friendshipId),
        requestActionById: {
          ...state.requestActionById,
          [String(friendshipId)]: '',
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        requestActionById: {
          ...state.requestActionById,
          [String(friendshipId)]: '',
        },
        incomingRequestsError: error.response?.data?.error ?? 'Failed to reject the request',
      }))
      return false
    }
  },

  searchUsers: async (query) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      set({
        searchedUsers: [],
        searchUsersError: '',
        isSearchingUsers: false,
      })
      return
    }

    if (get().isSearchingUsers) {
      return
    }

    set({
      isSearchingUsers: true,
      searchUsersError: '',
    })

    try {
      const data = await searchUsersRequest(trimmedQuery)
      set({
        searchedUsers: data.users ?? [],
        isSearchingUsers: false,
      })
    } catch (error) {
      set({
        searchedUsers: [],
        isSearchingUsers: false,
        searchUsersError: error.response?.data?.error ?? 'Failed to search users',
      })
    }
  },

  sendFriendRequest: async (targetUserId) => {
    if (!targetUserId || get().pendingRequestUserIds[String(targetUserId)]) {
      return false
    }

    set((state) => ({
      pendingRequestUserIds: {
        ...state.pendingRequestUserIds,
        [String(targetUserId)]: true,
      },
      searchUsersError: '',
    }))

    try {
      await sendFriendRequestRequest(targetUserId)
      set((state) => ({
        searchedUsers: state.searchedUsers.filter((user) => user.user_id !== targetUserId),
        pendingRequestUserIds: {
          ...state.pendingRequestUserIds,
          [String(targetUserId)]: false,
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        pendingRequestUserIds: {
          ...state.pendingRequestUserIds,
          [String(targetUserId)]: false,
        },
        searchUsersError: error.response?.data?.error ?? 'Failed to send friend request',
      }))
      return false
    }
  },

  removeFriend: async (friendUserId) => {
    if (!friendUserId || get().friendActionByUserId[String(friendUserId)]) {
      return false
    }

    set((state) => ({
      friendActionByUserId: {
        ...state.friendActionByUserId,
        [String(friendUserId)]: 'removing',
      },
      friendsError: '',
    }))

    try {
      await removeFriendRequest(friendUserId)
      set((state) => {
        const nextConversations = state.conversations.filter(
          (conversation) => conversation.other_user?.user_id !== friendUserId,
        )
        const nextConversationsById = { ...state.conversationsById }
        Object.keys(nextConversationsById).forEach((conversationId) => {
          if (nextConversationsById[conversationId]?.other_user?.user_id === friendUserId) {
            delete nextConversationsById[conversationId]
          }
        })

        return {
          friends: state.friends.filter((friend) => friend.user_id !== friendUserId),
          conversations: nextConversations,
          conversationsById: nextConversationsById,
          friendActionByUserId: {
            ...state.friendActionByUserId,
            [String(friendUserId)]: '',
          },
        }
      })
      return true
    } catch (error) {
      set((state) => ({
        friendActionByUserId: {
          ...state.friendActionByUserId,
          [String(friendUserId)]: '',
        },
        friendsError: error.response?.data?.error ?? 'Failed to remove friend',
      }))
      return false
    }
  },

  blockUser: async (blockedUserId) => {
    if (!blockedUserId || get().friendActionByUserId[String(blockedUserId)]) {
      return false
    }

    set((state) => ({
      friendActionByUserId: {
        ...state.friendActionByUserId,
        [String(blockedUserId)]: 'blocking',
      },
      friendsError: '',
    }))

    try {
      await blockUserRequest(blockedUserId)
      set((state) => {
        const nextConversations = state.conversations.filter(
          (conversation) => conversation.other_user?.user_id !== blockedUserId,
        )
        const nextConversationsById = { ...state.conversationsById }
        Object.keys(nextConversationsById).forEach((conversationId) => {
          if (nextConversationsById[conversationId]?.other_user?.user_id === blockedUserId) {
            delete nextConversationsById[conversationId]
          }
        })

        return {
          friends: state.friends.filter((friend) => friend.user_id !== blockedUserId),
          conversations: nextConversations,
          conversationsById: nextConversationsById,
          friendActionByUserId: {
            ...state.friendActionByUserId,
            [String(blockedUserId)]: '',
          },
        }
      })
      return true
    } catch (error) {
      set((state) => ({
        friendActionByUserId: {
          ...state.friendActionByUserId,
          [String(blockedUserId)]: '',
        },
        friendsError: error.response?.data?.error ?? 'Failed to block user',
      }))
      return false
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
      hasLoadedConversations: false,
      conversationsError: '',
      friends: [],
      isLoadingFriends: false,
      hasLoadedFriends: false,
      friendsError: '',
      incomingRequests: [],
      isLoadingIncomingRequests: false,
      hasLoadedIncomingRequests: false,
      incomingRequestsError: '',
      requestActionById: {},
      searchedUsers: [],
      isSearchingUsers: false,
      searchUsersError: '',
      pendingRequestUserIds: {},
      friendActionByUserId: {},
      isCreatingConversation: false,
      hidingConversationId: null,
      messagesByConversationId: {},
      loadingByConversationId: {},
      errorByConversationId: {},
      connectionStateByConversationId: {},
    }),
}))
