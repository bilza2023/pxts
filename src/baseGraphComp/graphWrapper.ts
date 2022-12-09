import { Graphics, DisplayObject } from "pixi.js";
/////////////////////////////////////////////

export default class BaseGraphComp {
    protected graphics: Graphics;
    public readonly id: string;
    /////////////////////////////////////////
    constructor() {
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

    ////////////////////////////////////////////////////////
    //////////////==========setters===//////////////////////
    ////////////////////////////////////////////////////////

    set width(width: number) {
        this.graphics.width = width;
    }
    get width(): number {
        return this.graphics.width;
    }

    set height(height: number) {
        this.graphics.height = height;
    }
    get height(): number {
        return this.graphics.height;
    }

    set color(color: number) {
        this.graphics.tint = color;
    }
    get color(): number {
        return this.graphics.tint;
    }

    set angle(angle: number) {
        this.graphics.angle = angle;
    }
    get angle(): number {
        return this.graphics.angle;
    }
    set opacity(opacity: number) {
        this.graphics.alpha = opacity;
    }
    get opacity(): number {
        return this.graphics.alpha;
    }
}
