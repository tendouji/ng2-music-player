import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeConverter'
})
export class TimeConverterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let minutes = Math.floor(value / 60),
      seconds = Math.round(value - (minutes * 60));
    return this.pad(minutes, 2) + ':' + this.pad(seconds, 2);
  }

  pad(num, size) {
    let s = '000000000' + num;
    return s.substr(s.length-size);
  }

}
