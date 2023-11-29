import {
  Action,
  MouseListener,
  Point,
  RequestModelAction,
  TYPES,
} from "@eclipse-glsp/client";
import {
  Command,
  CommandExecutionContext,
  CommandReturn,
  CommitModelAction,
  IActionDispatcher,
  LocalModelSource,
  ModelSource,
  SModelElementImpl,
  createRandomId,
  findParent,
} from "sprotty";
import { SGraph, SNode, SCompartment, SLabel, SPort } from "sprotty-protocol";
import { inject, injectable } from "inversify";
import { Node4diac } from "../../models";

// export const NodeCreator = Symbol("NodeCreator");

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

/* export interface CreatingNodeAction extends Action {
  kind: typeof CreatingNodeAction.KIND;
  // point: Point;
}
export namespace CreatingNodeAction {
  export const KIND = "CreatingNode";

  export function create(): CreatingNodeAction {
    return {
      kind: KIND,
      // point,
    };
  }
} */

/* @injectable()
export class CreateNodeCommand extends Command {
  static readonly KIND = CreatingFbAction.KIND;

  @inject(TYPES.ModelSource) modelSource: LocalModelSource;
  @inject(TYPES.IActionDispatcher) readonly actionDispatcher: IActionDispatcher;

  constructor(@inject(TYPES.Action) public action: CreatingFbAction) {
    super();
  }

  execute(context: CommandExecutionContext) {
    console.log("modelSource", this.modelSource);
    // try {
    //   await this.creatingFb(this.action);
    // } catch (e) {
    //   console.log("e", e);
    // }

    // let result = Promise.resolve(context.root);
    // return this.creatingFb(this.action);
    return context.root;
  }

  async creatingFb(action: CreatingFbAction) {
    let point = action.point;
    const viewport = await this.modelSource.getViewport();
    const adjust = (offset: number) => {
      return offset / viewport.zoom - 100 / 2;
    };
    let position = {
      x: viewport.scroll.x + adjust(point.x),
      y: viewport.scroll.y + adjust(point.y),
    };
    console.log(action.point);
    let id = createRandomId();
    let newNode = <SNode>{
      id: id,
      type: "node4diac",
      position,
      size: { width: 100, height: 100 },
      layoutOptions: {
        resizeContainer: true,
      },
      children: [
        <SLabel>{
          id: `${id}_title`,
          text:
            "FB #" +
            (this.modelSource.model.children.filter(
              (item) => item.type == "node4diac"
            ).length +
              1),
          type: "node4diac:title",
          position: { x: 20, y: 0 },
        },
        <SCompartment>{
          id: `${id}_inputs`,
          position: { x: 0, y: 50 },
          type: "node4diac:inputs",
          layout: "vbox",
          layoutOptions: {
            hAlign: "left",
            resizeContainer: true,
          },
          children: [],
        },
      ],
    };
    return this.modelSource.addElements([
      { element: newNode, parentId: this.modelSource.model.id },
    ]);
  }

  undo(context: CommandExecutionContext): CommandReturn {
    throw new Error("Method not implemented.");
  }
  redo(context: CommandExecutionContext): CommandReturn {
    throw new Error("Method not implemented.");
  }
} */

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
        actions = [
          CreatingInpAction.create(target.id),
          // CreatingNodeAction.create(),
        ];
      }
    } else if (type == "FB") {
      let point: Point = { x: e.offsetX, y: e.offsetY };

      // actions = [CreatingFbAction.create(point), CommitModelAction.create()];
      actions = [CreatingFbAction.create(point)];
    }
    return actions;
  }
}
