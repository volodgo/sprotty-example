import { ContainerModule } from "inversify";
import { DroppableMouseListener } from "./creatingNodes";
import { TYPES, configureCommand } from "@eclipse-glsp/client";

const creatingEdgeModule = new ContainerModule(
  (bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };
    // configureCommand({ bind, isBound }, CreateNodeCommand);
    //   configureCommand({ bind, isBound }, CreateEdgeCommand);

    // bind(NodeCreator).toConstantValue(nodeCreator);
    bind(DroppableMouseListener).toSelf().inSingletonScope();
    bind(TYPES.MouseListener).toService(DroppableMouseListener);
  }
);

export default creatingEdgeModule;
