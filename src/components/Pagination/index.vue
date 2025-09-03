<template>
	<div :class="{ hidden: hidden }" class="pagination-container">
		<el-pagination
			:background="background"
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			:layout="layout"
			:page-sizes="pageSizes"
			:pager-count="pagerCount"
			:total="total"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			class="custom-pagination"
		/>
	</div>
</template>

<script setup>
import { scrollTo } from '../../utils/commonFunc/scroll-to'
import { computed } from 'vue'
const props = defineProps({
	total: {
		required: true,
		type: Number,
	},
	page: {
		type: Number,
		default: 1,
	},
	limit: {
		type: Number,
		default: 20,
	},
	pageSizes: {
		type: Array,
		default() {
			return [20, 30, 50, 100, 500, 1000, 1500, 2000, 3000, 5000]
		},
	},
	// 移动端页码按钮的数量端默认值5
	pagerCount: {
		type: Number,
		default: document.body.clientWidth < 992 ? 5 : 7,
	},
	layout: {
		type: String,
		default: 'total, sizes, prev, pager, next, jumper',
	},
	background: {
		type: Boolean,
		default: true,
	},
	autoScroll: {
		type: Boolean,
		default: true,
	},
	hidden: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits()
const currentPage = computed({
	get() {
		return props.page
	},
	set(val) {
		emit('update:page', val)
	},
})
const pageSize = computed({
	get() {
		return props.limit
	},
	set(val) {
		emit('update:limit', val)
	},
})
function handleSizeChange(val) {
	if (currentPage.value * val > props.total) {
		currentPage.value = 1
	}
	emit('pagination', { pagination: true })
	if (props.autoScroll) {
		scrollTo(0, 800)
	}
}
function handleCurrentChange(val) {
	emit('pagination', { pagination: true })
	if (props.autoScroll) {
		scrollTo(0, 800)
	}
}
</script>

<style scoped lang="scss">
.pagination-container {
	background: #fff;
	padding: 10px 20px;
	border-left: none;
	height: auto; /* 由固定高度改为自动，避免内容被截断 */
	min-height: 50px; /* 保持最小高度 */
	margin: 0;
	overflow: hidden; /* 防止内容溢出 */
}
.pagination-container .custom-pagination {
	margin: 0 auto; /* 居中显示分页组件 */
	padding: 5px 0;
}
/* 解决尺寸选择器显示问题 */
::v-deep .el-pagination__sizes {
	display: flex;
	align-items: center;
	// margin-right: 10px;
	min-width: 140px; /* 确保有足够宽度 */

	select {
		min-width: 80px; /* 确保选择器有足够宽度 */
		padding: 5px;
	}
}
.pagination-container .el-pagination {
	margin-right: 15px;
}
.pagination-container.hidden {
	display: none;
}
/* 响应式调整 */
@media screen and (max-width: 768px) {
	::v-deep .el-pagination__sizes {
		min-width: auto;
		margin-right: 5px;
	}

	.pagination-container {
		padding: 10px 5px;
	}
}

.pagination-container.hidden {
	display: none;
}
</style>
