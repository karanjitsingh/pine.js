import { Series } from "./Model/Data/Series";
import * as Chart from 'lightweight-charts';
import { ByBitExchange } from "./Exchange/ByBit/ByBit";
import { resolve } from "path";

// const close =  Series.Create([1,2,3])
// const high =  Series.Create([5,8,11])
// const low =  Series.Create([7,8,9])

// const stoch = Stoch(close, high.offset(1), low, 2);

// const exchange = new ByBitExchange();

// const time = new Date().getTime();

// exchange.getData(time-Tick.Day, time, Resolution._30m).then((response) => {
//     console.log("resolve");
//     console.log(response);
// }, (response) => {
//     console.error("")
// })
