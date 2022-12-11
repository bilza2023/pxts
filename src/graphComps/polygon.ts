import BoxGraphComp from "../interfaces/boxGraphComp";
/////////////////////////////////////////////

export default class Polygon extends BoxGraphComp {
    /////////////////////////////////////////
    public points: number[];
    constructor() {
        super();
        this.points = [];
        /////////////////////////////
    }

    init() {
        if (this.points.length < 6) {
            throw new Error("a polygon needs atleast 6 points to draw");
        }

        this.pixiObj.beginFill(this.color);

        this.pixiObj.drawPolygon(this.points);
        //======================================
        this.pixiObj.endFill();
        //======================================
    }
   

    addPoint(x: number, y: number) {
        this.points.push(x);
        this.points.push(y);
    }
}
