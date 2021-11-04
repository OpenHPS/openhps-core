export interface RDFSubject {
    uri: string;
    predicates: RDFPredicates;
}

export type RDFPredicates = Record<string, Array<RDFObject>>;

export interface RDFObject {
    termType: 'Literal' | 'BlankNode' | 'NamedNode';
    value: string;
}

export interface RDFLiteral extends RDFObject {
    termType: 'Literal';
    dataType?: string;
}
