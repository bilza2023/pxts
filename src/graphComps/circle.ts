import BaseGraphComp from "./base/baseGraphComp";
/////////////////////////////////////////////

export default class Rect extends BaseGraphComp {
    /////////////////////////////////////////
    constructor(radius: number) {
        super();
        this.init(radius / 2);
        /////////////////////////////
    }

    init(radius: number) {
        this.graphics.beginFill(0xffffff); // Red
        this.graphics.drawCircle(0, 0, radius); // drawCircle(x, y, radius)
        this.graphics.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
