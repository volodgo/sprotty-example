import "reflect-metadata";
import { LocalModelSource, TYPES } from "sprotty";
import { createContainer } from "./di.config";

export default function run() {
  const container = createContainer("sprotty-container");
  const modelSource = container.get<LocalModelSource>(TYPES.ModelSource);
  modelSource.updateModel();

  let btnExport = document.getElementsByClassName("btnExport")?.item(0);
  btnExport.addEventListener("click", async (e: PointerEvent) => {
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
