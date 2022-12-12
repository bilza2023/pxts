// import BaseGraphComp from "../boxGraphComp/graphWrapper";
import BoxGraphComp from "../coreComps/boxGraphComp";
/////////////////////////////////////////////

export default class Line extends BoxGraphComp {
    private _x1: number;
    private _y1: number;
    private _x2: number;
    private _y2: number;
    private _lineWidth: number;
    /////////////////////////////////////////
    constructor(x1: number, y1: number, x2: number, y2: number, color: number = 0x000000, lineWidth: number = 1) {
        super();
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        this.color = color;
        this._lineWidth = lineWidth;

        this.init();
        /////////////////////////////
    }

    init() {
        this.pixiObj.clear();

        this.pixiObj.lineStyle(this._lineWidth, this.color);
        this.pixiObj.moveTo(this._x1, this._y1);
        this.pixiObj.lineTo(this._x2, this._y2);
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    set x1(x1: number) {
        this._x1 = x1;
        this.init();
    }
    get x1() {
        return this._x1;
    }

    set y1(y1: number) {
        this._y1 = y1;
        this.init();
    }
    get y1() {
        return this._y1;
    }

    set x2(x2: number) {
        this._x2 = x2;
        this.init();
    }
    get x2() {
        return this._x2;
    }

    set y2(y2: number) {
        this._y2 = y2;
        this.init();
    }
    get y2() {
        return this._y2;
    }

    set lineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.init();
    }
    get lineWidth() {
        return this._lineWidth;
    }
}
