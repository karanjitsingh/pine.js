import { Series } from "./Model/Series";
import { Stoch } from "./Model/Expressions/Expr";
import * as Chart from 'lightweight-charts';
import { Tick } from "./Model/Tick";
import { ByBitExchange } from "./Exchange/ByBit";
import { Resolution } from "./Exchange/IExchange";
import { resolve } from "path";


const close =  Series.Create([1,2,3])
const high =  Series.Create([5,8,11])
const low =  Series.Create([7,8,9])

// const stoch = Stoch(close, high.offset(1), low, 2);

const exchange = new ByBitExchange();

const time = new Date().getTime();

exchange.getData(time-Tick.Day, time, Resolution._30m).then((response) => {
    console.log("resolve");
    console.log(response);
}, (response) => {
    console.log("reject");
    console.log(response);
})
