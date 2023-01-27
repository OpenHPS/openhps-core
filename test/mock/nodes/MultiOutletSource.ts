import { 
    SourceNode, 
    DataFrame,
    Outlet,
    Inlet
} from '../../../src';

export class MultiOutletSource {
    test: Inlet<DataFrame>;
    sensor1: Outlet<DataFrame>;
    sensor2: Outlet<DataFrame>;
    sensor3: Outlet<DataFrame>;

    onPull(): Promise<void> {
        return new Promise((resolve, reject) => {
            
        });
    }

}
