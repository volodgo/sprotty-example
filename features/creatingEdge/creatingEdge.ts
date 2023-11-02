import { inject, injectable, optional } from "inversify";
import { VNode } from "snabbdom";
import {
  AnchorComputerRegistry,
  ButtonHandlerRegistry,
  Command,
  CommandExecutionContext,
  CommitModelAction,
  Connectable,
  MouseListener,
  PolylineEdgeRouter,
  SButtonImpl,
  SModelElementImpl,
  SModelRootImpl,
  SRoutableElementImpl,
  SRoutingHandleImpl,
  Selectable,
  SwitchEditModeAction,
  TYPES,
  createRandomId,
  findChildrenAtPosition,
  findParentByFeature,
  findViewportScrollbar,
  isBoundsAware,
  isConnectable,
  isCtrlOrCmd,
  isSelectable,
  setClass,
} from "sprotty";
import {
  Action,
  BringToFrontAction,
  GetSelectionAction,
  ResponseAction,
  SelectAction,
  SelectAllAction,
  SelectionResult,
} from "sprotty-protocol/lib/actions";
import { toArray } from "sprotty/lib/utils/iterable";
import {
  CreatableEdge,
  creatingEdgeFeature,
  isCreatableEdge,
  isCreatingEdge,
} from "./model";
import {
  Bounds,
  CreateEdgeOperation,
  DefaultTypes,
  DragAwareMouseListener,
  GChildElement,
  GConnectableElement,
  GModelElement,
  MoveAction,
  Point,
  absoluteToParent,
  getAbsolutePosition,
  toAbsoluteBounds,
} from "@eclipse-glsp/client";
import {
  DrawFeedbackEdgeAction,
  FeedbackEdgeEnd,
  RemoveFeedbackEdgeAction,
  feedbackEdgeEndId,
} from "../edge-creation/dangling-edge-feedback";
// import {
//   DrawFeedbackEdgeAction,
//   FeedbackEdgeEnd,
//   RemoveFeedbackEdgeAction,
//   feedbackEdgeEndId,
// } from "@eclipse-glsp/client/src/features/tools/edge-creation/dangling-edge-feedback";
import { SEdge } from "sprotty-protocol";

export interface CreatingEdgeAction extends Action {
  kind: typeof CreatingEdgeAction.KIND;
  sourceId: string;
}
export namespace CreatingEdgeAction {
  export const KIND = "CreatingEdge";

  export function create(sourceId: string): CreatingEdgeAction {
    return {
      kind: KIND,
      sourceId,
    };
  }
}

@injectable()
export class CreateEdgeCommand extends Command {
  static readonly KIND = CreateEdgeOperation.KIND;
  private id: string;

  constructor(@inject(TYPES.Action) public action: CreateEdgeOperation) {
    super();
  }

  execute(context: CommandExecutionContext): SModelRootImpl {
    this.id = createRandomId();
    return this.redo(context);
  }

  undo(context: CommandExecutionContext): SModelRootImpl {
    if (this.id) {
      const model = context.root;
      let element = model.index.getById(this.id);
      if (element instanceof GChildElement) {
        context.root.remove(element);
      }
      return context.root;
    }
  }

  redo(context: CommandExecutionContext): SModelRootImpl {
    let a = this.action;
    let element = context.modelFactory.createElement(<SEdge>{
      sourceId: a.sourceElementId,
      targetId: a.targetElementId,
      routerKind: "manhattan",
      type: DefaultTypes.EDGE,
      id: this.id,
    });
    const model = context.root;
    model.add(element);
    return context.root;
  }
}

@injectable()
export class CreatingEdgeCommand extends Command {
  static readonly KIND = CreatingEdgeAction.KIND;

  constructor(@inject(TYPES.Action) public action: CreatingEdgeAction) {
    super();
  }

  execute(context: CommandExecutionContext): SModelRootImpl {
    const model = context.root;
    let element = model.index.getById(this.action.sourceId);
    if (element && isCreatableEdge(element)) {
      element.selected = !element.selected;
    }
    return this.redo(context);
  }

  undo(context: CommandExecutionContext): SModelRootImpl {
    return context.root;
  }

  redo(context: CommandExecutionContext): SModelRootImpl {
    return context.root;
  }
}

export class CreatingEdgeMouseListener extends DragAwareMouseListener {
  @inject(ButtonHandlerRegistry)
  @optional()
  protected buttonHandlerRegistry: ButtonHandlerRegistry;

  @inject(AnchorComputerRegistry)
  protected anchorRegistry: AnchorComputerRegistry;

  protected source?: string;
  protected target?: string;
  protected currentTarget?: GModelElement;
  protected allowedTarget = false;
  protected pendingDynamicCheck = false;

  wasSelected = false;
  constructing = false;

  protected reinitialize(): void {
    this.source = undefined;
    this.target = undefined;
    this.currentTarget = undefined;
    this.allowedTarget = false;
  }

  // override doubleClick(target: SModelElementImpl, event: MouseEvent): Action[] {
  override mouseDown(target: SModelElementImpl, event: MouseEvent): Action[] {
    let creatableEdge = getCreatableEdge(target);
    if (!creatableEdge) {
      creatableEdge = findParentByFeature(target, isCreatableEdge);
    }
    if (creatableEdge) {
      this.constructing = true;
      this.source = creatableEdge.id;
      return [
        DrawFeedbackEdgeAction.create({
          elementTypeId: DefaultTypes.EDGE,
          sourceId: creatableEdge.id,
        }),
      ];
    }
    return [];
  }

  override nonDraggingMouseUp(
    target: SModelElementImpl,
    event: MouseEvent
  ): Action[] {
    if (this.constructing) {
      this.constructing = false;

      const root = target.root;
      let edgeEnd = root.index.getById(target.id);
      let connectable = false;
      if (edgeEnd) {
        edgeEnd = findParentByFeature(edgeEnd, isConnectable);
        if (edgeEnd) {
          connectable = true;
        }
      }

      if (connectable && edgeEnd.id != this.source) {
        return [
          CreateEdgeOperation.create({
            elementTypeId: DefaultTypes.EDGE,
            sourceElementId: this.source,
            targetElementId: edgeEnd.id,
            // args: this.triggerAction.args,
          }),
          RemoveFeedbackEdgeAction.create(),
          CommitModelAction.create(),
        ];
      } else {
        return [RemoveFeedbackEdgeAction.create()];
      }
    }
    return [];
  }

  override mouseMove(target: SModelElementImpl, event: MouseEvent) {
    if (this.constructing) {
      // console.log("mouse move");
      const root = target.root;
      const edgeEnd = root.index.getById(feedbackEdgeEndId(root));
      if (!(edgeEnd instanceof FeedbackEdgeEnd) || !edgeEnd.feedbackEdge) {
        return [];
      }
      const edge = edgeEnd.feedbackEdge;
      const position = getAbsolutePosition(edgeEnd, event);
      const endAtMousePosition = findChildrenAtPosition(target.root, position)
        .reverse()
        .find(
          (element) =>
            isConnectable(element) && element.canConnect(edge, "target")
        );
      if (
        endAtMousePosition instanceof GConnectableElement &&
        edge.source &&
        isBoundsAware(edge.source)
      ) {
        const anchor = this.computeAbsoluteAnchor(
          endAtMousePosition,
          Bounds.center(toAbsoluteBounds(edge.source))
        );
        if (Point.euclideanDistance(anchor, edgeEnd.position) > 1) {
          let actions: Action[] = [
            MoveAction.create([{ elementId: edgeEnd.id, toPosition: anchor }], {
              animate: false,
            }),
          ];
          return actions;
        }
      } else {
        return [
          MoveAction.create([{ elementId: edgeEnd.id, toPosition: position }], {
            animate: false,
          }),
        ];
      }
    }
    return [];
  }

  protected computeAbsoluteAnchor(
    element: GConnectableElement,
    absoluteReferencePoint: Point,
    offset?: number
  ): Point {
    const referencePointInParent = absoluteToParent(
      element,
      absoluteReferencePoint
    );
    const anchorComputer = this.anchorRegistry.get(
      PolylineEdgeRouter.KIND,
      element.anchorKind
    );
    let anchor = anchorComputer.getAnchor(
      element,
      referencePointInParent,
      offset
    );
    // The anchor is computed in the local coordinate system of the element.
    // If the element is a nested child element we have to add the absolute position of its parent to the anchor.
    if (element.parent !== element.root) {
      const parent = findParentByFeature(element.parent, isBoundsAware);
      if (parent) {
        const absoluteParentPosition = toAbsoluteBounds(parent);
        anchor = Point.add(absoluteParentPosition, anchor);
      }
    }
    return anchor;
  }

  protected isSourceSelected(): boolean {
    return this.source !== undefined;
  }

  protected isTargetSelected(): boolean {
    return this.target !== undefined;
  }

  override decorate(vnode: VNode, element: SModelElementImpl): VNode {
    let selectableTarget = getCreatableEdge(element);
    if (selectableTarget !== undefined) {
      setClass(vnode, "selected", selectableTarget.selected);
    }
    return vnode;
  }
}

export function getCreatableEdge(
  element: SModelElementImpl
): (CreatableEdge & Selectable & SModelElementImpl & Connectable) | undefined {
  // ): typeof isCreatableEdge {
  if (isCreatableEdge(element)) {
    return element;
  }
  return undefined;
}
