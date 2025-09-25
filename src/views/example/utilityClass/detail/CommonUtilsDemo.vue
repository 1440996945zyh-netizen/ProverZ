<template>
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<h1 class="text-3xl font-bold mb-8 text-center text-blue-600">核心工具类方法演示</h1>

		<!-- 1. 防抖函数演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">1. 防抖函数 (debounce)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('debounce')">
						{{ codeDisplayStatus.debounce ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">在输入框中快速输入，防抖函数会在停止输入1秒后才执行搜索</el-tag>
				</el-form-item>
				<el-form-item label="搜索输入" label-width="100px">
					<el-input v-model="searchText" @input="handleSearch" placeholder="请输入搜索内容..." clearable></el-input>
				</el-form-item>
				<el-form-item label="执行日志" label-width="100px" v-if="debounceLog">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 3 }"
						v-model="debounceLog"
						readonly
						placeholder="执行日志将显示在这里"
					></el-input>
				</el-form-item>
				<!-- 代码显示区域 -->

				<div v-if="codeDisplayStatus.debounce" class="mt-4" style="margin-left: 30px">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('debounce')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 2. DOM操作演示 -->
		<el-card class="mb-8 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">2. DOM操作 (hasClass/addClass/removeClass/toggleClass)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('dom')">
						{{ codeDisplayStatus.dom ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<div id="dom-demo" class="p-4 border rounded bg-gray-100">
					<p>这个盒子用于演示DOM操作</p>
				</div>
				<el-form-item label-width="100px">
					<el-space>
						<el-button @click="addClassToElement">添加class</el-button>
						<el-button @click="removeClassFromElement">移除class</el-button>
						<el-button @click="toggleClassElement">切换class</el-button>
						<el-button @click="checkClass">检查class</el-button>
					</el-space>
				</el-form-item>
				<el-form-item label="当前状态" label-width="100px">
					<el-input v-model="domStatus" readonly></el-input>
				</el-form-item>
				<div v-if="codeDisplayStatus.dom" class="mt-4" style="margin-left: 30px">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('dom')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>
		<!-- 3. 字符串处理 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						3. 字符串处理 (sprintf/normalizeEmptyString/byteLength/html2Text/capitalize/snakeToCamel)
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('string')">
						{{ codeDisplayStatus.string ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>
			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">提供多种字符串处理功能，包括格式化、转换和计算等操作</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- 字符串格式化 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full card-spacing">
							<div class="space-y-3">
								<h3 class="font-medium">sprintf格式化（sprintf）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">按照模板格式化字符串</el-tag>
								</el-form-item>
								<el-form-item label="模板" label-width="60px">
									<el-input
										v-model="sprintfTemplate"
										placeholder="Hello %s, your score is %s"
										clearable
										size="small"
									></el-input>
								</el-form-item>
								<el-form-item label="参数" label-width="60px">
									<el-input v-model="sprintfArgs" placeholder="参数1,参数2" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="handleSprintf" type="primary" size="small">格式化</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="sprintfResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<!-- 空字符串处理 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">空字符串处理（normalizeEmptyString）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将null、undefined等空值转换为空字符串</el-tag>
								</el-form-item>
								<el-form-item label="输入值" label-width="60px">
									<el-input v-model="emptyStringInput" placeholder="输入值" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="handleNormalizeEmpty" type="primary" size="small">
										处理
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0">
										<el-input v-model="normalizeEmptyResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<!-- 字节长度计算 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">字节长度计算（byteLength）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">计算字符串的字节长度</el-tag>
								</el-form-item>

								<el-form-item label="字符串" label-width="60px" class="custom-form-item">
									<el-input
										v-model="byteLengthInput"
										placeholder="输入字符串"
										clearable
										size="small"
										class="custom-input"
									></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="calculateByteLength" type="primary" size="small">
										计算
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="byteLengthResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<!-- HTML转纯文本 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">HTML转纯文本（html2Text）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将HTML字符串转换为纯文本</el-tag>
								</el-form-item>
								<el-form-item label="HTML" label-width="60px">
									<el-input
										v-model="htmlInput"
										type="textarea"
										placeholder="输入HTML内容"
										clearable
										size="small"
										:rows="2"
									></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="convertHtmlToText" type="primary" size="small">
										转换
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="textResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<!-- 首字母大写 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">首字母大写（capitalize）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将字符串首字母大写</el-tag>
								</el-form-item>
								<el-form-item label="字符串" label-width="60px">
									<el-input v-model="titleCaseInput" placeholder="输入字符串" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="capitalizeText" type="primary" size="small">转换</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="titleCaseResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
					<!-- 下划线转驼峰 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">下划线转驼峰（snakeToCamel）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将下划线命名转换为驼峰命名</el-tag>
								</el-form-item>
								<el-form-item label="下划线" label-width="60px">
									<el-input v-model="snakeCaseInput" placeholder="输入下划线命名" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="convertSnakeToCamel" type="primary" size="small">
										转换
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="camelCaseResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.string" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('string')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 4. 中文处理演示 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">4. 中文处理 (chineseToPinYin/createShortCode)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('chinese')">
						{{ codeDisplayStatus.chinese ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">提供中文处理功能，包括中文转拼音和创建中文速记码</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- 中文转拼音 -->
					<el-col :xs="24" :sm="12" :lg="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">中文转拼音（chineseToPinYin）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将中文字符转换为拼音</el-tag>
								</el-form-item>
								<el-form-item label="中文" label-width="60px">
									<el-input v-model="chineseInput" placeholder="输入中文" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="convertToPinYin" type="primary" size="small">转换</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="pinYinResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 创建速记码 -->
					<el-col :xs="24" :sm="12" :lg="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">创建速记码（createShortCode）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">为中文创建速记码（通常取每个字的首字母）</el-tag>
								</el-form-item>
								<el-form-item label="中文" label-width="60px">
									<el-input v-model="shortCodeInput" placeholder="输入中文" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="handleCreateShortCode" type="primary" size="small">
										创建
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="shortCodeResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.chinese" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('chinese')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>
		<!-- 5. URL参数处理演示 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						5. URL参数处理 (getQueryObject/objectToQueryString/queryStringToObject)
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('url')">
						{{ codeDisplayStatus.url ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">处理URL参数的解析和序列化操作</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- URL参数解析 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">URL参数解析（getQueryObject）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">从URL中提取查询参数并转换为对象</el-tag>
								</el-form-item>
								<el-form-item label="URL" label-width="60px">
									<el-input v-model="urlInput" placeholder="输入URL" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="parseUrlParams" type="primary" size="small">解析</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="urlParamsResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 参数对象转URL -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">参数对象转URL（objectToQueryString）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将对象转换为查询字符串</el-tag>
								</el-form-item>
								<el-form-item label="JSON" label-width="60px">
									<el-input
										v-model="paramsObjectInput"
										type="textarea"
										placeholder="输入JSON对象"
										clearable
										size="small"
										:rows="2"
									></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="convertObjectToQuery" type="primary" size="small">
										转换
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="queryResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- URL查询参数解析 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">查询参数解析（queryStringToObject）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将查询字符串转换为对象</el-tag>
								</el-form-item>
								<el-form-item label="查询串" label-width="60px">
									<el-input v-model="queryInput" placeholder="输入查询字符串" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="parseQueryParams" type="primary" size="small">
										解析
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="queryObjectResult" readonly size="small"></el-input>
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
		<!-- 6. 数字处理演示 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">
						6. 数字处理 (formatMoney/unformatMoney/safeAdd/safeSubtract/safeMultiply/safeDivide)
					</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('number')">
						{{ codeDisplayStatus.number ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">提供数字格式化和安全计算功能</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- 金额格式化 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">金额格式化（formatMoney）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">格式化金额显示</el-tag>
								</el-form-item>
								<el-form-item label="金额" label-width="60px">
									<el-input v-model="rawMoney" placeholder="输入金额数字" clearable type="number" size="small"></el-input>
								</el-form-item>
								<el-form-item label="精度" label-width="60px">
									<el-select v-model="decimalPrecision" placeholder="小数位数" size="small" class="w-full">
										<el-option label="0位" value="0"></el-option>
										<el-option label="1位" value="1"></el-option>
										<el-option label="2位" value="2"></el-option>
										<el-option label="3位" value="3"></el-option>
									</el-select>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="handleFormatMoney" type="primary" size="small">
										格式化
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="formattedMoneyResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 金额反格式化 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">金额反格式化（unformatMoney）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">反格式化金额字符串</el-tag>
								</el-form-item>
								<el-form-item label="格式化金额" label-width="86px">
									<el-input v-model="formattedMoneyInput" placeholder="输入格式化金额" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="handleUnformatMoney" type="primary" size="small">
										反格式化
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="unformattedMoneyResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 安全加法 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">安全加法（safeAdd）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">安全加法运算</el-tag>
								</el-form-item>
								<el-form-item label="参数1" label-width="70px">
									<el-input v-model="addNum1" placeholder="参数1" clearable type="number" size="small"></el-input>
								</el-form-item>
								<el-form-item label="参数2" label-width="70px">
									<el-input v-model="addNum2" placeholder="参数2" clearable type="number" size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="calculateAdd" type="primary" size="small">计算</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="addResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 安全减法 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">安全减法（safeSubtract）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">安全减法运算</el-tag>
								</el-form-item>
								<el-form-item label="参数1" label-width="70px">
									<el-input v-model="subNum1" placeholder="参数1" clearable type="number" size="small"></el-input>
								</el-form-item>
								<el-form-item label="参数2" label-width="70px">
									<el-input v-model="subNum2" placeholder="参数2" clearable type="number" size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="calculateSubtract" type="primary" size="small">
										计算
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="subResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 安全乘法 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">安全乘法（safeMultiply）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">安全乘法运算</el-tag>
								</el-form-item>
								<el-form-item label="参数1" label-width="70px">
									<el-input v-model="mulNum1" placeholder="参数1" clearable type="number" size="small"></el-input>
								</el-form-item>
								<el-form-item label="参数2" label-width="70px">
									<el-input v-model="mulNum2" placeholder="参数2" clearable type="number" size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="calculateMultiply" type="primary" size="small">
										计算
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="mulResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 安全除法 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">安全除法（safeDivide）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">安全除法运算</el-tag>
								</el-form-item>
								<el-form-item label="被除数" label-width="60px">
									<el-input v-model="divNum1" placeholder="被除数" clearable type="number" size="small"></el-input>
								</el-form-item>
								<el-form-item label="除数" label-width="60px">
									<el-input v-model="divNum2" placeholder="除数" clearable type="number" size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="calculateDivide" type="primary" size="small">计算</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="divResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.number" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('number')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>
		<!-- 7. 路径处理演示 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">7. 路径处理 (getNormalPath/paramsToQueryString)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('path')">
						{{ codeDisplayStatus.path ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">处理路径规范化和参数序列化操作</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- 路径规范化 -->
					<el-col :xs="24" :sm="12" :lg="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">路径规范化（getNormalPath）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">规范化路径（去除多余斜杠等）</el-tag>
								</el-form-item>
								<el-form-item label="路径" label-width="60px">
									<el-input v-model="pathInput" placeholder="输入路径" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="normalizePath" type="primary" size="small">规范化</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="normalizedPathResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 参数序列化 -->
					<el-col :xs="24" :sm="12" :lg="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">参数序列化（paramsToQueryString）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">将参数对象序列化为查询字符串</el-tag>
								</el-form-item>
								<el-form-item label="JSON" label-width="60px">
									<el-input
										v-model="paramsObjectInput"
										type="textarea"
										placeholder="输入JSON对象"
										clearable
										size="small"
										:rows="2"
									></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="serializeParams" type="primary" size="small">
										序列化
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="serializeParamsResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>
				</el-row>

				<!-- 代码显示区域 -->
				<div v-if="codeDisplayStatus.path" class="mt-4">
					<el-card style="background-color: #f5f7fa">
						<pre><code v-html="highlightedCode('path')"></code></pre>
					</el-card>
				</div>
			</div>
		</el-card>

		<!-- 8. 其他工具演示 -->
		<el-card class="mb-6 shadow-md" border>
			<template #header>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-purple-600">8. 其他工具 (createUniqueString/isNumberStr/createValueCheckMap)</h2>
					<el-button type="primary" link @click="toggleCodeDisplay('other')">
						{{ codeDisplayStatus.other ? '隐藏代码' : '查看代码' }}
					</el-button>
				</div>
			</template>

			<div class="space-y-4 mt-4">
				<el-form-item label="功能说明" label-width="100px">
					<el-tag type="info" size="small">其他实用工具函数如：生成唯一字符串、判断字符串是否为数字、创建值的检查映射</el-tag>
				</el-form-item>

				<el-row :gutter="20">
					<!-- 生成唯一字符串 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">生成唯一字符串（createUniqueString）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">生成唯一的字符串标识符</el-tag>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="generateUniqueString" type="primary" size="small">
										生成
									</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="uniqueStringResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 字符串是否为数字 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">字符串是否为数字（isNumberStr）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">判断字符串是否表示数字</el-tag>
								</el-form-item>
								<el-form-item label="字符串" label-width="70px">
									<el-input v-model="numberCheckInput" placeholder="输入字符串" clearable size="small"></el-input>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="checkIfNumber" type="primary" size="small">检查</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="numberCheckResult" readonly size="small"></el-input>
									</el-form-item>
								</div>
							</div>
						</el-card>
					</el-col>

					<!-- 创建值检查映射 -->
					<el-col :xs="24" :sm="12">
						<el-card shadow="hover" class="h-full">
							<div class="space-y-3">
								<h3 class="font-medium">创建值检查映射（createValueCheckMap）</h3>
								<el-form-item label="功能说明" label-width="70px">
									<el-tag type="info" size="small">创建值检查映射函数，用于快速验证值是否在指定列表中</el-tag>
								</el-form-item>
								<el-form-item label="值列表" label-width="60px">
									<el-input v-model="checkMapInput" placeholder="name,age,gender" clearable size="small"></el-input>
								</el-form-item>
								<el-form-item label="选项" label-width="60px">
									<el-checkbox v-model="caseSensitive" label="区分大小写" size="small"></el-checkbox>
								</el-form-item>
								<div class="flex items-center space-x-2">
									<el-button style="margin-top: 5px" @click="createCheckMap" type="primary" size="small">创建</el-button>
									<el-form-item label="结果:" label-width="60px" class="flex-1 mb-0" style="width: 100%">
										<el-input v-model="checkMapResult" readonly size="small"></el-input>
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
	</div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import {
	debounce,
	hasClass,
	addClass,
	removeClass,
	toggleClass,
	createValueCheckMap,
	sprintf,
	normalizeEmptyString,
	byteLength,
	html2Text,
	capitalize,
	snakeToCamel,
	chineseToPinYin,
	createShortCode,
	getQueryObject,
	objectToQueryString,
	queryStringToObject,
	createUniqueString,
	formatMoney,
	unformatMoney,
	isNumberStr,
	safeAdd,
	safeSubtract,
	safeMultiply,
	safeDivide,
	getNormalPath,
	paramsToQueryString,
} from '@/utils/common/core.js'
import Prism from 'prismjs'
import 'prismjs/themes/prism-coy.css'
// 在组件挂载后触发高亮更新
onMounted(() => {
	// Prism 需要在 DOM 更新后重新渲染
	setTimeout(() => {
		Prism.highlightAll()
	}, 0)
})
// 获取组件实例
const instance = getCurrentInstance()

// -------------------------- 1. 防抖函数演示 --------------------------
const searchText = ref('')
const debounceLog = ref('')
// 添加控制代码显示的状态
const showDebounceCode = ref(false)
const showDomCode = ref(false)
// 修改状态管理，使用一个对象来跟踪各个功能的代码显示状态
const codeDisplayStatus = ref({
	debounce: false,
	dom: false,
	string: false,
	chinese: false,
	url: false,
	number: false,
	path: false,
	other: false,
})

// 修改切换代码显示的函数，接受一个参数指定功能
const toggleCodeDisplay = feature => {
	codeDisplayStatus.value[feature] = !codeDisplayStatus.value[feature]
}

// 为每个功能创建相应的代码示例
const featureCodes = {
	debounce: `<script setup>
import { debounce } from '@/utils/common/core.js'

const searchText = ref('')
const debounceLog = ref('')

// 创建防抖处理函数（延迟1000ms）
const handleSearch = debounce(value => {
  debounceLog.value = \`执行搜索: \${value} (\${new Date().toLocaleTimeString()})\`
}, 1000)
<\/script>`,

	dom: `<script setup>
import { hasClass, addClass, removeClass, toggleClass } from '@/utils/common/core.js'

const domStatus = ref('')

//添加class
const addClassToElement = () => {
	const element = document.getElementById('dom-demo')
	addClass(element, 'highlighted')
	updateDomStatus()
}

//移除class
const removeClassFromElement = () => {
	const element = document.getElementById('dom-demo')
	removeClass(element, 'highlighted')
	updateDomStatus()
}

//切换class
const toggleClassElement = () => {
	const element = document.getElementById('dom-demo')
	toggleClass(element, 'highlighted')
	updateDomStatus()
}

//检查class
const checkClass = () => {
	const element = document.getElementById('dom-demo')
	const has = hasClass(element, 'highlighted')
	domStatus.value = has ? '已添加highlighted类' : '未添加highlighted类'
}

const updateDomStatus = () => {
	const element = document.getElementById('dom-demo')
	domStatus.value = hasClass(element, 'highlighted') ? '已添加highlighted类' : '未添加highlighted类'
}
<\/script>`,

	string: `<script setup>
import { 
  sprintf, 
  normalizeEmptyString, 
  byteLength, 
  html2Text, 
  capitalize, 
  snakeToCamel 
} from '@/utils/common/core.js'

//sprintf格式化
const sprintfTemplate = ref('Hello %s, your score is %s')
const sprintfArgs = ref('张三,95')
const sprintfResult = ref('')

const handleSprintf = () => {
	const args = sprintfArgs.value.split(',').map(arg => arg.trim())
	sprintfResult.value = sprintf(sprintfTemplate.value, ...args)
}

//空字符串处理
const emptyStringInput = ref(null)
const normalizeEmptyResult = ref('')

const handleNormalizeEmpty = () => {
	normalizeEmptyResult.value = normalizeEmptyString(emptyStringInput.value)
}

//字节长度计算
const byteLengthInput = ref('Hello 世界')
const byteLengthResult = ref('')

const calculateByteLength = () => {
	byteLengthResult.value = byteLength(byteLengthInput.value).toString()
}

//HTML转纯文本
const htmlInput = ref('<p>这是一个<b>HTML</b>字符串</p>')
const textResult = ref('')

const convertHtmlToText = () => {
	textResult.value = html2Text(htmlInput.value)
}

//首字母大写
const titleCaseInput = ref('hello world')
const titleCaseResult = ref('')

const capitalizeText = () => {
	titleCaseResult.value = capitalize(titleCaseInput.value)
}

//驼峰转下划线
const snakeCaseInput = ref('user_profile_settings')
const camelCaseResult = ref('')

const convertSnakeToCamel = () => {
	camelCaseResult.value = snakeToCamel(snakeCaseInput.value)
}
<\/script>`,
	chinese: `<script setup>
import { chineseToPinYin, createShortCode } from '@/utils/common/core.js'

//中文转拼音
const chineseInput = ref('你好世界')
const pinYinResult = ref('')

const convertToPinYin = () => {
	pinYinResult.value = chineseToPinYin(chineseInput.value)
}

//创建速记码
const shortCodeInput = ref('你好世界')
const shortCodeResult = ref('')

const handleCreateShortCode = () => {
	shortCodeResult.value = createShortCode(shortCodeInput.value)
}
<\/script>`,

	url: `<script setup>
import { 
  getQueryObject, 
  objectToQueryString, 
  queryStringToObject 
} from '@/utils/common/core.js'

//URL参数解析
const urlInput = ref('https://example.com/path?name=张三&age=25')
const urlParamsResult = ref('')

const parseUrlParams = () => {
	const params = getQueryObject(urlInput.value)
	urlParamsResult.value = JSON.stringify(params, null, 2)
}

//参数对象转URL
const paramsObjectInput = ref('{"name":"张三","age":25,"tags":["a","b"]}')
const queryResult = ref('')

const convertObjectToQuery = () => {
	const params = JSON.parse(paramsObjectInput.value)
	queryResult.value = objectToQueryString(params)
}

//查询参数解析
const queryInput = ref('https://example.com/path?name=张三&age=25&tags=a')
const queryObjectResult = ref('')

const parseQueryParams = () => {
	const params = queryStringToObject(queryInput.value)
	queryObjectResult.value = JSON.stringify(params, null, 2)
}

<\/script>`,

	number: `<script setup>
import { 
  formatMoney, 
  unformatMoney, 
  safeAdd, 
  safeSubtract, 
  safeMultiply, 
  safeDivide 
} from '@/utils/common/core.js'

//金额格式化
const rawMoney = ref(123456.789)
const decimalPrecision = ref(2)
const formattedMoneyResult = ref('')

const handleFormatMoney = () => {
	formattedMoneyResult.value = formatMoney(Number(rawMoney.value), decimalPrecision.value)
}

//金额反格式化
const formattedMoneyInput = ref('123,456.79')
const unformattedMoneyResult = ref('')

const handleUnformatMoney = () => {
	unformattedMoneyResult.value = unformatMoney(formattedMoneyInput.value)
}

//安全加法
const addNum1 = ref(0.1)
const addNum2 = ref(0.2)
const addResult = ref('')

const calculateAdd = () => {
	addResult.value = safeAdd(Number(addNum1.value), Number(addNum2.value))
}

//安全减法
const subNum1 = ref(1.5)
const subNum2 = ref(0.7)
const subResult = ref('')

const calculateSubtract = () => {
	subResult.value = safeSubtract(Number(subNum1.value), Number(subNum2.value))
}

//安全乘法
const mulNum1 = ref(0.1)
const mulNum2 = ref(0.2)
const mulResult = ref('')

const calculateMultiply = () => {
	mulResult.value = safeMultiply(Number(mulNum1.value), Number(mulNum2.value))
}

//安全除法
const divNum1 = ref(1)
const divNum2 = ref(3)
const divResult = ref('')

const calculateDivide = () => {
	divResult.value = safeDivide(Number(divNum1.value), Number(divNum2.value))
}
<\/script>`,
	path: `<script setup>
import { 
  getNormalPath, 
  paramsToQueryString,  
} from '@/utils/common/core.js'

//路径规范化
const pathInput = ref('/user//profile//settings/')
const normalizedPathResult = ref('')

const normalizePath = () => {
	normalizedPathResult.value = getNormalPath(pathInput.value)
}

//参数序列化
const serializeParamsResult = ref('')

const serializeParams = () => {
	const params = JSON.parse(paramsObjectInput.value)
	serializeParamsResult.value = paramsToQueryString(params)
}
<\/script>`,

	other: `<script setup>
import { 
  createUniqueString, 
  isNumberStr, 
  createValueCheckMap 
} from '@/utils/common/core.js'

//生成唯一字符串
const uniqueStringResult = ref('')
const generateUniqueString = () => {
	uniqueStringResult.value = createUniqueString()
}

//字符串是否为数字
const numberCheckInput = ref('123.45')
const numberCheckResult = ref('')
const checkIfNumber = () => {
	numberCheckResult.value = isNumberStr(numberCheckInput.value) ? '是数字' : '不是数字'
}

//创建值检查映射
const checkMapInput = ref('name,age,gender')
const caseSensitive = ref(true)
const checkMapResult = ref('')

const createCheckMap = () => {
	const checkMap = createValueCheckMap(checkMapInput.value, !caseSensitive.value)
	checkMapResult.value = '检查结果:name: ' + checkMap('name') +','+ 'Name: ' + checkMap('Name') + 'age: ' + checkMap('age')
}
<\/script>`,
}
// 创建防抖处理函数（延迟1000ms）
const handleSearch = debounce(value => {
	console.log(value, 'value')
	debounceLog.value = `执行搜索: ${value} (${new Date().toLocaleTimeString()})`
}, 1000)
// 添加计算属性用于代码高亮

const highlightedCode = (feature, language = 'javascript') => {
	const code = featureCodes[feature] || ''
	if (!code) return ''
	return Prism.highlight(code, Prism.languages[language], language)
}
// -------------------------- 2. DOM操作演示 --------------------------
const domStatus = ref('')

const addClassToElement = () => {
	const element = document.getElementById('dom-demo')
	addClass(element, 'highlighted')
	updateDomStatus()
}

const removeClassFromElement = () => {
	const element = document.getElementById('dom-demo')
	removeClass(element, 'highlighted')
	updateDomStatus()
}

const toggleClassElement = () => {
	const element = document.getElementById('dom-demo')
	toggleClass(element, 'highlighted')
	updateDomStatus()
}

const checkClass = () => {
	const element = document.getElementById('dom-demo')
	const has = hasClass(element, 'highlighted')
	domStatus.value = has ? '已添加highlighted类' : '未添加highlighted类'
}

const updateDomStatus = () => {
	const element = document.getElementById('dom-demo')
	domStatus.value = hasClass(element, 'highlighted') ? '已添加highlighted类' : '未添加highlighted类'
}

// -------------------------- 3. 字符串处理演示 --------------------------
const sprintfTemplate = ref('Hello %s, your score is %s')
const sprintfArgs = ref('张三,95')
const sprintfResult = ref('')

const handleSprintf = () => {
	const args = sprintfArgs.value.split(',').map(arg => arg.trim())
	sprintfResult.value = sprintf(sprintfTemplate.value, ...args)
}

const emptyStringInput = ref(null)
const normalizeEmptyResult = ref('')

const handleNormalizeEmpty = () => {
	normalizeEmptyResult.value = normalizeEmptyString(emptyStringInput.value)
}

const byteLengthInput = ref('Hello 世界')
const byteLengthResult = ref('')

const calculateByteLength = () => {
	byteLengthResult.value = byteLength(byteLengthInput.value).toString()
}

const htmlInput = ref('<p>这是一个<b>HTML</b>字符串</p>')
const textResult = ref('')

const convertHtmlToText = () => {
	textResult.value = html2Text(htmlInput.value)
}

const titleCaseInput = ref('hello world')
const titleCaseResult = ref('')

const capitalizeText = () => {
	titleCaseResult.value = capitalize(titleCaseInput.value)
}

const snakeCaseInput = ref('user_profile_settings')
const camelCaseResult = ref('')

const convertSnakeToCamel = () => {
	camelCaseResult.value = snakeToCamel(snakeCaseInput.value)
}

// -------------------------- 4. 中文处理演示 --------------------------
const chineseInput = ref('你好世界')
const pinYinResult = ref('')

const convertToPinYin = () => {
	pinYinResult.value = chineseToPinYin(chineseInput.value)
}

const shortCodeInput = ref('你好世界')
const shortCodeResult = ref('')

const handleCreateShortCode = () => {
	shortCodeResult.value = createShortCode(shortCodeInput.value)
}

// -------------------------- 5. URL参数处理演示 --------------------------
//URL参数解析
const urlInput = ref('https://example.com/path?name=张三&age=25')
const urlParamsResult = ref('')

const parseUrlParams = () => {
	const params = getQueryObject(urlInput.value)
	urlParamsResult.value = JSON.stringify(params, null, 2)
}

//参数对象转URL
const paramsObjectInput = ref('{"name":"张三","age":25,"tags":["a","b"]}')
const queryResult = ref('')

const convertObjectToQuery = () => {
	const params = JSON.parse(paramsObjectInput.value)
	queryResult.value = objectToQueryString(params)
}

//查询参数解析
const queryInput = ref('https://example.com/path?name=张三&age=25&tags=a')
const queryObjectResult = ref('')

const parseQueryParams = () => {
	const params = queryStringToObject(queryInput.value)
	queryObjectResult.value = JSON.stringify(params, null, 2)
}

// -------------------------- 6. 数字处理演示 --------------------------
//金额格式化
const rawMoney = ref(123456.789)
const decimalPrecision = ref(2)
const formattedMoneyResult = ref('')

const handleFormatMoney = () => {
	formattedMoneyResult.value = formatMoney(Number(rawMoney.value), decimalPrecision.value)
}

//金额反格式化
const formattedMoneyInput = ref('123,456.79')
const unformattedMoneyResult = ref('')

const handleUnformatMoney = () => {
	unformattedMoneyResult.value = unformatMoney(formattedMoneyInput.value)
}

//安全加法
const addNum1 = ref(0.1)
const addNum2 = ref(0.2)
const addResult = ref('')

const calculateAdd = () => {
	addResult.value = safeAdd(Number(addNum1.value), Number(addNum2.value))
}

//安全减法
const subNum1 = ref(1.5)
const subNum2 = ref(0.7)
const subResult = ref('')

const calculateSubtract = () => {
	subResult.value = safeSubtract(Number(subNum1.value), Number(subNum2.value))
}

//安全乘法
const mulNum1 = ref(0.1)
const mulNum2 = ref(0.2)
const mulResult = ref('')

const calculateMultiply = () => {
	mulResult.value = safeMultiply(Number(mulNum1.value), Number(mulNum2.value))
}

//安全除法
const divNum1 = ref(1)
const divNum2 = ref(3)
const divResult = ref('')

const calculateDivide = () => {
	divResult.value = safeDivide(Number(divNum1.value), Number(divNum2.value))
}

// -------------------------- 7. 路径处理演示 --------------------------
//路径规范化
const pathInput = ref('/user//profile//settings/')
const normalizedPathResult = ref('')

const normalizePath = () => {
	normalizedPathResult.value = getNormalPath(pathInput.value)
}
//参数序列化
const serializeParamsResult = ref('')

const serializeParams = () => {
	const params = JSON.parse(paramsObjectInput.value)
	serializeParamsResult.value = paramsToQueryString(params)
}

// -------------------------- 8. 其他工具演示 --------------------------
//生成唯一字符串
const uniqueStringResult = ref('')
const generateUniqueString = () => {
	uniqueStringResult.value = createUniqueString()
}

//字符串是否为数字
const numberCheckInput = ref('123.45')
const numberCheckResult = ref('')
const checkIfNumber = () => {
	numberCheckResult.value = isNumberStr(numberCheckInput.value) ? '是数字' : '不是数字'
}

//创建值检查映射
const checkMapInput = ref('name,age,gender')
const caseSensitive = ref(true)
const checkMapResult = ref('')

const createCheckMap = () => {
	const checkMap = createValueCheckMap(checkMapInput.value, !caseSensitive.value)

	checkMapResult.value = '检查结果:name: ' + checkMap('name') + ';' + 'Name: ' + checkMap('Name') + ';' + 'age: ' + checkMap('age') + ';'
}
</script>

<style scoped lang="scss">
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
.highlighted {
	background-color: #e6f7ff;
	border: 1px solid #91d5ff;
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
.grid-cols-1 {
	grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
	.sm\:grid-cols-2 {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

.grid-cols-1,
.sm\:grid-cols-2 {
	display: grid;
	gap: 20px;
	margin-bottom: 20px;
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

/* 卡片间距 */
.mb-4 {
	margin-bottom: 1rem;
}

/* 弹性布局使内容对齐 */
.flex-grow {
	flex-grow: 1;
}

.flex-col {
	flex-direction: column;
}

.mt-auto {
	margin-top: auto;
}
.el-card {
	margin-bottom: 1.5rem;
}
</style>
