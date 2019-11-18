import { DataFrame } from "./DataFrame";

export class ImageDataFrame extends DataFrame {
    private _image: ImageData;

    public getImage() : ImageData {
        return this._image;
    }
}