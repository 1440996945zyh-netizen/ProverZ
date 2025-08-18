<template>
	<div>
		<div class="upload-demo">
			<el-upload class="upload-demo" action="" :show-file-list="false" :http-request="upload" :accept="fileTypeName">
				<el-button size="small" icon="el-icon-upload2" plain>点击上传</el-button>
				<div slot="tip" class="el-upload__tip">支持扩展名：{{ fileTypeName }}</div>
			</el-upload>
			<ul class="el-upload-list el-upload-list--text">
				<li v-for="item in fileList" :key="item.id" class="el-upload-list__item is-success">
					<a class="el-upload-list__item-name" @click="downLoadFile(item)">
						<i class="iconfont icon-pdf" v-if="item.fileFormat === 'pdf'" />
						<i class="iconfont icon-a-filetxt-line" v-else-if="item.fileFormat === 'txt'" />
						<i class="iconfont icon-file-word" v-else-if="item.fileFormat === 'doc' || item.fileFormat === 'docx'" />
						<i class="iconfont icon-file-excel" v-else-if="item.fileFormat === 'xls' || item.fileFormat === 'xlsx'" />
						<i class="iconfont icon-img" v-else-if="item.fileFormat === 'jpg' || item.fileFormat === 'jpeg'" />
						<i class="iconfont icon-a-filetxt-line" v-else />
						<!-- <i class="el-icon-document" /> -->
						<!-- <i class="el-icon-document" /> -->
						{{ item.name }}
					</a>
					<label class="el-upload-list__item-status-label">
						<i class="el-icon-upload-success el-icon-circle-check" />
					</label>
					<i class="el-icon-close" @click="handleRemove(item)" />
					<i class="el-icon-view" @click="handlePreview(item)" />
				</li>
			</ul>
		</div>
		<el-dialog title="预览" append-to-body :visible.sync="previewVisible" width="90%" top="3vh" @close="cancelPreview">
			<div v-if="fileType === 'img'">
				<img :src="imgurl" style="width: 100%; height: auto" />
			</div>
			<div v-else-if="fileType === 'pdf'" style="height: 500px">
				<iframe style="width: 100%; height: 100%" :src="pdfUrl"></iframe>
			</div>
			<!-- <div v-else-if="fileType === 'doc'" class="sketch_content " ref="demoDocContainer" style="height:500px"></div> -->
			<div v-else-if="fileType === 'doc'" class="sketch_content" v-html="docHtml" style="height: 500px"></div>
			<div v-else-if="fileType === 'xls'" class="sketch_content" id="xls" style="height: 500px">
				<!-- <table border="1" v-if="tableau" style="border-collapse: collapse">
                    <tr v-for="(item, index) in tableau" :key="index">
                    <td v-for="(item1, index1) in item" :key="index1">{{ item1 }}</td>
                    </tr>
                </table> -->
				<el-table :data="tableData" style="width: 100%">
					<el-table-column v-for="(value, index) in tableColumn" :key="index" :prop="value" :label="value"></el-table-column>
				</el-table>
			</div>
			<div v-else-if="fileType === 'xlsx'" class="sketch_content" id="xlsx" ref="excelPreview" style="height: 500px"></div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="previewVisible = false">取 消</el-button>
				<el-button type="primary" @click="downLoadFile(fileInfo)">下载</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script setup name="Upload">
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
// import renderSheet from './xlsx'

import { onMounted, ref, reactive } from 'vue'
const { proxy } = getCurrentInstance()

let fileList = ref([]) // 文件列表
let fileType = ref('') // 文件类型
let fileInfo = ref({}) // 下载文件
let tableData = ref([]) // 预览excel
let tableColumn = ref([]) // 预览excel
let imgurl = ref('')
let pdfUrl = ref('')
let docHtml = ref('')
let comp = ref('')
let last = ref(null) // excel预览加载
let previewVisible = ref(false)

const props = defineProps({
	fileTypeName: {
		type: String,
		default: '.jpeg, .doc, .docx, .pdf, .jpg, .xlsx, .xls',
	},
	fileListEdit: {
		type: Array,
		// default: () => []
	},
	fileTypeA: {
		type: String,
	},
})
watch(
	fileList,
	newV => {
		this.$emit('changeFile', newV, this.comp, this.fileTypeA)
	},
	{ deep: true }
)
watch(
	props.fileListEdit,
	newV => {
		fileList.value = newV
		console.log(newV, '???')
	},
	{ deep: true, immediate: true }
)
onMounted(() => {
	this.$bus.$on('resetFileList', () => {
		fileList.value = []
	})
	this.$bus.$on('editFileList', (i, comp) => {
		fileList.value = i
		this.comp = comp
	})
})
/**
 * 上传附件
 */
const upload = file => {
	// 营业执照只传pdf,png,jpeg
	if (this.fileTypeA === '1') {
		console.log(file)
		if (file.file.name.indexOf('pdf') === -1 || file.file.name.indexOf('pdf') === -1 || file.file.name.indexOf('pdf') === -1) {
			return this.$Message.error('营业执照只能上传pdf、jpg及jpeg格式')
		}
	}
	const formData = new FormData()
	formData.append('fileArray', file.file)
	formData.append('businessType', '04')
	public.getFileInfo(formData).then(response => {
		if (response.data.code === '0000') {
			this.$message({
				message: '上传附件成功',
				type: 'success',
			})
			response.data.data.forEach(item => {
				item.name = item.fileName
				item.fileFormat = item.fileName.split('.')[1]
				item.fileType = this.fileTypeA
				this.fileList.push(item)
			})
		}
	})
}
const readBuffer = file => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = loadEvent => resolve(loadEvent.target.result)
		reader.onerror = e => reject(e)
		console.log(reader, 'redaer')
		reader.readAsArrayBuffer(file)
	})
}
/**
 * 删除文件
 */
const beforeRemove = file => {
	return this.$confirm(`确定移除 ${file.name}？`)
	//   console.log(file, 'file');
}

/**
 * 文件移除
 */
const handleRemove = async file => {
	await this.beforeRemove(file)
	this.fileList = this.fileList.filter(item => item.fileId !== file.fileId)
}
const getFile = (file, responseType) => {
	return axios({
		method: 'get',
		url: `${config.ConfigBaseURL}/wfpms-master-service/api/external/publics/file/down?id=${file.fileId}`,
		responseType,
		params: {
			token: window.sessionStorage.getItem('token'),
		},
	})
}
/**
 * 预览附件
 */
const handlePreview = file => {
	this.fileInfo = file

	if (file.fileName.indexOf('jpg') !== -1 || file.fileName.indexOf('png') !== -1 || file.fileName.indexOf('jpeg') !== -1) {
		this.fileType = 'img'
		this.getFile(file, 'arraybuffer').then(res => {
			const blob = new Blob([res.data], {
				type: 'application/png;charset=utf-8',
			})
			const url = window.URL.createObjectURL(blob)
			this.imgurl = url
			this.previewVisible = true
		})
	} else if (file.fileName.indexOf('pdf') !== -1) {
		this.fileType = 'pdf'
		this.getFile(file, 'blob').then(res => {
			this.previewVisible = true
			const blob = new Blob([res.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			this.pdfUrl = url
		})
	} else if (file.fileName.indexOf('doc') !== -1 || file.fileName.indexOf('docx') !== -1) {
		this.fileType = 'doc'
		// const docx = require('docx-preview');
		this.getFile(file, 'arraybuffer').then(res => {
			this.previewVisible = true
			//   //   const blob = new Blob([res.data], { type: 'application/msword' })
			//   docx.renderAsync(res.data, this.$refs.demoDocContainer) // 渲染到页面
			const vm = this
			mammoth.convertToHtml({ arrayBuffer: new Uint8Array(res.data) }).then(function (resultObject) {
				vm.$nextTick(() => {
					// document.querySelector("#wordView").innerHTML =
					//   resultObject.value;
					vm.docHtml = resultObject.value
				})
			})
		})
	} else if (file.fileName.split('.')[1] === 'xlsx') {
		this.fileType = 'xlsx'
		this.getFile(file, 'arraybuffer').then(res => {
			this.previewVisible = true
			// 嵌入式预览excel
			// 生成新的dom
			const node = document.createElement('div')
			// 添加孩子，防止vue实例替换dom元素

			// this.$nextTick(() => {
			// 	console.log(this.$refs.excelPreview, 'this.$refs.excelPreview')
			// 	const child = this.$refs.excelPreview.appendChild(node)
			// 	// 调用渲染方法进行渲染
			// 	new Promise((resolve, reject) => renderSheet(res.data, child).then(resolve).catch(reject)).then(res => {
			// 		this.last = res
			// 	})
			// })
		})
	} else if (file.fileName.split('.')[1] === 'xls') {
		this.fileType = 'xls'
		this.getFile(file, 'arraybuffer').then(res => {
			this.previewVisible = true
			this.tableData = []
			const data = new Uint8Array(res.data)
			const workbook = XLSX.read(data, { type: 'array' })
			const sheetNames = workbook.SheetNames // 工作表名称集合
			const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet

			const tableau = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				defval: '',
			})
			// 数据处理为el-table需要的格式
			this.tableColumn = tableau[0]
			for (let index = 1; index < tableau.length; index++) {
				const obj = {}
				for (let j = 0; j < tableau[index].length; j++) {
					Object.assign(obj, { [tableau[0][j]]: tableau[index][j] })
				}
				this.tableData.push(obj)
			}
		})
	} else {
		this.downLoadFile(file)
	}
}
/**
 * 下载附件
 */
const downLoadFile = async file => {
	const res = await public.down(file.fileId)
	const content = res.data
	const blob = new Blob([content]) // 构造一个blob对象来处理数据
	const link = document.createElement('a') // 创建a标签
	link.download = file.fileName // a标签添加属性
	link.style.display = 'none'
	link.href = URL.createObjectURL(blob, {
		type: `application/pdf`,
	})
	document.body.appendChild(link)
	link.click() // 执行下载
	URL.revokeObjectURL(link.href) // 释放url
	document.body.removeChild(link) // 释放标签
}
const cancelPreview = () => {
	if (this.last) {
		console.log(this.$refs.excelPreview, '???')
		this.$refs.excelPreview.removeChild(this.last.$el)
		this.last.$destroy()
	}
}
</script>

<style lang="less" scoped>
.el-upload-list__item:hover .el-icon-view {
	display: inline-block;
}
.el-upload-list__item:hover .el-icon-close {
	display: inline-block;
}

.el-upload-list__item .el-icon-view {
	display: none;
	position: absolute;
	top: 8px;
	right: 35px;
	cursor: pointer;
	opacity: 0.75;
	color: #606266;
}
.el-upload-list__item .el-icon-close {
	display: none;
	position: absolute;
	top: 8px;
}
.el-upload-list__item-status-label {
	position: absolute;
	right: 5px;
	top: 3px;
	line-height: inherit;
	display: none;
}
.sketch_content {
	overflow: auto;
	border-top: 1px solid #eff1f4;
	border-bottom: 1px solid #eff1f4;
	padding: 0px 30px 11px 27px;
}
</style>
