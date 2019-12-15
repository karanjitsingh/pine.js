const https = require('https');

const Tick = {};
Tick.Second = 1;
Tick.Minute = Tick.Second * 60;
Tick.Hour = Tick.Minute * 60;
Tick.Day = Tick.Hour * 24;
Tick.Week = Tick.Day * 7;

const GetResolutionTick = (resolution) => {
    console.log(resolution);
    const match = resolution.match(/^([0-9]+)(.)$/);
    if(!match) {
        throw new Error(`Invalid resolution '${resolution}'`);
    }

    const quantum = parseInt(match[1]);

    switch(match[2]) {
        case "m":
            return Tick.Minute * quantum;
        case "h":
            return Tick.Hour * quantum;
        case "d":
            return Tick.Day * quantum;
        case "w":
            return Tick.Week * quantum;
        default:
            throw new Error(`Unsupported resolution '${resolution}'`);
    }
}

const resolutionMap = (res) => {
    const tickValue = GetResolutionTick(res);

    switch (res) {
        case "1m":
            return ["1", tickValue];
        case "3m":
            return ["3", tickValue];
        case "5m":
            return ["5", tickValue];
        case "15m":
            return ["15", tickValue];
        case "30m":
            return ["30", tickValue];
        case "1h":
            return ["60", tickValue];
        case "2h":
            return ["120", tickValue];
        case "4h":
            return ["240", tickValue];
        case "1d":
            return ["D", Tick.Day];
        default:
            throw new Error("Unsupported resolution for getting base data");
    }
}

const urlBuilder = (candleLength, resolution) => {
    const [res, tickInterval] = resolutionMap(resolution);

    const toTime = parseInt(new Date().getTime() / 1000);
    const fromTime = toTime - tickInterval * candleLength;

    const url = `https://api.bybit.com/v2/public/kline/list?symbol=BTCUSD&interval=${res}&from=${fromTime}&to=${toTime}`;

    console.log(url);
}

const getCandle = module.exports = function (resolution, candleLength) {
    const url = urlBuilder(candleLength, resolution);

    let data = "";
    console.log(url);

    return new Promise((resolve) => {
        https.get(url, (resp) => {

            resp.on('data', function (chunk) {
                data += chunk;
            });
            
            resp.on('end', function() {
                resolve(data);
            });
        })
    })

}

getCandle('30m', 1000).then((data) => {
    console.log(data);
});
