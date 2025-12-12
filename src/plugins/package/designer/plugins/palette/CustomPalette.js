// CustomPalette.js (Vue3 适配版)
import PaletteProvider from "./paletteProvider"; // 导入改造后的基类
import { assign } from "min-dash";

/**
 * 自定义BPMN左侧面板（继承自PaletteProvider，Vue3 ES6版）
 */
export default class CustomPalette extends PaletteProvider {
  // bpmn-js 依赖注入声明（补充 moddle 参数）
  static $inject = [
    "palette", 
    "create", 
    "elementFactory", 
    "spaceTool", 
    "lassoTool", 
    "handTool", 
    "globalConnect", 
    "moddle", 
    "translate"
  ];

  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, moddle, translate) {
    // 调用父类构造函数（优先级 2000 保留）
    super(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate);
    // 扩展父类属性
    this._moddle = moddle;
    this.priority = 2000; // 自定义优先级，覆盖父类
  }

  /**
   * 重写父类面板配置（新增 MySQL 节点，保留其他逻辑）
   */
  getPaletteEntries() {
    const {
      _create: create,
      _elementFactory: elementFactory,
      _spaceTool: spaceTool,
      _lassoTool: lassoTool,
      _handTool: handTool,
      _globalConnect: globalConnect,
      _moddle: moddle,
      _translate: translate
    } = this;

    const actions = {};

    /**
     * 创建节点动作（复用父类逻辑，补充日志）
     */
    const createAction = (type, group, className, title, options) => {
      const createListener = (event) => {
        const shape = elementFactory.createShape(assign({ type }, options));
        console.log("自定义面板创建节点:", shape); // 保留原日志

        if (options) {
          shape.businessObject.di.isExpanded = options.isExpanded;
        }

        create.start(event, shape);
      };

      const shortType = type.replace(/^bpmn:/, "");

      return {
        group,
        className,
        title: title || translate("Create {type}", { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    };

    /**
     * 创建子流程（复用父类逻辑）
     */
    const createSubprocess = (event) => {
      const subProcess = elementFactory.createShape({
        type: "bpmn:SubProcess",
        x: 0,
        y: 0,
        isExpanded: true
      });

      const startEvent = elementFactory.createShape({
        type: "bpmn:StartEvent",
        x: 40,
        y: 82,
        parent: subProcess
      });

      create.start(event, [subProcess, startEvent], {
        hints: {
          autoSelect: [startEvent]
        }
      });
    };

    /**
     * 创建参与者/池（复用父类逻辑）
     */
    const createParticipant = (event) => {
      create.start(event, elementFactory.createParticipantShape());
    };

    // 组装面板配置项（新增 MySQL 节点）
    assign(actions, {
      "hand-tool": {
        group: "tools",
        className: "bpmn-icon-hand-tool",
        title: translate("Activate the hand tool"),
        action: {
          click: (event) => handTool.activateHand(event)
        }
      },
      "lasso-tool": {
        group: "tools",
        className: "bpmn-icon-lasso-tool",
        title: translate("Activate the lasso tool"),
        action: {
          click: (event) => lassoTool.activateSelection(event)
        }
      },
      "space-tool": {
        group: "tools",
        className: "bpmn-icon-space-tool",
        title: translate("Activate the create/remove space tool"),
        action: {
          click: (event) => spaceTool.activateSelection(event)
        }
      },
      "global-connect-tool": {
        group: "tools",
        className: "bpmn-icon-connection-multi",
        title: translate("Activate the global connect tool"),
        action: {
          click: (event) => globalConnect.toggle(event)
        }
      },
      "tool-separator": {
        group: "tools",
        separator: true
      },
      "create.start-event": createAction("bpmn:StartEvent", "event", "bpmn-icon-start-event-none", translate("Create StartEvent")),
      "create.intermediate-event": createAction(
        "bpmn:IntermediateThrowEvent",
        "event",
        "bpmn-icon-intermediate-event-none",
        translate("Create Intermediate/Boundary Event")
      ),
      "create.end-event": createAction("bpmn:EndEvent", "event", "bpmn-icon-end-event-none", translate("Create EndEvent")),
      "create.exclusive-gateway": createAction("bpmn:ExclusiveGateway", "gateway", "bpmn-icon-gateway-none", translate("Create Gateway")),
      "create.user-task": createAction("bpmn:UserTask", "activity", "bpmn-icon-user-task", translate("Create User Task")),
      // 核心：保留自定义 MySQL 节点
      "create.sql-task": createAction("user:MySql", "activity", "bpmn-icon-mysql", "MySQL 节点"),
      "create.data-object": createAction("bpmn:DataObjectReference", "data-object", "bpmn-icon-data-object", translate("Create DataObjectReference")),
      "create.data-store": createAction("bpmn:DataStoreReference", "data-store", "bpmn-icon-data-store", translate("Create DataStoreReference")),
      "create.subprocess-expanded": {
        group: "activity",
        className: "bpmn-icon-subprocess-expanded",
        title: translate("Create expanded SubProcess"),
        action: {
          dragstart: createSubprocess,
          click: createSubprocess
        }
      },
      "create.participant-expanded": {
        group: "collaboration",
        className: "bpmn-icon-participant",
        title: translate("Create Pool/Participant"),
        action: {
          dragstart: createParticipant,
          click: createParticipant
        }
      },
      "create.group": createAction("bpmn:Group", "artifact", "bpmn-icon-group", translate("Create Group"))
    });

    return actions;
  }
}