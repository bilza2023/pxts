import IComponent from "../common/IComponent";
import { Graphics } from "pixi.js";

/**
 * The IGraphComp interface extends IComponent.
 * adds graphics specific props
 * overwrite pixiObj to Graphics
 */

export default interface IGraphComp extends IComponent {
    //--over written
    pixiObj: Graphics;
    width: number;
    height: number;
    angle: number;

    //////////////////////////

    pivotX: number;
    pivotY: number;

    pivotXAlign(x: 0 | 1 | 2): number;
    pivotYAlign(x: 0 | 1 | 2): number;
}
