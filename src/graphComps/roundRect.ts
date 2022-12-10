import BaseGraphComp from "../baseGraphComp/graphWrapper";
/////////////////////////////////////////////

export default class RoundRect extends BaseGraphComp {
    /////////////////////////////////////////
    constructor(width: number, height: number, radius: number = 10) {
        super();
        this.init(width, height, radius);
        /////////////////////////////
    }

    init(width: number, height: number, radius: number) {
        this.graphics.beginFill(0xffffff);

        this.graphics.drawRoundedRect(
            0, // dont use this.x in init since it accumulates
            0,
            width,
            height,
            radius,
        );
        this.graphics.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
