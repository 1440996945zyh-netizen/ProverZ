<template>
	<div
		class="sidebar-logo-container"
		:class="{ collapse: collapse }"
		:style="{
			backgroundColor: !topNav
				? sideTheme === 'theme-dark'
					? variables.menuBackground
					: variables.menuLightBackground
				: variables.topNavColor,
		}"
	>
		<router-link key="collapse" class="sidebar-logo-link" to="/">
			<img :src="logo" class="sidebar-logo" />
			<span
				class="sidebar-title"
				:style="{
					color: !topNav
						? sideTheme === 'theme-dark'
							? variables.logoTitleColor
							: variables.logoLightTitleColor
						: variables.logoTitleColor,
				}"
			>
				{{ title }}
			</span>
		</router-link>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import variables from '@/assets/styles/variables.module.scss'
import logo from '@/assets/logo/logo1.png'
import useSettingsStore from '@/store/modules/settings'

defineProps({
	collapse: {
		type: Boolean,
		required: true,
	},
})

const title = ref('数智设备物资管理平台')
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)
const topNav = computed(() => settingsStore.topNav)
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
	transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
	opacity: 0;
}

.sidebar-logo-container {
	width: 100%;
	height: 50px;
	line-height: 50px;
	background: #2b2f3a;
	padding-left: 5px;
	overflow: visible;
	transition: width 0.28s;
	& .sidebar-logo-link {
		height: 100%;
		display: flex;
		align-items: center;
		padding-left: 5px;

		& .sidebar-logo {
			width: 36px;
			height: 36px;
		}

		& .sidebar-title {
			margin: 0;
			font-weight: 600;
			font-size: 16px;
			font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
			white-space: nowrap;
			letter-spacing: 0px;
			margin-left: 8px;
		}
	}

	&.collapse {
		.sidebar-logo {
			margin-right: 0px;
		}
	}
}
</style>
