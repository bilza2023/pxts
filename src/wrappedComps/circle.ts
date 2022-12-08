import BaseWrapper from "./base/baseWrapper";
/////////////////////////////////////////////

export default class Rect extends BaseWrapper {
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
