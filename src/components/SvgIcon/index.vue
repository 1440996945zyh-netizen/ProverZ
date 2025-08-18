<template>
  <svg 
   :class="[svgClass, { 'force-color': !!color }]" 

    aria-hidden="true" 
    :style="color ? { color: color } : {}"
    ref="svgRef"
    v-if="isValidIcon"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from 'vue';

export default defineComponent({
   name: 'SvgIcon', // 组件名，便于调试与复用
  props: {
    iconClass: { type: String, required: true },
    className: { type: String, default: '' },
    color: { type: String, default: '' },
    isHover: { type: Boolean, default: false }
  },
  setup(props) {
    // 当color不存在时，执行简化逻辑
    if (!props.color && props.isHover) {

      return {
        iconName: computed(() => `#icon-${props.iconClass}`),
        svgClass: computed(() => {
          return props.className ? `svg-icon ${props.className}` : 'svg-icon';
        }),
        isValidIcon: computed(() => true) // 简化校验，直接返回有效
      };
    }

    // 当color存在时，执行完整逻辑
    const svgRef = ref(null);
    
    // 1. 校验iconClass是否有效
    const isValidIcon = computed(() => {
      const invalidChars = /[#.:\[\],+*~><=]/;
      const isValid = props.iconClass && !invalidChars.test(props.iconClass);
      if (!isValid) {
        // console.warn(`无效的iconClass: "${props.iconClass}"，请检查传入值`);
      }
      return isValid;
    });

    // 2. 生成安全的选择器
    const iconName = computed(() => {
      return isValidIcon.value ? `#icon-${props.iconClass}` : '';
    });

    // 3. 计算样式类
    const svgClass = computed(() => {
      return props.className ? `svg-icon ${props.className}` : 'svg-icon';
    });

    // 4. 挂载时处理DOM
    onMounted(() => {
      if (!svgRef.value || !isValidIcon.value) return;
      
      const useEl = svgRef.value.querySelector('use');
      if (!useEl) return;
      
      const href = useEl.getAttribute('xlink:href');
      if (!href || !href.startsWith('#icon-')) {
        // console.error(`无效的SVG引用: ${href}`);
        return;
      }
      
      const targetSvg = document.querySelector(href);
      if (!targetSvg) {
        // console.error(`未找到SVG: ${href}，请检查图标是否正确导入`);
        return;
      }
      
      // 处理path样式
      const paths = targetSvg.querySelectorAll('path');
      paths.forEach(path => {
        path.setAttribute('fill', 'currentColor');
        path.removeAttribute('data-darkreader-inline-fill');
        path.removeAttribute('style');
      });
    });

    return { iconName, svgClass, svgRef, isValidIcon };
  }
});
</script>

<style lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  vertical-align: -2px;
}
/* 1. 强制覆盖path的fill，优先级最高（确保覆盖SVG原生fill） */
.svg-icon.force-color path {
  fill: currentColor !important;
}

/* 2. 清除darkreader残留样式，避免颜色异常 */
.svg-icon.force-color [data-darkreader-inline-fill],
.svg-icon.force-color [style*="--darkreader-inline-fill"] {
  --darkreader-inline-fill: unset !important;
  data-darkreader-inline-fill: unset !important;
}

/* 3. 兼容多路径图标（如含circle、rect等标签） */
.svg-icon.force-color circle,
.svg-icon.force-color rect,
.svg-icon.force-color polygon {
  fill: currentColor !important;
}

</style>
    