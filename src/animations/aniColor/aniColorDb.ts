import AniPropDb from "../aniProp/aniPropDb";


export default class AniColorDb extends AniPropDb<string>{


    constructor(initialValue: string) {
        super(initialValue)
    }
    random(startSec: number, endSec: number, delay: number) {
        //----not implemented yet
    }
}