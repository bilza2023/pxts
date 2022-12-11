// import BaseGraphComp from "../boxGraphComp/graphWrapper";
import BoxGraphComp from "../interfaces/boxGraphComp";
/////////////////////////////////////////////

export default class RoundRect extends BoxGraphComp {
    /////////////////////////////////////////
    private _width :number;
    private _height :number;
    private _radius :number;
    constructor(width: number, height: number, radius: number = 10) {
        super();
        this._width = width
        this._height = height
        this._radius = radius
        this.init( );
        /////////////////////////////
    }

    init() {
        this.pixiObj.clear();
        this.pixiObj.beginFill(0xffffff);

        this.pixiObj.drawRoundedRect(
            0, // dont use this.x in init since it accumulates
            0,
            this._width,
            this._height,
            this._radius,
        );
        this.pixiObj.endFill();
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    set radius(radius :number){
    this._radius = radius;
    this.init();
    }
    get radius(){
        return this._radius;
    }
}
