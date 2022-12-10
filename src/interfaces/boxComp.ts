import { Graphics,Text as PixiText,Sprite } from "pixi.js";
// import IBoxComp from "./IBoxComp";
import RootComp from "./rootComp";

export default class BoxComp extends RootComp   {
    
orignalX: number;
orignalY: number;
//..
    constructor(pixiObj :Graphics | PixiText | Sprite) {

super(pixiObj);
this.orignalX = 0;
this.orignalY = 0;
}
//--OVER-RIDE  parent
    set x(x: number) {
        this.orignalX = x;
        this.pixiObj.x = this.orignalX + this.pixiObj.pivot.x;
    }
    get x(): number {
        return this.orignalX;
    }
    //===Y
    set y(y: number) {
        this.orignalY = y;
        this.pixiObj.y = this.orignalY + this.pixiObj.pivot.y;
    }
    get y(): number {
        return this.orignalY;
    }

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
    set angle(angle: number) {
        this.pixiObj.angle = angle;
    }
    get angle(): number {
        return this.pixiObj.angle;
    }
    /////////////////////////////////////////
    set pivotX(x: number) {
        this.pixiObj.x = 0;
        this.pixiObj.pivot.x = x;
        this.pixiObj.x = this.orignalX + this.pixiObj.pivot.x;
    }

    get pivotX() {
        return this.pixiObj.pivot.x;
    }

    ////////////////////////////
    set pivotY(y: number) {
        this.pixiObj.y = 0;
        this.pixiObj.pivot.y = y;
        this.pixiObj.y = this.orignalY + this.pixiObj.pivot.y;
    }

    get pivotY() {
        return this.pixiObj.pivot.y;
    }
    ////////////////////////////////////
    public pivotXAlign(x: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(x, this.width);
        this.pivotX = 0;
        this.pivotX = sum;
        return this.pivotX;
    }

    public pivotYAlign(y: 0 | 1 | 2): number {
        const sum = this.zeroFiftyHundred(y, this.height);
        this.pivotY = 0;
        this.pivotY = sum;
        return this.pivotY;
    }

    ////////////////////////////
    zeroFiftyHundred(offset: 0 | 1 | 2, widthHeight: number): number {
        let ret = 0;
        switch (offset) {
            case 0:
                ret = 0;
                break;
            case 1:
                ret = widthHeight / 2;
                break;
            case 2:
                ret = widthHeight;
                break;
        }
        return ret;
    }
   
    
}
