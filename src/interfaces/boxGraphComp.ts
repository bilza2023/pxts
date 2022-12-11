import { Graphics } from "pixi.js";
import BoxComp from "./boxComp";
// import IBoxGraphComp from "./IBoxGraphComp";


const pixiObj = new Graphics();

export default class BoxGraphComp extends BoxComp  {
    pixiObj: Graphics = new Graphics;
    constructor() {
    //--we can feed parent class directly as well 
    //--No need to feed it through child class
        super(pixiObj);
        // this.pixiObj = new Graphics();
    }
}