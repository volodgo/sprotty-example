import { ContainerModule } from "inversify";
import {
  CreateEdgeCommand,
  CreatingEdgeCommand,
  CreatingEdgeMouseListener,
} from "./creatingEdge";
// import { configureCommand } from "../../base/commands/command-registration";
import { configureCommand } from "sprotty";
import { bindAsService, TYPES } from "@eclipse-glsp/client";
import { configureDanglingFeedbackEdge } from "../edge-creation/dangling-edge-feedback";
// import { configureDanglingFeedbackEdge } from "@eclipse-glsp/client/src/features/tools/edge-creation/dangling-edge-feedback";

const creatingEdgeModule = new ContainerModule(
  (bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };
    configureCommand({ bind, isBound }, CreatingEdgeCommand);
    configureCommand({ bind, isBound }, CreateEdgeCommand);

    bind(CreatingEdgeMouseListener).toSelf().inSingletonScope();
    bind(TYPES.MouseListener).toService(CreatingEdgeMouseListener);

    // bindAsService(context, TYPES.ITool, EdgeCreationTool);
    configureDanglingFeedbackEdge(context);
  }
);

export default creatingEdgeModule;
