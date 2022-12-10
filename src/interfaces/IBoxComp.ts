
import IRootComp from "./IRootComp";
//..
export default interface IBoxComp extends IRootComp {

    width: number;
    height: number;
    angle: number;

    pivotX: number;
    pivotY: number;

    pivotXAlign(x: 0 | 1 | 2): number;
    pivotYAlign(x: 0 | 1 | 2): number;

}