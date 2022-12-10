import { Graphics } from "pixi.js";
import BoxComp from "../interfaces/boxComp";
import IBoxGraphComp from "./IBoxGraphComp";
const pixiObj = new Graphics();


export default class BoxGraphComp extends BoxComp implements IBoxGraphComp {
    constructor() {
    //--we can feed parent class directly as well 
    //--No need to feed it through child class
        super(pixiObj);
    }
}