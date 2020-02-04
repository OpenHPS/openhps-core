import { DataFrame, DataObject } from "../../../src";

export class EvaluationDataFrame extends DataFrame {
    public evaluationObjects: Map<string, DataObject> = new Map();
}