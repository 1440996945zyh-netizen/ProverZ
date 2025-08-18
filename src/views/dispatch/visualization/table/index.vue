<template>
	<div class="table">
		<div class="head">
			<span class="col" v-for="item in tableColumns">{{ item.lable }}</span>
		</div>
		<div class="marquee-view">
			<div class="marquee">
				<div class="table_row" v-for="row in tableData">
					<span
						class="col"
						v-for="col in tableColumns"
						@mouseenter="getMouseenter(row[col.prop])"
						@mouseleave="showPopover = false"
					>
						{{ col.prop == 'schedule' ? row[col.prop] + '%' : row[col.prop] }}
					</span>
				</div>
			</div>
		</div>
		<div class="popover" v-if="showPopover">{{ popoverData }}</div>
	</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
const prop = defineProps({
	tableData: {
		type: Array,
		default: () => [],
	},
	tableColumns: {
		type: Array,
		default: () => [],
	},
})

const popoverData = ref(null)
const getMouseenter = val => {
	showPopover.value = true
	popoverData.value = val
}
const showPopover = ref(false)
</script>

<style lang="scss" scoped>
.table {
	width: 100%;
	height: 90%;
}
.head {
	background: rgba(255, 255, 255, 0.1);
	height: 26px;
	font-size: 14px;
	padding: 0px 15px;
	text-align: center;
	color: #68d8fe;
	display: flex;
	justify-content: space-between;
	line-height: 26px;
}
.marquee-view {
	// position: absolute;
	// top: 1.6rem;
	// bottom: 0;
	height: 85%;
	width: 100%;
	overflow: hidden;
}
@keyframes row {
	0% {
	}
	100% {
		transform: translateY(-50%);
	}
}
.marquee {
	animation: row 50s linear infinite;
}
.marquee:hover {
	animation-play-state: paused;
}
.table_row {
	line-height: 26px;
	padding: 0px 15px;
	color: #61a8ff;
	font-size: 10px;
	display: flex;
	justify-content: space-between;
}
.table_row:hover {
	color: #68d8ff;
	background: rgba(255, 255, 255, 0.1);
}
.col {
	display: inline-block;
	margin-right: 5px;
	flex: 1;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.popover {
	position: absolute;
	top: 15px;
	right: 0;
	transform: translateX(-50%);
	background-color: #01162f58;
	color: #61a8ff;
	font-size: 14px;
	text-shadow: 0 0 55px #023b48;
}
</style>
