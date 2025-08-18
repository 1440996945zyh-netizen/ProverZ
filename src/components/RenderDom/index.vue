<script>
import { h, ref, watch } from 'vue'
import useUserStore from '../../store/modules/user'
export default {
	props: {
		render: {
			type: Function,
			defalut: () => {},
		},
		row: {
			type: Object,
			defalut: () => {},
		},
	},
	setup(props) {
		const userStore = useUserStore()
		const permissions = userStore.permissions
		const render = ref([])
		// 修改数据改变render不渲染新值问题
		watch(
			() => props.row,
			newV => {
				render.value = props.render(newV).filter(item => permissions.includes(item.props.permission) || !item.props.permission)
			},
			{ deep: true }
		)
		render.value = props.render(props.row).filter(item => permissions.includes(item.props.permission) || !item.props.permission)
		return () => {
			return h('div', {}, render.value)
		}
	},
}
</script>
