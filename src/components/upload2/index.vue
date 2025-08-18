<template>
	<div class="upload_demo">
		<el-upload class="upload_demo" v-if="showUploadBtn" :http-request="upload" :show-file-list="false" :accept="fileTypeName">
			<el-button icon="Upload" plain>点击上传</el-button>
		</el-upload>
		<div class="el-upload__tip" v-if="showUploadBtn">支持扩展名：{{ fileTypeName }}</div>

		<ul class="el-upload-list el-upload-list--text">
			<li v-for="item in fileList" :key="item.id" class="el-upload-list__item is-success">
				<div class="el-upload-list__item-info">
					<a class="el-upload-list__item-name" @click="downLoadFile(item)">
						<i class="iconfont icon-pdf" v-if="item.fileSuffix === 'pdf'" />
						<i class="iconfont icon-a-filetxt-line" v-else-if="item.fileSuffix === 'txt'" />
						<i class="iconfont icon-file-word" v-else-if="item.fileSuffix === 'doc' || item.fileSuffix === 'docx'" />
						<i class="iconfont icon-file-excel" v-else-if="item.fileSuffix === 'xls' || item.fileSuffix === 'xlsx'" />
						<i class="iconfont icon-img" v-else-if="item.fileSuffix === 'jpg' || item.fileSuffix === 'jpeg'" />
						<i class="iconfont icon-a-filetxt-line" v-else />
						<!-- <i class="el-icon-document" /> -->
						<!-- <i class="el-icon-document" /> -->
						{{ item.fileName }}
					</a>
				</div>

				<label class="el-upload-list__item-status-label">
					<i class="el-icon-upload-success el-icon-circle-check" />
				</label>
				<el-icon class="el-icon--close" @click="handleRemove(item)" v-if="showRemoveBtn">
					<Close />
				</el-icon>
				<el-icon class="el-icon--view" @click="handlePreview(item)">
					<View />
				</el-icon>
			</li>
		</ul>
		<el-dialog title="预览" append-to-body v-model="previewVisible" width="95%" top="2vh">
			<div v-if="fileType === 'img'">
				<img :src="imgurl" style="width: 100%; height: auto" />
			</div>
			<div v-else-if="fileType === 'pdf'" style="height: 900px">
				<iframe style="width: 100%; height: 100%" :src="pdfUrl"></iframe>
			</div>
			<!-- <div v-else-if="fileType === 'doc'" class="sketch_content " ref="demoDocContainer" style="height:500px"></div> -->
			<div v-else-if="fileType === 'doc'" class="sketch_content" ref="docRef" style="height: 500px"></div>
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
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="previewVisible = false">取 消</el-button>
					<el-button type="primary" @click="downLoadFile(fileInfo)">下 载</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>
<script setup name="Upload">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import publicApi from '@/api/public/index.js'
import * as XLSX from 'xlsx'
import { renderAsync } from 'docx-preview'
//import {files} from "yarn/lib/cli";
// import renderSheet from './xlsx'
const { proxy } = getCurrentInstance()
const emit = defineEmits(['changeFile'])
const props = defineProps({
	fileTypeName: {
		type: String,
		default: '.jpeg, .docx, .pdf, .jpg, .xlsx, .xls',
	},
	businessId: {
		type: String,
	},
	businessType: {
		type: String,
	},
	showUploadBtn: {
		type: Boolean,
		default: true,
	},
	showRemoveBtn: {
		type: Boolean,
		default: true,
	},
  filesData: {
    type: Array,
    default: () => [],
  },
})
const fileList = ref([]) // 上传文件列表

watch(
	() => props.businessId,
	newV => {
		if (newV) {
			const params = {
				id: newV,
				businessType: props.businessType
			}
			publicApi.getBusFiles2(params).then(res => {
				if (props.filesData.value != null ){
				fileList.value = props.filesData.value
				}else{
				fileList.value = res.data
				}
			})
		}
	}
)
watch(
	fileList,
	newV => {
		let ids = []
		newV.forEach(item => {
			ids.push(item.id)
		})
		emit('changeFile', ids)
	},
	{ deep: true, immediate: true }
)
const fileInfo = ref([]) // 下载文件
const fileType = ref('') // 预览文件类型
const imgurl = ref('') // 图片路径
const pdfUrl = ref('') // pdf路径
const tableData = ref([]) // 预览表格数据
const tableColumn = ref([]) // 预览表格表头
const previewVisible = ref(false)
/**
 * 上传附件
 */
const upload = file => {
	console.log(file, 'file111')
	const formData = new FormData()
	formData.append('fileArray', file.file)
	formData.append('businessType', props.businessType)
	console.log(formData, 'formData')
	publicApi.getFileInfo(formData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传附件成功',
				type: 'success',
			})
			response.data.files.forEach(item => {
				item.name = item.fileName
				fileList.value.push(item)
			})
		}
	})
}
/**
 * 下载附件
 */
const downLoadFile = async file => {
	const res = await publicApi.down2(file.id)
	const content = res
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
const last = ref('')
/**
 * 预览附件
 */
const handlePreview = file => {
	fileInfo.value = file
	console.log(file, 'file')
	// console.log(docRef.value, 'docRef.value')
	if (file.fileName.indexOf('jpg') !== -1 || file.fileName.indexOf('png') !== -1 || file.fileName.indexOf('jpeg') !== -1) {
		fileType.value = 'img'
		publicApi.down2(file.id, 'arraybuffer').then(res => {
			const blob = new Blob([res], {
				type: 'application/png;charset=utf-8',
			})
			const url = window.URL.createObjectURL(blob)
			imgurl.value = url
			previewVisible.value = true
		})
	} else if (file.fileName.indexOf('pdf') !== -1) {
		fileType.value = 'pdf'
		publicApi.down2(file.id, 'blob').then(res => {
			previewVisible.value = true
			const blob = new Blob([res], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			pdfUrl.value = url
		})
	} else if (file.fileName.indexOf('doc') !== -1 || file.fileName.indexOf('docx') !== -1) {
		fileType.value = 'doc'
		publicApi.down2(file.id, 'blob').then(res => {
			previewVisible.value = true
			nextTick(() => {
				const blob = new Blob([res], { type: 'application/msword' })
				console.log(proxy.$refs.docRef, 'proxy.$refs.docRef')
				renderAsync(res, proxy.$refs.docRef)
			})
		})
	}
	// else if (file.fileName.split('.')[1] === 'xlsx') {
	// 	fileType.value = 'xlsx'
	// 	publicApi.down(file.id, 'arraybuffer').then(res => {
	// 		previewVisible.value = true
	// 		// 嵌入式预览excel
	// 		// 生成新的dom
	// 		const node = document.createElement('div')
	// 		// 添加孩子，防止vue实例替换dom元素

	// 		nextTick(() => {
	// 			console.log(proxy.$refs.excelPreview, 'proxy.$refs.excelPreview')
	// 			const child = proxy.$refs.excelPreview.appendChild(node)
	// 			// 调用渲染方法进行渲染
	// 			new Promise((resolve, reject) => renderSheet(res.data, child).then(resolve).catch(reject)).then(res => {
	// 				last.value = res
	// 			})
	// 		})
	// 	})
	// }
	else if (file.fileName.split('.')[1] === 'xls' || file.fileName.split('.')[1] === 'xlsx') {
		fileType.value = 'xls'
		publicApi.down2(file.id, 'arraybuffer').then(res => {
			previewVisible.value = true
			tableData.value = []
			const data = new Uint8Array(res)
			const workbook = XLSX.read(data, { type: 'array' })
			const sheetNames = workbook.SheetNames // 工作表名称集合
			const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet

			const tableau = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				defval: '',
			})
			// 数据处理为el-table需要的格式
			tableColumn.value = tableau[0]
			for (let index = 1; index < tableau.length; index++) {
				const obj = {}
				for (let j = 0; j < tableau[index].length; j++) {
					Object.assign(obj, { [tableau[0][j]]: tableau[index][j] })
				}
				tableData.value.push(obj)
			}
		})
	} else {
		downLoadFile(file)
	}
}
const cancelPreview = () => {
	if (last.value) {
		console.log(this.$refs.excelPreview, '???')
		this.$refs.excelPreview.removeChild(last.value.$el)
		last.value.$destroy()
	}
}
/**
 * 删除文件前
 */
const beforeRemove = file => {
	console.log(file, '???')
	return proxy.$modal.confirm(`确定删除 ${file.fileName}？`)
	//   console.log(file, 'file');
}

/**
 * 文件移除
 */
const handleRemove = async file => {
	await beforeRemove(file)
	fileList.value = fileList.value.filter(item => item.id !== file.id)
}
onMounted(() => {
	proxy.$bus.on('resetFileList', () => {
		fileList.value = []
	})
})
</script>
<style lang="scss" scoped>
.el-upload__tip {
	font-size: 12px;
	color: var(--el-text-color-regular);
	margin-top: 7px;
}
.upload_demo {
	width: 100% !important;
}
.el-upload-list__item-info {
	height: 100%;
}
.el-upload-list__item.is-success {
	height: 30px;
}
.el-upload-list__item:hover .el-icon--view {
	display: inline-block;
}
.el-upload-list__item:hover .el-icon--close {
	display: inline-block;
}

.el-upload-list__item .el-icon--view {
	display: none;
	position: absolute;
	top: 8px;
	right: 30px;
	cursor: pointer;
	opacity: 0.75;
	color: #606266;
}
.el-upload-list__item .el-icon--close {
	display: none;
	position: absolute;
	top: 15px;
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
.iconfont {
	margin-right: 6px;
}
</style>
