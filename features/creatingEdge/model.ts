import {
  Connectable,
  SEdgeImpl,
  SModelElementImpl,
  Selectable,
  getRouteBounds,
} from "sprotty";
import { Bounds, Point, isBounds } from "sprotty-protocol";

export const creatingEdgeFeature = Symbol("creatingEdgeFeature");

/**
 * Feature extension interface for {@link creatingEdgeFeature}.
 */
export interface CreatableEdge {
  creatingEdge: boolean;
}

export function isCreatableEdge(
  element: SModelElementImpl
): element is SModelElementImpl & CreatableEdge & Selectable & Connectable {
  return element.hasFeature(creatingEdgeFeature);
}

export function isCreatingEdge(
  element: SModelElementImpl | undefined
): element is SModelElementImpl & CreatableEdge {
  return (
    element !== undefined && isCreatableEdge(element) && element.creatingEdge
  );
}
