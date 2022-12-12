import { Sprite as PixiSprite,Texture } from "pixi.js";
import BoxComp from "./boxComp";



export default class BoxCompSprite extends BoxComp {
    // pixiObj: PixiSprite;
    constructor(texture: Texture) {
    const pObj = new PixiSprite(texture);
        //--we can feed parent class directly as well 
        //--No need to feed it through child class
        super(pObj);
        // this.pixiObj = pixiObj;
    }
}