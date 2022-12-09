import { DisplayObject } from "pixi.js";

/**
 * The IDrawable interface needs to be implemented by an drawable component in this library.
 */

export default interface IGraphComp {
    //-8-dec-2021 7 public props
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
    angle: number;
    opacity: number;

    //////////////////////////
    // update( ):void;
    getDrawable(): DisplayObject;

    originX: number;
    originY: number;
    originXAlign(x: 0 | 1 | 2): number;
    originYAlign(x: 0 | 1 | 2): number;
}
