<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Component -->
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- TikTok Videos Section -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            @pontpontbagshopmdy
          </h2>
          <a href="https://www.tiktok.com/@pontpontbagshopmdy" target="_blank" 
             class="text-orange-500 hover:text-orange-600 text-sm flex items-center gap-1">
            Follow on TikTok
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>

        <!-- Loading State -->
        <div v-if="loadingVideos" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          <p class="mt-3 text-gray-600 text-sm">Loading videos...</p>
        </div>

        <!-- TikTok Videos Grid -->
        <div v-else-if="tiktokVideos.length > 0" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div v-for="(video, index) in tiktokVideos" :key="video.id" 
               class="bg-white rounded shadow overflow-hidden hover:shadow-lg transition">
            <div class="relative" style="height: 280px;">
              <iframe 
                height="280" 
                width="100%" 
                :src="`https://www.tiktok.com/player/v1/${video.video_id}?embed_from=webapp_share&music_info=0&description=0&autoplay=0&muted=1`" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" 
                allowfullscreen 
                loading="lazy"
                class="w-full">
              </iframe>
            </div>
            <div v-if="video.title" class="p-2 bg-gray-50">
              <p class="text-xs text-gray-700 text-center">{{ video.title }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-white rounded-lg">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <p class="text-gray-500">No videos available</p>
          <a href="https://www.tiktok.com/@pontpontbagshopmdy" target="_blank" 
             class="text-orange-500 hover:underline text-sm mt-2 inline-block">
            Visit our TikTok
          </a>
        </div>
      </section>

      <!-- Categories Grid -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Categories</h2>
        <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
          <div v-for="category in categories" :key="category.id"
               @click="filterByCategory(category.slug)"
               class="bg-white rounded-lg p-4 text-center cursor-pointer hover:shadow-lg transition group">
            <div class="w-16 h-16 mx-auto mb-2 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100">
              <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <p class="text-sm text-gray-700 font-medium">{{ category.name }}</p>
          </div>
        </div>
      </section>

      <!-- Just For You Section -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">Just For You</h2>
          <button @click="showAllProducts" class="text-orange-500 hover:text-orange-600 text-sm">
            SEE ALL >
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="product in products.slice(0, 12)" :key="product.id"
               class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
               @click="viewProduct(product.id)">
            <div class="relative">
              <img :src="product.images?.[0] || '/placeholder.jpg'" 
                   :alt="product.name"
                   class="w-full h-48 object-cover" />
              <span v-if="product.sale_price" class="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                -{{ Math.round((1 - product.sale_price / product.price) * 100) }}%
              </span>
            </div>
            <div class="p-3">
              <h3 class="text-sm text-gray-800 line-clamp-2 mb-2">{{ product.name }}</h3>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-orange-500 font-bold">{{ product.sale_price || product.price }} Ks</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <FooterCompact />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import api from '../api'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'

const router = useRouter()
const cartStore = useCartStore()

const products = ref([])
const categories = ref([])
const tiktokVideos = ref([])
const loadingVideos = ref(true)

function loadProducts() {
  api.get('/products').then(res => {
    if (res.data.success) {
      products.value = res.data.data
    }
  })
}

function loadCategories() {
  api.get('/categories').then(res => {
    if (res.data.success) {
      categories.value = res.data.data
    }
  })
}

function loadTiktokVideos() {
  loadingVideos.value = true
  api.get('/tiktok').then(res => {
    if (res.data.success) {
      tiktokVideos.value = res.data.data
    }
    loadingVideos.value = false
  }).catch(() => {
    loadingVideos.value = false
  })
}

function filterByCategory(slug) {
  router.push({ path: '/products', query: { category: slug } })
}

function showAllProducts() {
  router.push('/products')
}

function viewProduct(id) {
  router.push(`/products/${id}`)
}

onMounted(() => {
  loadProducts()
  loadCategories()
  loadTiktokVideos()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
