import BaseGraphComp from "../baseGraphComp/baseGraphComp";
/////////////////////////////////////////////

export default class Rect extends BaseGraphComp {
    /////////////////////////////////////////
    constructor(width: number, height: number) {
        super();
        this.init(width, height);
        /////////////////////////////
    }

    init(width: number, height: number) {
        this.graphics.beginFill(0xffffff);
        this.graphics.drawRect(
            0, // dont use this.x in init since it accumulates
            0,
            width,
            height,
        );
        this.graphics.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
