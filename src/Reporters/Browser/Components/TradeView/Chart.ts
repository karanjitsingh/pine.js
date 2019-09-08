import * as LightweightCharts from 'lib/lightweight-charts';
import { ChartData, PlotConfig } from "Model/Contracts";

type TimeStamp = LightweightCharts.Nominal<number, 'UTCTimestamp'>;

enum Color {
    GreenCandle = "rgba(0, 150, 136, 0.8)",
	RedCandle = "rgba(255,82,82, 0.8)"
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
    private chartObj: LightweightCharts.IChartApi;
    private chartSeries: ChartSeries;

    public static Create(container: HTMLElement, plotConfig: PlotConfig): Chart {

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

        const chartObj = chart.chartObj = LightweightCharts.createChart(container, {
            width: container.offsetWidth,
            height: container.offsetHeight,
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
        });

        container.onresize = () => {
            chartObj.applyOptions({
                height: container.offsetHeight,
                width: container.offsetWidth
            });
        }

        chart.chartSeries.candles = chartObj.addCandlestickSeries();

        chart.chartSeries.volume = chartObj.addHistogramSeries({
            color: '#26a69a',
            lineWidth: 2,
            priceFormat: {
                type: 'volume',

            },
            overlay: true,
            scaleMargins: volumeScale,
        });

        plotConfig.IndicatorConfigs.forEach((config) => {
            if (config.PlotType == 'Area') {
                chart.chartSeries.indicators.push(chartObj.addAreaSeries({
                    topColor: 'rgba(38,198,218, 0.56)',
                    bottomColor: 'rgba(38,198,218, 0.04)',
                    lineColor: 'rgba(38,198,218, 1)',
                    lineWidth: 2,
                    overlay: true,
                    scaleMargins: indicatorScale,
                    priceLineVisible: false,
                    lastValueVisible: false
                }));
            } else if (config.PlotType == 'Line') {
                chart.chartSeries.indicators.push(chartObj.addLineSeries({
                    color: 'rgba(38,198,218, 1)',
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

    public Update(chartData: ChartData) {
        // It's given that length of candle update is same as length of indicator update

        const chartUpdate: ChartUpdate = {
            candles: [],
            volume: [],
            indicators: new Array(chartData.IndicatorData.length).fill([])
        }

        for(let i = 0; i < chartData.Data.length; i++) {

            const candle = chartData.Data[chartData.Data.length - i - 1];
            const time = candle.startTick as TimeStamp;

            chartUpdate.candles.unshift({
                open: candle.open,
                close: candle.close,
                high: candle.high,
                low: candle.low,
                time
            });

            chartUpdate.volume.unshift({
                time,
                color: candle.open < candle.close ? Color.GreenCandle : Color.RedCandle,
                value: candle.volume
            });

            chartData.IndicatorData.forEach((indicator, index) => {
                const value = indicator[indicator.length - i -1];
                if(value !== undefined && value !== NaN) {
                    chartUpdate.indicators[index].unshift({
                        time,
                        value
                    });
                }
            });
        }

        this.chartSeries.candles.setData(chartUpdate.candles);
        this.chartSeries.volume.setData(chartUpdate.volume);

        this.chartSeries.indicators.forEach((indicator, index) => {
            indicator.setData(chartUpdate.indicators[index]);
        });
    }
}