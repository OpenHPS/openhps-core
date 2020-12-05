import 'https://cdn.skypack.dev/reflect-metadata';
import { 
    DataObject, 
    ModelBuilder,
    Model,
    CallbackSinkNode,
    CallbackSourceNode,
    CallbackNode,
    DataFrame
} from 'https://cdn.skypack.dev/@openhps/core@v0.1.0-alpha.92/dist=dts';

ModelBuilder.create()
    .from(new CallbackSourceNode(() => {
        const object = new DataObject("mvdewync", "Maxim Van de Wynckel");
        return new DataFrame(object);
    }))
    .to()
    .build().then((model: Model) => {
        return model.push(object);
    });
