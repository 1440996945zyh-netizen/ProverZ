<template>
  <div class="app-container">
    <el-carousel
      :interval="4000"
      height="91vh"
      indicator-position="outside"
      arrow="always"
      style='margin-right: 30px;width: 98%'
    >
      <el-carousel-item v-for="(item, index) in carouselImages" :key="index">
        <img
          :src="item.src"
          :alt="item.alt"
          style="width: 100%; height: 100%; object-fit: fill; display: block; margin: 0; padding: 0; border: none;"
        />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import map from '@/assets/map/map.png'
import map1 from '@/assets/map/map1.png'
import map2 from '@/assets/map/map2.png'
import map3 from '@/assets/map/map3.png'
import map4 from '@/assets/map/map4.png'
import map5 from '@/assets/map/map5.png'
import map6 from '@/assets/map/map6.png'
import map7 from '@/assets/map/map7.png'
const screenHeight = ref(window.innerHeight)

// 轮播图数据
const carouselImages = ref([
  {
    src: map1,
    alt: '地图'
  },
  {
    src: map3,
    alt: '地图'
  },
  {
    src: map5,
    alt: '地图'
  },

	{
		src: map4,
		alt: '地图'
	},

	{
		src: map6,
		alt: '地图'
	},
  {
    src: map3,
    alt: '地图'
  },
	{
		src: map7,
		alt: '地图'
	},
  {
    src: map2,
    alt: '地图'
  },
])

function updateScreenHeight() {
  screenHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', updateScreenHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenHeight)
})
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 91vh;
  overflow: hidden;
}

.el-carousel {
  width: 100%;
  height: 100%;
}

.el-carousel__item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-carousel__item img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
</style>
