import { Series } from "./Model/Series";
import { Stoch } from "./Model/Expressions/Expr";
import * as Chart from 'lightweight-charts';
import { Tick } from "./Model/Tick";
import { Network } from './Network/Network';


const close =  Series.Create([1,2,3])
const high =  Series.Create([5,8,11])
const low =  Series.Create([7,8,9])

const stoch = Stoch(close, high.offset(1), low, 2);


const currentTick = new Date().getTime()

const endpoint = `https://api2.bybit.com/kline/list?symbol=BTCUSD&resolution=30&from=${currentTick - Tick.Day}to=${currentTick}`;


const network = Network.getNetwork();

network.get