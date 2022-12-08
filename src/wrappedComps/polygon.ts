import BaseWrapper from "./base/baseWrapper";
/////////////////////////////////////////////

export default class Polygon extends BaseWrapper {
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

        this.graphics.beginFill(this.getColor());

        this.graphics.drawPolygon(this.points);
        //======================================
        this.graphics.endFill();
        //======================================
    }

    addPoint(x: number, y: number) {
        this.points.push(x);
        this.points.push(y);
    }
}
