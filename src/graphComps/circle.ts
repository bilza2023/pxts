// import BaseGraphComp from "../boxGraphComp/boxGraphComp";
import BoxGraphComp from "../interfaces/boxGraphComp";
/////////////////////////////////////////////
export default class Rect extends BoxGraphComp {
    /////////////////////////////////////////
    constructor(diameter: number) {
        super();
        this.init(diameter);
        /////////////////////////////
    }

    init(width: number) {
        this.pixiObj.beginFill(0xffffff); // Red
        this.pixiObj.drawCircle(0, 0, width / 2);
        this.pixiObj.endFill();
    }
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
