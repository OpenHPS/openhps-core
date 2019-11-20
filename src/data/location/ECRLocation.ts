import { Cartesian3DLocation } from "./Cartesian3DLocation";
import { GeographicalLocation } from "./GeographicalLocation";
import { AngleUnit } from "../unit";

/**
 * # OpenHPS: ECR location
 * Earth Centered Rotational location
 */
export class ECRLocation extends Cartesian3DLocation {

    constructor();
    constructor(geoLocation?: GeographicalLocation) {
        super();
        if (!geoLocation) {
            return;
        }

        const phi = AngleUnit.DEGREES.convert(geoLocation.getLatitude(), AngleUnit.RADIANS);
        const lambda = AngleUnit.DEGREES.convert(geoLocation.getLongitude(), AngleUnit.RADIANS);
        // Convert ECR positions
        this.setX(GeographicalLocation.EARTH_RADIUS * Math.cos(phi) * Math.cos(lambda));
        this.setY(GeographicalLocation.EARTH_RADIUS * Math.cos(phi) * Math.sin(lambda));
        this.setZ(GeographicalLocation.EARTH_RADIUS * Math.sin(phi));
    }

    public toGeoLocation(): GeographicalLocation {
        const geoLocation = new GeographicalLocation();
        geoLocation.setLatitude(AngleUnit.RADIANS.convert(Math.asin(this.getZ() / GeographicalLocation.EARTH_RADIUS), AngleUnit.DEGREES));
        geoLocation.setLongitude(AngleUnit.RADIANS.convert(Math.atan2(this.getY(), this.getX()), AngleUnit.DEGREES));
        return geoLocation;
    }
    
}
