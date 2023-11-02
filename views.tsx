/** @jsx svg */
import { svg } from 'sprotty/lib/lib/jsx';
import { injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { ATTR_BBOX_ELEMENT, Expandable, IView, IViewArgs, PolylineEdgeViewWithGapsOnIntersections, RectangularNodeView, RenderingContext, SLabelImpl, SNodeImpl, SPortImpl, ShapeView, isEdgeLayoutable, setAttr } from 'sprotty';
import { Icon, TaskNode } from './models';
import { Point, angleOfPoint, toDegrees } from 'sprotty-protocol';
import { GEdge, getSubType } from '@eclipse-glsp/client';

@injectable()
export class Node4diacView extends ShapeView {
    override render(node: Readonly<SNodeImpl>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        let d = 20
        let path = `M 0 0 H${node.size.width} v${d} h${-d} v${d} h${d} V ${node.size.height} H0 V${d*2} h${d} v${-d} h${-d} Z`;
        return <g class-b4diac={true}>
                  <path d={path} fill="transparent" />
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class PortViewWithExternalLabel extends ShapeView {
    render(node: Readonly<SPortImpl>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const bboxElement = <rect
            class-sprotty-port={true}
            class-mouseover={node.hoverFeedback} class-selected={node.selected}
            x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}>
        </rect>;
        // setAttr(bboxElement, ATTR_BBOX_ELEMENT, true);
        return <g>
            {bboxElement}
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class WorkflowEdgeView extends PolylineEdgeViewWithGapsOnIntersections {
    protected override renderAdditionals(edge: GEdge, segments: Point[], context: RenderingContext): VNode[] {
        const additionals = super.renderAdditionals(edge, segments, context);
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        const arrow = (
            <path
                class-sprotty-edge={true}
                class-arrow={true}
                d='M 1,0 L 10,-4 L 10,4 Z'
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${
                    p2.y
                })`}
            />
        );
        additionals.push(arrow);
        return additionals;
    }
}



@injectable()
export class TaskNodeView implements IView {
    render(node: Readonly<TaskNode>, context: RenderingContext): VNode {
        const position = 50;
        return <g>
            <rect class-sprotty-node={true} class-task={true}
                class-finished={node.isFinished}
                width={Math.max(node.size.width, 0)}
                height={Math.max(node.size.height, 0)}
            >
            </rect>
            {/* <text>{node.position.x}:{node.position.y}</text> */}
            {context.renderChildren(node)}
            {/* <text x="10" y="10">{node.name} ({node.type})</text> */}
        </g>;
    }
}


