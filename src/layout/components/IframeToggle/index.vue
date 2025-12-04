<template>
  <transition-group name="fade-transform" mode="out-in">
    <inner-link
      v-for="(item, index) in tagsViewStore.iframeViews"
      :key="item.path"
      :iframeId="'iframe' + index"
      v-show="currentRoutePath === item.path"
      :src="item.meta.link"
    ></inner-link>
  </transition-group>
</template>

<script setup>
import InnerLink from "../InnerLink/index"
import useTagsViewStore from '@/store/modules/tagsView'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const tagsViewStore = useTagsViewStore()

const currentRoutePath = computed(() => route.path)

</script>