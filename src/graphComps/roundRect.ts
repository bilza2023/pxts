// import BaseGraphComp from "../boxGraphComp/graphWrapper";
import BoxGraphComp from "../interfaces/boxGraphComp";
/////////////////////////////////////////////

export default class RoundRect extends BoxGraphComp {
    /////////////////////////////////////////
    constructor(width: number, height: number, radius: number = 10) {
        super();
        this.init(width, height, radius);
        /////////////////////////////
    }

    init(width: number, height: number, radius: number) {
        this.pixiObj.beginFill(0xffffff);

        this.pixiObj.drawRoundedRect(
            0, // dont use this.x in init since it accumulates
            0,
            width,
            height,
            radius,
        );
        this.pixiObj.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
