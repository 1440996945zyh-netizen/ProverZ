<template>
	<div class="attachment">
		<el-collapse v-model="activeNames">
			<!-- 设备全景图 -->
			<el-collapse-item title="设备全景图" name="panorama">
				<div class="image-upload-section">
					<el-upload
						v-if="!readonly"
						class="image-uploader"
						:http-request="handlePanoramaUpload"
						:file-list="panoramaFileList"
						list-type="picture-card"
						:on-preview="handlePicturePreview"
						:on-remove="handlePanoramaRemove"
						accept="image/*"
					>
						<el-icon><Plus /></el-icon>
					</el-upload>
					<div v-else class="image-view-only">
						<div v-if="panoramaFileList.length === 0" class="empty-placeholder">暂无图片</div>
						<div v-else class="image-list">
							<div
								v-for="(item, index) in panoramaFileList"
								:key="item.id || index"
								class="image-item"
								@click="handlePicturePreview(item)"
							>
								<img :src="item.url" alt="设备全景图" />
							</div>
						</div>
					</div>
				</div>
			</el-collapse-item>

			<!-- 设备方位图 -->
			<el-collapse-item title="设备方位图" name="orientation">
				<div class="image-upload-section">
					<el-upload
						v-if="!readonly"
						class="image-uploader"
						:http-request="handleOrientationUpload"
						:file-list="orientationFileList"
						list-type="picture-card"
						:on-preview="handlePicturePreview"
						:on-remove="handleOrientationRemove"
						accept="image/*"
					>
						<el-icon><Plus /></el-icon>
					</el-upload>
					<div v-else class="image-view-only">
						<div v-if="orientationFileList.length === 0" class="empty-placeholder">暂无图片</div>
						<div v-else class="image-list">
							<div
								v-for="(item, index) in orientationFileList"
								:key="item.id || index"
								class="image-item"
								@click="handlePicturePreview(item)"
							>
								<img :src="item.url" alt="设备方位图" />
							</div>
						</div>
					</div>
				</div>
			</el-collapse-item>

			<!-- 设备主要附属物 -->
			<el-collapse-item title="设备主要附属物" name="accessory">
				<div class="image-upload-section">
					<el-upload
						v-if="!readonly"
						class="image-uploader"
						:http-request="handleAccessoryUpload"
						:file-list="accessoryFileList"
						list-type="picture-card"
						:on-preview="handlePicturePreview"
						:on-remove="handleAccessoryRemove"
						accept="image/*"
					>
						<el-icon><Plus /></el-icon>
					</el-upload>
					<div v-else class="image-view-only">
						<div v-if="accessoryFileList.length === 0" class="empty-placeholder">暂无图片</div>
						<div v-else class="image-list">
							<div
								v-for="(item, index) in accessoryFileList"
								:key="item.id || index"
								class="image-item"
								@click="handlePicturePreview(item)"
							>
								<img :src="item.url" alt="设备主要附属物" />
							</div>
						</div>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>

		<!-- 图片预览对话框 -->
		<el-dialog v-model="previewVisible" title="图片预览" width="80%">
			<img :src="previewImageUrl" style="width: 100%; height: auto" />
		</el-dialog>
	</div>
</template>

<script setup name="Attachment">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import publicApi from '@/api/public/index'
import request from '@/utils/auth/request'

const props = defineProps({
	equipmentId: {
		type: [Number, String],
		default: null,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:imageIds'])

// 折叠面板展开项
const activeNames = ref(['panorama', 'orientation', 'accessory'])

// 图片上传列表
const panoramaFileList = ref([]) // 设备全景图
const orientationFileList = ref([]) // 设备方位图
const accessoryFileList = ref([]) // 设备主要附属物
const previewImageUrl = ref('') // 预览图片URL
const previewVisible = ref(false) // 预览对话框显示状态

// 查询图片列表
const loadImages = async () => {
	if (!props.equipmentId) {
		return
	}

	// 查询设备全景图
	try {
		const panoramaRes = await publicApi.getBusFiles({
			businessId: props.equipmentId,
			businessType: 'EQUIPMENT_PANORAMA',
		})
		if (panoramaRes.code === '0000' && panoramaRes.data) {
			panoramaFileList.value = await Promise.all(
				panoramaRes.data.map(async item => {
					try {
						const res = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([res.data], {
							type: 'image/jpeg',
						})
						const url = window.URL.createObjectURL(blob)
						return {
							id: item.id,
							name: item.fileName,
							url: url,
						}
					} catch (error) {
						console.error('加载图片失败:', error)
						return {
							id: item.id,
							name: item.fileName,
							url: '',
						}
					}
				})
			)
		}
	} catch (error) {
		console.error('查询设备全景图失败:', error)
	}

	// 查询设备方位图
	try {
		const orientationRes = await publicApi.getBusFiles({
			businessId: props.equipmentId,
			businessType: 'EQUIPMENT_ORIENTATION',
		})
		if (orientationRes.code === '0000' && orientationRes.data) {
			orientationFileList.value = await Promise.all(
				orientationRes.data.map(async item => {
					try {
						const res = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([res.data], {
							type: 'image/jpeg',
						})
						const url = window.URL.createObjectURL(blob)
						return {
							id: item.id,
							name: item.fileName,
							url: url,
						}
					} catch (error) {
						console.error('加载图片失败:', error)
						return {
							id: item.id,
							name: item.fileName,
							url: '',
						}
					}
				})
			)
		}
	} catch (error) {
		console.error('查询设备方位图失败:', error)
	}

	// 查询设备主要附属物
	try {
		const accessoryRes = await publicApi.getBusFiles({
			businessId: props.equipmentId,
			businessType: 'EQUIPMENT_ACCESSORY',
		})
		if (accessoryRes.code === '0000' && accessoryRes.data) {
			accessoryFileList.value = await Promise.all(
				accessoryRes.data.map(async item => {
					try {
						const res = await publicApi.down(item.id, 'arraybuffer')
						const blob = new Blob([res.data], {
							type: 'image/jpeg',
						})
						const url = window.URL.createObjectURL(blob)
						return {
							id: item.id,
							name: item.fileName,
							url: url,
						}
					} catch (error) {
						console.error('加载图片失败:', error)
						return {
							id: item.id,
							name: item.fileName,
							url: '',
						}
					}
				})
			)
		}
	} catch (error) {
		console.error('查询设备主要附属物失败:', error)
	}
}

// 设备全景图上传
const handlePanoramaUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_PANORAMA')
	if (props.equipmentId) {
		uploadFormData.append('businessId', props.equipmentId)
	}

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				panoramaFileList.value.push({
					id: uploadedFile.id,
					name: uploadedFile.fileName,
					url: previewUrl,
					raw: file.file,
				})
				// 更新图片ID列表
				updateImageIds()
			}
		} else {
			ElMessage({
				message: response.msg || '上传失败',
				type: 'error',
			})
		}
	}).catch(error => {
		ElMessage({
			message: '上传失败',
			type: 'error',
		})
	})
}

// 设备方位图上传
const handleOrientationUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_ORIENTATION')
	if (props.equipmentId) {
		uploadFormData.append('businessId', props.equipmentId)
	}

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				orientationFileList.value.push({
					id: uploadedFile.id,
					name: uploadedFile.fileName,
					url: previewUrl,
					raw: file.file,
				})
				// 更新图片ID列表
				updateImageIds()
			}
		} else {
			ElMessage({
				message: response.msg || '上传失败',
				type: 'error',
			})
		}
	}).catch(error => {
		ElMessage({
			message: '上传失败',
			type: 'error',
		})
	})
}

// 设备主要附属物上传
const handleAccessoryUpload = (file) => {
	const uploadFormData = new FormData()
	uploadFormData.append('fileArray', file.file)
	uploadFormData.append('businessType', 'EQUIPMENT_ACCESSORY')
	if (props.equipmentId) {
		uploadFormData.append('businessId', props.equipmentId)
	}

	publicApi.getFileInfo(uploadFormData).then(response => {
		if (response.code === '0000') {
			ElMessage({
				message: '上传成功',
				type: 'success',
			})
			if (response.data.files && response.data.files.length > 0) {
				const uploadedFile = response.data.files[0]
				// 创建预览URL并添加到文件列表
				const previewUrl = URL.createObjectURL(file.file)
				accessoryFileList.value.push({
					id: uploadedFile.id,
					name: uploadedFile.fileName,
					url: previewUrl,
					raw: file.file,
				})
				// 更新图片ID列表
				updateImageIds()
			}
		} else {
			ElMessage({
				message: response.msg || '上传失败',
				type: 'error',
			})
		}
	}).catch(error => {
		ElMessage({
			message: '上传失败',
			type: 'error',
		})
	})
}

// 图片预览
const handlePicturePreview = (file) => {
	if (file.url) {
		previewImageUrl.value = file.url
		previewVisible.value = true
	} else if (file.id) {
		// 如果只有文件ID，需要下载后预览
		publicApi.down(file.id, 'arraybuffer').then(res => {
			const blob = new Blob([res.data], {
				type: 'image/jpeg',
			})
			const url = window.URL.createObjectURL(blob)
			previewImageUrl.value = url
			previewVisible.value = true
		})
	}
}

// 删除设备全景图
const handlePanoramaRemove = async (file) => {
	if (file && file.id && props.equipmentId) {
		try {
			const res = await request({
				url: '/api/internal/file/deletefile',
				method: 'get',
				params: {
					fileId: file.id,
					businessId: props.equipmentId,
				},
			})
			if (res.code === '0000') {
				ElMessage({
					message: '删除成功',
					type: 'success',
				})
				// 从文件列表中移除
				const fileIndex = panoramaFileList.value.findIndex(item => item.id === file.id)
				if (fileIndex > -1) {
					panoramaFileList.value.splice(fileIndex, 1)
					// 更新图片ID列表
					updateImageIds()
				}
			} else {
				ElMessage({
					message: res.msg || '删除失败',
					type: 'error',
				})
			}
		} catch (error) {
			ElMessage({
				message: '删除失败',
				type: 'error',
			})
		}
	}
}

// 删除设备方位图
const handleOrientationRemove = async (file) => {
	if (file && file.id && props.equipmentId) {
		try {
			const res = await request({
				url: '/api/internal/file/deletefile',
				method: 'get',
				params: {
					fileId: file.id,
					businessId: props.equipmentId,
				},
			})
			if (res.code === '0000') {
				ElMessage({
					message: '删除成功',
					type: 'success',
				})
				// 从文件列表中移除
				const fileIndex = orientationFileList.value.findIndex(item => item.id === file.id)
				if (fileIndex > -1) {
					orientationFileList.value.splice(fileIndex, 1)
					// 更新图片ID列表
					updateImageIds()
				}
			} else {
				ElMessage({
					message: res.msg || '删除失败',
					type: 'error',
				})
			}
		} catch (error) {
			ElMessage({
				message: '删除失败',
				type: 'error',
			})
		}
	}
}

// 删除设备主要附属物
const handleAccessoryRemove = async (file) => {
	if (file && file.id && props.equipmentId) {
		try {
			const res = await request({
				url: '/api/internal/file/deletefile',
				method: 'get',
				params: {
					fileId: file.id,
					businessId: props.equipmentId,
				},
			})
			if (res.code === '0000') {
				ElMessage({
					message: '删除成功',
					type: 'success',
				})
				// 从文件列表中移除
				const fileIndex = accessoryFileList.value.findIndex(item => item.id === file.id)
				if (fileIndex > -1) {
					accessoryFileList.value.splice(fileIndex, 1)
					// 更新图片ID列表
					updateImageIds()
				}
			} else {
				ElMessage({
					message: res.msg || '删除失败',
					type: 'error',
				})
			}
		} catch (error) {
			ElMessage({
				message: '删除失败',
				type: 'error',
			})
		}
	}
}

// 更新图片ID列表并通知父组件
const updateImageIds = () => {
	const panoramaImageIds = panoramaFileList.value.map(item => item.id)
	const orientationImageIds = orientationFileList.value.map(item => item.id)
	const accessoryImageIds = accessoryFileList.value.map(item => item.id)
	
	emit('update:imageIds', {
		panoramaImageIds,
		orientationImageIds,
		accessoryImageIds,
	})
}

// 监听 equipmentId 变化，重新加载图片
watch(
	() => props.equipmentId,
	(newId) => {
		if (newId) {
			loadImages()
		} else {
			panoramaFileList.value = []
			orientationFileList.value = []
			accessoryFileList.value = []
		}
		// 更新图片ID列表
		updateImageIds()
	},
	{ immediate: true }
)

// 监听文件列表变化，更新图片ID列表
watch(
	[panoramaFileList, orientationFileList, accessoryFileList],
	() => {
		updateImageIds()
	},
	{ deep: true }
)
</script>

<style scoped lang="scss">
.attachment {
	:deep(.el-collapse) {
		border: none;
		width: 100%;
	}

	:deep(.el-collapse-item) {
		border: none !important;
		border-bottom: none !important;
		margin-bottom: 10px;
	}

	:deep(.el-collapse-item:last-child) {
		border-bottom: none !important;
	}

	:deep(.el-collapse-item__content) {
		padding: 10px;
	}

	:deep(.el-collapse-item__header) {
		padding: 10px;
		font-size: 13px;
		background-color: #f5f7fa;
		border: 1px solid #e4e7ed;
		border-radius: 4px;
	}

	.image-upload-section {
		:deep(.el-upload--picture-card) {
			width: 148px;
			height: 148px;
			border: 1px dashed #d9d9d9;
			border-radius: 6px;
			cursor: pointer;
			position: relative;
			overflow: hidden;
			transition: all 0.3s;

			&:hover {
				border-color: #409eff;
			}
		}

		:deep(.el-upload-list--picture-card) {
			.el-upload-list__item {
				width: 148px;
				height: 148px;
				margin-bottom: 10px;
			}
		}

		.image-view-only {
			.empty-placeholder {
				text-align: center;
				color: #909399;
				padding: 50px 0;
				font-size: 14px;
			}

			.image-list {
				display: flex;
				flex-direction: column;
				gap: 10px;

				.image-item {
					width: 148px;
					height: 148px;
					border: 1px solid #d9d9d9;
					border-radius: 6px;
					overflow: hidden;
					cursor: pointer;
					transition: all 0.3s;

					&:hover {
						border-color: #409eff;
						transform: scale(1.05);
					}

					img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
				}
			}
		}
	}
}
</style>
