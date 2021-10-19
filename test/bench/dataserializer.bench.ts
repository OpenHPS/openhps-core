import { Suite } from 'benchmark';
import { 
    Absolute3DPosition, 
    AngularVelocity, 
    DataFrame, 
    DataObject, 
    DataSerializer,
    LinearVelocity, 
    Orientation 
} from '../../src';

const dummyFrame = new DataFrame();
const dummyObject = new DataObject("dummy", "Dummy Data Object");
const position = new Absolute3DPosition(0, 0, 0);
position.velocity.linear = new LinearVelocity(0.1, 0.1, 0.1);
position.velocity.angular = new AngularVelocity(0.1, 0.1, 0.1);
position.orientation = new Orientation(0, 0, 0, 1);
dummyObject.setPosition(position);
dummyFrame.source = dummyObject;
dummyFrame.addObject(dummyObject);

const suite = new Suite();
const settings = {
    minSamples: 100,
    initCount: 10
};

let serialized: any;
let deserialized: DataFrame;

suite.add("dataserializer#serialize", () => {
    serialized = DataSerializer.serialize(dummyFrame);
}, settings)
.add("dataserializer#deserialize", () => {
    deserialized = DataSerializer.deserialize(serialized);
}, settings)
.on('cycle', function(event: any) {
    console.log(String(event.target));
})
.run(); 
