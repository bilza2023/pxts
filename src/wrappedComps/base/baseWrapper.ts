import { Graphics, DisplayObject } from "pixi.js";
import IWComp from "./IWComp";
import Pivot from "./pivot";
/////////////////////////////////////////////

export default class BaseWrapper extends Pivot implements IWComp {
    protected graphics: Graphics;
    public readonly id: string;
    //------

    /////////////////////////////////////////
    constructor() {
        super();
        this.graphics = new Graphics();
        this.id = Math.random().toString(36).slice(2);
        //--- We will add the init code here:
    }
    /**
     * Returns the pixi Graphics/DisplayObject element.
     * @returns Graphics
     */
    public getDrawable(): DisplayObject {
        return this.graphics;
    }

    // this.graphics.pivot.x = this.getPivotX(this.width);
    // this.graphics.pivot.y = this.getPivotY(this.height);
    // this.graphics.x = this.x + this.getPivotX(this.width);
    // this.graphics.y = this.y + this.getPivotY(this.height);

    x(x: number): number {
        this.graphics.x = x;
        return this.graphics.x;
    }

    y(y: number): number {
        this.graphics.y = y;
        return this.graphics.y;
    }

    width(width: number): number {
        this.graphics.width = width;
        return this.graphics.width;
    }

    height(height: number): number {
        this.graphics.height = height;
        return this.graphics.height;
    }

    color(color: number): number {
        this.graphics.tint = color;
        return this.graphics.tint;
    }

    angle(angle: number): number {
        this.graphics.angle = angle;
        return this.graphics.angle;
    }

    opacity(opacity: number): number {
        this.graphics.alpha = opacity;
        return this.graphics.alpha;
    }
}
