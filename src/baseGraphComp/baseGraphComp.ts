import { Graphics, DisplayObject } from "pixi.js";
import IGraphComp from "./IGraphComp";
import getOffset from "./offset";
/////////////////////////////////////////////

export default class BaseGraphComp implements IGraphComp {
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
    set x(x: number) {
        this.graphics.x = x;
    }
    getX(): number {
        return this.graphics.x;
    }
    //===Y
    set y(y: number) {
        this.graphics.y = y;
    }
    getY(): number {
        return this.graphics.y;
    }

    set width(width: number) {
        this.graphics.width = width;
    }
    getWidth(): number {
        return this.graphics.width;
    }

    set height(height: number) {
        this.graphics.height = height;
    }
    getHeight(): number {
        return this.graphics.height;
    }

    set color(color: number) {
        this.graphics.tint = color;
    }
    getColor(): number {
        return this.graphics.tint;
    }
    set angle(angle: number) {
        this.graphics.angle = angle;
    }
    getAngle(): number {
        return this.graphics.angle;
    }
    set opacity(opacity: number) {
        this.graphics.alpha = opacity;
    }
    getOpacity(): number {
        return this.graphics.alpha;
    }

    public setOriginX(x: 0 | 1 | 2): void {
        const oldx = this.getX();
        this.x = 0;
        const offset = getOffset(x, this.getWidth());
        this.graphics.pivot.x = offset;
        this.x = oldx + offset;
    }
    public setOriginY(y: 0 | 1 | 2): void {
        const oldy = this.getY();
        this.y = 0;
        const offset = getOffset(y, this.getHeight());
        this.graphics.pivot.y = offset;
        this.y = oldy + offset;
    }
    public setOrigin(x: 0 | 1 | 2 | null = null, y: 0 | 1 | 2 | null = null): void {
        if (x !== null) {
            this.setOriginX(x);
        }
        if (y !== null) {
            this.setOriginY(y);
        }
    }
}
