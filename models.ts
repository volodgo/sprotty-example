import {
  RectangularNode,
  boundsFeature,
  hoverFeedbackFeature,
  moveFeature,
  selectFeature,
} from "sprotty";

export class Node4diac extends RectangularNode {
  static readonly DEFAULT_FEATURES = [
    selectFeature,
    moveFeature,
    boundsFeature,
  ];
}
