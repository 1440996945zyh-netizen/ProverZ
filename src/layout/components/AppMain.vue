<template>
	<section class="app-main">
		<router-view v-slot="{ Component, route }">
			<keep-alive :include="tagsViewStore.cachedViews">
				<component 
					v-if="!isIframeRoute(route)" 
					:is="Component" 
					:key="route.path" 
				/>
			</keep-alive>
		</router-view>
		<iframe-toggle />
	</section>
</template>

<script setup>
import iframeToggle from './IframeToggle/index'
import useTagsViewStore from '@/store/modules/tagsView'
import { useRoute } from 'vue-router'

const route = useRoute()
const tagsViewStore = useTagsViewStore()

// 判断是否是 iframe 路由
const isIframeRoute = (route) => {
  // 检查路径是否以 /iframe/ 开头
  return route.path.startsWith('/iframe/') && 
         tagsViewStore.iframeViews.some(v => v.path === route.path)
}

console.log('Current route:', route.path, 'meta:', route.meta, 'is iframe:', isIframeRoute(route));
console.log('All iframe views:', tagsViewStore.iframeViews);
</script>