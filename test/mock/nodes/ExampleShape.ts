import { DataFrame, GraphBuilder, GraphShapeNode } from "../../../src";

export class ExampleShape<In extends DataFrame, Out extends DataFrame> extends GraphShapeNode<In, Out> {

    construct(builder: GraphBuilder<In, Out>): GraphBuilder<In, Out> {
        return builder.from().to();
    }

}
