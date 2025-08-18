<template>
	<div>
		<ul class="el-upload-list el-upload-list--text" v-if="fileList.length > 0">
			<li v-for="item in fileList" :key="item.fileId" class="el-upload-list__item is-success">
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
		<span v-if="fileList.length === 0" class="file_tip">暂无数据</span>
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

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import publicApi from '@/api/public/index.js'
import * as XLSX from 'xlsx'
import { renderAsync } from 'docx-preview'
const { proxy } = getCurrentInstance()

const previewVisible = ref(false)
const fileType = ref('') // 预览文件类型
const fileInfo = ref([]) // 下载文件
const imgurl = ref('') // 图片路径
const pdfUrl = ref('') // pdf路径
const tableData = ref([]) // 预览表格数据
const tableColumn = ref([]) // 预览表格表头

const props = defineProps({
	fileList: {
		type: Array,
		default: () => [],
	},
	showRemoveBtn: {
		type: Boolean,
		default: false,
	},
})
// const fileList = ref([
// 	{ fileName: 'Snipaste_2023-12-06_14-44-17.png', fileId: '1732289866999402496', fileType: null },
// 	{ fileName: 'Snipaste_2023-12-06_13-54-14.png', fileId: '1732277386336145408', fileType: null },
// ])
/**
 * 文件移除
 */
// const handleRemove = async file => {
// 	await beforeRemove(file)
// 	fileList.value = fileList.value.filter(item => item.fileId !== file.fileId)
// }
/**
 * 预览附件
 */
const handlePreview = file => {
	fileInfo.value = file
	console.log(file, 'file')
	// console.log(docRef.value, 'docRef.value')
	if (file.fileName.indexOf('jpg') !== -1 || file.fileName.indexOf('png') !== -1 || file.fileName.indexOf('jpeg') !== -1) {
		fileType.value = 'img'
		publicApi.down(file.fileId, 'arraybuffer').then(res => {
			console.log('文件预览', res)
			const blob = new Blob([res.data], {
				type: 'application/png;charset=utf-8',
			})
			const url = window.URL.createObjectURL(blob)
			imgurl.value = url
			previewVisible.value = true
		})
	} else if (file.fileName.indexOf('pdf') !== -1) {
		fileType.value = 'pdf'
		publicApi.down(file.fileId, 'blob').then(res => {
			previewVisible.value = true
			const blob = new Blob([res.data], { type: 'application/pdf' })
			const url = window.URL.createObjectURL(blob)
			pdfUrl.value = url
		})
	} else if (file.fileName.indexOf('doc') !== -1 || file.fileName.indexOf('docx') !== -1) {
		fileType.value = 'doc'
		publicApi.down(file.fileId, 'blob').then(res => {
			previewVisible.value = true
			nextTick(() => {
				// const blob = new Blob([res.data], { type: 'application/msword' })
				console.log(proxy.$refs.docRef, 'proxy.$refs.docRef')
				renderAsync(res.data, proxy.$refs.docRef)
			})
		})
	} else if (file.fileName.split('.')[1] === 'xls' || file.fileName.split('.')[1] === 'xlsx') {
		fileType.value = 'xls'
		publicApi.down(file.fileId, 'arraybuffer').then(res => {
			previewVisible.value = true
			tableData.value = []
			const data = new Uint8Array(res.data)
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
/**
 * 下载附件
 */
const downLoadFile = async file => {
	const res = await publicApi.down(file.fileId)
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
	width: 330px;
}
.file_tip {
	margin-left: 5px;
	color: rgb(184, 183, 183);
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
