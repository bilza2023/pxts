import { Graphics } from "pixi.js";
import IComponent from "../common/IComponent";
/**
 * The IDrawable interface needs to be implemented by an drawable component in this library.
 */

export default interface   extends IComponent {
    //-8-dec-2021 7 public props
    pixiObj:Graphics;
    width: number;
    height: number;
    angle: number;

    //////////////////////////

    pivotX: number;
    pivotY: number;

    pivotXAlign(x: 0 | 1 | 2): number;
    pivotYAlign(x: 0 | 1 | 2): number;
}