import 'https://cdn.skypack.dev/reflect-metadata';
import { 
    DataObject, 
    ModelBuilder,
    Model,
    CallbackSourceNode,
    DataFrame
} from 'https://cdn.skypack.dev/@openhps/core?dts';

ModelBuilder.create()
    .from(new CallbackSourceNode(() => {
        const object = new DataObject("mvdewync", "Maxim Van de Wynckel");
        return new DataFrame(object);
    }))
    .to()
    .build().then((model: Model) => {
        return model.pull();
    });
