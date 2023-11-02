import { Action, MouseListener, Point } from "@eclipse-glsp/client";
import { SModelElementImpl, findParent } from "sprotty";
import { injectable } from "inversify";
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
