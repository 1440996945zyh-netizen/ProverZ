<template>
  <div class="echarts-wrap">
<!--    <span class="echarts-titlt">这是我自己定义的 echarts 组件</span>-->
    <div
      ref="refEle"
      :style="{
        height: height || '350px', // 可选高度，默认400px
        width: width || '750px' // 可选宽度，默认100%
      }"
    />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';

// 保留原有props.code逻辑，同时添加可选配置
const props = defineProps<{
  code: string; // 原始JSON字符串配置
  width?: string; // 可选：图表宽度
  height?: string; // 可选：图表高度
  theme?: string; // 可选：图表主题
  // 可选：自定义加载动画样式
  loadingOption?: echarts.LoadingOption;
}>();

const refEle = ref<HTMLElement>();
let myChart: echarts.ECharts | null = null; // 图表实例引用

/**
 * 检查图表配置是否包含有效数据
 * @param option ECharts配置项
 * @returns 是否有有效数据
 */
function hasValidData(option: any): boolean {
  if (!option || !option.series) return false;

  // 遍历series，检查是否有非空的data
  return option.series.some((series: any) => {
    // 兼容不同图表类型（如pie的data、line/bar的data）
    return series.data && Array.isArray(series.data) && series.data.length > 0;
  });
}

function parseEChartsOption(str: string): any {
  if (!str || str.trim() === '') return null;
  try {
    let cleanedStr = str.replace(/^option\s*=\s*/, '').replace(/;\s*$/, '');
    cleanedStr = cleanedStr.replace(/'/g, '"');
    cleanedStr = cleanedStr.replace(/(\w+)\s*:/g, '"$1":');
    // 关键：JSON.parse 严格校验，确保配置完整
    const option = JSON.parse(cleanedStr);
    return option;
  } catch (error) {
    // 流式输出中解析失败属于正常情况，仅在开发环境打印提示
    if (process.env.NODE_ENV === 'development') {
      console.debug('ECharts配置暂未完整，解析失败（流式输出中）:', error);
    }
    return null;
  }
}

// 核心渲染逻辑（保留原始解析流程）
function renderChart() {
  if (!refEle.value) return;

  try {
    // 初始化/更新图表
    if (!myChart) {
      myChart = echarts.init(refEle.value, props.theme);
      // 初始化时先显示加载动画
      myChart.showLoading(props.loadingOption || {
        text: '图表加载中...',
        color: '#409eff', // 加载动画颜色（适配Element UI主色）
        textColor: '#666',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14
      });
    }else {
      // 非首次渲染，先显示加载动画
      myChart.showLoading();
    }
    // 解析配置（仅完整配置能通过）
    const option = parseEChartsOption(props.code);
    if (!option) return;

    // 3. 检查是否有有效数据
    if (hasValidData(option)) {
      myChart.setOption(option, true);
      myChart.hideLoading(); // 有数据则隐藏加载动画
      myChart.resize();
    } else {
      // 无有效数据，显示加载/空数据提示（可自定义文字）
      myChart.showLoading({
        text: '暂无数据',
        color: '#999',
        textColor: '#999'
      });
    }
    // 更新图表配置（完整配置才会执行到这里）
    // myChart.setOption(option, true); // 第二个参数true表示替换所有配置，避免残留
    // myChart.resize(); // 强制适配容器
  } catch (error) {
    console.error('图表配置解析失败:', error);
    myChart.hideLoading(); // 出错时隐藏加载动画，避免一直转
  }
}
/**
 * 手动实现防抖函数（核心修复：替代未定义的debounce）
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间（ms）
 * @returns 防抖后的函数（带cancel方法）
 */
function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  // 防抖核心逻辑
  const debounced = (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
  // 增加取消方法，用于组件卸载时清理
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}
// 防抖处理：避免流式输出时频繁触发渲染（延迟50ms，可根据需求调整）
const debouncedRenderChart = debounce(renderChart, 200);

// 窗口resize处理
function handleResize() {
  myChart?.resize();
}

// 销毁逻辑
function destroyChart() {
  if (myChart) {
    myChart.dispose(); // 释放ECharts实例
    myChart = null;
  }
  window.removeEventListener('resize', handleResize);
}

// 初始化渲染
onMounted(() => {
  // renderChart();
  window.addEventListener('resize', handleResize); // 添加resize监听
  debouncedRenderChart();
});

// 监听code变化自动更新（关键优化）
watch(
  () => props.code,
  () => {
    debouncedRenderChart(); // // 防抖后执行，避免频繁解析
  },
  { immediate: false, deep: false }
);

// 卸载时清理资源
onUnmounted(() => {
  destroyChart();
  // 取消防抖函数的执行（避免卸载后仍触发）
  debouncedRenderChart.cancel();
});
</script>

<style scoped lang="less">
.echarts-wrap {
  position: relative;

  .echarts-titlt {
    position: absolute;
    width: fit-content;
    margin-left: 20px;
    color: blue;
    font-size: 20px;
    font-weight: bold;
  }
}
</style>
