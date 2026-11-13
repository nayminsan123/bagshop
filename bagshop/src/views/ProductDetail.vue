<template>
  <div class="min-h-screen bg-gray-100">
    <HeaderCompact />

    <div class="container mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <router-link to="/" class="hover:text-orange-500">Home</router-link>
        <span>></span>
        <router-link to="/products" class="hover:text-orange-500">Products</router-link>
        <span>></span>
        <span class="text-gray-800">{{ product?.name || 'Loading...' }}</span>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">Loading product...</p>
      </div>

      <div v-else-if="product" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          
          <!-- Left: Product Images -->
          <div class="border-r">
            <div class="sticky top-24 p-6">
              <!-- Main Image -->
              <div class="relative mb-4">
                <img :src="currentImage" :alt="product.name" 
                     class="w-full h-[500px] object-contain rounded-lg bg-gray-50" />
                
                <!-- Discount Badge -->
                <span v-if="product.sale_price && product.price > product.sale_price" 
                      class="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded font-bold text-lg">
                  -{{ Math.round((1 - product.sale_price / product.price) * 100) }}% OFF
                </span>

                <!-- Image Navigation -->
                <button v-if="allImages.length > 1" 
                        @click="prevImage"
                        class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button v-if="allImages.length > 1" 
                        @click="nextImage"
                        class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow hover:bg-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>

              <!-- Thumbnail Images -->
              <div class="flex gap-3 justify-center">
                <button v-for="(img, index) in allImages" :key="index"
                        @click="currentImageIndex = index"
                        :class="['w-20 h-20 rounded-lg overflow-hidden border-2 transition', 
                                 currentImageIndex === index ? 'border-orange-500' : 'border-gray-200 hover:border-orange-300']">
                  <img :src="img" :alt="`Image ${index + 1}`" class="w-full h-full object-cover" />
                </button>
              </div>

              <!-- Image Counter -->
              <p class="text-center text-gray-500 text-sm mt-4">
                Image {{ currentImageIndex + 1 }} of {{ allImages.length }}
              </p>
            </div>
          </div>

          <!-- Right: Product Info -->
          <div class="p-8">
            <!-- Brand -->
            <p class="text-orange-500 text-sm font-medium mb-2">{{ product.category_name || 'BagShop' }}</p>
            
            <!-- Title -->
            <h1 class="text-2xl font-bold text-gray-900 mb-3">{{ product.name }}</h1>

            <!-- Rating & Sold -->
            <div class="flex items-center gap-4 mb-4 pb-4 border-b">
              <div class="flex items-center gap-1">
                <div class="flex">
                  <svg v-for="i in 5" :key="i" class="w-5 h-5" 
                       :class="i <= Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'" 
                       viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                </div>
                <span class="text-gray-700 font-medium ml-1">{{ product.rating || 4.5 }}</span>
              </div>
              <span class="text-gray-300">|</span>
              <span class="text-gray-600 text-sm">{{ product.reviews_count || 0 }} Reviews</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-600 text-sm">{{ product.stock || 0 }} sold</span>
            </div>

            <!-- Price Section -->
            <div class="bg-orange-50 rounded-xl p-6 mb-6">
              <div class="flex items-baseline gap-4">
                <span class="text-4xl font-bold text-orange-500">
                  {{ formatPrice(product.sale_price || product.price) }} Ks
                </span>
                <span v-if="product.sale_price && product.price > product.sale_price" 
                      class="text-xl text-gray-400 line-through">
                  {{ formatPrice(product.price) }} Ks
                </span>
              </div>
              <div v-if="product.sale_price && product.price > product.sale_price" class="mt-2">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  You save {{ formatPrice(product.price - product.sale_price) }} Ks!
                </span>
              </div>
            </div>

            <!-- Color Selection -->
            <div class="mb-6">
              <h3 class="text-gray-700 font-semibold mb-3">Color: <span class="font-normal text-gray-500">{{ selectedColor }}</span></h3>
              <div class="flex gap-3">
                <button v-for="color in colors" :key="color.name"
                        @click="selectedColor = color.name"
                        :class="['w-12 h-12 rounded-full border-2 transition relative', 
                                 selectedColor === color.name ? 'border-orange-500' : 'border-gray-300 hover:border-orange-300']"
                        :style="{ backgroundColor: color.code }">
                  <span v-if="selectedColor === color.name" class="absolute inset-0 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div class="mb-6">
              <h3 class="text-gray-700 font-semibold mb-3">Quantity</h3>
              <div class="flex items-center gap-4">
                <div class="flex items-center border-2 rounded-lg overflow-hidden">
                  <button @click="decrementQuantity" 
                          :disabled="quantity <= 1"
                          class="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xl">
                    −
                  </button>
                  <input type="number" :value="quantity" 
                         @change="setQuantity($event.target.value)"
                         class="w-16 h-12 text-center border-x text-lg font-medium" />
                  <button @click="incrementQuantity"
                          :disabled="quantity >= product.stock"
                          class="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xl">
                    +
                  </button>
                </div>
                <span class="text-gray-500">{{ product.stock }} pieces available</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 mb-6">
              <button @click="addToCart" 
                      class="flex-1 h-14 bg-white border-2 border-orange-500 text-orange-500 rounded-xl font-semibold text-lg hover:bg-orange-50 transition flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Add to Cart
              </button>
              <button @click="buyNow" 
                      class="flex-1 h-14 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Buy Now
              </button>
            </div>

            <!-- Features -->
            <div v-if="product.features && product.features.length" class="mb-6">
              <h3 class="text-gray-700 font-semibold mb-3">Product Features</h3>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="(feature, index) in product.features" :key="index" 
                     class="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-700 text-sm">{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery & Returns -->
            <div class="space-y-4 pt-6 border-t">
              <div class="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <svg class="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                </svg>
                <div>
                  <p class="font-semibold text-gray-800">Free Delivery</p>
                  <p class="text-sm text-gray-600">Enter your postal code for delivery availability</p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <svg class="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <div>
                  <p class="font-semibold text-gray-800">Return Delivery</p>
                  <p class="text-sm text-gray-600">Free 30 days delivery returns. <a href="#" class="text-orange-500 underline">Details</a></p>
                </div>
              </div>

              <div class="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                <svg class="w-8 h-8 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <div>
                  <p class="font-semibold text-gray-800">Secure Payment</p>
                  <p class="text-sm text-gray-600">100% secure payment with SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Description Tab -->
        <div class="border-t">
          <div class="container mx-auto p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Product Description</h2>
            <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h2 class="text-xl text-gray-500 mb-4">Product not found</h2>
        <router-link to="/" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
          Back to Home
        </router-link>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-12">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Related Products</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="prod in relatedProducts" :key="prod.id"
               @click="router.push(`/products/${prod.id}`)"
               class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer">
            <img :src="prod.images?.[0]" :alt="prod.name" class="w-full h-40 object-cover" />
            <div class="p-3">
              <h3 class="text-sm text-gray-800 line-clamp-1">{{ prod.name }}</h3>
              <p class="text-orange-500 font-bold mt-1">{{ formatPrice(prod.sale_price || prod.price) }} Ks</p>
            </div>
          </div>
        </div>
      </div>
    </div>

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

const product = ref(null)
const relatedProducts = ref([])
const loading = ref(true)
const currentImageIndex = ref(0)
const quantity = ref(1)
const selectedColor = ref('Black')

const colors = [
  { name: 'Black', code: '#1a1a1a' },
  { name: 'Brown', code: '#8B4513' },
  { name: 'Tan', code: '#D2B48C' },
  { name: 'Navy', code: '#1e3a5f' }
]

const currentImage = computed(() => {
  return allImages.value[currentImageIndex.value] || ''
})

const allImages = computed(() => {
  if (!product.value?.images || product.value.images.length === 0) {
    return ['https://via.placeholder.com/500x500?text=No+Image']
  }
  return product.value.images
})

function formatPrice(price) {
  return parseFloat(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function loadProduct() {
  loading.value = true
  const productId = route.params.id
  
  api.get(`/products/${productId}`).then(res => {
    if (res.data.success) {
      product.value = res.data.data
      document.title = `${product.value.name} - BagShop`
      
      // Load related products
      loadRelatedProducts(product.value.category_id, product.value.id)
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function loadRelatedProducts(categoryId, excludeId) {
  api.get('/products', { params: { limit: 6 } }).then(res => {
    if (res.data.success) {
      relatedProducts.value = res.data.data.filter(p => p.id !== excludeId).slice(0, 6)
    }
  })
}

function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length
}

function prevImage() {
  currentImageIndex.value = currentImageIndex.value === 0 ? allImages.value.length - 1 : currentImageIndex.value - 1
}

function incrementQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function setQuantity(value) {
  const newQty = parseInt(value) || 1
  quantity.value = Math.max(1, Math.min(newQty, product.value.stock || 999))
}

function addToCart() {
  if (!product.value) return
  
  cartStore.addToCart({
    id: product.value.id,
    name: product.value.name,
    price: product.value.sale_price || product.value.price,
    originalPrice: product.value.price,
    image: product.value.images?.[0] || '',
    color: selectedColor.value,
    quantity: quantity.value
  })
  
  // Show success notification
  showNotification(`${quantity.value} item(s) added to cart!`)
}

function buyNow() {
  addToCart()
  router.push('/checkout')
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up'
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transform = 'translateY(20px)'
    notification.style.transition = 'all 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    currentImageIndex.value = 0
    quantity.value = 1
    window.scrollTo(0, 0)
    loadProduct()
  }
})

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
