import * as LightweightCharts from "lightweight-charts";
import { ChartData, PlotConfig } from "Model/Contracts";

type TimeStamp = LightweightCharts.Nominal<number, 'UTCTimestamp'>;

enum Color {
    GreenCandle = "rgba(0, 150, 136, 0.3)",
    RedCandle = "rgba(255,82,82, 0.3)"
}

interface ChartSeries {
    candles: LightweightCharts.ISeriesApi<"Candlestick">;
    volume: LightweightCharts.ISeriesApi<"Histogram">;
    indicators: LightweightCharts.ISeriesApi<"Line" | "Area">[]
}

interface ChartUpdate {
    candles: LightweightCharts.BarData[];
    volume: LightweightCharts.HistogramData[];
    indicators: LightweightCharts.LineData[][];
}

export class Chart {

    private constructor() { }
    private obj: LightweightCharts.IChartApi;
    private series: ChartSeries;
    private size: {
        height: number,
        width: number
    }
    private container: HTMLDivElement;
    private dataInit: boolean = false;

    public static Create(container: HTMLDivElement, plotConfig: PlotConfig): Chart {

        let chartScale;
        let volumeScale;

        const indicatorScale = {
            top: 0.775,
            bottom: 0.025
        }

        if (plotConfig.IndicatorConfigs.length) {
            chartScale = {
                top: 0.05,
                bottom: 0.30,
            };
            volumeScale = {
                top: 0.55,
                bottom: 0.25
            };
        }
        else {
            chartScale = {
                top: 0.05,
                bottom: 0.05,
            }
            volumeScale = {
                top: 0.8,
                bottom: 0
            }
        }

        const chart = new Chart();

        chart.container = container;

        chart.size = {
            width: container.offsetWidth,
            height: container.offsetHeight,
        };

        const chartObj = chart.obj = LightweightCharts.createChart(container, {
            ...chart.size,
            priceScale: {
                scaleMargins: chartScale,
                borderVisible: false,
            },
            layout: {
                backgroundColor: '#131722',
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: 'rgba(42, 46, 57, 0)',
                },
                horzLines: {
                    color: 'rgba(42, 46, 57, 0.6)',
                },
            },
            timeScale: {
                timeVisible: true
            }
        });

        chart.series = {
            candles: null,
            volume: null,
            indicators: []
        };

        window['chartObj'] = chartObj; 

        chart.series.candles = chartObj.addCandlestickSeries();

        chart.series.volume = chartObj.addHistogramSeries({
            color: '#26a69a',
            lineWidth: 2,
            priceFormat: {
                type: 'volume',

            },
            overlay: true,
            scaleMargins: volumeScale,
        });

        plotConfig.IndicatorConfigs.forEach((config) => {

            const color = config.Color || "rgba(38,198,218, 0.5)"

            if (config.PlotType == 'Area') {
                chart.series.indicators.push(chartObj.addAreaSeries({
                    topColor: color,
                    bottomColor: color,
                    lineColor: color,
                    lineWidth: 2,
                    overlay: true,
                    scaleMargins: indicatorScale,
                    priceLineVisible: false,
                    lastValueVisible: false,
                    scaleGroup: "indicator"
                }));
            } else if (config.PlotType == 'Line') {
                chart.series.indicators.push(chartObj.addLineSeries({
                    color: color,
                    lineWidth: 2,
                    overlay: true,
                    scaleMargins: indicatorScale,
                    priceLineVisible: false,
                    lastValueVisible: false
                }));
            }
        });

        return chart;
    }

    public update(chartData: ChartData) {
        // It's given that length of candle update is same as length of indicator update

        const chartUpdate: ChartUpdate = {
            candles: [],
            volume: [],
            indicators: new Array(chartData.IndicatorData.length).fill(0).map(() => new Array())
        }

        let candleUpdate: (data: LightweightCharts.BarData) => void;
        let volumeUpdate: (data: LightweightCharts.HistogramData) => void;
        let indicatorUpdates: ((data: LightweightCharts.LineData) => void)[];

        if (!this.dataInit) {
            candleUpdate = chartUpdate.candles.unshift.bind(chartUpdate.candles);
            volumeUpdate = chartUpdate.volume.unshift.bind(chartUpdate.volume);
            indicatorUpdates = chartUpdate.indicators.map<(data: LightweightCharts.LineData) => void>((indicator) => indicator.unshift.bind(indicator) as any)
        } else {
            candleUpdate = this.series.candles.update.bind(this.series.candles);
            volumeUpdate = this.series.volume.update.bind(this.series.volume);
            indicatorUpdates = this.series.indicators.map((indicator) => indicator.update.bind(indicator));
        }

        for (let i = 0; i < chartData.Data.length; i++) {

            const candle = chartData.Data[chartData.Data.length - i - 1];
            const time = candle.StartTick / 1000 as TimeStamp;

            candleUpdate({
                open: candle.Open,
                close: candle.Close,
                high: candle.High,
                low: candle.Low,
                time,
                glyphs: []
            });

            volumeUpdate({
                time,
                color: candle.Open < candle.Close ? Color.GreenCandle : Color.RedCandle,
                value: candle.Volume
            });

            chartData.IndicatorData.forEach((indicator, index) => {
                const value = indicator[indicator.length - i - 1];
                if (value !== undefined && value !== NaN && value !== null) {
                    indicatorUpdates[index]({
                        time,
                        value
                    });
                }
            });
        }

        if (!this.dataInit) {
            this.series.candles.setData(chartUpdate.candles);
            this.series.volume.setData(chartUpdate.volume);

            this.series.indicators.forEach((indicator, index) => {
                indicator.setData(chartUpdate.indicators[index]);
            });

            this.dataInit = true;
        }

    }

    public resize() {
        const newSize = {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
        };

        if (newSize.width != this.size.width || newSize.height != this.size.height) {
            this.obj.applyOptions({
                ...newSize
            });
        }
    }
}