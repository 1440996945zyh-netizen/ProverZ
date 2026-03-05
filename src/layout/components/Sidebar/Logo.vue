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
		<transition name="sidebarLogoFade">
			<router-link key="collapse" class="sidebar-logo-link" to="/">
				<img :src="logo" class="sidebar-logo" />
				<h1
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
				</h1>
			</router-link>
			<!-- <router-link v-else key="expand" class="sidebar-logo-link" to="/">
				<img v-if="logo" :src="logo" class="sidebar-logo" />
				<h1
					class="sidebar-title"
					:style="{ color: !topNav?sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor: variables.logoTitleColor }"
				>
					{{ title }}
				</h1>
			</router-link> -->
		</transition>
	</div>
</template>

<script setup>
import variables from '@/assets/styles/variables.module.scss'
import logo from '@/assets/logo/logo1.png'
import useSettingsStore from '@/store/modules/settings'

defineProps({
	collapse: {
		type: Boolean,
		required: true,
	},
})

const title = ref('设备管理系统')
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
	padding-left: 10px;
	overflow: hidden;
	transition: width 0.28s;
	& .sidebar-logo-link {
		height: 100%;
		width: 100%;

		& .sidebar-logo {
			width: 40px;
			height: 40px;
			vertical-align: middle;
			margin-top: -6%;
			margin-left: -12px;
		}

		& .sidebar-title {
			display: inline-block;
			margin: 0;
			color: #fff;
			font-weight: 600;
			line-height: 50px;
			font-size: 16px;
			font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
			vertical-align: middle;
		}
	}

	&.collapse {
		.sidebar-logo {
			margin-right: 0px;
		}
	}
}
</style>
