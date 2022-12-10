import { Graphics,Text as PixiText,Sprite } from "pixi.js";
// import IComponent from "./IRootComp";

export default class RootComp   {
    public readonly id: string;
    public pixiObj: Graphics | PixiText |Sprite;
    /////////////////////////////////////////
    constructor(pixiObj :Graphics | PixiText | Sprite) {
        this.id = Math.random().toString(36).slice(2);
        this.pixiObj = pixiObj;
    }
    set x(x: number) {
        this.pixiObj.x = x;
    }

    get x() {
        return this.pixiObj.x;
    }

    set y(y : number) {
        this.pixiObj.y = y;
    }

    get y() {
        return this.pixiObj.y;
    }

    set color(color: number) {
        this.pixiObj.tint = color;
    }

    get color() {
        return this.pixiObj.tint;
    }

    set opacity (opacity: number) {
        this.pixiObj.alpha = opacity;
    }

    get opacity() {
        return this.pixiObj.alpha;
    }

}
