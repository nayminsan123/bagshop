import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data.success) {
        token.value = response.data.token
        user.value = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          phone: response.data.user.phone,
          role: response.data.user.role
        }
        localStorage.setItem('token', response.data.token)
        return { success: true }
      }
      return { success: false, message: 'Login failed' }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    }
  }
  
  async function register(userData) {
    try {
      const response = await api.post('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      })
      if (response.data.success) {
        token.value = response.data.token
        user.value = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          role: response.data.user.role
        }
        localStorage.setItem('token', response.data.token)
        return { success: true }
      }
      return { success: false, message: 'Registration failed' }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' }
    }
  }
  
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  async function fetchUser() {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        user.value = {
          id: response.data.data.id,
          email: response.data.data.email,
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          phone: response.data.data.phone,
          role: response.data.data.role
        }
      }
    } catch (error) {
      logout()
    }
  }
  
  return { user, token, isAuthenticated, login, register, logout, fetchUser }
})
