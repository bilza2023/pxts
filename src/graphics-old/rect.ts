import { Application, Graphics } from "pixi.js";
import BaseComp from "./BaseGraph";

export default class Rect extends BaseComp {
    ///////////////////////////////////////////////
    constructor(x: number, y: number, width: number, height: number, color: number) {
        super(x, y, width, height, color);

    }
    /**
     * I am calling this as draw but it is actually add to stage
     */
    add() {
        const graphics = new Graphics();
        this.drawBorder(graphics);
        // Rectangle
        graphics.beginFill(this.color);
        graphics.drawRect(this.x, this.y, this.width, this.height);
        graphics.endFill();
        return graphics;
    }



}