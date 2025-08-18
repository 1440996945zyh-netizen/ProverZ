<template>
	<div class="app-container">
		<!-- 头部搜索模块 -->
		<!-- <SearchHeader ref="SearchHeaderRef" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" /> -->
		<el-tabs v-model="tabActiveName" type="card" class="demo-tabs" @tab-click="handleClick">
			<el-tab-pane label="天气" name="first">
				<iframe src="http://sd.weather.com.cn/qxsj/jinhai.shtml?ivk_sa=1024320u" width="100%" :height="tabTableHeight"></iframe>
			</el-tab-pane>
			<el-tab-pane label="潮汐" name="second">
				<iframe src="https://www.chaoxibiao.net/tides/161.html" width="100%" :height="tabTableHeight"></iframe>
			</el-tab-pane>
		</el-tabs>
		<!-- <el-drawer v-model="drawerVisible" :title="title" size="35%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer> -->
	</div>
</template>

<script setup name="weather">
import SearchHeader from '@/components/SearchHeader/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import tableParamsStore from '../../../store/modules/tableParams'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 表格高度
const tableParams = tableParamsStore()
const tabTableHeight = computed(() => tableParams.tabTableHeight + 100)
const tabActiveName = ref('first')
const handleClick = tab => {}
</script>
<style lang="scss" scoped>
.box {
	display: flex;
	justify-content: space-between;

	.left {
		width: 254px;
		height: calc(100vh - 85px);
		display: inline-block;
		white-space: nowrap;
		position: relative;
		transition: all 0.3s;

		&.close {
			width: 0px;

			.content {
				display: none;
			}
		}

		.content {
			overflow-x: hidden;
			height: 100%;

			.left-top {
				height: 40px;
				line-height: 40px;
				padding-left: 10px;
				font-size: 14px;
			}

			.shipData {
				width: 100%;
				height: 150px;
				margin-top: 10px;
			}

			.panel {
				width: 100%;
				height: 200px;
			}

			.step {
				height: calc(100vh - 557px);
				padding: 20px;
				box-sizing: border-box;
				margin-top: 14px;

				:deep(.el-timeline-item) {
					left: 50px;

					:deep(.el-timeline-item__wrapper) {
						height: 43px;
					}
				}

				:deep(.el-timeline-item__content) {
					position: relative;
					top: -1px;
					left: -160px;
					text-align: center;
				}

				:deep(.el-timeline-item__timestamp) {
					position: relative;
					top: -25px;
					left: 0px;
				}
			}
		}

		.fold-wrap {
			position: absolute;
			top: 0;
			right: -16px;
			width: 16px;
			height: 100%;
			display: inline-block;
		}

		.btn-fold {
			font-size: 12px;
			background-color: #f5f7fa;
			width: 16px;
			padding: 15px 0;
			position: absolute;
			top: 50%;
			right: 0px;
			transform: translateY(-50%);
			cursor: pointer;
			overflow: hidden;
			opacity: 0.8;
		}

		.btn-fold:hover {
			opacity: 1;
			// transform:scale(1.2);//设置缩放比例
			// transform: translateX(10%);
		}
	}

	.right {
		width: calc(100% - 270px);
		height: 100%;
	}

	.close + .right {
		width: calc(100% - 20px);
	}
}

:deep(.el-tabs__header) {
	margin: 0 0 0;
}
</style>
