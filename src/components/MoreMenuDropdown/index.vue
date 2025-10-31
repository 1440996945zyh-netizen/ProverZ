<!--
 * @Author: zhangsd
 * @Date: 2025-10-31 16:37:05
 * @LastEditTime: 2025-10-31 16:39:11
 * @LastEditors: zhangsd
 * @Description: 更多菜单下拉组件
 * @FilePath: \view\src\components\MoreMenuDropdown\index.vue
-->

<template>
  <el-tooltip content="更多菜单" effect="dark" placement="bottom" offset="10">
    <el-dropdown placement="bottom-end" trigger="click" class="more-menu-dropdown">
      <el-icon style="color: #c1c1c1; font-size: 22px; cursor: pointer"><Menu /></el-icon>
      <template #dropdown>
        <el-dropdown-menu style="width: 200px; padding: 0">
          <div class="dropdown-content">
            <!-- 搜索框容器 - 使用独立容器避免样式冲突 -->
            <div class="search-wrapper" @click.stop>
              <el-input
                v-model="searchQuery"
                placeholder="搜索页面..."
                clearable
                size="default"
                @input="handleSearch"
                @clear="handleClear"
                @keydown.delete="handleDeleteKey"
                @keydown.backspace="handleDeleteKey"
              >
                <template #prefix>
                  <el-icon size="14"><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-dropdown-item @click="removeNow">关闭当前</el-dropdown-item>
            <el-dropdown-item @click="removeOther">关闭其他</el-dropdown-item>
            <el-dropdown-item @click="removeAll">关闭所有</el-dropdown-item>
            <el-divider style="margin: 0" />

            <div class="dropdown-items">
              <!-- topMenus 改为 allTopMenus，以显示包含首页的完整列表 -->
              <template v-for="(item, index) in filteredMenus" :key="index">
                <el-dropdown-item @click="handleMenuSelect(item)">{{ item.meta.title }}</el-dropdown-item>
              </template>
              <el-dropdown-item v-if="filteredMenus.length === 0 && searchQuery" disabled>无匹配结果</el-dropdown-item>
            </div>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-tooltip>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Menu, Search } from '@element-plus/icons-vue'
import useTagsViewStore from '@/store/modules/tagsView'
import { useRoute, useRouter } from 'vue-router'
import { isHttpOrHttps } from '@/utils/common/form-validation'
const router = useRouter()
const route = useRoute()
const tagsViewStore = useTagsViewStore()

const searchQuery = ref('')

// 获取完整的菜单列表（包含首页）
const allTopMenus = computed(() => tagsViewStore.visitedViews);

// 过滤后的菜单列表（包含首页）
const filteredMenus = computed(() => {
  if (!searchQuery.value) {
    return allTopMenus.value; // 显示包含首页的完整列表
  }
  const query = searchQuery.value.toLowerCase()
  // 在包含首页的列表中搜索
  return allTopMenus.value.filter(item => item.meta.title.toLowerCase().includes(query))
})

const handleSearch = () => {
  // 确保输入框获得焦点
}

const handleClear = () => {
  searchQuery.value = ''
}

const handleDeleteKey = (e) => {
  e.stopPropagation()
  // v-model会自动更新
}

const removeNow = () => {
  // 获取当前路由对应的完整菜单项
  const currentRoute = allTopMenus.value.find(i => i.path === route.path);
  if (!currentRoute) return;

  // 如果当前路由是首页，则不执行删除操作
  if (currentRoute.meta.title === '首页') {
    console.log('当前为首页，无法关闭'); // 或者可以给出用户提示
    return;
  }

  // 从 store 中删除视图和缓存
  tagsViewStore.delView(currentRoute)
  tagsViewStore.delCachedView(currentRoute)

  // 获取删除后的完整列表（包含首页）
  const topMenuListAfterDel = allTopMenus.value.filter(item => item.path !== currentRoute.path);
  const currentPath = route.path;
  const currentIndex = topMenuListAfterDel.findIndex(menuItem => menuItem.path === currentPath);

  // 检查被删除的是否是当前激活的页面
  if (currentRoute.path === currentPath) {
    if (currentIndex > 0) {
      // 如果当前页面不是第一个，跳转到列表中的前一个页面
      const previousItem = topMenuListAfterDel[currentIndex - 1];
      if (previousItem) {
        router.push(previousItem.path).catch(err => console.error('跳转失败:', err));
      }
    } else if (topMenuListAfterDel.length > 1) {
      // 如果当前页面是第一个，但列表还有其他页面，跳转到列表中的下一个页面
      const nextItem = topMenuListAfterDel[currentIndex + 1]; // currentIndex 现在是 0
      if (nextItem) {
        router.push(nextItem.path).catch(err => console.error('跳转失败:', err));
      }
    } else {
      // 如果删除后列表（包含首页）为空，跳转到首页
      // 注意：这里 topMenuListAfterDel.length 为 0 意味着只有首页被删除了，这不应该发生
      // 如果删除非首页后只剩首页，topMenuListAfterDel.length 应该为 1
      // 所以这里检查是否只剩首页（即所有非首页都被删除）
      const nonHomeTabsAfterDel = topMenuListAfterDel.filter(item => item.meta.title !== '首页');
      if (nonHomeTabsAfterDel.length === 0) {
         router.push('/index').catch(err => console.error('跳转失败:', err));
      }
    }
  }
  // 如果删除的不是当前激活的页面，则不需要跳转
  // (保持当前页面不变)
}

const removeOther = () => {
  // 获取当前路由对应的完整菜单项
  const currentRoute = allTopMenus.value.find(i => i.path === route.path);
  if (!currentRoute) return;

  // 获取所有需要删除的非当前页且非首页的标签
  const routesToDel = allTopMenus.value.filter(
    item => item.path !== currentRoute.path && item.meta.title !== '首页'
  );

  // 逐个删除
  routesToDel.forEach(item => {
    tagsViewStore.delView(item);
    tagsViewStore.delCachedView(item);
  });

  // 如果当前路由是首页，删除其他后，理论上只剩下首页，无需跳转
  // 如果当前路由不是首页，删除其他后，当前页面仍然是激活的，无需跳转
}

const removeAll = () => {
  // 获取所有非首页的标签页
  const routesToDel = allTopMenus.value.filter(item => item.meta.title !== '首页');

  // 逐个删除非首页的标签页
  routesToDel.forEach(item => {
    tagsViewStore.delView(item);
    tagsViewStore.delCachedView(item);
  });

  // 检查是否所有非首页标签都已关闭
  const remainingNonHomeTabs = allTopMenus.value.filter(item => item.meta.title !== '首页');
  if (remainingNonHomeTabs.length === 0) {
    // 如果只剩下首页，跳转到首页
    router.push('/index').catch(err => console.error('跳转失败:', err));
  }
  // 如果当前页面不是首页，删除所有后会跳转到首页
  // 如果当前页面是首页，删除所有其他后，会停留在首页
}

const handleMenuSelect = (item) => {
  if (isHttpOrHttps(item.path)) {
    window.open(item.path, '_blank')
  } else {
    router.push({ path: item.path }).catch(err => console.error('路由跳转失败:', err));
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.more-menu-dropdown {
  z-index: 10;
  height: 100%;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;

  &:hover {
    background-color: $top-hover-color;
    color: #fff;
    cursor: pointer;
  }
}

:deep(.el-dropdown-menu) {
  padding: 0 !important;
}

.dropdown-content {
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.search-wrapper {
  padding: 8px;
  border-bottom: 1px solid #eee;
  pointer-events: auto;

  :deep(.el-input) {
    width: 100%;
    --el-input-bg-color: #f5f5f5;

    &:hover {
      --el-input-hover-border-color: $top-active-color;
    }
  }

  :deep(.el-input__inner) {
    background-color: #f5f5f5;
    border-radius: 4px;
    pointer-events: auto;
    user-select: text;
  }

  :deep(.el-input__clear) {
    pointer-events: auto;
  }
}

.dropdown-items {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(150, 150, 150, 0.5) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(150, 150, 150, 0.5);
    border-radius: 2px;
  }
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

.dropdown-footer {
  display: flex;
  width: 100%;
  justify-content: space-between;
  height: 40px;
  color: #8b8b8b;
  align-items: center;
  background-color: #f5f5f5;
  padding: 0 10px;
  border-top: 1px solid #eee;
}

.dropdown-btn {
  flex: 1;
  text-align: center;
  height: 100%;
  line-height: 40px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff !important;
    background-color: $top-active-color;
  }
}
</style>