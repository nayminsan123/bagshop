<template>
  <div class="card group">
    <div class="relative overflow-hidden">
      <img :src="product.image" :alt="product.name" 
           class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <button @click="addToCart" 
                class="opacity-0 group-hover:opacity-100 bg-white text-primary-800 px-6 py-2 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          Add to Cart
        </button>
      </div>
    </div>
    <div class="p-4">
      <router-link :to="`/products/${product.id}`">
        <h3 class="font-semibold text-lg text-gray-800 hover:text-primary-800 transition-colors">
          {{ product.name }}
        </h3>
      </router-link>
      <div class="flex items-center justify-between mt-2">
        <span class="text-primary-800 font-bold text-xl">${{ product.price }}</span>
        <div class="flex items-center text-yellow-500">
          <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.floor(product.rating) ? 'fill-current' : 'fill-gray-300'" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
          <span class="text-gray-600 text-sm ml-1">({{ product.rating }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

function addToCart() {
  cartStore.addToCart(props.product)
  alert('Added to cart!')
}
</script>
