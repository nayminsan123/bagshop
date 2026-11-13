<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCompact />

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">
            {{ isLogin ? 'Login' : 'Create Account' }}
          </h1>

          <form @submit.prevent="handleSubmit">
            <div v-if="!isLogin" class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-gray-700 mb-1 text-sm">First Name</label>
                <input type="text" v-model="form.firstName" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label class="block text-gray-700 mb-1 text-sm">Last Name</label>
                <input type="text" v-model="form.lastName" required
                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-sm">Email</label>
              <input type="email" v-model="form.email" required
                     class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
            </div>

            <div class="mb-4">
              <label class="block text-gray-700 mb-1 text-sm">Password</label>
              <input type="password" v-model="form.password" required :minlength="isLogin ? 0 : 6"
                     class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
            </div>

            <div v-if="!isLogin" class="mb-4">
              <label class="block text-gray-700 mb-1 text-sm">Confirm Password</label>
              <input type="password" v-model="form.confirmPassword" required
                     class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500" />
            </div>

            <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

            <button type="submit" :disabled="loading"
                    class="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account') }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
              <button @click="isLogin = !isLogin" class="text-orange-500 font-semibold hover:underline ml-1">
                {{ isLogin ? 'Sign Up' : 'Login' }}
              </button>
            </p>
          </div>

          <div class="mt-6 pt-6 border-t">
            <p class="text-center text-gray-500 text-sm mb-4">Or continue with</p>
            <div class="flex gap-4">
              <button class="flex-1 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button class="flex-1 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FooterCompact />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    if (isLogin.value) {
      // Login
      const result = await authStore.login(form.email, form.password)
      if (result.success) {
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        error.value = result.message
      }
    } else {
      // Register
      if (form.password !== form.confirmPassword) {
        error.value = 'Passwords do not match'
        loading.value = false
        return
      }

      const result = await authStore.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password
      })

      if (result.success) {
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        error.value = result.message
      }
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>
