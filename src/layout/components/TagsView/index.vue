<template>
	<div id="tags-view-container" class="tags-view-container">
		<vue3-tabs-chrome
			:tabs="tabs"
			:ref="setTabRef"
			v-model="tab"
			:maxWidth="150"
			v-if="showTabs"
			@click="handleClick"
			@remove="handleRemove"
		/>
		<!-- <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
			<li @click="refreshSelectedTag(selectedTag)">
				<refresh-right style="width: 1em; height: 1em" />
				刷新页面
			</li>
			<li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
				<close style="width: 1em; height: 1em" />
				关闭当前
			</li>
			<li @click="closeOthersTags">
				<circle-close style="width: 1em; height: 1em" />
				关闭其他
			</li>
			<li v-if="!isFirstView()" @click="closeLeftTags">
				<back style="width: 1em; height: 1em" />
				关闭左侧
			</li>
			<li v-if="!isLastView()" @click="closeRightTags">
				<right style="width: 1em; height: 1em" />
				关闭右侧
			</li>
			<li @click="closeAllTags(selectedTag)">
				<circle-close style="width: 1em; height: 1em" />
				全部关闭
			</li>
		</ul> -->
	</div>
</template>

<script setup name="TagsView">
import Vue3TabsChrome from 'vue3-tabs-chrome'
import 'vue3-tabs-chrome/dist/vue3-tabs-chrome.css'
import { getNormalPath } from '@/utils/common/common'
import useTagsViewStore from '@/store/modules/tagsView'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { ref, reactive, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})
const affixTags = ref([])
const scrollPaneRef = ref(null)
const tab = ref('/index')
const tabs = ref([{ label: '首页', key: '/index' }])
let showTabs = ref(true)
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => useSettingsStore().theme)

const tabRef = ref()
function isActive(r) {
	return r.path === route.path
}

function filterAffixTags(routes, basePath = '') {
	let tags = []
	routes.forEach(route => {
		if (route.meta && route.meta.affix) {
			const tagPath = getNormalPath(basePath + '/' + route.path)
			tags.push({
				fullPath: tagPath,
				path: tagPath,
				name: route.name,
				meta: { ...route.meta },
			})
		}
		if (route.children) {
			const tempTags = filterAffixTags(route.children, route.path)
			if (tempTags.length >= 1) {
				tags = [...tags, ...tempTags]
			}
		}
	})
	return tags
}
function initTags() {
	const res = filterAffixTags(routes.value)
	affixTags.value = res
	for (const tag of res) {
		// Must have tag name
		if (tag.name) {
			useTagsViewStore().addVisitedView(tag)
		}
	}
}
const setTabRef = el => {
	tabRef.value = el
}
function addTags() {
	const { name } = route
	if (name) {
		console.log(
			visitedViews.value,
			visitedViews.value.findIndex(item => item.path === route.path)
		)
		if (visitedViews.value.findIndex(item => item.path === route.path) < 0) {
			// 先判断
			tabRef.value.addTab({
				label: route.meta.title,
				key: route.path,
				query: route.query,
			})
		}
		tab.value = route.path
		useTagsViewStore().addView(route)

		if (route.meta.link) {
			useTagsViewStore().addIframeView(route)
		}
	}
	return false
}
const handleClick = (event, tab, index) => {
	router.push({ path: tab.key, query: tab.query })
}

const handleRemove = (tab, index) => {
	const delRoute = visitedViews.value.filter(item => item.path === tab.key)[0]
	useTagsViewStore().delView(delRoute)
	useTagsViewStore().delCachedView(delRoute)

	if (delRoute.path === route.path && index > 0) router.push(visitedViews.value[index - 1].path)
	if (tabs.value.length === 0) {
		// 如果删除完，则增加首页路由
		if (tab.key === '/index') {
			addTags()
		} else {
			router.push('/index')
		}
	}
}
// p-------------------------------------------------------------------------------------------------

function closeMenu() {
	visible.value = false
}
function handleScroll() {
	closeMenu()
}
// watch(
// 	visitedViews,
// 	val => {
// 		showTabs.value = false
// 		setTimeout(() => {
// 			tabs.value = val
// 			showTabs.value = true
// 			console.log(val, 'vak')
// 		}, 100)
// 	},
// 	{ deep: true }
// )
watch(route, () => {
	addTags()
	// moveToCurrentTag()
})
watch(visible, value => {
	if (value) {
		document.body.addEventListener('click', closeMenu)
	} else {
		document.body.removeEventListener('click', closeMenu)
	}
})
onMounted(() => {
	initTags()
	addTags()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.tags-view-container {
	height: 34px;
	width: 100%;
	background: #fff;
	border-bottom: 1px solid #d8dce5;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
	.tags-view-wrapper {
		.tags-view-item {
			display: inline-block;
			position: relative;
			cursor: pointer;
			height: 26px;
			line-height: 26px;
			border: 1px solid #d8dce5;
			color: #495060;
			background: #fff;
			padding: 0 8px;
			font-size: 12px;
			margin-left: 5px;
			margin-top: 4px;
			&:first-of-type {
				margin-left: 15px;
			}
			&:last-of-type {
				margin-right: 15px;
			}
			&.active {
				background-color: #42b983;
				color: #fff;
				border-color: #42b983;
				&::before {
					content: '';
					background: #fff;
					display: inline-block;
					width: 8px;
					height: 8px;
					border-radius: 50%;
					position: relative;
					margin-right: 2px;
				}
			}
		}
	}
	.contextmenu {
		margin: 0;
		background: #fff;
		z-index: 3000;
		position: absolute;
		list-style-type: none;
		padding: 5px 0;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 400;
		color: #333;
		box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
		li {
			margin: 0;
			padding: 7px 16px;
			cursor: pointer;
			&:hover {
				background: #eee;
			}
		}
	}
}
.vue3-tabs-chrome {
	padding-top: 0px;
	background-color: $navColor;
	position: relative;
	font-size: 14px;
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
	.tags-view-item {
		.el-icon-close {
			width: 16px;
			height: 16px;
			vertical-align: 2px;
			border-radius: 50%;
			text-align: center;
			transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
			transform-origin: 100% 50%;
			&:before {
				transform: scale(0.6);
				display: inline-block;
				vertical-align: -3px;
			}
			&:hover {
				background-color: #b4bccc;
				color: #fff;
				width: 12px !important;
				height: 12px !important;
			}
		}
	}
}
</style>
