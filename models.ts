import { SNode } from "sprotty-protocol";

import {
  SShapeElementImpl,
  Expandable,
  RectangularNode,
  Nameable,
  SLabelImpl,
  WithEditableLabel,
  isEditableLabel,
  boundsFeature,
  layoutContainerFeature,
  layoutableChildFeature,
  fadeFeature,
  SNodeImpl,
  Connectable,
  SRoutableElementImpl,
} from "sprotty";

export class Icon extends SShapeElementImpl {
  static readonly DEFAULT_FEATURES = [
    boundsFeature,
    layoutContainerFeature,
    layoutableChildFeature,
    fadeFeature,
  ];

  override size = {
    width: 32,
    height: 32,
  };
}

export interface ITaskNode {
  isFinished: boolean;
}

// export class TaskNode extends RectangularNode implements WithEditableLabel {
export class TaskNode extends RectangularNode implements ITaskNode {
  isFinished: boolean;
  // name: string;

  get hurma() {
    return "hurma";
  }

  // Использутеся пока только в popup
  /* get editableLabel() {
    let titleElement = this.children.find((item) => item.type == "task:title");
    if (titleElement && isEditableLabel(titleElement)) {
      return titleElement;
    }
  } */
}

export class TaskTitle extends SLabelImpl {}
export class TaskPort extends SLabelImpl implements Connectable {
  canConnect(
    routable: SRoutableElementImpl,
    role: "source" | "target"
  ): boolean {
    return true;
  }
}
export class TaskDesc extends SLabelImpl {}

export class Node4diac extends RectangularNode {}
