<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Component -->
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <router-link to="/" class="hover:text-orange-500">Home</router-link>
        <span>></span>
        <span class="text-gray-800">Products</span>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar Filters -->
        <div class="w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h3 class="font-bold text-gray-800 mb-4">FILTER BY</h3>
            
            <!-- Category Filter -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-700 mb-3">Categories</h4>
              <div class="space-y-2">
                <label v-for="cat in categories" :key="cat.id" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="selectedCategories" :value="cat.slug"
                         class="w-4 h-4 text-orange-500 rounded" @change="applyFilters" />
                  <span class="text-gray-600">{{ cat.name }}</span>
                  <span class="text-gray-400 text-sm">({{ cat.productCount }})</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-700 mb-3">Price Range</h4>
              <div class="flex items-center gap-2">
                <input type="number" v-model="priceMin" placeholder="Min" 
                       class="w-full px-3 py-2 border rounded text-sm" />
                <span>-</span>
                <input type="number" v-model="priceMax" placeholder="Max"
                       class="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <button @click="applyFilters" class="w-full mt-3 bg-orange-500 text-white py-2 rounded text-sm hover:bg-orange-600">
                Apply
              </button>
            </div>

            <!-- Rating Filter -->
            <div class="mb-6">
              <h4 class="font-semibold text-gray-700 mb-3">Rating</h4>
              <div class="space-y-2">
                <label v-for="i in [5, 4, 3, 2, 1]" :key="i" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="selectedRatings" :value="i"
                         class="w-4 h-4 text-orange-500 rounded" @change="applyFilters" />
                  <div class="flex items-center gap-1">
                    <svg v-for="j in 5" :key="j" class="w-4 h-4" :class="j <= i ? 'text-yellow-400 fill-current' : 'text-gray-300'" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <button @click="clearFilters" class="w-full border border-orange-500 text-orange-500 py-2 rounded hover:bg-orange-50">
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Sort Options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <span class="text-gray-600">{{ totalProducts }} products found</span>
            <div class="flex items-center gap-4">
              <span class="text-gray-600">Sort by:</span>
              <select v-model="sortBy" @change="applyFilters" 
                      class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <!-- Products -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="product in products" :key="product.id"
                 class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                 @click="viewProduct(product.id)">
              <div class="relative">
                <img :src="product.images?.[0] || '/placeholder.jpg'" 
                     :alt="product.name"
                     class="w-full h-48 object-cover" />
                <span v-if="product.sale_price" class="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  -{{ Math.round((1 - product.sale_price / product.price) * 100) }}%
                </span>
                <button @click.stop="addToCart(product)" 
                        class="absolute bottom-2 right-2 bg-orange-500 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </button>
              </div>
              <div class="p-3">
                <h3 class="text-sm text-gray-800 line-clamp-2 mb-2">{{ product.name }}</h3>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-orange-500 font-bold">{{ product.sale_price || product.price }} Ks</span>
                  <span v-if="product.sale_price" class="text-gray-400 text-sm line-through">{{ product.price }} Ks</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span>{{ product.rating || 4.5 }}</span>
                  </div>
                  <span>{{ product.stock }} in stock</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="products.length === 0" class="text-center py-12">
            <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p class="text-gray-500 text-lg">No products found</p>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                    class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button v-for="page in displayPages" :key="page"
                    @click="changePage(page)"
                    :class="['px-4 py-2 border rounded', currentPage === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-50']">
              {{ page }}
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                    class="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <FooterCompact />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import HeaderCompact from '../components/HeaderCompact.vue'
import FooterCompact from '../components/FooterCompact.vue'
import api from '../api'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const products = ref([])
const categories = ref([])
const totalProducts = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)

const selectedCategories = ref([])
const selectedRatings = ref([])
const priceMin = ref('')
const priceMax = ref('')
const sortBy = ref('newest')

const displayPages = computed(() => {
  const pages = []
  for (let i = 1; i <= Math.min(totalPages.value, 5); i++) {
    pages.push(i)
  }
  return pages
})

function loadProducts() {
  const params = {
    page: currentPage.value,
    limit: 12,
    sort: sortBy.value
  }
  
  if (selectedCategories.value.length > 0) {
    params.category = selectedCategories.value[0]
  }
  
  if (route.query.search) {
    params.search = route.query.search
  }
  
  api.get('/products', { params }).then(res => {
    if (res.data.success) {
      products.value = res.data.data
      totalProducts.value = res.data.total
      totalPages.value = res.data.totalPages
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

function applyFilters() {
  currentPage.value = 1
  loadProducts()
}

function clearFilters() {
  selectedCategories.value = []
  selectedRatings.value = []
  priceMin.value = ''
  priceMax.value = ''
  sortBy.value = 'newest'
  loadProducts()
}

function changePage(page) {
  currentPage.value = page
  loadProducts()
}

function viewProduct(id) {
  router.push(`/products/${id}`)
}

function addToCart(product) {
  cartStore.addToCart(product)
}

watch(() => route.query, () => {
  loadProducts()
}, { deep: true })

onMounted(() => {
  loadCategories()
  loadProducts()
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
