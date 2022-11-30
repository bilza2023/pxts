import BaseFilter from "../../filters/baseFilter";

export default class BaseStringFilter extends BaseFilter<string> {

    constructor(
        rTimeMsStart: number,
        rTimeMsEnd: number,
        startValue: string,
        endValue: string,
        delaySec: number = 0) {

        super(rTimeMsStart, rTimeMsEnd, startValue, endValue, delaySec);
    }


}