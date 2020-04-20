import { DataFrame } from "../../data";
import { Node } from "../../Node";

export class BroadcastNode<InOut extends DataFrame | DataFrame[]> extends Node<InOut, InOut> {

}
