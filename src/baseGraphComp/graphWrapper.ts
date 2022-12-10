import { Graphics, DisplayObject } from "pixi.js";
import IComponent from "../common/IComponent";
import RootComp from "../common/rootComp";
/////////////////////////////////////////////

export default class BaseGraphComp extends RootComp {
    protected pixiObj: Graphics;
    /////////////////////////////////////////
    constructor() {
    super();
        this.pixiObj = new Graphics();
    }
    

    ////////////////////////////////////////////////////////
    //////////////==========setters===//////////////////////
    ////////////////////////////////////////////////////////

    set width(width: number) {
        this.pixiObj.width = width;
    }
    get width(): number {
        return this.pixiObj.width;
    }

    set height(height: number) {
        this.pixiObj.height = height;
    }
    get height(): number {
        return this.pixiObj.height;
    }

    set color(color: number) {
        this.pixiObj.tint = color;
    }
    get color(): number {
        return this.pixiObj.tint;
    }

    set angle(angle: number) {
        this.pixiObj.angle = angle;
    }
    get angle(): number {
        return this.pixiObj.angle;
    }
    set opacity(opacity: number) {
        this.pixiObj.alpha = opacity;
    }
    get opacity(): number {
        return this.pixiObj.alpha;
    }
}