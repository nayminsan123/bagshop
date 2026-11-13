<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="text-2xl font-bold text-primary-900">
          BagShop
        </router-link>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/products" class="nav-link">Products</router-link>
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <button class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>

          <!-- Cart -->
          <router-link to="/cart" class="p-2 hover:bg-gray-100 rounded-full relative">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span v-if="cartStore.totalItems > 0" 
                  class="absolute -top-1 -right-1 bg-primary-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative group">
            <button class="p-2 hover:bg-gray-100 rounded-full">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
              <router-link to="/profile" class="block px-4 py-2 hover:bg-gray-100">Profile</router-link>
              <button @click="logout" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
            </div>
          </div>
          <div v-else class="flex items-center space-x-2">
            <router-link to="/login" class="nav-link">Login</router-link>
            <router-link to="/register" class="btn-primary py-2 px-4 text-sm">Sign Up</router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
        <router-link to="/" class="block py-2 hover:text-primary-800">Home</router-link>
        <router-link to="/products" class="block py-2 hover:text-primary-800">Products</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-primary-800 transition-colors duration-200;
}
</style>
