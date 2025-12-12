// contentPadProvider.js (Vue3适配版)
import { assign, forEach, isArray } from "min-dash";
import { is } from "bpmn-js/lib/util/ModelUtil";
import { isExpanded, isEventSubProcess } from "bpmn-js/lib/util/DiUtil";
import { isAny } from "bpmn-js/lib/features/modeling/util/ModelingUtil";
import { getChildLanes } from "bpmn-js/lib/features/modeling/util/LaneUtil";
import { hasPrimaryModifier } from "diagram-js/lib/util/Mouse";

/**
 * BPMN 2.0 元素上下文菜单提供者（Vue3 ES6模块化适配版）
 */
export default class ContextPadProvider {
  constructor(
    config,
    injector,
    eventBus,
    contextPad,
    modeling,
    elementFactory,
    connect,
    create,
    popupMenu,
    canvas,
    rules,
    translate,
    elementRegistry
  ) {
    this.config = config || {};
    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas = canvas;
    this._rules = rules;
    this._translate = translate;

    // 注册上下文菜单提供者
    contextPad.registerProvider(this);

    // 自动放置功能（可选）
    if (this.config.autoPlace !== false) {
      this._autoPlace = injector.get("autoPlace", false);
    }

    // 监听创建结束事件
    eventBus.on("create.end", 250, (event) => {
      const context = event.context;
      const shape = context.shape;

      if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
        return;
      }

      const entries = contextPad.getEntries(shape);
      if (entries.replace) {
        entries.replace.action.click(event, shape);
      }
    });
  }

  // 依赖注入声明（bpmn-js原生机制，保留）
  static $inject = [
    "config.contextPad",
    "injector",
    "eventBus",
    "contextPad",
    "modeling",
    "elementFactory",
    "connect",
    "create",
    "popupMenu",
    "canvas",
    "rules",
    "translate",
    "elementRegistry"
  ];

  /**
   * 获取上下文菜单配置项（核心业务逻辑，完全保留）
   */
  getContextPadEntries(element) {
    const {
      _contextPad: contextPad,
      _modeling: modeling,
      _elementFactory: elementFactory,
      _connect: connect,
      _create: create,
      _popupMenu: popupMenu,
      _canvas: canvas,
      _rules: rules,
      _autoPlace: autoPlace,
      _translate: translate
    } = this;

    const actions = {};

    // 标签元素不显示菜单
    if (element.type === "label") {
      return actions;
    }

    const businessObject = element.businessObject;

    // 开始连线
    const startConnect = (event, element) => {
      connect.start(event, element);
    };

    // 删除元素
    const removeElement = () => {
      modeling.removeElements([element]);
    };

    // 获取替换菜单位置
    const getReplaceMenuPosition = (element) => {
      const Y_OFFSET = 5;
      const diagramContainer = canvas.getContainer();
      const pad = contextPad.getPad(element).html;

      const diagramRect = diagramContainer.getBoundingClientRect();
      const padRect = pad.getBoundingClientRect();

      const top = padRect.top - diagramRect.top;
      const left = padRect.left - diagramRect.left;

      return {
        x: left,
        y: top + padRect.height + Y_OFFSET
      };
    };

    /**
     * 创建追加元素的动作
     */
    const appendAction = (type, className, title, options) => {
      if (typeof title !== "string") {
        options = title;
        title = translate("Append {type}", { type: type.replace(/^bpmn:/, "") });
      }

      const appendStart = (event, element) => {
        const shape = elementFactory.createShape(assign({ type }, options));
        create.start(event, shape, { source: element });
      };

      const append = autoPlace
        ? (event, element) => {
            const shape = elementFactory.createShape(assign({ type }, options));
            autoPlace.append(element, shape);
          }
        : appendStart;

      return {
        group: "model",
        className,
        title,
        action: {
          dragstart: appendStart,
          click: append
        }
      };
    };

    // 分割泳道处理函数
    const splitLaneHandler = (count) => (event, element) => {
      modeling.splitLane(element, count);
      contextPad.open(element, true);
    };

    // 泳道/参与者相关菜单
    if (isAny(businessObject, ["bpmn:Lane", "bpmn:Participant"]) && isExpanded(businessObject)) {
      const childLanes = getChildLanes(element);

      assign(actions, {
        "lane-insert-above": {
          group: "lane-insert-above",
          className: "bpmn-icon-lane-insert-above",
          title: translate("Add Lane above"),
          action: {
            click: (event, element) => modeling.addLane(element, "top")
          }
        }
      });

      if (childLanes.length < 2) {
        if (element.height >= 120) {
          assign(actions, {
            "lane-divide-two": {
              group: "lane-divide",
              className: "bpmn-icon-lane-divide-two",
              title: translate("Divide into two Lanes"),
              action: { click: splitLaneHandler(2) }
            }
          });
        }

        if (element.height >= 180) {
          assign(actions, {
            "lane-divide-three": {
              group: "lane-divide",
              className: "bpmn-icon-lane-divide-three",
              title: translate("Divide into three Lanes"),
              action: { click: splitLaneHandler(3) }
            }
          });
        }
      }

      assign(actions, {
        "lane-insert-below": {
          group: "lane-insert-below",
          className: "bpmn-icon-lane-insert-below",
          title: translate("Add Lane below"),
          action: {
            click: (event, element) => modeling.addLane(element, "bottom")
          }
        }
      });
    }

    // 流程节点相关菜单
    if (is(businessObject, "bpmn:FlowNode")) {
      if (is(businessObject, "bpmn:EventBasedGateway")) {
        assign(actions, {
          "append.receive-task": appendAction("bpmn:ReceiveTask", "bpmn-icon-receive-task", translate("Append ReceiveTask")),
          "append.message-intermediate-event": appendAction(
            "bpmn:IntermediateCatchEvent",
            "bpmn-icon-intermediate-event-catch-message",
            translate("Append MessageIntermediateCatchEvent"),
            { eventDefinitionType: "bpmn:MessageEventDefinition" }
          ),
          "append.timer-intermediate-event": appendAction(
            "bpmn:IntermediateCatchEvent",
            "bpmn-icon-intermediate-event-catch-timer",
            translate("Append TimerIntermediateCatchEvent"),
            { eventDefinitionType: "bpmn:TimerEventDefinition" }
          ),
          "append.condition-intermediate-event": appendAction(
            "bpmn:IntermediateCatchEvent",
            "bpmn-icon-intermediate-event-catch-condition",
            translate("Append ConditionIntermediateCatchEvent"),
            { eventDefinitionType: "bpmn:ConditionalEventDefinition" }
          ),
          "append.signal-intermediate-event": appendAction(
            "bpmn:IntermediateCatchEvent",
            "bpmn-icon-intermediate-event-catch-signal",
            translate("Append SignalIntermediateCatchEvent"),
            { eventDefinitionType: "bpmn:SignalEventDefinition" }
          )
        });
      } else if (isEventType(businessObject, "bpmn:BoundaryEvent", "bpmn:CompensateEventDefinition")) {
        assign(actions, {
          "append.compensation-activity": appendAction("bpmn:Task", "bpmn-icon-task", translate("Append compensation activity"), {
            isForCompensation: true
          })
        });
      } else if (
        !is(businessObject, "bpmn:EndEvent") &&
        !businessObject.isForCompensation &&
        !isEventType(businessObject, "bpmn:IntermediateThrowEvent", "bpmn:LinkEventDefinition") &&
        !isEventSubProcess(businessObject)
      ) {
        // 关键修改：将默认Task改为UserTask（和你Vue3组件中自定义插件逻辑对齐）
        assign(actions, {
          "append.end-event": appendAction("bpmn:EndEvent", "bpmn-icon-end-event-none", translate("Append EndEvent")),
          "append.gateway": appendAction("bpmn:ExclusiveGateway", "bpmn-icon-gateway-none", translate("Append Gateway")),
          "append.append-task": appendAction("bpmn:UserTask", "bpmn-icon-user-task", translate("Append UserTask")), // 改为用户任务
          "append.intermediate-event": appendAction(
            "bpmn:IntermediateThrowEvent",
            "bpmn-icon-intermediate-event-none",
            translate("Append Intermediate/Boundary Event")
          )
        });
      }
    }

    // 替换类型菜单
    if (!popupMenu.isEmpty(element, "bpmn-replace")) {
      assign(actions, {
        replace: {
          group: "edit",
          className: "bpmn-icon-screw-wrench",
          title: translate("Change type"),
          action: {
            click: (event, element) => {
              const position = assign(getReplaceMenuPosition(element), {
                cursor: { x: event.x, y: event.y }
              });
              popupMenu.open(element, "bpmn-replace", position);
            }
          }
        }
      });
    }

    // 连线/文本注释菜单
    if (isAny(businessObject, ["bpmn:FlowNode", "bpmn:InteractionNode", "bpmn:DataObjectReference", "bpmn:DataStoreReference"])) {
      assign(actions, {
        "append.text-annotation": appendAction("bpmn:TextAnnotation", "bpmn-icon-text-annotation"),
        connect: {
          group: "connect",
          className: "bpmn-icon-connection-multi",
          title: translate("Connect using " + (businessObject.isForCompensation ? "" : "Sequence/MessageFlow or ") + "Association"),
          action: { click: startConnect, dragstart: startConnect }
        }
      });
    }

    // 数据对象/数据存储连线
    if (isAny(businessObject, ["bpmn:DataObjectReference", "bpmn:DataStoreReference"])) {
      assign(actions, {
        connect: {
          group: "connect",
          className: "bpmn-icon-connection-multi",
          title: translate("Connect using DataInputAssociation"),
          action: { click: startConnect, dragstart: startConnect }
        }
      });
    }

    // 分组文本注释
    if (is(businessObject, "bpmn:Group")) {
      assign(actions, {
        "append.text-annotation": appendAction("bpmn:TextAnnotation", "bpmn-icon-text-annotation")
      });
    }

    // 删除菜单（权限校验）
    const deleteAllowed = rules.allowed("elements.delete", { elements: [element] });
    let isDeleteAllowed = deleteAllowed;
    if (isArray(deleteAllowed)) {
      isDeleteAllowed = deleteAllowed[0] === element;
    }

    if (isDeleteAllowed) {
      assign(actions, {
        delete: {
          group: "edit",
          className: "bpmn-icon-trash",
          title: translate("Remove"),
          action: { click: removeElement }
        }
      });
    }

    return actions;
  }
}

// 工具函数：判断事件类型
function isEventType(eventBo, type, definition) {
  const isType = eventBo.$instanceOf(type);
  let isDefinition = false;

  const definitions = eventBo.eventDefinitions || [];
  forEach(definitions, (def) => {
    if (def.$type === definition) {
      isDefinition = true;
    }
  });

  return isType && isDefinition;
}