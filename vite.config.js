import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
	const env = loadEnv(mode, process.cwd())
	const { VITE_APP_ENV } = env
	return {
		// 部署生产环境和开发环境下的URL。
		// 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
		// 例如 https://www.yangyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.yangyi.vip/admin/，则设置 baseUrl 为 /admin/。
		base: VITE_APP_ENV === 'production' ? '/' : '/',
		plugins: createVitePlugins(env, command === 'build'),
		resolve: {
			// https://cn.vitejs.dev/config/#resolve-alias
			alias: {
				// 设置路径
				'~': path.resolve(__dirname, './'),
				// 设置别名
				'@': path.resolve(__dirname, './src'),
				'bpmn-js-token-simulation': path.resolve(__dirname, 'node_modules/bpmn-js-token-simulation'),
				'diagram-js-minimap': path.resolve(__dirname, 'node_modules/diagram-js-minimap'),
				'bpmn-js': path.resolve(__dirname, 'node_modules/bpmn-js'),
				// 新增：font-awesome别名（关键）
				'font-awesome': path.resolve(__dirname, 'node_modules/font-awesome'),
				'bpmn-js-token-simulation/assets/css/font-awesome.min.css': path.resolve(__dirname, 'node_modules/font-awesome/css/font-awesome.min.css'),
			},
			// https://cn.vitejs.dev/config/#resolve-extensions
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
			dedupe: ['vue'],
		},
		// vite 相关配置
		server: {
			port: 9099,
			host: true,
			open: true,
			proxy: {
				// https://cn.vitejs.dev/config/#server-proxy
				'/wfppm': {
					target: 'http://localhost:9092',
					changeOrigin: true,
					rewrite: p => p.replace(/^\/wfppm/, ''),
				},
				'/ais': {
					target: 'http://172.18.5.229:8072',
					changeOrigin: true,
				},
				// 2. 新增：代理/dev-api到后端9093服务（积木报表资源专用）
				'/dev-api': {
					target: 'http://localhost:9093', // 后端服务地址（端口与后端一致）
					changeOrigin: true, // 允许跨域
					// 不需要rewrite，因为后端context-path就是/dev-api，直接转发即可
					// 例如：前端请求/dev-api/jmreport/xxx → 转发到http://localhost:9093/dev-api/jmreport/xxx
				}
			},
		},
		//fix:error:stdin>:7356:1: warning: "@charset" must be the first rule in the file
		css: {
			postcss: {
				plugins: [
					{
						postcssPlugin: 'internal:charset-removal',
						AtRule: {
							charset: atRule => {
								if (atRule.name === 'charset') {
									atRule.remove()
								}
							},
						},
					},
				],
			},
		},
		assetsInclude: ['**/*.xlsx'],
	}
})
