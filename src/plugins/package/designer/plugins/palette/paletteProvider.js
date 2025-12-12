// paletteProvider.js (Vue3 适配版)
import { assign } from "min-dash";

/**
 * BPMN 2.0 左侧面板提供者（Vue3 ES6 Class 版）
 */
export default class PaletteProvider {
  // bpmn-js 依赖注入声明（静态属性，保留原生规则）
  static $inject = [
    "palette", 
    "create", 
    "elementFactory", 
    "spaceTool", 
    "lassoTool", 
    "handTool", 
    "globalConnect", 
    "translate"
  ];

  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
    this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
    this._spaceTool = spaceTool;
    this._lassoTool = lassoTool;
    this._handTool = handTool;
    this._globalConnect = globalConnect;
    this._translate = translate;

    // 注册面板提供者
    palette.registerProvider(this);
  }

  /**
   * 获取面板配置项（核心业务逻辑完全保留）
   */
  getPaletteEntries() {
    const {
      _create: create,
      _elementFactory: elementFactory,
      _spaceTool: spaceTool,
      _lassoTool: lassoTool,
      _handTool: handTool,
      _globalConnect: globalConnect,
      _translate: translate
    } = this;

    const actions = {};

    /**
     * 创建节点动作
     */
    const createAction = (type, group, className, title, options) => {
      const createListener = (event) => {
        const shape = elementFactory.createShape(assign({ type }, options));

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
     * 创建子流程
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
     * 创建参与者/池
     */
    const createParticipant = (event) => {
      create.start(event, elementFactory.createParticipantShape());
    };

    // 组装面板配置项
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