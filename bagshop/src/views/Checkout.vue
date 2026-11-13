<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <router-link to="/" class="hover:text-orange-500">Home</router-link>
        <span>></span>
        <span class="text-gray-800">Checkout</span>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>

      <form v-else @submit.prevent="placeOrder" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Shipping Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Shipping Address
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 mb-1 text-sm">Full Name *</label>
                <input type="text" v-model="form.fullName" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label class="block text-gray-700 mb-1 text-sm">Phone *</label>
                <input type="tel" v-model="form.phone" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-gray-700 mb-1 text-sm">Email *</label>
                <input type="email" v-model="form.email" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-gray-700 mb-1 text-sm">Address *</label>
                <input type="text" v-model="form.address" required placeholder="Street address"
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label class="block text-gray-700 mb-1 text-sm">City *</label>
                <input type="text" v-model="form.city" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label class="block text-gray-700 mb-1 text-sm">Postal Code</label>
                <input type="text" v-model="form.postalCode"
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-gray-700 mb-1 text-sm">Note</label>
                <textarea v-model="form.notes" rows="3" placeholder="Optional delivery note"
                          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Payment Method
            </h3>
            
            <div class="space-y-3">
              <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-orange-500"
                     :class="paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : ''">
                <input type="radio" v-model="paymentMethod" value="cod" class="text-orange-500" />
                <div class="flex-1">
                  <p class="font-semibold text-gray-800">Cash on Delivery</p>
                  <p class="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </label>
              
              <label class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-orange-500"
                     :class="paymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : ''">
                <input type="radio" v-model="paymentMethod" value="bank" class="text-orange-500" />
                <div class="flex-1">
                  <p class="font-semibold text-gray-800">Bank Transfer</p>
                  <p class="text-sm text-gray-500">Transfer to our bank account</p>
                </div>
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </label>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
            
            <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
              <div v-for="item in cartStore.items" :key="item.id" 
                   class="flex gap-3 py-2 border-b last:border-0">
                <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded" />
                <div class="flex-1">
                  <p class="text-sm text-gray-800 line-clamp-1">{{ item.name }}</p>
                  <p class="text-sm text-gray-500">x{{ item.quantity }}</p>
                  <p class="text-sm font-semibold text-orange-500">{{ (item.price * item.quantity).toFixed(2) }} Ks</p>
                </div>
              </div>
            </div>
            
            <div class="space-y-3 border-t pt-4">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{{ cartStore.totalPrice.toFixed(2) }} Ks</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="text-green-600">Free</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{{ tax.toFixed(2) }} Ks</span>
              </div>
              <div class="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span class="text-orange-500">{{ total.toFixed(2) }} Ks</span>
              </div>
            </div>
            
            <button type="submit" 
                    :disabled="submitting"
                    class="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="submitting" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ submitting ? 'Processing...' : 'Place Order' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <FooterCompact />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'
import api from '../api'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(true)
const submitting = ref(false)
const paymentMethod = ref('cod')

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  notes: ''
})

const tax = computed(() => cartStore.totalPrice * 0.05)
const total = computed(() => cartStore.totalPrice + tax.value)

function loadUserInfo() {
  if (authStore.isAuthenticated && authStore.user) {
    form.fullName = `${authStore.user.firstName || ''} ${authStore.user.lastName || ''}`.trim()
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
  }
  loading.value = false
}

async function placeOrder() {
  if (cartStore.items.length === 0) {
    alert('Your cart is empty')
    return
  }

  submitting.value = true

  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode
      },
      billingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode
      },
      paymentMethod: paymentMethod.value,
      notes: form.notes
    }

    const response = await api.post('/orders', orderData)

    if (response.data.success) {
      cartStore.clearCart()
      alert('Order placed successfully!')
      router.push('/')
    }
  } catch (error) {
    console.error('Order error:', error)
    alert(error.response?.data?.message || 'Failed to place order. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }
  
  if (cartStore.items.length === 0) {
    router.push('/cart')
    return
  }
  
  loadUserInfo()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
