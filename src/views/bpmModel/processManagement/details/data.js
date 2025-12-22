// @/mock/processManagement.js
/**
 * 流程管理页面假数据
 * 包含流程列表、分类选项、状态选项等模拟数据
 */
export const processMockData = {
  // 流程列表假数据
  tableList: [
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "03500701-0bd1-11ed-8314-601895569a42",
      "name": "4级流程",
      "id": "process_p1erruba:5:0543e7c4-0bd1-11ed-8314-601895569a42",
      "category": "oa",
      "version": 5,
      "key": "process_p1erruba",
      "deploymentTime": "2022-07-25 20:19:45",
      "bpmnXml": `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" xmlns:flowable="http://flowable.org/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://www.flowable.org/processdef">
  <process id="process_p1erruba" name="4级流程" flowable:processCategory="oa">
    <startEvent id="startNode1" name="开始">
      <outgoing>Flow_0dmsq92</outgoing>
    </startEvent>
    <sequenceFlow id="Flow_0sdhsl7" sourceRef="Activity_1waubpl" targetRef="Activity_1pzosh2" />
    <sequenceFlow id="Flow_1r69z2i" sourceRef="Activity_1pzosh2" targetRef="Activity_0veu7zt" />
    <sequenceFlow id="Flow_0ilaccz" sourceRef="Activity_0veu7zt" targetRef="Activity_044a7dh" />
    <endEvent id="Event_1y9ppwf" name="结束">
      <incoming>Flow_11uijnu</incoming>
    </endEvent>
    <sequenceFlow id="Flow_11uijnu" sourceRef="Activity_044a7dh" targetRef="Event_1y9ppwf" />
    <sequenceFlow id="Flow_0dmsq92" sourceRef="startNode1" targetRef="Activity_1waubpl" />
    <userTask id="Activity_1waubpl" name="发起人" flowable:candidateGroups="">
      <incoming>Flow_0dmsq92</incoming>
      <outgoing>Flow_0sdhsl7</outgoing>
    </userTask>
    <userTask id="Activity_1pzosh2" name="人力资源部审批" flowable:candidateGroups="1260924539346472962">
      <incoming>Flow_0sdhsl7</incoming>
      <outgoing>Flow_1r69z2i</outgoing>
    </userTask>
    <userTask id="Activity_0veu7zt" name="副总经理审批" flowable:assignee="4539296845785491881">
      <incoming>Flow_1r69z2i</incoming>
      <outgoing>Flow_0ilaccz</outgoing>
    </userTask>
    <userTask id="Activity_044a7dh" name="总经理审批" flowable:candidateGroups="f6817f48af4fb3af11b9e8bf182f618b">
      <incoming>Flow_0ilaccz</incoming>
      <outgoing>Flow_11uijnu</outgoing>
    </userTask>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_flow">
    <bpmndi:BPMNPlane id="BPMNPlane_flow" bpmnElement="process_p1erruba">
      <bpmndi:BPMNEdge id="Flow_0dmsq92_di" bpmnElement="Flow_0dmsq92">
        <di:waypoint x="-20" y="165" />
        <di:waypoint x="-20" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11uijnu_di" bpmnElement="Flow_11uijnu">
        <di:waypoint x="490" y="70" />
        <di:waypoint x="490" y="152" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ilaccz_di" bpmnElement="Flow_0ilaccz">
        <di:waypoint x="380" y="30" />
        <di:waypoint x="440" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1r69z2i_di" bpmnElement="Flow_1r69z2i">
        <di:waypoint x="210" y="30" />
        <di:waypoint x="280" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0sdhsl7_di" bpmnElement="Flow_0sdhsl7">
        <di:waypoint x="30" y="30" />
        <di:waypoint x="110" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="BPMNShape_startNode1" bpmnElement="startNode1" bioc:stroke="">
        <omgdc:Bounds x="-35" y="165" width="30" height="30" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="-31" y="173" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1y9ppwf_di" bpmnElement="Event_1y9ppwf">
        <omgdc:Bounds x="472" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="479" y="163" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1tijclt_di" bpmnElement="Activity_1waubpl">
        <omgdc:Bounds x="-70" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0vs17eb_di" bpmnElement="Activity_1pzosh2">
        <omgdc:Bounds x="110" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_01a7vtq_di" bpmnElement="Activity_0veu7zt">
        <omgdc:Bounds x="280" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0ni28ja_di" bpmnElement="Activity_044a7dh">
        <omgdc:Bounds x="440" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`
    },
    {
      "formId": "d35109c3632c4952a19ecc094943dd71",
      "suspensionState": 2,
      "formName": "test_demo",
      "deploymentId": "d093df70-633d-11ed-abfe-601895569a42",
      "name": "online主从表测试",
      "id": "Flow_1668335236185:1:d0a7dca3-633d-11ed-abfe-601895569a42",
      "category": "online",
      "version": 1,
      "key": "Flow_1668335236185",
      "deploymentTime": "2022-11-14 02:27:46",
      "bpmnXml": `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" id="diagram_Flow_1668740624904" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Flow_1668740624904" name="testbingxing" isExecutable="true" flowable:processCategory="oa">
    <bpmn2:startEvent id="Event_1ecw2w2" flowable:formKey="1567709993582768129">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:outgoing>Flow_016cmrq</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="Activity_09xyq6w" name="发起人" flowable:assignee="">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_016cmrq</bpmn2:incoming>
      <bpmn2:outgoing>Flow_03kbtj5</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_016cmrq" sourceRef="Event_1ecw2w2" targetRef="Activity_09xyq6w" />
    <bpmn2:sequenceFlow id="Flow_03kbtj5" sourceRef="Activity_09xyq6w" targetRef="Gateway_0n0vcox" />
    <bpmn2:parallelGateway id="Gateway_0n0vcox">
      <bpmn2:incoming>Flow_03kbtj5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0uzjcou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1bzkoaw</bpmn2:outgoing>
    </bpmn2:parallelGateway>
    <bpmn2:userTask id="Activity_05bzsv7" name="张三审批" flowable:assignee="zhangsan">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0uzjcou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_110nbdu</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0uzjcou" sourceRef="Gateway_0n0vcox" targetRef="Activity_05bzsv7" />
    <bpmn2:userTask id="Activity_00rkcf9" name="管理员审批" flowable:assignee="admin">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_1bzkoaw</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0m81nkq</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_1bzkoaw" sourceRef="Gateway_0n0vcox" targetRef="Activity_00rkcf9" />
    <bpmn2:userTask id="Activity_12nwqv2" name="管理员审批" flowable:assignee="admin">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_110nbdu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0undne7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_110nbdu" sourceRef="Activity_05bzsv7" targetRef="Activity_12nwqv2" />
    <bpmn2:userTask id="Activity_0j38wnw" name="张三审批" flowable:assignee="zhangsan">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0m81nkq</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1pexuja</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0m81nkq" sourceRef="Activity_00rkcf9" targetRef="Activity_0j38wnw" />
    <bpmn2:userTask id="Activity_0gn067c" name="角色选择" flowable:candidateGroups="1260924539346472962">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_1pexuja</bpmn2:incoming>
      <bpmn2:incoming>Flow_0undne7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1wji2vz</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_1pexuja" sourceRef="Activity_0j38wnw" targetRef="Activity_0gn067c" />
    <bpmn2:sequenceFlow id="Flow_0undne7" sourceRef="Activity_12nwqv2" targetRef="Activity_0gn067c" />
    <bpmn2:endEvent id="Event_0djjz25">
      <bpmn2:incoming>Flow_1wji2vz</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1wji2vz" sourceRef="Activity_0gn067c" targetRef="Event_0djjz25" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Flow_1668740624904">
      <bpmndi:BPMNEdge id="Flow_1wji2vz_di" bpmnElement="Flow_1wji2vz">
        <di:waypoint x="1040" y="260" />
        <di:waypoint x="1092" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0undne7_di" bpmnElement="Flow_0undne7">
        <di:waypoint x="940" y="120" />
        <di:waypoint x="940" y="170" />
        <di:waypoint x="990" y="170" />
        <di:waypoint x="990" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1pexuja_di" bpmnElement="Flow_1pexuja">
        <di:waypoint x="960" y="420" />
        <di:waypoint x="960" y="360" />
        <di:waypoint x="990" y="360" />
        <di:waypoint x="990" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0m81nkq_di" bpmnElement="Flow_0m81nkq">
        <di:waypoint x="660" y="390" />
        <di:waypoint x="760" y="390" />
        <di:waypoint x="760" y="460" />
        <di:waypoint x="910" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_110nbdu_di" bpmnElement="Flow_110nbdu">
        <di:waypoint x="660" y="140" />
        <di:waypoint x="695" y="140" />
        <di:waypoint x="695" y="80" />
        <di:waypoint x="890" y="80" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1bzkoaw_di" bpmnElement="Flow_1bzkoaw">
        <di:waypoint x="480" y="305" />
        <di:waypoint x="480" y="390" />
        <di:waypoint x="560" y="390" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0uzjcou_di" bpmnElement="Flow_0uzjcou">
        <di:waypoint x="480" y="255" />
        <di:waypoint x="480" y="140" />
        <di:waypoint x="560" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_03kbtj5_di" bpmnElement="Flow_03kbtj5">
        <di:waypoint x="400" y="280" />
        <di:waypoint x="455" y="280" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_016cmrq_di" bpmnElement="Flow_016cmrq">
        <di:waypoint x="248" y="280" />
        <di:waypoint x="300" y="280" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1ecw2w2_di" bpmnElement="Event_1ecw2w2">
        <dc:Bounds x="212" y="262" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_09xyq6w_di" bpmnElement="Activity_09xyq6w">
        <dc:Bounds x="300" y="240" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0r9p6o2_di" bpmnElement="Gateway_0n0vcox">
        <dc:Bounds x="455" y="255" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_05bzsv7_di" bpmnElement="Activity_05bzsv7">
        <dc:Bounds x="560" y="100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_00rkcf9_di" bpmnElement="Activity_00rkcf9">
        <dc:Bounds x="560" y="350" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_12nwqv2_di" bpmnElement="Activity_12nwqv2">
        <dc:Bounds x="890" y="40" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0j38wnw_di" bpmnElement="Activity_0j38wnw">
        <dc:Bounds x="910" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gn067c_di" bpmnElement="Activity_0gn067c">
        <dc:Bounds x="940" y="220" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0djjz25_di" bpmnElement="Event_0djjz25">
        <dc:Bounds x="1092" y="242" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`
    },
    {
      "formId": "d35109c3632c4952a19ecc094943dd71",
      "suspensionState": 1,
      "formName": "test_demo",
      "deploymentId": "5fd033c0-6335-11ed-abfe-601895569a42",
      "name": "online测试表单",
      "id": "Flow_1666766068413:3:60b11de3-6335-11ed-abfe-601895569a42",
      "category": "online",
      "version": 3,
      "key": "Flow_1666766068413",
      "deploymentTime": "2022-11-14 01:27:21"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 2,
      "formName": "测试上传",
      "deploymentId": "feda2235-674b-11ed-a11a-601895569a42",
      "name": "testbingxing",
      "id": "Flow_1668740624904:2:005b43f8-674c-11ed-a11a-601895569a42",
      "category": "oa",
      "version": 2,
      "key": "Flow_1668740624904",
      "deploymentTime": "2022-11-18 22:19:21"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "931a57ee-747b-11ed-9052-601895569a42",
      "name": "test会签百分比",
      "id": "Flow_1670068744592:1:93fca1a1-747b-11ed-9052-601895569a42",
      "category": "oa",
      "version": 1,
      "key": "Flow_1670068744592",
      "deploymentTime": "2022-12-05 17:02:41"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 2,
      "formName": "出差申请单",
      "deploymentId": "98a5d3a8-8418-11ee-b1c0-601895569a42",
      "name": "不同条件后面角色",
      "id": "process_1p3y69039:1:98fb6dbb-8418-11ee-b1c0-601895569a42",
      "category": "oa",
      "version": 1,
      "key": "process_1p3y69039",
      "deploymentTime": "2023-11-16 08:39:27"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "380ea1c2-3bac-11ed-b545-601895569a42",
      "name": "不同条件流转",
      "id": "process_p3y69038:3:38270bc5-3bac-11ed-b545-601895569a42",
      "category": "oa",
      "version": 3,
      "key": "process_p3y69038",
      "deploymentTime": "2022-09-24 17:57:17"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 2,
      "formName": "测试上传",
      "deploymentId": "4536fa57-4ddf-11ed-8bf2-601895569a42",
      "name": "业务流程_1665285961149",
      "id": "Process_1665285961149:11:454b1e9a-4ddf-11ed-8bf2-601895569a42",
      "category": "oa",
      "version": 11,
      "key": "Process_1665285961149",
      "deploymentTime": "2022-10-17 21:48:05"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "df07fe9d-4df6-11ed-9c12-601895569a42",
      "name": "业务流程_1665297073678",
      "id": "Process_1665297073678:12:df424880-4df6-11ed-9c12-601895569a42",
      "category": "oa",
      "version": 12,
      "key": "Process_1665297073678",
      "deploymentTime": "2022-10-18 00:37:01"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 2,
      "formName": "测试上传",
      "deploymentId": "1f2402c9-4de0-11ed-8bf2-601895569a42",
      "name": "业务流程_1665541743227",
      "id": "Process_1665541743227:2:1f31e57c-4de0-11ed-8bf2-601895569a42",
      "category": "oa",
      "version": 2,
      "key": "Process_1665541743227",
      "deploymentTime": "2022-10-17 21:54:10"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "eccb907b-08f8-11ef-8763-601895569a42",
      "name": "业务流程_测试表单保存",
      "id": "Process_1665477884022:17:ecdb20de-08f8-11ef-8763-601895569a42",
      "category": "oa",
      "version": 17,
      "key": "Process_1665477884022",
      "deploymentTime": "2024-05-03 10:57:48"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "f482d6f9-0753-11ef-8e89-601895569a42",
      "name": "主子表流程",
      "id": "process_dulwndb3:3:f494d85c-0753-11ef-8e89-601895569a42",
      "category": "zdyyw",
      "version": 3,
      "key": "process_dulwndb3",
      "deploymentTime": "2024-05-01 08:44:23"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 2,
      "formName": "测试上传",
      "deploymentId": "dc295279-70aa-11ed-91e3-601895569a42",
      "name": "会签是否完成测试",
      "id": "process_moebxzgd:15:dc7a7fbc-70aa-11ed-91e3-601895569a42",
      "category": "oa",
      "version": 15,
      "key": "process_moebxzgd",
      "deploymentTime": "2022-11-30 20:31:05"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "747ad9b6-154c-11ee-982f-601895569a42",
      "name": "作业审批",
      "id": "zysplc:2:76026419-154c-11ee-982f-601895569a42",
      "category": "oa",
      "version": 2,
      "key": "zysplc",
      "deploymentTime": "2023-06-28 08:41:01"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "2e6455d6-92b4-11ee-bc22-601895569a42",
      "name": "动态设置下一个节点为部门负责人",
      "id": "Flow_1690972451471:14:2f3f7399-92b4-11ee-bc22-601895569a42",
      "category": "oa",
      "version": 14,
      "key": "Flow_1690972451471",
      "deploymentTime": "2023-12-04 22:48:26"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 2,
      "formName": "测试上传",
      "deploymentId": "4822a096-32a7-11ee-ba42-601895569a42",
      "name": "动态设置部门经理审批",
      "id": "Flow_1691140148159:2:48419a49-32a7-11ee-ba42-601895569a42",
      "category": "oa",
      "version": 2,
      "key": "Flow_1691140148159",
      "deploymentTime": "2023-08-04 17:14:14"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "adf911ae-539f-11ed-be10-601895569a42",
      "name": "单表流程demo",
      "id": "process_73eqxqi7:4:ae1c9f41-539f-11ed-be10-601895569a42",
      "category": "zdyyw",
      "version": 4,
      "key": "process_73eqxqi7",
      "deploymentTime": "2022-10-25 05:28:00"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "cc6a1f44-534c-11ed-be10-601895569a42",
      "name": "员工出行申请流程(因私升级)",
      "id": "cc943c87-534c-11ed-be10-601895569a42",
      "category": "oa",
      "version": 5,
      "key": "travel-for-personal-update",
      "deploymentTime": "2022-10-24 19:34:43"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "c4d7ee03-9248-11ee-8895-601895569a42",
      "name": "多实例用户任务示例流程",
      "id": "multiUserTaskProcess:6:c55f4676-9248-11ee-8895-601895569a42",
      "category": "oa",
      "version": 6,
      "key": "multiUserTaskProcess",
      "deploymentTime": "2023-12-04 09:59:33"
    },
    {
      "formId": null,
      "suspensionState": 2,
      "formName": null,
      "deploymentId": "f9479059-e23a-11ec-acf6-601895569a42",
      "name": "宁波牛吧信息技术有限公司",
      "id": "process_g1k8ee39:2:f95cc60c-e23a-11ec-acf6-601895569a42",
      "category": "ddxz",
      "version": 2,
      "key": "process_g1k8ee39",
      "deploymentTime": "2022-06-02 22:12:25"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "23eced25-662b-11ed-b847-601895569a42",
      "name": "并行会签表单测试",
      "id": "Process_1665914041805:9:2402bf18-662b-11ed-b847-601895569a42",
      "category": "oa",
      "version": 9,
      "key": "Process_1665914041805",
      "deploymentTime": "2022-11-17 11:51:39"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "ae69854d-4ddf-11ed-8bf2-601895569a42",
      "name": "并行流程审批",
      "id": "process_a0lyq9xl:9:ae974c10-4ddf-11ed-8bf2-601895569a42",
      "category": "oa",
      "version": 9,
      "key": "process_a0lyq9xl",
      "deploymentTime": "2022-10-17 21:51:01"
    },
    {
      "formId": "1566592421961478145",
      "suspensionState": 1,
      "formName": "出差申请单",
      "deploymentId": "7420e494-848a-11ee-a641-601895569a42",
      "name": "并行驳回测试",
      "id": "process_b0lyq9xi:3:8424edfa-848a-11ee-a641-601895569a42",
      "category": "oa",
      "version": 3,
      "key": "process_b0lyq9xi",
      "deploymentTime": "2023-11-16 22:14:28"
    },
    {
      "formId": "1567709993582768129",
      "suspensionState": 1,
      "formName": "测试上传",
      "deploymentId": "8917d32f-b357-11ed-97b2-601895569a42",
      "name": "手机流程测试",
      "id": "Flow_16749791484422:7:8aab6b82-b357-11ed-97b2-601895569a42",
      "category": "oa",
      "version": 7,
      "key": "Flow_16749791484422",
      "deploymentTime": "2023-02-23 16:53:26"
    },
    {
      "formId": "1584466180634316801",
      "suspensionState": 1,
      "formName": "测试9",
      "deploymentId": "4c576a10-572f-11ed-a29b-601895569a42",
      "name": "流程_1665977527836",
      "id": "Flow_1665977527836:14:4c7bbaf3-572f-11ed-a29b-601895569a42",
      "category": "oa",
      "version": 14,
      "key": "Flow_1665977527836",
      "deploymentTime": "2022-10-29 18:13:37"
    },
    {
      "formId": "1566984909226455041",
      "suspensionState": 1,
      "formName": "请假单",
      "deploymentId": "befda246-5377-11ed-be10-601895569a42",
      "name": "流程_1665982169511",
      "id": "Flow_1665982169511:6:bf11ed99-5377-11ed-be10-601895569a42",
      "category": "oa",
      "version": 6,
      "key": "Flow_1665982169511",
      "deploymentTime": "2022-10-25 00:42:08"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "c90713c9-7dff-11ed-a461-601895569a42",
      "name": "流程_1671277238759",
      "id": "Flow_1671277238759:1:c914814c-7dff-11ed-a461-601895569a42",
      "category": "oa",
      "version": 1,
      "key": "Flow_1671277238759",
      "deploymentTime": "2022-12-17 19:41:46"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "dc8605c3-8f7d-11f0-a732-00ff0aaddc43",
      "name": "流程_1757643085500",
      "id": "Flow_1757643085500:1:dccde436-8f7d-11f0-a732-00ff0aaddc43",
      "category": "online",
      "version": 1,
      "key": "Flow_1757643085500",
      "deploymentTime": "2025-09-12 10:11:58"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "0df5d95e-91d6-11f0-a2a1-00ff0aaddc43",
      "name": "流程_1757900755505",
      "id": "Flow_1757900755505:1:0e3ccd71-91d6-11f0-a2a1-00ff0aaddc43",
      "category": "zdyyw",
      "version": 1,
      "key": "Flow_1757900755505",
      "deploymentTime": "2025-09-15 09:48:19"
    },
    {
      "formId": null,
      "suspensionState": 1,
      "formName": null,
      "deploymentId": "39485011-4947-11ee-812e-601895569a42",
      "name": "流程_6人多实例消息测试",
      "id": "Flow_1693626590642:3:39554864-4947-11ee-812e-601895569a42",
      "category": "zdyyw",
      "version": 3,
      "key": "Flow_1693626590642",
      "deploymentTime": "2023-09-02 12:14:34"
    }
  ],

  // 流程分类选项
  categoryOptions: [
    { label: 'OA流程', value: 'oa' },
    { label: '财务流程', value: 'cw' },
    { label: '自定义业务', value: 'zdyyw' },
    { label: '在线表单', value: 'online' },
    { label: '订单相关', value: 'ddxz' },
    { label: '订单财务', value: 'ddcw' }
  ],

  // 流程状态选项
  statusOptions: [
    { dictLabel: '激活', dictValue: '1' },
    { dictLabel: '挂起', dictValue: '2' }
  ],

  // 模拟流程图片地址（用于查看流程）
  processImageUrl: 'https://picsum.photos/800/500?random=1',

  xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" xmlns:flowable="http://flowable.org/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://www.flowable.org/processdef">
  <process id="process_p1erruba" name="4级流程" flowable:processCategory="oa">
    <startEvent id="startNode1" name="开始">
      <outgoing>Flow_0dmsq92</outgoing>
    </startEvent>
    <sequenceFlow id="Flow_0sdhsl7" sourceRef="Activity_1waubpl" targetRef="Activity_1pzosh2" />
    <sequenceFlow id="Flow_1r69z2i" sourceRef="Activity_1pzosh2" targetRef="Activity_0veu7zt" />
    <sequenceFlow id="Flow_0ilaccz" sourceRef="Activity_0veu7zt" targetRef="Activity_044a7dh" />
    <endEvent id="Event_1y9ppwf" name="结束">
      <incoming>Flow_11uijnu</incoming>
    </endEvent>
    <sequenceFlow id="Flow_11uijnu" sourceRef="Activity_044a7dh" targetRef="Event_1y9ppwf" />
    <sequenceFlow id="Flow_0dmsq92" sourceRef="startNode1" targetRef="Activity_1waubpl" />
    <userTask id="Activity_1waubpl" name="发起人" flowable:candidateGroups="">
      <incoming>Flow_0dmsq92</incoming>
      <outgoing>Flow_0sdhsl7</outgoing>
    </userTask>
    <userTask id="Activity_1pzosh2" name="人力资源部审批" flowable:candidateGroups="1260924539346472962">
      <incoming>Flow_0sdhsl7</incoming>
      <outgoing>Flow_1r69z2i</outgoing>
    </userTask>
    <userTask id="Activity_0veu7zt" name="副总经理审批" flowable:assignee="4539296845785491881">
      <incoming>Flow_1r69z2i</incoming>
      <outgoing>Flow_0ilaccz</outgoing>
    </userTask>
    <userTask id="Activity_044a7dh" name="总经理审批" flowable:candidateGroups="f6817f48af4fb3af11b9e8bf182f618b">
      <incoming>Flow_0ilaccz</incoming>
      <outgoing>Flow_11uijnu</outgoing>
    </userTask>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_flow">
    <bpmndi:BPMNPlane id="BPMNPlane_flow" bpmnElement="process_p1erruba">
      <bpmndi:BPMNEdge id="Flow_0dmsq92_di" bpmnElement="Flow_0dmsq92">
        <di:waypoint x="-20" y="165" />
        <di:waypoint x="-20" y="70" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11uijnu_di" bpmnElement="Flow_11uijnu">
        <di:waypoint x="490" y="70" />
        <di:waypoint x="490" y="152" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ilaccz_di" bpmnElement="Flow_0ilaccz">
        <di:waypoint x="380" y="30" />
        <di:waypoint x="440" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1r69z2i_di" bpmnElement="Flow_1r69z2i">
        <di:waypoint x="210" y="30" />
        <di:waypoint x="280" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0sdhsl7_di" bpmnElement="Flow_0sdhsl7">
        <di:waypoint x="30" y="30" />
        <di:waypoint x="110" y="30" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="BPMNShape_startNode1" bpmnElement="startNode1" bioc:stroke="">
        <omgdc:Bounds x="-35" y="165" width="30" height="30" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="-31" y="173" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1y9ppwf_di" bpmnElement="Event_1y9ppwf">
        <omgdc:Bounds x="472" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="479" y="163" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1tijclt_di" bpmnElement="Activity_1waubpl">
        <omgdc:Bounds x="-70" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0vs17eb_di" bpmnElement="Activity_1pzosh2">
        <omgdc:Bounds x="110" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_01a7vtq_di" bpmnElement="Activity_0veu7zt">
        <omgdc:Bounds x="280" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0ni28ja_di" bpmnElement="Activity_044a7dh">
        <omgdc:Bounds x="440" y="-10" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,

  xmlData2: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" id="diagram_Flow_1668740624904" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Flow_1668740624904" name="testbingxing" isExecutable="true" flowable:processCategory="oa">
    <bpmn2:startEvent id="Event_1ecw2w2" flowable:formKey="1567709993582768129">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:outgoing>Flow_016cmrq</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="Activity_09xyq6w" name="发起人" flowable:assignee="">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_016cmrq</bpmn2:incoming>
      <bpmn2:outgoing>Flow_03kbtj5</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_016cmrq" sourceRef="Event_1ecw2w2" targetRef="Activity_09xyq6w" />
    <bpmn2:sequenceFlow id="Flow_03kbtj5" sourceRef="Activity_09xyq6w" targetRef="Gateway_0n0vcox" />
    <bpmn2:parallelGateway id="Gateway_0n0vcox">
      <bpmn2:incoming>Flow_03kbtj5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0uzjcou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_1bzkoaw</bpmn2:outgoing>
    </bpmn2:parallelGateway>
    <bpmn2:userTask id="Activity_05bzsv7" name="张三审批" flowable:assignee="zhangsan">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0uzjcou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_110nbdu</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0uzjcou" sourceRef="Gateway_0n0vcox" targetRef="Activity_05bzsv7" />
    <bpmn2:userTask id="Activity_00rkcf9" name="管理员审批" flowable:assignee="admin">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_1bzkoaw</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0m81nkq</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_1bzkoaw" sourceRef="Gateway_0n0vcox" targetRef="Activity_00rkcf9" />
    <bpmn2:userTask id="Activity_12nwqv2" name="管理员审批" flowable:assignee="admin">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_110nbdu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_0undne7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_110nbdu" sourceRef="Activity_05bzsv7" targetRef="Activity_12nwqv2" />
    <bpmn2:userTask id="Activity_0j38wnw" name="张三审批" flowable:assignee="zhangsan">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_0m81nkq</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1pexuja</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_0m81nkq" sourceRef="Activity_00rkcf9" targetRef="Activity_0j38wnw" />
    <bpmn2:userTask id="Activity_0gn067c" name="角色选择" flowable:candidateGroups="1260924539346472962">
      <bpmn2:extensionElements>
        <flowable:formData />
      </bpmn2:extensionElements>
      <bpmn2:incoming>Flow_1pexuja</bpmn2:incoming>
      <bpmn2:incoming>Flow_0undne7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_1wji2vz</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_1pexuja" sourceRef="Activity_0j38wnw" targetRef="Activity_0gn067c" />
    <bpmn2:sequenceFlow id="Flow_0undne7" sourceRef="Activity_12nwqv2" targetRef="Activity_0gn067c" />
    <bpmn2:endEvent id="Event_0djjz25">
      <bpmn2:incoming>Flow_1wji2vz</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1wji2vz" sourceRef="Activity_0gn067c" targetRef="Event_0djjz25" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Flow_1668740624904">
      <bpmndi:BPMNEdge id="Flow_1wji2vz_di" bpmnElement="Flow_1wji2vz">
        <di:waypoint x="1040" y="260" />
        <di:waypoint x="1092" y="260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0undne7_di" bpmnElement="Flow_0undne7">
        <di:waypoint x="940" y="120" />
        <di:waypoint x="940" y="170" />
        <di:waypoint x="990" y="170" />
        <di:waypoint x="990" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1pexuja_di" bpmnElement="Flow_1pexuja">
        <di:waypoint x="960" y="420" />
        <di:waypoint x="960" y="360" />
        <di:waypoint x="990" y="360" />
        <di:waypoint x="990" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0m81nkq_di" bpmnElement="Flow_0m81nkq">
        <di:waypoint x="660" y="390" />
        <di:waypoint x="760" y="390" />
        <di:waypoint x="760" y="460" />
        <di:waypoint x="910" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_110nbdu_di" bpmnElement="Flow_110nbdu">
        <di:waypoint x="660" y="140" />
        <di:waypoint x="695" y="140" />
        <di:waypoint x="695" y="80" />
        <di:waypoint x="890" y="80" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1bzkoaw_di" bpmnElement="Flow_1bzkoaw">
        <di:waypoint x="480" y="305" />
        <di:waypoint x="480" y="390" />
        <di:waypoint x="560" y="390" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0uzjcou_di" bpmnElement="Flow_0uzjcou">
        <di:waypoint x="480" y="255" />
        <di:waypoint x="480" y="140" />
        <di:waypoint x="560" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_03kbtj5_di" bpmnElement="Flow_03kbtj5">
        <di:waypoint x="400" y="280" />
        <di:waypoint x="455" y="280" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_016cmrq_di" bpmnElement="Flow_016cmrq">
        <di:waypoint x="248" y="280" />
        <di:waypoint x="300" y="280" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1ecw2w2_di" bpmnElement="Event_1ecw2w2">
        <dc:Bounds x="212" y="262" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_09xyq6w_di" bpmnElement="Activity_09xyq6w">
        <dc:Bounds x="300" y="240" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0r9p6o2_di" bpmnElement="Gateway_0n0vcox">
        <dc:Bounds x="455" y="255" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_05bzsv7_di" bpmnElement="Activity_05bzsv7">
        <dc:Bounds x="560" y="100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_00rkcf9_di" bpmnElement="Activity_00rkcf9">
        <dc:Bounds x="560" y="350" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_12nwqv2_di" bpmnElement="Activity_12nwqv2">
        <dc:Bounds x="890" y="40" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0j38wnw_di" bpmnElement="Activity_0j38wnw">
        <dc:Bounds x="910" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gn067c_di" bpmnElement="Activity_0gn067c">
        <dc:Bounds x="940" y="220" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0djjz25_di" bpmnElement="Event_0djjz25">
        <dc:Bounds x="1092" y="242" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`

}