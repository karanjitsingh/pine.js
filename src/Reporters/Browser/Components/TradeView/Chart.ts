import { PlotConfig, ChartData, PlotType } from "Model/Contracts";
import * as LightweightCharts from 'lib/lightweight-charts';

export class Chart {

    private constructor() { }
    private chartObj: LightweightCharts.IChartApi;
    private chartSeries: {
        candles: LightweightCharts.ISeriesApi<"Candlestick">;
        volume: LightweightCharts.ISeriesApi<"Histogram">;
        indicators: LightweightCharts.ISeriesApi<"Line" | "Area">[]
    }

    public Create(container: HTMLElement, plotConfig: PlotConfig): Chart {

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
            width: 600,
            height: 300,
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
            if (config.PlotType == PlotType.Area) {
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
            } else if (config.PlotType == PlotType.Line) {
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

    }

    private scale = {

    }


}