<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <router-link to="/" class="hover:text-orange-500">Home</router-link>
        <span>></span>
        <span class="text-gray-800">My Account</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center mb-6">
              <div class="w-20 h-20 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-3xl text-orange-500 font-bold">
                {{ authStore.user?.firstName?.charAt(0) }}{{ authStore.user?.lastName?.charAt(0) }}
              </div>
              <h3 class="mt-3 font-semibold text-gray-800">
                {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
              </h3>
              <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
            </div>
            
            <nav class="space-y-1">
              <button @click="activeTab = 'profile'"
                      :class="['w-full text-left px-4 py-3 rounded-lg transition', 
                               activeTab === 'profile' ? 'bg-orange-50 text-orange-500 font-medium' : 'hover:bg-gray-50']">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                My Profile
              </button>
              <button @click="activeTab = 'orders'"
                      :class="['w-full text-left px-4 py-3 rounded-lg transition', 
                               activeTab === 'orders' ? 'bg-orange-50 text-orange-500 font-medium' : 'hover:bg-gray-50']">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                My Orders
              </button>
              <button @click="logout"
                      class="w-full text-left px-4 py-3 rounded-lg text-red-500 hover:bg-red-50">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-gray-700 mb-1">First Name</label>
                  <input type="text" v-model="profileForm.firstName"
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label class="block text-gray-700 mb-1">Last Name</label>
                  <input type="text" v-model="profileForm.lastName"
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label class="block text-gray-700 mb-1">Email</label>
                  <input type="email" v-model="profileForm.email" disabled
                         class="w-full px-4 py-2 border rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label class="block text-gray-700 mb-1">Phone</label>
                  <input type="tel" v-model="profileForm.phone"
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
              </div>
              
              <button type="submit" :disabled="saving"
                      class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>

            <div class="mt-8 pt-8 border-t">
              <h3 class="font-semibold text-gray-800 mb-4">Change Password</h3>
              <form @submit.prevent="changePassword" class="space-y-4">
                <div class="max-w-md">
                  <label class="block text-gray-700 mb-1">Current Password</label>
                  <input type="password" v-model="passwordForm.currentPassword" required
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
                <div class="max-w-md">
                  <label class="block text-gray-700 mb-1">New Password</label>
                  <input type="password" v-model="passwordForm.newPassword" required minlength="6"
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
                <div class="max-w-md">
                  <label class="block text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" v-model="passwordForm.confirmPassword" required
                         class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
                </div>
                <button type="submit" :disabled="changingPassword"
                        class="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50">
                  {{ changingPassword ? 'Changing...' : 'Change Password' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Orders Tab -->
          <div v-if="activeTab === 'orders'">
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-4 border-b">
                <h2 class="text-xl font-bold text-gray-800">My Orders</h2>
              </div>
              
              <div v-if="loadingOrders" class="p-8 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              </div>

              <div v-else-if="orders.length === 0" class="p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p class="text-gray-500">You have no orders yet</p>
                <router-link to="/" class="inline-block mt-4 text-orange-500 hover:underline">
                  Start Shopping
                </router-link>
              </div>

              <div v-else class="divide-y">
                <div v-for="order in orders" :key="order.id" class="p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <p class="text-sm text-gray-500">Order #{{ order.id.substring(0, 8).toUpperCase() }}</p>
                      <p class="text-sm text-gray-400">{{ formatDate(order.created_at) }}</p>
                    </div>
                    <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-gray-800">{{ order.total.toFixed(2) }} Ks</span>
                    <button @click="viewOrder(order)" class="text-orange-500 hover:underline text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterCompact />

    <!-- Order Detail Modal -->
    <div v-if="showOrderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-bold">Order Details</h3>
          <button @click="showOrderModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div v-if="selectedOrder" class="p-6">
          <div class="space-y-4 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Order ID</span>
              <span class="font-medium">{{ selectedOrder.id.substring(0, 8).toUpperCase() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Date</span>
              <span>{{ formatDate(selectedOrder.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status</span>
              <span :class="getStatusClass(selectedOrder.status)" class="px-3 py-1 rounded-full text-xs">
                {{ selectedOrder.status }}
              </span>
            </div>
          </div>
          
          <h4 class="font-semibold mb-3">Items</h4>
          <div class="space-y-2 mb-6">
            <div v-for="item in selectedOrder.items" :key="item.id" 
                 class="flex justify-between py-2 border-b">
              <div>
                <p class="text-gray-800">{{ item.product_name }}</p>
                <p class="text-sm text-gray-500">x{{ item.quantity }}</p>
              </div>
              <span class="font-medium">{{ item.total.toFixed(2) }} Ks</span>
            </div>
          </div>
          
          <div class="space-y-2 pt-4 border-t">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span>{{ selectedOrder.subtotal.toFixed(2) }} Ks</span>
            </div>
            <div class="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="text-orange-500">{{ selectedOrder.total.toFixed(2) }} Ks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('profile')
const saving = ref(false)
const changingPassword = ref(false)
const loadingOrders = ref(false)
const orders = ref([])
const showOrderModal = ref(false)
const selectedOrder = ref(null)

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function loadProfile() {
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || ''
    profileForm.lastName = authStore.user.lastName || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
  }
}

async function loadOrders() {
  loadingOrders.value = true
  try {
    const response = await api.get('/orders')
    if (response.data.success) {
      orders.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loadingOrders.value = false
  }
}

async function updateProfile() {
  saving.value = true
  try {
    await api.put('/auth/me', {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone
    })
    await authStore.fetchUser()
    alert('Profile updated!')
  } catch (error) {
    alert('Failed to update profile')
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('Passwords do not match')
    return
  }

  changingPassword.value = true
  try {
    await api.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    alert('Password changed!')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

async function viewOrder(order) {
  try {
    const response = await api.get(`/orders/${order.id}`)
    if (response.data.success) {
      selectedOrder.value = response.data.data
      showOrderModal.value = true
    }
  } catch (error) {
    console.error('Error loading order:', error)
  }
}

function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function logout() {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadProfile()
  loadOrders()
})
</script>
