import "reflect-metadata";
import { IActionDispatcher, LocalModelSource, TYPES } from "sprotty";
import { SEdge, Point } from "sprotty-protocol";
import { createContainer } from "./di.config";
// import { graph } from "./model-source";
import { TaskNode } from "./models";

export default function run() {
  const container = createContainer("sprotty-container", createNode);
  // let mouseTracker = container.get(MousePositionTracker)
  const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);
  modelSource.updateModel();
  const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher);
  // modelSource.setModel(graph);

  let btnExport = document.getElementsByClassName("btnExport")?.item(0);
  btnExport.addEventListener("click", async (e: PointerEvent) => {
    // console.log("btnExport", e);
    // console.log(modelSource.model);
    let str = JSON.stringify(modelSource.model, null, " ");
    console.log(str);
    alert(str);
  });

  let btnUpdate = document.getElementsByClassName("btnUpdate")?.item(0);
  btnUpdate.addEventListener("click", async (e: PointerEvent) => {
    console.log("btnUpdate", e);
    // let action = SelectAllAction.create();
    // let boundsAction = RequestBoundsAction.create(modelSource.model);
    // let rBounds = await dispatcher.request<ComputedBoundsAction>(boundsAction);
    // console.log("rBoudns", rBounds);
    // await dispatcher.dispatch(rBounds);

    modelSource.updateModel();

    // let action = RequestModelAction.create();
    // let r = await dispatcher.dispatch(action);
    // console.log("r", r);

    /* let selectAction = SelectAction.create({ selectedElementsIDs: ["node0"] });
    let rSelect = await dispatcher.dispatch(selectAction);
    console.log("rSelect", rSelect); */
    // dispatcher.request<SelectAction>
  });

  let btnAddEdge = document.getElementsByClassName("btnAddEdge")?.item(0);
  btnAddEdge.addEventListener("click", async (e: PointerEvent) => {
    console.log("btnAddEdge", e);

    const edge0: SEdge = {
      id: "edge0",
      type: "edge:straight",
      sourceId: "task1",
      targetId: "task2",
      routerKind: "manhattan",
    };
    // modelSource.addElements([{ element: edge0, parentId: "graph" }]);
    modelSource.addElements([edge0]);
    // createNode();
  });

  function createNode(point: Point, type: string) {
    console.log("createNode", point, type);
  }
}

document.addEventListener("DOMContentLoaded", () => run());
