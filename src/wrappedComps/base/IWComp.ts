import { DisplayObject } from "pixi.js";

/**
 * The IDrawable interface needs to be implemented by an drawable component in this library.
 */

export default interface IWComp {
    //-8-dec-2021 7 public props
    x(x: number): number;
    y(y: number): number;
    width(width: number): number;
    height(height: number): number;
    color(color: number): number;
    angle(angle: number): number;
    opacity(opacity: number): number;

    //////////////////////////
    // update( ):void;
    getDrawable(): DisplayObject;
    pivot(x: 0 | 1 | 2 | null, y: 0 | 1 | 2 | null): void;
}
