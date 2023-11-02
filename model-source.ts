import {
  SGraph,
  SNode,
  SCompartment,
  SLabel,
  SPort,
  Action,
} from "sprotty-protocol";
import {
  ActionHandlerRegistry,
  LocalModelSource,
  createRandomId,
} from "sprotty";
import { injectable } from "inversify";
import {
  CreatingFbAction,
  CreatingInpAction,
} from "./features/creatingNodes/creatingNodes";

@injectable()
export class ClassDiagramModelSource extends LocalModelSource {
  constructor() {
    super();
    this.currentRoot = this.initializeModel();
    // this.model = this.initializeModel();
  }

  override initialize(registry: ActionHandlerRegistry): void {
    super.initialize(registry);
    registry.register(CreatingFbAction.KIND, this);
    registry.register(CreatingInpAction.KIND, this);
  }

  override handle(action: Action) {
    switch (action.kind) {
      case CreatingInpAction.KIND:
        this.creatingInp(action as CreatingInpAction);
        break;
      case CreatingFbAction.KIND:
        this.creatingFb(action as CreatingFbAction);
        break;
      default:
        super.handle(action);
    }
  }
  async creatingFb(action: CreatingFbAction) {
    let point = action.point;
    const viewport = await this.getViewport();
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
            (this.model.children.filter((item) => item.type == "node4diac")
              .length +
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
    this.addElements([{ element: newNode, parentId: this.model.id }]);
    // this.updateModel();
  }
  creatingInp(action: CreatingInpAction) {
    let id = createRandomId();
    let parent = this.model.children.find((item) => item.id == action.parentId);
    if (parent) {
      let inputs = parent.children.find(
        (item) => item.type == "node4diac:inputs"
      );
      if (inputs) {
        this.addElements([
          {
            element: <SPort>{
              type: "node4diac:port",
              id: id,
              children: [
                <SLabel>{
                  id: `${id}_title`,
                  text: "INP",
                  type: "node4diac:port_title",
                },
              ],
            },
            parentId: inputs.id,
          },
        ]);
        this.updateModel();
      }
    }
  }

  initializeModel() {
    let node1 = <SNode>{
      id: "node1",
      type: "node4diac",
      position: {
        x: 100,
        y: 100,
      },
      size: { width: 100, height: 100 },
      // layout: "vbox",
      layoutOptions: {
        resizeContainer: true,
      },
      children: [
        <SLabel>{
          id: "node1_title",
          text: "FB #1",
          type: "node4diac:title",
          position: { x: 20, y: 0 },
        },
        <SCompartment>{
          id: "node1_inputs",
          position: { x: 0, y: 50 },
          type: "node4diac:inputs",
          layout: "vbox",
          layoutOptions: {
            hAlign: "left",
            resizeContainer: true,
          },
          children: [
            <SPort>{
              id: "node1_port1",
              type: "node4diac:port",
              // anchorKind: "diamond",
              children: [
                <SLabel>{
                  id: "node1_port_title1",
                  text: "INP",
                  type: "node4diac:port_title",
                },
              ],
            },
            <SPort>{
              id: "node1_port2",
              type: "node4diac:port",
              // anchorKind: "diamond",
              children: [
                <SLabel>{
                  id: "node1_port_title2",
                  text: "INP",
                  type: "node4diac:port_title",
                },
              ],
            },
          ],
        },
      ],
    };

    let node2 = <SNode>{
      id: "node2",
      type: "node4diac",
      position: {
        x: 300,
        y: 300,
      },
      size: { width: 100, height: 100 },
      children: [
        <SLabel>{
          id: "node2_title",
          text: "FB #2",
          type: "node4diac:title",
          position: { x: 20, y: 0 },
        },
        <SCompartment>{
          id: "node2_inputs",
          position: { x: 0, y: 50 },
          type: "node4diac:inputs",
          layout: "vbox",
          layoutOptions: {
            hAlign: "left",
          },
          children: [
            <SPort>{
              id: "node2_port1",
              type: "node4diac:port",
              // anchorKind: "diamond",
              children: [
                <SLabel>{
                  id: "node2_port_title1",
                  text: "INP",
                  type: "node4diac:port_title",
                },
              ],
            },
            <SPort>{
              id: "node2_port2",
              type: "node4diac:port",
              // anchorKind: "diamond",
              children: [
                <SLabel>{
                  id: "node2_port_title2",
                  text: "INP",
                  type: "node4diac:port_title",
                },
              ],
            },
          ],
        },
      ],
    };

    const graph: SGraph = {
      id: "root",
      type: "graph",
      children: [node1, node2],
      layoutOptions: {
        // hGap: 5,
        // paddingLeft: 7,
        // paddingRight: 7,
        // paddingTop: 7,
        // paddingBottom: 7,
      },
    };
    return graph;
  }
}
