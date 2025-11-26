import { defineStore } from 'pinia'

const tableParamsStore = defineStore('tableParams', {
	state: () => ({
		normalTableHeight: window.innerHeight - 160, // 全沾满
		pageTableHeight: window.innerHeight - 170, // 带分页
		drawerTableHeightSear: window.innerHeight - 210, // 抽屉内带本地查询+table
		tabTableHeight: window.innerHeight - 260, // 带tab+分页
		drawerNormalTableHeight: window.innerHeight - 270, // 抽屉里全沾满
		drawerPageTableHeight: window.innerHeight - 350, // 抽屉里带分页
		drawerSearchTableHeight: window.innerHeight - 300, // 抽屉里带查询+table
		drawerHeaderPageTableHeight: window.innerHeight - 370, // 抽屉里带header + 分页
		drawerTableHeight: window.innerHeight - 600, // 抽屉里带header +table
	}),
	actions: {
		setTableHeight(tempHeight) {
			// console.log(window.innerHeight, 'window.innerHeight', tempHeight)
			this.normalTableHeight = window.innerHeight - 147 + tempHeight
			this.pageTableHeight = window.innerHeight - 170 + tempHeight
			this.drawerTableHeightSear = window.innerHeight - 210 + tempHeight
			this.tabTableHeight = window.innerHeight - 260 + tempHeight
			this.drawerNormalTableHeight = window.innerHeight - 270 + tempHeight
			this.drawerSearchTableHeight = window.innerHeight - 300 + tempHeight
			this.drawerPageTableHeight = window.innerHeight - 350 + tempHeight
			this.drawerHeaderPageTableHeight = window.innerHeight - 370 + tempHeight
			this.drawerTableHeight = window.innerHeight - 600 + tempHeight
		
		},
	},
})

export default tableParamsStore
