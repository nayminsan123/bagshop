<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <router-link to="/" class="hover:text-orange-500">Home</router-link>
        <span>></span>
        <span class="text-gray-800">Shopping Cart</span>
      </div>

      <div v-if="cartStore.items.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
        <router-link to="/" class="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600">
          Continue Shopping
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" 
                       class="w-4 h-4 text-orange-500 rounded" />
                <span class="font-semibold">Select All ({{ cartStore.items.length }} items)</span>
              </label>
              <button @click="cartStore.clearCart" class="text-red-500 hover:text-red-700 text-sm">
                Delete All
              </button>
            </div>
            
            <div v-for="item in cartStore.items" :key="item.id" 
                 class="flex gap-4 py-4 border-t">
              <input type="checkbox" v-model="selectedItems" :value="item.id"
                     class="w-4 h-4 text-orange-500 rounded mt-6" />
              
              <img :src="item.image" :alt="item.name" 
                   class="w-24 h-24 object-cover rounded-lg cursor-pointer"
                   @click="router.push(`/products/${item.id}`)" />
              
              <div class="flex-1">
                <h3 class="text-gray-800 font-medium cursor-pointer hover:text-orange-500"
                    @click="router.push(`/products/${item.id}`)">
                  {{ item.name }}
                </h3>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-orange-500 font-bold">{{ item.price }} Ks</span>
                  <span v-if="item.originalPrice && item.originalPrice > item.price" 
                        class="text-gray-400 text-sm line-through">{{ item.originalPrice }} Ks</span>
                </div>
                
                <div class="flex items-center justify-between mt-4">
                  <div class="flex items-center border rounded-lg">
                    <button @click="updateQuantity(item.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                            class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50">-</button>
                    <input type="number" :value="item.quantity" 
                           @change="updateQuantity(item.id, parseInt($event.target.value))"
                           class="w-12 text-center border-x py-1" />
                    <button @click="updateQuantity(item.id, item.quantity + 1)"
                            class="px-3 py-1 hover:bg-gray-100">+</button>
                  </div>
                  
                  <button @click="removeItem(item.id)" class="text-red-500 hover:text-red-700">
                    Remove
                  </button>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-lg font-bold text-gray-800">{{ (item.price * item.quantity).toFixed(2) }} Ks</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
            
            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ selectedItems.length }} items)</span>
                <span>{{ selectedSubtotal.toFixed(2) }} Ks</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="text-green-600">Free</span>
              </div>
            </div>
            
            <div class="border-t pt-4 mb-6">
              <div class="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-orange-500">{{ selectedTotal.toFixed(2) }} Ks</span>
              </div>
            </div>
            
            <!-- Voucher Code -->
            <div class="mb-4">
              <div class="flex gap-2">
                <input type="text" v-model="voucherCode" placeholder="Enter voucher code"
                       class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Apply
                </button>
              </div>
            </div>
            
            <button @click="checkout" 
                    :disabled="selectedItems.length === 0"
                    class="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Proceed to Checkout
            </button>
            
            <router-link to="/" class="block text-center mt-4 text-orange-500 hover:underline">
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <FooterCompact />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const selectedItems = ref([])
const selectAll = ref(false)
const voucherCode = ref('')

const selectedSubtotal = computed(() => {
  return cartStore.items
    .filter(item => selectedItems.value.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const selectedTotal = computed(() => {
  return selectedSubtotal.value // Add tax/shipping if needed
})

function toggleSelectAll() {
  if (selectAll.value) {
    selectedItems.value = cartStore.items.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) return
  cartStore.updateQuantity(productId, newQuantity)
}

function removeItem(productId) {
  cartStore.removeFromCart(productId)
  selectedItems.value = selectedItems.value.filter(id => id !== productId)
}

function checkout() {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }
  router.push('/checkout')
}

// Select all by default
selectedItems.value = cartStore.items.map(item => item.id)
selectAll.value = true
</script>
