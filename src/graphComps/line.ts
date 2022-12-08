import BaseGraphComp from "../baseGraphComp/baseGraphComp";
/////////////////////////////////////////////

export default class Line extends BaseGraphComp {
    public _y: number;
    public x2: number;
    public y2: number;
    public lineWidth: number;
    /////////////////////////////////////////
    constructor(x: number, y: number, x2: number, y2: number) {
        super();
        this._y = y;
        this.x2 = x2;
        this.y2 = y2;
        this.lineWidth = 2;
        this.init(x, y, x2, y2);
        /////////////////////////////
    }

    init(x: number, y: number, x2: number, y2: number) {
        this.graphics.clear();
        this.graphics.lineStyle(this.lineWidth, 0xffffff);
        this.graphics.moveTo(x, y);
        this.graphics.lineTo(x2, y2);
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    set x(x: number) {
        this.init(x, this._y, this.x2, this.y2);
    }
}
