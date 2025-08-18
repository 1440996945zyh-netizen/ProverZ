import path from 'path'
module.exports = {
	// 网站标题
	title: '扬奕E-port',
	// 网站描述
	description: 'Interview with vitePress',
	// 打包目录
	dest: './dist',
	// 头部head
	head: [
		// 添加图标
		['link', { rel: 'icon', href: '/favicon.ico' }],
	],
	vite: {
		resolve: {
			alias: {
				'@': path.resolve(__dirname, '../../src'),
			},
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
			dedupe: ['vue'],
		},
	},
	// 使用插件
	plugins: [
		'@vuepress/active-header-links',
		'@vuepress/back-to-top',
		'@vuepress/medium-zoom',
		'@vuepress/nprogress',
		[
			'@vuepress/plugin-search',
			{
				locales: {
					'/': {
						placeholder: 'Search',
					},
					'/zh/': {
						placeholder: '搜索',
					},
				},
			},
		],
	],
	// 主题配置
	themeConfig: {
		// 获取每个文件最后一次 git 提交的 UNIX 时间戳(ms)，同时它将以合适的日期格式显示在每一页的底部
		// lastUpdated: 'Last Updated', // string | boolean
		// 启动页面丝滑滚动
		smoothScroll: true,
		logo: '/favicon.ico',
		// 导航栏配置
		nav: [
			{ text: 'element-plus', link: 'https://element-plus.org/zh-CN/' },
			{ text: 'vxe-table', link: 'https://vxetable.cn/#/table/base/basic' },
		],
		sidebar: [
			{
				text: '介绍',
				items: [
					{ text: '框架介绍', link: '/home/introduce' },
					{ text: '快速了解', link: '/home/start' },
				],
			},
			{
				text: '开发规范（开发前必读）',
				items: [
					{ text: '新建文件以及开发规范', link: '/specification/addNew' },
					{ text: '命名规范', link: '/specification/name' },
					{ text: '页面写法Demo', link: '/specification/demo' },
					{ text: '详情页Demo', link: '/specification/form.md' },
					{ text: '代码自动格式化', link: '/specification/format' },
				],
			},
			{
				text: '全局组件',
				items: [
					{ text: '普通table', link: '/components/table/index.md' },
					{ text: '可编辑table', link: '/components/editTable' },
					{ text: '普通select', link: '/components/select' },
					{ text: '下拉表格', link: '/components/selectTable' },
				],
			},
			{
				text: '消息弹框',
				items: [{ text: '消息提示', link: '/modal/index' }],
			},
		],
	},
}

function getSidebar() {
	return [
		{
			text: 'HTML',
			children: [
				{ text: '基础', link: '/HTML/' },
				{ text: '进阶', link: '/HTML/advanced' },
			],
			sidebarDepth: 3,
		},
		{
			text: 'CSS',
			children: [
				{ text: '基础', link: '/CSS/' },
				{ text: '进阶', link: '/CSS/advanced' },
			],
		},
		{
			text: 'Javascript',
			children: [
				{ text: '基础', link: '/Javascript/' },
				{ text: '进阶', link: '/Javascript/advanced' },
				{ text: '进阶', link: '/Javascript/nightmare' },
			],
		},
		{
			text: 'Vue',
			children: [
				{ text: '基础', link: '/Vue/' },
				{ text: '进阶', link: '/Vue/advanced' },
			],
		},
		{
			text: '浏览器',
			children: [
				{ text: '基础', link: '/Vue/' },
				{ text: '进阶', link: '/Vue/advanced' },
			],
		},
		{
			text: '网络',
			children: [
				{ text: '基础', link: '/Network/' },
				{ text: '进阶', link: '/Network/advanced' },
			],
		},
		{
			text: '安全',
			children: [
				{ text: '基础', link: '/Security/' },
				{ text: '进阶', link: '/Security/advanced' },
			],
		},
		{
			text: '面经',
			children: [
				{ text: '基础', link: '/Experience/' },
				{ text: '进阶', link: '/Experience/advanced' },
			],
		},
	]
}
