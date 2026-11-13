<template>
  <div>
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <!-- Top Header -->
        <div class="flex items-center justify-between py-1.5 border-b text-xs">
          <div class="flex items-center gap-3 text-gray-600">
            <a href="#" class="hover:text-orange-500">Sell On Us</a>
            <span>|</span>
            <a href="#" class="hover:text-orange-500">Help & Support</a>
          </div>
          <div class="flex items-center gap-3">
            <template v-if="authStore.isAuthenticated">
              <div class="relative group">
                <button class="text-gray-600 hover:text-orange-500 flex items-center gap-1 text-xs">
                  {{ authStore.user?.firstName }}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block text-sm">
                  <router-link to="/profile" class="block px-3 py-1.5 hover:bg-gray-50">My Account</router-link>
                  <router-link to="/profile" class="block px-3 py-1.5 hover:bg-gray-50">My Orders</router-link>
                  <button @click="logout" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-500">Logout</button>
                </div>
              </div>
            </template>
            <template v-else>
              <router-link to="/login" class="text-gray-600 hover:text-orange-500">Login</router-link>
              <router-link to="/register" class="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">Sign Up</router-link>
            </template>
          </div>
        </div>

        <!-- Main Header -->
        <div class="flex items-center py-3 gap-6">
          <!-- Logo -->
          <router-link to="/" class="text-2xl font-bold text-orange-500">
            Pont Pont Hand-Bag
          </router-link>

          <!-- Search Bar -->
          <div class="flex-1 relative">
            <input type="text" v-model="searchQuery" @keyup.enter="searchProducts"
                   placeholder="Search for products, brands and more..."
                   class="w-full px-3 py-2 border-2 border-orange-500 rounded-lg focus:outline-none focus:border-orange-600 text-sm" />
            <button @click="searchProducts" class="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-5 py-1.5 rounded-lg hover:bg-orange-600 text-sm">
              Search
            </button>
          </div>

          <!-- Cart -->
          <router-link to="/cart" class="relative flex items-center gap-1.5 text-gray-700 hover:text-orange-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-sm">Cart</span>
            <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {{ cartStore.totalItems }}
            </span>
          </router-link>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const searchQuery = ref('')

function searchProducts() {
  if (searchQuery.value) {
    router.push({ path: '/products', query: { search: searchQuery.value } })
  }
}

function logout() {
  authStore.logout()
  router.push('/')
}
</script>
