
export default class Duration {
//the size of video-length in milli seconds         
private _pvt_duration_val :number; 
  
constructor(){
this._pvt_duration_val = 0; 
}
/**
 * The len function will return the length of the video in milli seconds by dafualt. we can get seconds using len(false).
 * The calculation of duration is in milli seoncds
 * @param inMilliSec 
 * @returns number
 */
public len(inMilliSec :boolean = true):number{
    if (inMilliSec){
        return (this._pvt_duration_val);
    }else {
        return (this._pvt_duration_val / 1000 );
    }
}
//14-may-2022-The only place to extend duration
public extend( MilliSec :number):number {
this._pvt_duration_val += MilliSec;
    return this._pvt_duration_val;
}
public set(MilliSec :number):number {
this._pvt_duration_val = MilliSec;
    return this._pvt_duration_val;
}

}//duration