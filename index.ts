import "reflect-metadata";
import { IActionDispatcher, LocalModelSource, TYPES } from "sprotty";
import { createContainer } from "./di.config";

export default function run() {
  const container = createContainer("sprotty-container");
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
    modelSource.updateModel();
  });

}

document.addEventListener("DOMContentLoaded", () => run());
