import { 
    create,  
    addDependencies,
    divideDependencies,
    multiplyDependencies,
    normDependencies,
    subtractDependencies,
} from 'mathjs';

const math = create({
    addDependencies,
    divideDependencies,
    multiplyDependencies,
    normDependencies,
    subtractDependencies
}, {
    matrix: 'Array',
    number: 'number',
    precision: 64,
    randomSeed: null
});

export = math;
