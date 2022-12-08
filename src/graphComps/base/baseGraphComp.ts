import { Graphics, DisplayObject } from "pixi.js";
import IGraphComp from "./IGraphComp";
import getOffset from "./offset";
/////////////////////////////////////////////

export default class BaseGraphComp implements IGraphComp {
    protected graphics: Graphics;
    public readonly id: string;
    //------

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

    // this.graphics.pivot.x = this.getPivotX(this.width);
    // this.graphics.pivot.y = this.getPivotY(this.height);
    // this.graphics.x = this.x + this.getPivotX(this.width);
    // this.graphics.y = this.y + this.getPivotY(this.height);

    x(x: number): number {
        this.graphics.x = x;
        return this.graphics.x;
    }
    getX(): number {
        return this.graphics.x;
    }
    y(y: number): number {
        this.graphics.y = y;
        return this.graphics.y;
    }
    getY(): number {
        return this.graphics.y;
    }
    width(width: number): number {
        this.graphics.width = width;
        return this.graphics.width;
    }
    getWidth(): number {
        return this.graphics.width;
    }
    height(height: number): number {
        this.graphics.height = height;
        return this.graphics.height;
    }
    getHeight(): number {
        return this.graphics.height;
    }
    color(color: number): number {
        this.graphics.tint = color;
        return this.graphics.tint;
    }
    getColor(): number {
        return this.graphics.tint;
    }
    angle(angle: number): number {
        this.graphics.angle = angle;
        return this.graphics.angle;
    }
    getAngle(): number {
        return this.graphics.angle;
    }
    opacity(opacity: number): number {
        this.graphics.alpha = opacity;
        return this.graphics.alpha;
    }
    getOpacity(): number {
        return this.graphics.alpha;
    }

    public setOriginX(x: 0 | 1 | 2): void {
        const oldx = this.getX();
        this.x(0);
        const offset = getOffset(x, this.getWidth());
        this.graphics.pivot.x = offset;
        this.x(oldx + offset);
    }
    public setOriginY(y: 0 | 1 | 2): void {
        const oldy = this.getY();
        this.y(0);
        const offset = getOffset(y, this.getHeight());
        this.graphics.pivot.y = offset;
        this.y(oldy + offset);
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
