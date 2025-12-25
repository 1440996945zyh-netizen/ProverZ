<!-- RenderDom/index.vue -->
<script>
import { h, ref, watch } from 'vue'
import useUserStore from '../../store/modules/user'

export default {
	props: {
		render: {
			type: Function,
			default: () => null, // 修正：拼写错误 defalut → default，默认返回null
		},
		row: {
			type: Object,
			default: () => ({}), // 修正：拼写错误 defalut → default，默认返回空对象
		},
	},
	setup(props) {
		const userStore = useUserStore()
		const permissions = userStore.permissions
		const renderList = ref([]) // 重命名为renderList，语义更清晰

		// 统一处理render返回值：兼容单个VNode、数组、空值
		const handleRenderResult = (row) => {
			if (!props.render) return [] // 无render函数，返回空数组
			
			try {
				const renderResult = props.render(row)
				// 1. 空值处理：返回空数组
				if (!renderResult) return []
				// 2. 单个VNode处理：转为数组
				if (renderResult.type && !Array.isArray(renderResult)) {
					return [renderResult]
				}
				// 3. 数组处理：直接返回
				return Array.isArray(renderResult) ? renderResult : []
			} catch (error) {
				console.error('RenderDom处理render结果失败：', error)
				return []
			}
		}

		// 权限过滤逻辑：兼容无props的节点
		const filterByPermission = (nodeList) => {
			return nodeList.filter(item => {
				// 无props属性 → 直接保留；有props但无permission → 直接保留；有permission且在权限列表中 → 保留
				if (!item || !item.props) return true
				const requiredPermission = item.props.permission
				return !requiredPermission || permissions.includes(requiredPermission)
			})
		}

		// 监听row变化，更新渲染列表
		watch(
			() => props.row,
			(newRow) => {
				const rawRenderResult = handleRenderResult(newRow)
				renderList.value = filterByPermission(rawRenderResult)
			},
			{ deep: true, immediate: true } // 立即执行
		)

		// 渲染函数
		return () => {
			return h('div', {}, renderList.value)
		}
	},
}
</script>