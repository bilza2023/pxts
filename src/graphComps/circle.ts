import BaseGraphComp from "../baseGraphComp/graphWrapper";
/////////////////////////////////////////////
export default class Rect extends BaseGraphComp {
    /////////////////////////////////////////
    constructor(diameter: number) {
        super();
        this.init(diameter);
        /////////////////////////////
    }

    init(width: number) {
        this.graphics.beginFill(0xffffff); // Red
        this.graphics.drawCircle(0, 0, width / 2);
        this.graphics.endFill();
    }
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
