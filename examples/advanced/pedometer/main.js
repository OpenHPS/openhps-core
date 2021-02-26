import { 
    Absolute2DPosition, 
    AngularVelocity, 
    CallbackNode, 
    CallbackSinkNode, 
    IMUBrowserSource, 
    IMUSensorObject, 
    ModelBuilder, 
    Orientation, 
    PedometerProcessingNode, 
    SMAFilterNode, 
    VelocityProcessingNode 
} from '../../../dist/web/openhps-core.es.js';

const object = new IMUSensorObject("phone");
object.position = new Absolute2DPosition(0, 0);

let plot;

ModelBuilder.create()
    .from(new IMUBrowserSource({
        source: object
    }))
    .via(new PedometerProcessingNode({
        windowSize: 1,
        minPeak: 2,
        maxPeak: 8,
        minStepTime: 0.3,
        peakThreshold: 0.5,
        maxStepTime: 0.8,
        meanFilterSize: 1,
        stepSize: 0.3,
        minConsecutiveSteps: 1
    }))
    .to(new CallbackSinkNode(frame => {
        const position = frame.source.position;
        const element = document.getElementById('position');
        element.innerHTML = `X=${position.x}</br>Y=${position.y}</br>SPEED=${position.linearVelocity.x}</br>YAW=${position.orientation.toEuler().yaw}`;
        plot.data.datasets.forEach((dataset) => {
            dataset.data.push({
                x: position.x,
                y: position.y
            });
        });
        plot.update();
    }))
    .build().then(model => {
        const element = document.getElementById('position');
        element.innerHTML = `Loading...`;
        const ctx = document.getElementById('myChart').getContext('2d');
        plot = new Chart.Scatter(ctx, {
            data: {
                datasets: [{
					label: 'My First dataset',
					data: []
                }]
            },
            options: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                    }
                }]
            }
        });

        model.on('error', ex => {
            alert(ex.message);
        });
    }).catch(console.error);
    