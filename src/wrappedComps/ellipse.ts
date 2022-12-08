import BaseWrapper from "./base/baseWrapper";
/////////////////////////////////////////////

export default class Rect extends BaseWrapper {
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
