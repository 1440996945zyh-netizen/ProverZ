// 复杂港口作业流程数据
export const complexFlowData = {
  // 节点数据 - 包含各种关系类型
  nodes: [
    // 开始节点 - 集港作业
    {
      id: 'start_1',
      name: '集港作业',
      type: '集港',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 08:00:00',
      endTime: '2024-01-15 12:00:00',
      operator: '张三',
      remark: '批量进港',
      isStart: true,
      isEnd: false,
      x: 50,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    // 多对一关系 - 多个集港作业汇聚到同一个堆场
    {
      id: 'node_1',
      name: '进入堆场A',
      type: '堆场',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 12:00:00',
      endTime: '2024-01-15 14:00:00',
      operator: '李四',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 200,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    // 多对一关系 - 多个集港作业汇聚到堆场B
    {
      id: 'node_2',
      name: '进入堆场B',
      type: '堆场',
      goods: '钢材',
      quantity: 800,
      weight: 400.0,
      startTime: '2024-01-15 12:30:00',
      endTime: '2024-01-15 14:30:00',
      operator: '王五',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 200,
      y: 200,
      status: 'completed',
      area: 'B区'
    },
    
    // 一对一关系 - 堆场作业与质检
    {
      id: 'node_3',
      name: '质检作业',
      type: '质检',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 14:00:00',
      endTime: '2024-01-15 15:00:00',
      operator: '赵六',
      remark: '质量检测',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    // 一对多关系 - 一个质检作业对应多个装船任务
    {
      id: 'node_4',
      name: '装船作业1',
      type: '装船',
      goods: '钢材',
      quantity: 400,
      weight: 200.0,
      startTime: '2024-01-15 15:00:00',
      endTime: '2024-01-15 17:00:00',
      operator: '钱七',
      remark: '装船作业1',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 50,
      status: 'completed',
      area: '码头1'
    },
    
    {
      id: 'node_5',
      name: '装船作业2',
      type: '装船',
      goods: '钢材',
      quantity: 300,
      weight: 150.0,
      startTime: '2024-01-15 15:30:00',
      endTime: '2024-01-15 17:30:00',
      operator: '孙八',
      remark: '装船作业2',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 150,
      status: 'completed',
      area: '码头2'
    },
    
    {
      id: 'node_6',
      name: '装船作业3',
      type: '装船',
      goods: '钢材',
      quantity: 300,
      weight: 150.0,
      startTime: '2024-01-15 16:00:00',
      endTime: '2024-01-15 18:00:00',
      operator: '周九',
      remark: '装船作业3',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 250,
      status: 'processing',
      area: '码头3'
    },
    
    // 多对一关系 - 多个装船作业汇聚到疏港
    {
      id: 'node_7',
      name: '疏港作业',
      type: '疏港',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 18:00:00',
      endTime: '2024-01-15 20:00:00',
      operator: '吴十',
      remark: '疏港出港',
      isStart: false,
      isEnd: true,
      x: 650,
      y: 150,
      status: 'pending',
      area: '码头'
    },
    
    // 一对一关系 - 装船与转垛
    {
      id: 'node_8',
      name: '转垛作业',
      type: '转垛',
      goods: '钢材',
      quantity: 200,
      weight: 100.0,
      startTime: '2024-01-15 17:00:00',
      endTime: '2024-01-15 19:00:00',
      operator: '郑十一',
      remark: '转垛作业',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 250,
      status: 'completed',
      area: 'A区'
    },
    
    // 多对一关系 - 多个转垛作业汇聚到同一堆场
    {
      id: 'node_9',
      name: '堆场C入库',
      type: '堆场',
      goods: '钢材',
      quantity: 200,
      weight: 100.0,
      startTime: '2024-01-15 19:00:00',
      endTime: '2024-01-15 20:00:00',
      operator: '王十二',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 350,
      status: 'completed',
      area: 'C区'
    },
    
    // 多对一关系 - 多个转垛作业汇聚到另一堆场
    {
      id: 'node_10',
      name: '堆场D入库',
      type: '堆场',
      goods: '钢材',
      quantity: 100,
      weight: 50.0,
      startTime: '2024-01-15 19:30:00',
      endTime: '2024-01-15 20:30:00',
      operator: '李十三',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 450,
      status: 'completed',
      area: 'D区'
    },
    
    // 一对一关系 - 堆场与盘点
    {
      id: 'node_11',
      name: '库存盘点',
      type: '盘点',
      goods: '钢材',
      quantity: 1300,
      weight: 650.0,
      startTime: '2024-01-15 20:00:00',
      endTime: '2024-01-15 21:00:00',
      operator: '赵十四',
      remark: '库存盘点',
      isStart: false,
      isEnd: false,
      x: 650,
      y: 350,
      status: 'pending',
      area: '仓库'
    },
    
    // 多对一关系 - 多个盘点作业汇聚到最终报告
    {
      id: 'end_1',
      name: '作业完成报告',
      type: '报告',
      goods: '钢材',
      quantity: 1300,
      weight: 650.0,
      startTime: '2024-01-15 21:00:00',
      endTime: '2024-01-15 22:00:00',
      operator: '钱十五',
      remark: '作业总结报告',
      isStart: false,
      isEnd: true,
      x: 800,
      y: 350,
      status: 'pending',
      area: '办公室'
    },
    
    // 新增节点 - 质检异常处理
    {
      id: 'node_12',
      name: '质检异常处理',
      type: '异常处理',
      goods: '钢材',
      quantity: 50,
      weight: 25.0,
      startTime: '2024-01-15 15:00:00',
      endTime: '2024-01-15 16:00:00',
      operator: '孙十六',
      remark: '质检不合格处理',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 350,
      status: 'completed',
      area: '质检室'
    },
    
    // 多对一关系 - 质检异常处理与重新入库
    {
      id: 'node_13',
      name: '重新入库',
      type: '堆场',
      goods: '钢材',
      quantity: 50,
      weight: 25.0,
      startTime: '2024-01-15 16:00:00',
      endTime: '2024-01-15 17:00:00',
      operator: '周十七',
      remark: '重新入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 550,
      status: 'completed',
      area: 'A区'
    }
  ],
  
  // 连接线数据 - 展示复杂关系
  edges: [
    // 开始节点到堆场（一对一）
    { source: 'start_1', target: 'node_1', label: '集港→堆场A' },
    
    // 多对一关系 - 多个集港作业汇聚到堆场
    { source: 'start_1', target: 'node_2', label: '集港→堆场B' },
    
    // 一对一关系 - 堆场到质检
    { source: 'node_1', target: 'node_3', label: '堆场→质检' },
    
    // 一对多关系 - 质检到多个装船
    { source: 'node_3', target: 'node_4', label: '质检→装船1' },
    { source: 'node_3', target: 'node_5', label: '质检→装船2' },
    { source: 'node_3', target: 'node_6', label: '质检→装船3' },
    
    // 多对一关系 - 多个装船作业汇聚到疏港
    { source: 'node_4', target: 'node_7', label: '装船1→疏港' },
    { source: 'node_5', target: 'node_7', label: '装船2→疏港' },
    { source: 'node_6', target: 'node_7', label: '装船3→疏港' },
    
    // 一对一关系 - 装船与转垛
    { source: 'node_6', target: 'node_8', label: '装船→转垛' },
    
    // 多对一关系 - 多个转垛作业汇聚到堆场
    { source: 'node_8', target: 'node_9', label: '转垛→堆场C' },
    { source: 'node_8', target: 'node_10', label: '转垛→堆场D' },
    
    // 一对一关系 - 堆场与盘点
    { source: 'node_9', target: 'node_11', label: '堆场C→盘点' },
    { source: 'node_10', target: 'node_11', label: '堆场D→盘点' },
    
    // 多对一关系 - 多个盘点作业汇聚到报告
    { source: 'node_11', target: 'end_1', label: '盘点→报告' },
    
    // 异常处理关系
    { source: 'node_12', target: 'node_13', label: '异常处理→重新入库' },
    { source: 'node_13', target: 'node_11', label: '重新入库→盘点' },
    
    // 异常处理与主流程并行
    { source: 'node_3', target: 'node_12', label: '质检→异常处理' }
  ],
  
  // 关系类型分类
  relationshipTypes: {
    oneToOne: [
      { from: 'node_1', to: 'node_3', description: '堆场作业→质检作业' },
      { from: 'node_3', to: 'node_4', description: '质检作业→装船作业1' },
      { from: 'node_3', to: 'node_5', description: '质检作业→装船作业2' },
      { from: 'node_3', to: 'node_6', description: '质检作业→装船作业3' },
      { from: 'node_8', to: 'node_9', description: '转垛作业→堆场C' },
      { from: 'node_8', to: 'node_10', description: '转垛作业→堆场D' },
      { from: 'node_9', to: 'node_11', description: '堆场C→库存盘点' },
      { from: 'node_10', to: 'node_11', description: '堆场D→库存盘点' }
    ],
    oneToMany: [
      { from: 'node_3', to: ['node_4', 'node_5', 'node_6'], description: '质检作业→多个装船作业' },
      { from: 'node_1', to: ['node_3', 'node_12'], description: '堆场作业→质检和异常处理' }
    ],
    manyToOne: [
      { from: ['start_1'], to: 'node_1', description: '多个集港作业→堆场A' },
      { from: ['start_1'], to: 'node_2', description: '多个集港作业→堆场B' },
      { from: ['node_4', 'node_5', 'node_6'], to: 'node_7', description: '多个装船作业→疏港作业' },
      { from: ['node_8'], to: ['node_9', 'node_10'], description: '转垛作业→多个堆场' },
      { from: ['node_9', 'node_10'], to: 'node_11', description: '多个堆场→库存盘点' },
      { from: ['node_11'], to: 'end_1', description: '多个盘点→最终报告' }
    ]
  }
}