import BaseGraphComp from "../baseGraphComp/graphWrapper";
/////////////////////////////////////////////

export default class Rect extends BaseGraphComp {
    /////////////////////////////////////////
    constructor(width: number, height: number) {
        super();
        this.init(width, height);
    }

    init(width: number, height: number) {
        this.graphics.beginFill(0xffffff);
        this.graphics.drawEllipse(0, 0, width, height);
        this.graphics.endFill();
    }
}
