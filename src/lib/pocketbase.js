import PocketBase from 'pocketbase'

// Initialize PocketBase client
// Change this URL to your PocketBase server URL
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Enable auto cancellation for all pending requests
pb.autoCancellation(false)

export default pb

// Authentication functions
export const authService = {
  // Register a new user
  async register(email, password, passwordConfirm, name = '') {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
      }
      const record = await pb.collection('users').create(userData)
      // Automatically login after registration
      await this.login(email, password)
      return { success: true, user: record }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Login user
  async login(email, password) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      return { success: true, user: authData.record }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Logout user
  logout() {
    pb.authStore.clear()
  },

  // Get current user
  getCurrentUser() {
    return pb.authStore.model
  },

  // Check if user is authenticated
  isAuthenticated() {
    return pb.authStore.isValid
  },

  // Get auth token
  getToken() {
    return pb.authStore.token
  },
}

// Avatar data service
export const avatarService = {
  // Save avatar configuration
  async saveAvatar(avatarData) {
    try {
      if (!pb.authStore.isValid) {
        return { success: false, error: 'Please login to save your avatar' }
      }

      const data = {
        user: pb.authStore.model.id,
        gender: avatarData.gender || 'male',
        height: avatarData.height,
        weight: avatarData.weight,
        skinColor: avatarData.skinColor,
        hairType: avatarData.hairType,
        bmi: avatarData.bmi,
      }

      // Check if user already has an avatar
      const existing = await pb.collection('avatars').getFirstListItem(
        `user="${pb.authStore.model.id}"`
      )

      if (existing) {
        // Update existing avatar
        const record = await pb.collection('avatars').update(existing.id, data)
        return { success: true, avatar: record }
      } else {
        // Create new avatar
        const record = await pb.collection('avatars').create(data)
        return { success: true, avatar: record }
      }
    } catch (error) {
      if (error.status === 404) {
        // No existing avatar, create new one
        try {
          const data = {
            user: pb.authStore.model.id,
            height: avatarData.height,
            weight: avatarData.weight,
            skinColor: avatarData.skinColor,
            hairType: avatarData.hairType,
            bmi: avatarData.bmi,
          }
          const record = await pb.collection('avatars').create(data)
          return { success: true, avatar: record }
        } catch (createError) {
          return { success: false, error: createError.message }
        }
      }
      return { success: false, error: error.message }
    }
  },

  // Load user's avatar
  async loadAvatar() {
    try {
      if (!pb.authStore.isValid) {
        return { success: false, error: 'Please login to load your avatar' }
      }

      const record = await pb.collection('avatars').getFirstListItem(
        `user="${pb.authStore.model.id}"`
      )

      return {
        success: true,
        avatar: {
          gender: record.gender || 'male',
          height: record.height,
          weight: record.weight,
          skinColor: record.skinColor,
          hairType: record.hairType,
          bmi: record.bmi,
        },
      }
    } catch (error) {
      if (error.status === 404) {
        return { success: false, error: 'No saved avatar found' }
      }
      return { success: false, error: error.message }
    }
  },

  // Delete user's avatar
  async deleteAvatar() {
    try {
      if (!pb.authStore.isValid) {
        return { success: false, error: 'Please login to delete your avatar' }
      }

      const existing = await pb.collection('avatars').getFirstListItem(
        `user="${pb.authStore.model.id}"`
      )

      await pb.collection('avatars').delete(existing.id)
      return { success: true }
    } catch (error) {
      if (error.status === 404) {
        return { success: false, error: 'No avatar to delete' }
      }
      return { success: false, error: error.message }
    }
  },
}

// Listen to auth store changes
pb.authStore.onChange((token, model) => {
  // You can add custom logic here when auth state changes
  console.log('Auth state changed:', { token, model })
})
