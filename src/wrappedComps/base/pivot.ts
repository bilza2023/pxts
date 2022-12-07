//////////////////////////////////////////
export default class Pivot {
    protected pvtOffsetX: 0 | 1 | 2;
    protected pvtOffsetY: 0 | 1 | 2;

    //----------------------------------------
    constructor() {
        this.pvtOffsetX = 0;
        this.pvtOffsetY = 0;
    }

    //-----------------------------------------------
    public pivot(x: 0 | 1 | 2 | null = null, y: 0 | 1 | 2 | null = null): void {
        if (x !== null) {
            this.pvtOffsetX = x;
        }
        if (y !== null) {
            this.pvtOffsetY = y;
        }
    }
    //getPivotX
    protected getPivotX(width: number): number {
        let ret = 0;
        switch (this.pvtOffsetX) {
            case 0:
                ret = 0;
                break;
            case 1:
                ret = width / 2;
                break;
            case 2:
                ret = width;
                break;
        }
        return ret;
    }
    //getPivotY
    protected getPivotY(height: number): number {
        let ret = 0;
        switch (this.pvtOffsetY) {
            case 0:
                ret = 0;
                break;
            case 1:
                ret = height / 2;
                break;
            case 2:
                ret = height;
                break;
        }
        return ret;
    }
}
