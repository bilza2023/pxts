// import BaseGraphComp from "../boxGraphComp/graphWrapper";
import BoxGraphComp from "../interfaces/boxGraphComp";
/////////////////////////////////////////////

export default class Rect extends BoxGraphComp {
    /////////////////////////////////////////
    constructor(width: number, height: number) {
        super();
        this.init(width, height);
    }

    init(width: number, height: number) {
        this.pixiObj.beginFill(0xffffff);
        this.pixiObj.drawEllipse(0, 0, width, height);
        this.pixiObj.endFill();
    }
}
