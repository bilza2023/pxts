// import BaseGraphComp from "../boxGraphComp/boxGraphComp";
import BoxGraphComp from "../interfaces/boxGraphComp";
///////////////////////////////////////////// 
export default class Rect extends BoxGraphComp {
    /////////////////////////////////////////
    constructor(diameter: number) {
        super();
        this.init(diameter);
        /////////////////////////////
    }

    init(width: number) {
        this.pixiObj.beginFill(0xffffff); // Red
        this.pixiObj.drawCircle(0, 0, width / 2);
        this.pixiObj.endFill();
    }
    set width(width: number) {
        this.pixiObj.width = width;
        //--This one sentence bugged me for months
        this.pixiObj.height = width;
    }
    get width(): number {
        return this.pixiObj.width;
    }
    //@ts-expect-error //first correct use of expect-error
    set height(height: number) {
        //--do nothing
    }
    get height(): number {
        //--for circle height and width is the same
        return this.pixiObj.width;
    }
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
