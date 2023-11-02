import { Container, ContainerModule, inject, injectable } from "inversify";
import {
  configureModelElement,
  configureViewerOptions,
  connectableFeature,
  ConsoleLogger,
  edgeIntersectionModule,
  editLabelFeature,
  expandModule,
  fadeModule,
  hoverFeedbackFeature,
  JumpingPolylineEdgeView,
  layoutableChildFeature,
  loadDefaultModules,
  LogLevel,
  PolylineEdgeView,
  popupFeature,
  SCompartmentImpl,
  SCompartmentView,
  SEdgeImpl,
  SGraphImpl,
  SGraphView,
  SLabelView,
  SPortImpl,
  SRoutingHandleImpl,
  SRoutingHandleView,
} from "sprotty";
import {
  TaskNodeView,
  Node4diacView,
  PortViewWithExternalLabel,
  WorkflowEdgeView,
} from "./views";
import { Icon, TaskNode, TaskTitle, TaskPort, Node4diac } from "./models";
import { ClassDiagramModelSource } from "./model-source";
import creatingEdgeModule from "./features/creatingEdge/di.config";
import { creatingEdgeFeature } from "./features/creatingEdge/model";
import creatingNodesModule from "./features/creatingNodes/di.config";
import { DefaultTypes, GEdge, TYPES } from "@eclipse-glsp/client";

import { Action, Point } from "sprotty-protocol";

export const createContainer = (
  containerId: string,
  nodeCreator: (point: Point, type: string) => void
) => {
  const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(TYPES.ModelSource).to(ClassDiagramModelSource).inSingletonScope();
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);

    // bind(TYPES.MouseListener).to(DroppableMouseListener).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, "graph", SGraphImpl, SGraphView);

    configureModelElement(context, "node4diac", Node4diac, Node4diacView, {
      // enable: [withEditLabelFeature, layoutableChildFeature], // плюсуются к SNodeImpl.DEFAULT_FEATURES
      disable: [hoverFeedbackFeature, popupFeature, connectableFeature],
    });

    // Тайтл редактируемый
    configureModelElement(context, "node4diac:title", TaskTitle, SLabelView, {
      enable: [editLabelFeature],
    });

    configureModelElement(
      context,
      "node4diac:inputs",
      SCompartmentImpl,
      SCompartmentView
    );

    configureModelElement(
      context,
      "node4diac:port",
      SPortImpl,
      PortViewWithExternalLabel,
      {
        enable: [layoutableChildFeature, creatingEdgeFeature],
        disable: [hoverFeedbackFeature, popupFeature],
      }
    );

    // Грань
    configureModelElement(
      context,
      "edge:straight",
      SEdgeImpl,
      PolylineEdgeView
    );

    configureModelElement(
      context,
      "node4diac:port_title",
      TaskTitle,
      SLabelView
    );

    configureModelElement(context, DefaultTypes.EDGE, GEdge, WorkflowEdgeView);

    configureModelElement(context, "task", TaskNode, TaskNodeView, {
      // enable: [withEditLabelFeature, layoutableChildFeature], // плюсуются к SNodeImpl.DEFAULT_FEATURES
      // boundsFeature, layoutContainerFeature,
      enable: [layoutableChildFeature],
      disable: [hoverFeedbackFeature, popupFeature, connectableFeature],
    });
    // Тайтл редактируемый
    configureModelElement(context, "task:title", TaskTitle, SLabelView, {
      enable: [editLabelFeature],
    });

    configureViewerOptions(context, {
      needsClientLayout: true,
      baseDiv: containerId,
    });
    // configureModelElement(
    //   context,
    //   "pre-rendered",
    //   PreRenderedElementImpl,
    //   PreRenderedView
    // );

    configureModelElement(
      context,
      "routing-point",
      SRoutingHandleImpl,
      SRoutingHandleView
    );
    configureModelElement(
      context,
      "volatile-routing-point",
      SRoutingHandleImpl,
      SRoutingHandleView
    );
    // configureModelElement(
    //   context,
    //   "bezier-create-routing-point",
    //   SRoutingHandleImpl,
    //   SBezierCreateHandleView
    // );
    // configureModelElement(
    //   context,
    //   "bezier-remove-routing-point",
    //   SRoutingHandleImpl,
    //   SBezierCreateHandleView
    // );
    // configureModelElement(
    //   context,
    //   "bezier-routing-point",
    //   SRoutingHandleImpl,
    //   SBezierControlHandleView
    // );
  });

  const container = new Container();
  loadDefaultModules(container, { exclude: [expandModule, fadeModule] });
  container.load(
    myModule,
    edgeIntersectionModule,
    creatingEdgeModule,
    creatingNodesModule
  );
  return container;
};
