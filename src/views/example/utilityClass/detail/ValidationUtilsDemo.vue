<!--
 * @Author: zhangsd
 * @Date: 2025-09-15 14:34:05
 * @LastEditTime: 2025-09-15 15:22:50
 * @LastEditors: zhangsd
 * @Description: 表单验证工具方法演示
 * @FilePath: \view\src\views\example\utilityClass\detail\ValidationUtilsDemo.vue
-->
<template>
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<h1 class="text-3xl font-bold mb-8 text-center text-blue-600">表单验证工具方法演示</h1>

		<!-- 1. 表单处理相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">1. 表单处理相关 (resetForm / setFormData)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('form')">
						{{ codeDisplayStatus.form ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">表单数据填充和重置功能</el-tag>
				</el-form-item>
				<el-form ref="demoForm" :model="formData" label-width="100px" class="form-demo">
					<el-form-item label="姓名" prop="name">
						<el-input v-model="formData.name" placeholder="请输入姓名"></el-input>
					</el-form-item>
					<el-form-item label="年龄" prop="age">
						<el-input v-model.number="formData.age" placeholder="请输入年龄" type="number"></el-input>
					</el-form-item>
					<el-form-item label="邮箱" prop="email">
						<el-input v-model="formData.email" placeholder="请输入邮箱" type="email"></el-input>
					</el-form-item>
					<el-form-item label-width="100px">
						<el-space>
							<el-button type="primary" @click="handleSetFormData">填充表单数据</el-button>
							<el-button type="default" @click="handleResetForm">重置表单</el-button>
						</el-space>
					</el-form-item>
				</el-form>
				<el-form-item label="当前表单数据" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" v-model="formDataStr" readonly></el-input>
				</el-form-item>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.form" class="mt-4" style="margin-left: 30px">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('form')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 2. URL/外链验证相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">2. URL/外链验证相关 (isHttpOrHttps / isExternal / validURL)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('url')">
						{{ codeDisplayStatus.url ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">URL和外链验证功能</el-tag>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">URL验证 (validURL)</h3>
								<el-form-item label="功能说明" label-width="80px">
									<el-tag type="info" size="small">验证输入的字符串是否符合URL格式规范</el-tag>
								</el-form-item>
								<el-form-item label="URL验证" label-width="80px">
									<el-input v-model="urlInput" placeholder="输入URL" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="80px">
									<el-button @click="handleValidateUrl" type="primary">验证URL</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="80px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="urlResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">外链检测 (isExternal)</h3>
								<el-form-item label="功能说明" label-width="80px">
									<el-tag type="info" size="small">检测输入的路径是否为外链</el-tag>
								</el-form-item>
								<el-form-item label="外链检测" label-width="80px">
									<el-input v-model="externalPath" placeholder="输入路径" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="80px">
									<el-button @click="handleCheckExternal" type="primary">检测外链</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="80px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="externalResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">HTTP/HTTPS检测 (isHttpOrHttps)</h3>
								<el-form-item label="功能说明" label-width="80px">
									<el-tag type="info" size="small">检测输入的URL是否为HTTP/HTTPS协议</el-tag>
								</el-form-item>
								<el-form-item label="HTTP/HTTPS检测" label-width="140px">
									<el-input v-model="httpUrl" placeholder="输入URL" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="140px">
									<el-button @click="handleCheckHttpProtocol" type="primary">检测协议</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="140px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="httpResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.url" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('url')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 3. 基础验证相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						3. 基础验证相关 (validUsername / validLowerCase / validUpperCase / validAlphabets / validEmail / isString / isArray)
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('basic')">
						{{ codeDisplayStatus.basic ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">基础字符串和数据类型验证功能</el-tag>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">用户名验证 (validUsername)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否符合用户名格式规范</el-tag>
								</el-form-item>
								<el-form-item label="用户名验证" label-width="100px">
									<el-input v-model="usernameInput" placeholder="输入用户名" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateUsername" type="primary">验证用户名</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="usernameResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">小写字母验证 (validLowerCase)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否只包含小写字母</el-tag>
								</el-form-item>
								<el-form-item label="小写字母验证" label-width="100px">
									<el-input v-model="lowercaseInput" placeholder="输入字符串" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateLowercase" type="primary">验证小写字母</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="lowercaseResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">大写字母验证 (validUpperCase)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否只包含大写字母</el-tag>
								</el-form-item>
								<el-form-item label="大写字母验证" label-width="100px">
									<el-input v-model="uppercaseInput" placeholder="输入字符串" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateUppercase" type="primary">验证大写字母</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="uppercaseResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">纯字母验证 (validAlphabets)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否只包含字母</el-tag>
								</el-form-item>
								<el-form-item label="纯字母验证" label-width="100px">
									<el-input v-model="alphabetsInput" placeholder="输入字符串" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateAlphabets" type="primary">验证纯字母</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="alphabetsResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">邮箱验证 (validEmail)</h3>
								<el-form-item label="功能说明" label-width="80px">
									<el-tag type="info" size="small">验证输入的字符串是否符合邮箱格式规范</el-tag>
								</el-form-item>
								<el-form-item label="邮箱验证" label-width="80px">
									<el-input v-model="emailInput" placeholder="输入邮箱" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="80px">
									<el-button @click="handleValidateEmail" type="primary">验证邮箱</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="80px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="emailResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">字符串验证 (isString)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的值是否为字符串类型</el-tag>
								</el-form-item>
								<el-form-item label="字符串验证" label-width="100px">
									<el-input v-model="stringInput" placeholder="输入值" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateStringType" type="primary">验证字符串类型</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="stringResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">数组验证 (isArray)</h3>
								<el-form-item label="功能说明" label-width="80px">
									<el-tag type="info" size="small">验证输入的值是否为数组类型</el-tag>
								</el-form-item>
								<el-form-item label="数组验证" label-width="80px">
									<el-input v-model="arrayInput" placeholder="输入数组" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="80px">
									<el-button @click="handleValidateArrayType" type="primary">验证数组类型</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="80px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="arrayResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.basic" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('basic')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 4. 表单验证规则相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						4. 表单验证规则相关 (validateNumberFormat / validateEmailRule / isBankCard / isMobilePhone /isTelephone / isIdCard )
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('getRules')">
						{{ codeDisplayStatus.getRules ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">通过 getRules 方法动态生成表单各种验证规则</el-tag>
				</el-form-item>

				<el-form ref="dynamicFormRef" :model="dynamicFormData" :rules="dynamicFormRules" label-width="120px" class="form-demo">
					<el-row :gutter="20">
						<el-col :span="24">
							<el-form-item label="数字（validateNumberFormat）" prop="number" label-width="240px">
								<el-input v-model="dynamicFormData.number" placeholder="请输入数字"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="邮箱（validateEmailRule）" label-width="240px" prop="email">
								<el-input v-model="dynamicFormData.email" placeholder="请输入邮箱"></el-input>
							</el-form-item>
						</el-col>

						<el-col :span="24">
							<el-form-item label="银行卡号（isBankCard）" prop="bankCard" label-width="240px">
								<el-input v-model="dynamicFormData.bankCard" placeholder="请输入银行卡号"></el-input>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="手机号（isMobilePhone）" label-width="240px" prop="mobile">
								<el-input v-model="dynamicFormData.mobile" placeholder="请输入手机号"></el-input>
							</el-form-item>
						</el-col>

						<el-col :span="24">
							<el-form-item label="身份证号（isIdCard）" prop="idCard" label-width="240px">
								<el-input v-model="dynamicFormData.idCard" placeholder="请输入身份证号"></el-input>
							</el-form-item>
						</el-col>
					</el-row>

					<el-form-item label-width="240px">
						<el-space>
							<el-button type="primary" @click="validateDynamicForm">验证表单</el-button>
							<el-button @click="resetDynamicForm">重置表单</el-button>
						</el-space>
					</el-form-item>
				</el-form>

				<el-form-item label="验证结果" label-width="100px">
					<el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" v-model="validationResult" readonly></el-input>
				</el-form-item>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.getRules" class="mt-4" style="margin-left: 30px">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('getRules')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>
		<!-- 5. 其他验证相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						5. 其他验证相关 (validateAlphanumeric / validatePhone / validateVersion / isValidIP)
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('other')">
						{{ codeDisplayStatus.other ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">其他常用验证功能</el-tag>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">字母数字组合 (validateAlphaNumeric)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否符合字母数字组合格式</el-tag>
								</el-form-item>
								<el-form-item label="字母数字组合" label-width="100px">
									<el-input v-model="alphaNumericInput" placeholder="输入字符串" clearable></el-input>
								</el-form-item>
								<el-form-item label="最小长度" label-width="100px">
									<el-input v-model="minLength" type="number" placeholder="最小长度" clearable></el-input>
								</el-form-item>
								<el-form-item label="最大长度" label-width="100px">
									<el-input v-model="maxLength" type="number" placeholder="最大长度" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateAlphaNumeric" type="primary">验证字母数字组合</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="alphaNumericResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">电话号码验证 (validatePhone)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否符合电话号码格式</el-tag>
								</el-form-item>
								<el-form-item label="电话号码验证" label-width="100px">
									<el-input v-model="phoneInput2" placeholder="输入电话号码" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidatePhone2" type="primary">验证电话号码</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="phoneResult2"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">版本号验证 (validateVersion)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否符合版本号格式</el-tag>
								</el-form-item>
								<el-form-item label="版本号验证" label-width="100px">
									<el-input v-model="versionInput" placeholder="输入版本号" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateVersion" type="primary">验证版本号</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="versionResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">IP地址验证 (isValidIP)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">验证输入的字符串是否符合IP地址格式</el-tag>
								</el-form-item>
								<el-form-item label="IP地址验证" label-width="100px">
									<el-input v-model="ipInput" placeholder="输入IP地址" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateIP" type="primary">验证IP地址</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="ipResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.other" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('other')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 6. 文件验证相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">6. 文件验证相关 (determineFileType / validUploadFile)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('file')">
						{{ codeDisplayStatus.file ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">文件类型和上传验证功能</el-tag>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">文件类型判断 (determineFileType)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">判断输入的文件名所属的文件类型</el-tag>
								</el-form-item>
								<el-form-item label="文件类型判断" label-width="100px">
									<el-input v-model="fileTypeInput" placeholder="输入文件名" clearable></el-input>
								</el-form-item>
								<el-form-item label="允许类型" label-width="100px">
									<el-input v-model="allowedTypes" placeholder="img,video,pdf" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleDetermineFileType" type="primary">判断文件类型</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="fileTypeResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">文件上传校验 (validUploadFile)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">校验上传的文件是否符合要求</el-tag>
								</el-form-item>
								<el-form-item label="文件上传校验" label-width="100px">
									<el-input v-model="uploadFileInput" placeholder="输入文件名" clearable></el-input>
								</el-form-item>
								<el-form-item label="允许类型" label-width="100px">
									<el-input v-model="uploadAllowedTypes" placeholder="img,video,pdf" clearable></el-input>
								</el-form-item>
								<el-form-item label="文件大小(KB)" label-width="100px">
									<el-input v-model="fileSize" type="number" placeholder="文件大小" clearable></el-input>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleValidateUploadFile" type="primary">校验上传文件</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="uploadResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.file" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('file')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 7. 输入修正相关 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">7. 输入修正相关 (filterInput)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('filter')">
						{{ codeDisplayStatus.filter ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">输入内容过滤和修正功能</el-tag>
				</el-form-item>
				<el-row :gutter="20">
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">输入修正 (filterInput)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">对输入的内容进行过滤和修正</el-tag>
								</el-form-item>
								<el-form-item label="输入修正" label-width="100px">
									<el-input v-model="inputValue" placeholder="输入内容" clearable></el-input>
								</el-form-item>
								<el-form-item label="修正类型" label-width="100px">
									<el-select v-model="filterType" placeholder="选择修正类型" style="width: 150px">
										<el-option label="数字" value="number"></el-option>
										<el-option label="正整数" value="positiveNumber"></el-option>
										<el-option label="小数" value="decimal"></el-option>
										<el-option label="正小数" value="positiveDecimal"></el-option>
										<el-option label="精确到两位小数" value="exactDecimal"></el-option>
										<el-option label="精确到六位小数" value="sixDecimal"></el-option>
										<el-option label="中文" value="chineseOnly"></el-option>
										<el-option label="字母数字" value="duty"></el-option>
										<el-option label="数字和中文" value="numChinese"></el-option>
										<el-option label="银行卡号" value="cardNum"></el-option>
										<el-option label="拉丁字母" value="latin"></el-option>
										<el-option label="带空格的拉丁字母" value="latinSpace"></el-option>
									</el-select>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleFilterInput" type="primary">修正输入</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="filteredResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<el-col :xs="24" :md="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">精确小数修正 (filterInput)</h3>
								<el-form-item label="功能说明" label-width="100px">
									<el-tag type="info" size="small">对输入的小数进行精确位数修正</el-tag>
								</el-form-item>
								<el-form-item label="精确小数修正" label-width="100px">
									<el-input v-model="decimalInput" placeholder="输入小数" clearable></el-input>
								</el-form-item>
								<el-form-item label="小数位数" label-width="100px">
									<el-select v-model="decimalPrecision" placeholder="选择小数位数" style="width: 150px">
										<el-option label="1位" value="onePoint"></el-option>
										<el-option label="2位" value="twoPoint"></el-option>
										<el-option label="3位" value="threePoint"></el-option>
										<el-option label="4位" value="fourPoint"></el-option>
									</el-select>
								</el-form-item>
								<el-form-item label-width="100px">
									<el-button @click="handleFilterDecimal" type="primary">修正小数</el-button>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-form-item label="结果:" label-width="100px" class="flex-1 mb-0" style="width: 100%">
										<el-input
											type="textarea"
											:autosize="{ minRows: 2, maxRows: 3 }"
											v-model="decimalResult"
											readonly
											class="mt-2"
										></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.filter" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('filter')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>
	</div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import {
	ElCard,
	ElRow,
	ElCol,
	ElForm,
	ElFormItem,
	ElInput,
	ElButton,
	ElSpace,
	ElSelect,
	ElOption,
	ElTable,
	ElTableColumn,
	ElMessage,
} from 'element-plus'
import Prism from 'prismjs'
import 'prismjs/themes/prism-coy.css'
import {
	resetForm,
	setFormData,
	isHttpOrHttps,
	isExternal,
	validURL,
	validUsername,
	validLowerCase,
	validUpperCase,
	validAlphabets,
	validEmail,
	isString,
	isArray,
	getRules,
	validateEmailRule,
	validateNumberFormat,
	createNumberValidationError,
	isEmptyTrim,
	isInteger,
	isDecimal,
	isBankCard,
	isMobilePhone,
	isTelephone,
	isIdCard,
	isEmpty,
	validationMessages,
	validateAlphaNumeric,
	validatePhone,
	validateVersion,
	isValidIP,
	determineFileType,
	validUploadFile,
	filterInput as filterInputMethod,
} from '@/utils/common/form-validation.js'

// 在组件挂载后触发高亮更新
onMounted(() => {
	// Prism 需要在 DOM 更新后重新渲染
	setTimeout(() => {
		Prism.highlightAll()
	}, 0)
})

// 获取组件实例
const instance = getCurrentInstance()

// 控制代码显示的状态
const codeDisplayStatus = ref({
	form: false,
	url: false,
	basic: false,
	rules: false,
	other: false,
	file: false,
	filter: false,
})

// 切换代码显示
const toggleCodeDisplay = feature => {
	codeDisplayStatus.value[feature] = !codeDisplayStatus.value[feature]
}

// 为每个功能创建相应的代码示例
const featureCodes = {
	form: `<script setup>
import { ref, getCurrentInstance } from 'vue'
import { resetForm, setFormData } from '@/utils/common/form-validation.js'

const instance = getCurrentInstance()

const formData = ref({
	name: '',
	age: null,
	email: '',
})

const handleSetFormData = () => {
	const sampleData = {
		name: '张三',
		age: 28,
		email: 'zhangsan@example.com',
	}
	setFormData(formData.value, sampleData)
}

const handleResetForm = () => {
	resetForm.call(instance.proxy, 'demoForm')
}
<\/script>`,

	url: `<script setup>
import { 
	isHttpOrHttps,
	isExternal,
	validURL
} from '@/utils/common/form-validation.js'

//URL验证
const urlInput = ref('https://example.com ')
const urlResult = ref('')

const handleValidateUrl = () => {
	urlResult.value = validURL(urlInput.value) ? 'URL格式有效' : 'URL格式无效'
}

//外链验证
const externalPath = ref('https://example.com')
const externalResult = ref('')

const handleCheckExternal = () => {
	externalResult.value = isExternal(externalPath.value) ? '是外链' : '不是外链'
}

//HTTP/HTTPS验证
const httpUrl = ref('http://example.com')
const httpResult = ref('')

const handleCheckHttpProtocol = () => {
	httpResult.value = isHttpOrHttps(httpUrl.value) ? '是HTTP/HTTPS协议' : '不是HTTP/HTTPS协议'
}
<\/script>`,

	basic: `<script setup>
import { 
	validUsername,
	validLowerCase,
	validUpperCase,
	validAlphabets,
	validEmail,
	isString,
	isArray
} from '@/utils/common/form-validation.js'

//用户名验证
const usernameInput = ref('admin')
const usernameResult = ref('')

const handleValidateUsername = () => {
	usernameResult.value = validUsername(usernameInput.value) ? '有效用户名' : '无效用户名'
}

//仅包含小写字母验证
const lowercaseInput = ref('abc')
const lowercaseResult = ref('')

const handleValidateLowercase = () => {
	lowercaseResult.value = validLowerCase(lowercaseInput.value) ? '仅包含小写字母' : '不满足条件'
}

//仅包含大写字母验证
const uppercaseInput = ref('ABC')
const uppercaseResult = ref('')

const handleValidateUppercase = () => {
	uppercaseResult.value = validUpperCase(uppercaseInput.value) ? '仅包含大写字母' : '不满足条件'
}

//仅包含字母验证
const alphabetsInput = ref('abcABC')
const alphabetsResult = ref('')

const handleValidateAlphabets = () => {
	alphabetsResult.value = validAlphabets(alphabetsInput.value) ? '仅包含字母' : '不满足条件'
}

//邮箱验证
const emailInput = ref('test@example.com')
const emailResult = ref('')

const handleValidateEmail = () => {
	emailResult.value = validEmail(emailInput.value) ? '有效邮箱' : '无效邮箱'
}

//字符串类型验证
const stringInput = ref('hello')
const stringResult = ref('')

const handleValidateStringType = () => {
	stringResult.value = isString(stringInput.value) ? '是字符串' : '不是字符串'
}

//数组类型验证
const arrayInput = ref('[1,2,3]')
const arrayResult = ref('')

const handleValidateArrayType = () => {
	let value = arrayInput.value
	try {
		value = JSON.parse(arrayInput.value)
	} catch (e) {
		// 如果不是有效JSON，保持原样
	}
	arrayResult.value = isArray(value) ? '是数组' : '不是数组'
}
<\/script>`,

	getRules: `<script setup>
import { ref, reactive } from 'vue'
import { getRules } from '@/utils/common/form-validation.js'

const dynamicFormRef = ref(null)

const dynamicFormData = reactive({
  username: '',
  email: '',
  mobile: '',
  number: '',
  bankCard: '',
  idCard: ''
})

// 使用 getRules 方法生成表单验证规则
const dynamicFormRules = {
  username: getRules({
    required: true,
    trigger: 'blur'
  }),
  email: getRules({
    required: true,
    email: true, // 这会调用 validateEmailRule
    trigger: 'blur'
  }),
  mobile: getRules({
    required: true,
    handset: true, // 这会调用 isMobilePhone
    trigger: 'blur'
  }),
  number: getRules({
    required: true,
    numberCheck: {
      int: 5,
      dec: 2,
      startWith: ''
    }, // 这会调用 validateNumberFormat
    trigger: 'blur'
  }),
  bankCard: getRules({
    required: true,
    bankCard: true, // 这会调用 isBankCard
    trigger: 'blur'
  }),
  idCard: getRules({
    required: true,
    idCard: true, // 这会调用 isIdCard
    trigger: 'blur'
  })
}

const validateDynamicForm = () => {
  if (!dynamicFormRef.value) return
  
  dynamicFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('表单验证通过')
    } else {
      ElMessage.error('表单验证失败，请检查输入内容')
    }
  })
}
<\/script>`,

	other: `<script setup>
import { 
	validateAlphaNumeric,
	validatePhone,
	validateVersion,
	isValidIP
} from '@/utils/common/form-validation.js'

//字母数字组合验证
const alphaNumericInput = ref('abc123')
const minLength = ref(3)
const maxLength = ref(6)
const alphaNumericResult = ref('')

const handleValidateAlphaNumeric = () => {
	alphaNumericResult.value = validateAlphaNumeric(alphaNumericInput.value, minLength.value, maxLength.value)
		? '符合字母数字组合规则'
		: '不符合字母数字组合规则'
}

//电话号码验证
const phoneInput2 = ref('010-12345678')
const phoneResult2 = ref('')

const handleValidatePhone2 = () => {
	phoneResult2.value = validatePhone(phoneInput2.value) ? '符合电话号码格式' : '不符合电话号码格式'
}

//版本号验证
const versionInput = ref('1.2.3')
const versionResult = ref('')

const handleValidateVersion = () => {
	versionResult.value = validateVersion(versionInput.value) ? '符合版本号格式' : '不符合版本号格式'
}

//IP地址验证
const ipInput = ref('192.168.1.1')
const ipResult = ref('')

const handleValidateIP = () => {
	ipResult.value = isValidIP(ipInput.value) ? '符合IP地址格式' : '不符合IP地址格式'
}
<\/script>`,

	file: `<script setup>
import { 
	determineFileType,
	validUploadFile
} from '@/utils/common/form-validation.js'

//文件类型验证
const fileTypeInput = ref('image.jpg')
const allowedTypes = ref('img,video')
const fileTypeResult = ref('')

const handleDetermineFileType = () => {
	const file = {
		name: fileTypeInput.value,
		size: 1024,
	}
	fileTypeResult.value = determineFileType(allowedTypes.value, file)
}

//文件上传验证
const uploadFileInput = ref('image.jpg')
const uploadAllowedTypes = ref('img,video')
const fileSize = ref(512)
const uploadResult = ref('')

const handleValidateUploadFile = () => {
	const file = {
		name: uploadFileInput.value,
		size: fileSize.value * 1024,
	}
	const result = validUploadFile(uploadAllowedTypes.value, file)
	uploadResult.value = result ? result : '验证通过'
}
<\/script>`,

	filter: `<script setup>
import { 
	filterInput as filterInputMethod
} from '@/utils/common/form-validation.js'

//输入过滤
const inputValue = ref('123.45abc')
const filterType = ref('number')
const filteredResult = ref('')

const handleFilterInput = () => {
	filteredResult.value = filterInputMethod(filterType.value, inputValue.value)
}

//小数过滤
const decimalInput = ref('123.45678')
const decimalPrecision = ref('twoPoint')
const decimalResult = ref('')

const handleFilterDecimal = () => {
	decimalResult.value = filterInputMethod(decimalPrecision.value, decimalInput.value)
}
<\/script>`,
}

// 代码高亮
const highlightedCode = (feature, language = 'javascript') => {
	const code = featureCodes[feature] || ''
	if (!code) return ''
	return Prism.highlight(code, Prism.languages[language], language)
}
// 1. 表单处理相关
const formData = ref({
	name: '',
	age: null,
	email: '',
})
const formDataStr = ref(JSON.stringify(formData.value, null, 2))

const handleSetFormData = () => {
	const sampleData = {
		name: '张三',
		age: 28,
		email: 'zhangsan@example.com',
		extraField: '不会显示（仅匹配表单已有字段）',
	}
	setFormData(formData.value, sampleData)
	formDataStr.value = JSON.stringify(formData.value, null, 2)
}

const handleResetForm = () => {
	resetForm.call(instance.proxy, 'demoForm')
	formDataStr.value = JSON.stringify(formData.value, null, 2)
}

// 2. URL/外链验证相关
const urlInput = ref('https://example.com  ')
const urlResult = ref('')

const handleValidateUrl = () => {
	urlResult.value = validURL(urlInput.value) ? 'URL格式有效' : 'URL格式无效'
}

const externalPath = ref('https://example.com')
const externalResult = ref('')

const handleCheckExternal = () => {
	externalResult.value = isExternal(externalPath.value) ? '是外链' : '不是外链'
}

const httpUrl = ref('http://example.com')
const httpResult = ref('')

const handleCheckHttpProtocol = () => {
	httpResult.value = isHttpOrHttps(httpUrl.value) ? '是HTTP/HTTPS协议' : '不是HTTP/HTTPS协议'
}

// 3. 基础验证相关
const usernameInput = ref('admin')
const usernameResult = ref('')

const handleValidateUsername = () => {
	usernameResult.value = validUsername(usernameInput.value) ? '有效用户名' : '无效用户名'
}

const lowercaseInput = ref('abc')
const lowercaseResult = ref('')

const handleValidateLowercase = () => {
	lowercaseResult.value = validLowerCase(lowercaseInput.value) ? '仅包含小写字母' : '不满足条件'
}

const uppercaseInput = ref('ABC')
const uppercaseResult = ref('')

const handleValidateUppercase = () => {
	uppercaseResult.value = validUpperCase(uppercaseInput.value) ? '仅包含大写字母' : '不满足条件'
}

const alphabetsInput = ref('abcABC')
const alphabetsResult = ref('')

const handleValidateAlphabets = () => {
	alphabetsResult.value = validAlphabets(alphabetsInput.value) ? '仅包含字母' : '不满足条件'
}

const emailInput = ref('test@example.com')
const emailResult = ref('')

const handleValidateEmail = () => {
	emailResult.value = validEmail(emailInput.value) ? '有效邮箱' : '无效邮箱'
}

const stringInput = ref('hello')
const stringResult = ref('')

const handleValidateStringType = () => {
	stringResult.value = isString(stringInput.value) ? '是字符串' : '不是字符串'
}

const arrayInput = ref('[1,2,3]')
const arrayResult = ref('')

const handleValidateArrayType = () => {
	let value = arrayInput.value
	try {
		value = JSON.parse(arrayInput.value)
	} catch (e) {
		// 如果不是有效JSON，保持原样
	}
	arrayResult.value = isArray(value) ? '是数组' : '不是数组'
}

// 4. 表单验证规则相关
const dynamicFormRef = ref(null)
const validationResult = ref('')

const dynamicFormData = reactive({
	username: '',
	email: '',
	mobile: '',
	number: '',
	bankCard: '',
	idCard: '',
})

// 使用 getRules 方法生成表单验证规则
const dynamicFormRules = {
	username: getRules({
		required: true,
		trigger: 'blur',
	}),
	email: getRules({
		required: true,
		email: true, // 这会调用 validateEmailRule
		trigger: 'blur',
	}),
	mobile: getRules({
		required: true,
		handset: true, // 这会调用 isMobilePhone
		trigger: 'blur',
	}),
	number: getRules({
		required: true,
		numberCheck: {
			int: 5,
			dec: 2,
			startWith: '',
		}, // 这会调用 validateNumberFormat
		trigger: 'blur',
	}),
	bankCard: getRules({
		required: true,
		bankCard: true, // 这会调用 isBankCard
		trigger: 'blur',
	}),
	idCard: getRules({
		required: true,
		idCard: true, // 这会调用 isIdCard
		trigger: 'blur',
	}),
}

const validateDynamicForm = () => {
	if (!dynamicFormRef.value) return

	dynamicFormRef.value.validate(valid => {
		if (valid) {
			validationResult.value = '表单验证通过！所有字段均符合规则要求。'
			ElMessage.success('表单验证通过')
		} else {
			validationResult.value = '表单验证失败，请检查输入内容。'
			ElMessage.error('表单验证失败，请检查输入内容')
		}
	})
}

const resetDynamicForm = () => {
	if (!dynamicFormRef.value) return

	dynamicFormRef.value.resetFields()
	validationResult.value = ''
}

// 5. 其他验证相关
const alphaNumericInput = ref('abc123')
const minLength = ref(3)
const maxLength = ref(6)
const alphaNumericResult = ref('')

const handleValidateAlphaNumeric = () => {
	alphaNumericResult.value = validateAlphaNumeric(alphaNumericInput.value, minLength.value, maxLength.value)
		? '符合字母数字组合规则'
		: '不符合字母数字组合规则'
}

const phoneInput2 = ref('010-12345678')
const phoneResult2 = ref('')

const handleValidatePhone2 = () => {
	phoneResult2.value = validatePhone(phoneInput2.value) ? '符合电话号码格式' : '不符合电话号码格式'
}

const versionInput = ref('1.2.3')
const versionResult = ref('')

const handleValidateVersion = () => {
	versionResult.value = validateVersion(versionInput.value) ? '符合版本号格式' : '不符合版本号格式'
}

const ipInput = ref('192.168.1.1')
const ipResult = ref('')

const handleValidateIP = () => {
	ipResult.value = isValidIP(ipInput.value) ? '符合IP地址格式' : '不符合IP地址格式'
}

// 6. 文件验证相关
const fileTypeInput = ref('image.jpg')
const allowedTypes = ref('img,video')
const fileTypeResult = ref('')

const handleDetermineFileType = () => {
	const file = {
		name: fileTypeInput.value,
		size: 1024,
	}
	fileTypeResult.value = determineFileType(allowedTypes.value, file)
}

const uploadFileInput = ref('image.jpg')
const uploadAllowedTypes = ref('img,video')
const fileSize = ref(512)
const uploadResult = ref('')

const handleValidateUploadFile = () => {
	const file = {
		name: uploadFileInput.value,
		size: fileSize.value * 1024,
	}
	const result = validUploadFile(uploadAllowedTypes.value, file)
	uploadResult.value = result ? result : '验证通过'
}

// 7. 输入修正相关
const inputValue = ref('123.45abc')
const filterType = ref('number')
const filteredResult = ref('')

const handleFilterInput = () => {
	filteredResult.value = filterInputMethod(filterType.value, inputValue.value)
}

const decimalInput = ref('123.45678')
const decimalPrecision = ref('twoPoint')
const decimalResult = ref('')

const handleFilterDecimal = () => {
	decimalResult.value = filterInputMethod(decimalPrecision.value, decimalInput.value)
}

// 初始化数据
const init = () => {
	handleValidateUrl()
	handleCheckExternal()
	handleCheckHttpProtocol()
	handleValidateUsername()
	handleValidateLowercase()
	handleValidateUppercase()
	handleValidateAlphabets()
	handleValidateEmail()
	handleValidateStringType()
	handleValidateArrayType()
	handleValidateNumberFormat()
	handleValidateBankCard()
	handleValidateMobilePhone()
	handleValidateTelephone()
	handleValidateIdCard()
	handleValidateAlphaNumeric()
	handleValidateAlphaOrNumeric()
	handleValidatePhone2()
	handleValidateEmail2()
	handleValidateVersion()
	handleValidateIP()
	handleDetermineFileType()
	handleValidateUploadFile()
	handleFilterInput()
	handleFilterDecimal()
}

//init()
</script>

<style scoped>
/* 统一Element组件样式，对齐DataUtilsDemo */
.el-card {
	transition: all 0.3s ease;
}
.el-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.el-input--textarea[readonly],
.el-input[readonly] {
	background-color: #f5f7fa !important;
	color: #333 !important;
}
.el-form-item__label {
	font-weight: 500 !important;
}
.form-demo {
	max-width: 600px;
}
/* 适配主界面滚动容器 */
.container {
	box-sizing: border-box;
}
/* 新增：金额演示模块样式补充 */
.el-col :deep(.el-form-item) {
	margin-bottom: 16px;
}
pre {
	margin: 0;
	tab-size: 4;
	line-height: 1.5;
}

pre code {
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
	font-size: 14px;
}
.el-card {
	margin-bottom: 1.5rem;
}
/* 确保卡片高度一致 */
.el-card.h-full {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.el-card.h-full .el-card__body {
	flex: 1;
	display: flex;
	flex-direction: column;
}
</style>
