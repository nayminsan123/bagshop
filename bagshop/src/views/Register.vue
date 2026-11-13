<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-900">BagShop</h1>
        <p class="text-gray-600 mt-2">Create your account</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-primary-900 mb-6">Sign Up</h2>

        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 mb-1">First Name</label>
                <input type="text" v-model="form.firstName" required
                       class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label class="block text-gray-700 mb-1">Last Name</label>
                <input type="text" v-model="form.lastName" required
                       class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label class="block text-gray-700 mb-1">Email</label>
              <input type="email" v-model="form.email" required
                     class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-gray-700 mb-1">Password</label>
              <input type="password" v-model="form.password" required minlength="6"
                     class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-gray-700 mb-1">Confirm Password</label>
              <input type="password" v-model="form.confirmPassword" required
                     class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <label class="flex items-start">
              <input type="checkbox" v-model="form.terms" required class="mr-2 mt-1" />
              <span class="text-gray-600 text-sm">
                I agree to the <a href="#" class="text-primary-800 hover:underline">Terms of Service</a> 
                and <a href="#" class="text-primary-800 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>

          <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>

          <button type="submit" :disabled="loading"
                  class="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-primary-800 font-semibold hover:underline">
              Sign In
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''

  const result = await authStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password
  })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>
