<template>
  <div class="topmenu-wrapper" :style="{ width: computedWidth }">
    <!-- 左滚动按钮 - 无法滑动时隐藏 -->
    <button class="scroll-btn left-btn" @click="scrollLeft" :disabled="!canScrollLeft" v-if="canScrollLeft">
      <ArrowLeftBold />
    </button>

    <!-- 菜单容器 -->
    <div class="menu-container" ref="menuContainer" @wheel="handleWheelOnMenu">
      <el-menu class="topmenu-container" :default-active="activeMenu" mode="horizontal" @select="handleSelect" :ellipsis="false">
        <template v-for="(item) in topMenus" :key="item.fullPath">
          <el-menu-item
            :style="{ '--theme': theme }"
            :index="item.path"
            @mouseenter="handleMouseenter(item)"
            @mouseleave="handleMouseleave(item)"
          >
            {{ item.meta.title }}
            <div style="width: 20px; height: 12px; padding-left: 8px; display: flex" v-if="item.meta.title != '首页'">
              <img
                v-show="item.meta.hover || item.path == route.path"
                @click.stop="handleRemove(item)"
                class="close"
                src="@/assets/icons/close.png"
                alt="关闭"
                width="12"
                height="12"
              />
            </div>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- 右滚动按钮 - 无法滑动时隐藏 -->
    <button class="scroll-btn right-btn" @click="scrollRight" :disabled="!canScrollRight" v-if="canScrollRight">
      <ArrowRightBold />
    </button>

  </div>
</template>

<script setup>
import { getCurrentInstance, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { constantRoutes } from '@/router'
import { isHttpOrHttps } from '@/utils/common/form-validation'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { useRoute, useRouter } from 'vue-router'
import useTagsViewStore from '@/store/modules/tagsView'

const { proxy } = getCurrentInstance()
const menuContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const scrollTimer = ref(null)
const wheelTimer = ref(null);
const isComponentMounted = ref(true)
const props = defineProps({
  searchVisible: {
    type: Boolean,
    default: false,
  },
})

// 计算屏幕宽度的响应式变量
const screenWidth = ref(window.innerWidth)
const computedWidth = computed(() => {
  const baseWidth = screenWidth.value - 400
  const otherWidth = screenWidth.value - 630
  return props.searchVisible ? `${otherWidth}px` : `${baseWidth}px`
})

const hideList = ['/index', '/user/profile']

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

const theme = computed(() => settingsStore.theme)
const routers = computed(() => permissionStore.topbarRouters)

const childrenMenus = computed(() => {
  let childrenMenus = []
  routers.value.forEach(router => {
    if (router.children) {
      router.children.forEach(item => {
        let modifiedItem = { ...item };
        if (modifiedItem.parentPath === undefined) {
          if (router.path === '/') {
            modifiedItem.path = '/' + modifiedItem.path
          } else {
            if (! isHttpOrHttps(modifiedItem.path)) {
              modifiedItem.path = router.path + '/' + modifiedItem.path
            }
          }
          modifiedItem.parentPath = router.path
        }
        childrenMenus.push(modifiedItem)
      })
    }
  })
  return constantRoutes.concat(childrenMenus)
})

const activeMenu = computed(() => {
  const path = route.path
  let activePath = path
  if (path !== undefined && path.lastIndexOf('/') > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1, path.length)
    activePath = '/' + tmpPath
    if (!route.meta.link) {
      appStore.toggleSideBarHide(false)
    }
  } else if (!route.children) {
    activePath = path
  }
  return activePath
})

function handleSelect(key, keyPath) {
  if ( isHttpOrHttps(key)) {
    window.open(key, '_blank')
  } else {
    router.push({ path: key }).then(() => {
      // 路由跳转后，调用优化后的滚动函数
      scrollToActiveItemAfterRouteChange()
    }).catch(err => {
      console.error('路由跳转失败:', err)
    })
  }
  proxy.$bus.emit('closeMask')
}

function activeRoutes(key) {
  let routes = []
  if (childrenMenus.value && childrenMenus.value.length > 0) {
    childrenMenus.value.forEach(item => {
      if (key == item.parentPath || (key == 'index' && '' == item.path)) {
        routes.push(item)
      }
    })
  }
  if (routes.length > 0) {
    permissionStore.setSidebarRouters(routes)
  } else {
    appStore.toggleSideBarHide(true)
  }
  return routes
}

const topMenus = computed(() => useTagsViewStore().visitedViews)


const handleRemove = (item) => {
  const delRoute = item;
  const currentPath = route.path; // 获取当前路由路径
  const topMenuList = topMenus.value; // 获取当前标签页列表
  const currentIndex = topMenuList.findIndex(menuItem => menuItem.path === currentPath); // 找到当前路由在列表中的索引

  // 从 store 中删除视图和缓存
  useTagsViewStore().delView(delRoute);
  useTagsViewStore().delCachedView(delRoute);

  // 检查被删除的是否是当前激活的页面
  if (delRoute.path === currentPath) {
    // 如果是当前页面
    if (currentIndex > 0) {
      // 如果当前页面不是第一个，跳转到列表中的前一个页面
      const previousItem = topMenuList[currentIndex - 1];
      if (previousItem) {
        router.push(previousItem.path).catch(err => console.error('跳转失败:', err));
      }
    } else if (topMenuList.length > 1) {
      // 如果当前页面是第一个，但列表还有其他页面，跳转到列表中的下一个页面
      const nextItem = topMenuList[currentIndex + 1];
      if (nextItem) {
        router.push(nextItem.path).catch(err => console.error('跳转失败:', err));
      }
    } else {
      // 如果删除后列表为空，跳转到首页
      router.push('/index').catch(err => console.error('跳转失败:', err));
    }
  } else {
    // 如果删除的不是当前激活的页面，则不需要跳转
    // 但可能需要滚动到当前激活的页面
    nextTick(() => {
        if (isComponentMounted.value && menuContainer.value) {
            checkScrollStatus(); // 删除非当前页面后，也可能影响滚动状态，重新检查
        }
    });
  }
}


const removeNow = () => {
  const currentRoute = topMenus.value.find(i => i.path === route.path)
  if (!currentRoute) return

  const currentPath = route.path;
  const topMenuList = topMenus.value;
  const currentIndex = topMenuList.findIndex(menuItem => menuItem.path === currentPath);

  useTagsViewStore().delView(currentRoute)
  useTagsViewStore().delCachedView(currentRoute)

  if (currentRoute.path === currentPath && currentIndex > 0 && topMenuList.length > 0) {
    const previousItem = topMenuList[currentIndex - 1];
    if (previousItem) {
      router.push(previousItem.path).catch(err => console.error('跳转失败:', err));
    }
  }

  if (topMenuList.length === 0) {
    router.push('/index').catch(err => console.error('跳转失败:', err));
  }
}

const removeOther = () => {
  const currentRoute = topMenus.value.find(i => i.path === route.path)
  if (!currentRoute) return

  useTagsViewStore().delOthersViews(currentRoute)
}

const removeAll = () => {
  useTagsViewStore().delAllViews()
  router.push('/index').catch(err => console.error('跳转失败:', err));
}

const scrollLeft = () => {
  if (menuContainer.value) {
    menuContainer.value.scrollBy({ left: -300, behavior: 'smooth' }) // 滚动按钮的滚动仍可保持平滑
  }
}

const scrollRight = () => {
  if (menuContainer.value) {
    menuContainer.value.scrollBy({ left: 300, behavior: 'smooth' }) // 滚动按钮的滚动仍可保持平滑
  }
}

const checkScrollStatus = () => {
  if (!menuContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = menuContainer.value
  canScrollLeft.value = scrollLeft > 10
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

const scrollToActiveItemAfterRouteChange = async () => {
  if (!isComponentMounted.value || !menuContainer.value) {
    return;
  }

  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value);
  }

  await nextTick(); // 等待 DOM 更新，确保 .is-active 类已应用

  if (!isComponentMounted.value || !menuContainer.value) {
    return;
  }

  const activeItem = menuContainer.value.querySelector('.el-menu-item.is-active');
  if (!activeItem) {
    // console.warn('未找到激活的菜单项进行滚动');
    return;
  }

  const container = menuContainer.value;
  const containerRect = container.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();

  if (containerRect.width === 0 || itemRect.width === 0) {
    // console.warn('容器或项目元素尺寸为0，无法滚动');
    return;
  }

  const itemLeftInContainer = itemRect.left - containerRect.left;
  const itemRightInContainer = itemRect.right - containerRect.left;

  // --- 使用同步滚动 (移除 behavior: 'smooth') ---
  if (itemLeftInContainer < 0) {
    // 项目左侧在容器视口外，滚动到左侧
    container.scrollTo({
      left: container.scrollLeft + itemLeftInContainer,
      // behavior: 'smooth', // 移除平滑滚动
    });
    // 滚动完成后，同步调用 checkScrollStatus
    checkScrollStatus(); // 关键：同步检查状态
  } else if (itemRightInContainer > containerRect.width) {
    // 项目右侧在容器视口外，滚动到右侧
    container.scrollTo({
      left: container.scrollLeft + (itemRightInContainer - containerRect.width),
      // behavior: 'smooth', // 移除平滑滚动
    });
    // 滚动完成后，同步调用 checkScrollStatus
    checkScrollStatus(); // 关键：同步检查状态
  } else {
     // 如果元素已经在视口内，也需要检查状态
     // 这对于新添加的标签尤其重要，因为它可能就在末尾
     checkScrollStatus(); // 直接检查状态
  }

};

const handleWheelOnMenu = (e) => {
  e.preventDefault();
  if (wheelTimer.value) {
    clearTimeout(wheelTimer.value);
  }
  wheelTimer.value = setTimeout(() => {
    if (menuContainer.value) {
      menuContainer.value.scrollBy({
        left: e.deltaY,
        // behavior: 'smooth', // 滚轮滚动也可以移除平滑效果以提高性能
      })
    }
  }, 16);
}

const handleMenuSelect = item => {
  if ( isHttpOrHttps(item.path)) {
    window.open(item.path, '_blank')
  } else {
    router.push({ path: item.path }).then(() => {
      // 路由跳转后，调用优化后的滚动函数
      scrollToActiveItemAfterRouteChange()
    }).catch(err => {
      console.error('路由跳转失败:', err)
    })
  }
  proxy.$bus.emit('closeMask')
}

watch(
  route,
  () => {
    addTags()
    scrollToActiveItemAfterRouteChange()
  },
  {
    immediate: true,
  }
)

watch(
  () => topMenus.value.length,
  () => {
    nextTick(checkScrollStatus)
  }
)

function addTags() {
  const { name, path } = route
  if (name) {
    const tagsViewStore = useTagsViewStore();
    // 检查标签是否已存在，如果不存在则添加
    const exists = tagsViewStore.visitedViews.some(v => v.path === path);
    if (!exists) {
      tagsViewStore.addView(route)
      if (route.meta.link) {
        tagsViewStore.addIframeView(route)
      }
      // 新增标签后，不再在 addTags 内部检查滚动状态
    }
  }
  // if (!name) { console.warn('Route has no name, skipping addTags:', path); }
  return false
}

const handleMouseenter = item => {
  nextTick(() => {
    if (item.meta) {
      item.meta.hover = true
    }
  });
}

const handleMouseleave = item => {
  nextTick(() => {
    if (item.meta) {
      item.meta.hover = false
    }
  });
}

onMounted(() => {
  if (menuContainer.value) {
    menuContainer.value.addEventListener('scroll', checkScrollStatus)
  }
  window.addEventListener('resize', checkScrollStatus)
  checkScrollStatus()
})

onBeforeUnmount(() => {
  isComponentMounted.value = false

  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }
  if (wheelTimer.value) {
    clearTimeout(wheelTimer.value);
  }

  if (menuContainer.value) {
    menuContainer.value.removeEventListener('scroll', checkScrollStatus)
  }
  window.removeEventListener('resize', checkScrollStatus)
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.topmenu-wrapper {
  display: flex; // 确保是 flex 容器
  align-items: center;
  height: 50px;
  position: relative; // 保持相对定位，或者移除
  overflow: hidden;
  background-color: $top-navColor;
  // 移除或注释掉可能导致固定定位的样式
  // position: relative; // 如果父级有特殊定位，可能影响子元素
}

.menu-container {
  flex: 1; // 占据剩余空间
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.scroll-btn {
   width: 36px;
  height: 70px;
  background-color: $top-navColor;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  transform: scale(0.7);

  &:hover {
    background-color: $top-hover-color;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: $top-navColor;
      color: #c1c1c1;
    }
  }
}


.left-btn {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.right-btn {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}



.el-menu {
  background-color: $top-navColor;
  height: 50px;
  width: max-content;
}

.el-menu--horizontal {
  border-bottom: none;
}

.topmenu-container.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #c1c1c1;
  border-bottom: none;
  padding: 0 20px;
  white-space: nowrap;

  &:hover {
    background-color: $top-hover-color !important;
  }
}

.topmenu-container.el-menu--horizontal .el-menu-item:not(.is-disabled):focus {
  background-color: $top-navColor !important;
}

:deep(.el-menu--popup) {
  width: 170px;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active {
  color: #ffffff !important;
  background-color: $top-active-color;
}

.close {
  padding: 2px;
  border-radius: 12px;
  transition: all 0.5s ease;
  cursor: pointer;

  &:hover {
    background: #8b8b8b;
  }
}

.el-divider {
  margin: 0.75rem 0;
}

:deep(.el-dropdown-item) {
  padding: 10px 15px;
  margin: 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: $top-hover-color;
    color: #fff;
  }

  &.is-disabled {
    color: #999;
    background-color: transparent;
    cursor: default;
  }
}

</style>