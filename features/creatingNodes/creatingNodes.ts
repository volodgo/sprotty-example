import {
  Action,
  CreateNodeOperation,
  GChildElement,
  MouseListener,
  Point,
  TYPES,
  UpdateModelAction,
} from "@eclipse-glsp/client";
import { SPort, SLabel } from "sprotty-protocol";
import {
  ActionDispatcher,
  Command,
  CommandExecutionContext,
  IActionDispatcher,
  IActionDispatcherProvider,
  LocalModelSource,
  SModelElementImpl,
  SModelRootImpl,
  SParentElementImpl,
  SShapeElementImpl,
  createRandomId,
  findParent,
  findParentByFeature,
  isConnectable,
} from "sprotty";
import { inject, injectable, optional } from "inversify";
import { Node4diac } from "../../models";

// export const NodeCreator = Symbol("NodeCreator");

@injectable()
export class DroppableMouseListener extends MouseListener {
  //   @inject(NodeCreator) nodeCreator: (point: Point, type: string) => void;

  override dragOver(
    target: SModelElementImpl,
    event: MouseEvent
  ): (Action | Promise<Action>)[] {
    event.preventDefault();
    return [];
  }

  override drop(
    target: SModelElementImpl,
    e: DragEvent
  ): (Action | Promise<Action>)[] {
    let actions: Action[] = [];
    let type = e.dataTransfer.getData("text/plain");
    if (type == "INP") {
      if (!(target instanceof Node4diac)) {
        target = findParent(target, (item) => item.type == "node4diac");
      }
      if (target instanceof Node4diac) {
        actions = [CreatingInpAction.create(target.id)];
      }
    } else if (type == "FB") {
      let point: Point = { x: e.offsetX, y: e.offsetY };
      actions = [CreatingFbAction.create(point)];
    }
    return actions;
  }
}

export interface CreatingInpAction extends Action {
  kind: typeof CreatingInpAction.KIND;
  parentId: string;
}
export namespace CreatingInpAction {
  export const KIND = "CreatingInp";

  export function create(parentId: string): CreatingInpAction {
    return {
      kind: KIND,
      parentId,
    };
  }
}

export interface CreatingFbAction extends Action {
  kind: typeof CreatingFbAction.KIND;
  point: Point;
}
export namespace CreatingFbAction {
  export const KIND = "CreatingFb";

  export function create(point: Point): CreatingFbAction {
    return {
      kind: KIND,
      point,
    };
  }
}

// обработку перенес в model-source
@injectable()
export class CreateInpCommand extends Command {
  static readonly KIND = CreatingInpAction.KIND;
  private id: string;

  constructor(@inject(TYPES.Action) public action: CreatingInpAction) {
    super();
  }

  execute(context: CommandExecutionContext): SModelRootImpl {
    this.id = createRandomId();
    let model = context.root;
    let element = model.index.getById(this.action.parentId);
    if (element instanceof SParentElementImpl) {
      let inputs = element.children.find(
        (item) => item.type == "node4diac:inputs"
      );
      if (inputs) {
        let port = context.modelFactory.createElement(<SPort>{
          type: "node4diac:port",
          id: this.id,
          children: [
            <SLabel>{
              id: `${this.id}_title`,
              text: "INP",
              type: "node4diac:port_title",
            },
          ],
        });
        inputs.add(port);
      }
    }
    return context.root;
  }

  undo(context: CommandExecutionContext): SModelRootImpl {
    return context.root;
  }

  redo(context: CommandExecutionContext): SModelRootImpl {
    return context.root;
  }
}
