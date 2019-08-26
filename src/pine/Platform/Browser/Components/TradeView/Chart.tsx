import * as React from 'react';
import * as LightweightCharts from '../../lib/lightweight-charts';
import { Plot } from 'Model/Data/Trading';
import { ChartData } from 'Model/Platform/Contracts';

export class ChartProps {
    data: ChartData;
}

interface Series {
    mainSeries: LightweightCharts.ISeriesApi<'Candlestick'>;
    volumeData: LightweightCharts.ISeriesApi<'Histogram'>;
    indicators: LightweightCharts.ISeriesApi<'Line' | 'Area'>[];
}

export class Chart extends React.Component<ChartProps> {

    private chartContainerRef: React.RefObject<HTMLDivElement>;
    private chart: LightweightCharts.IChartApi;

    private series: LightweightCharts.ISeriesApi<any>[]

    public constructor(props: ChartProps) {
        super(props);
        this.chartContainerRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount() {
        if(this.chartContainerRef.current) {
            this.chartContainerRef.current.onresize = this.chartResize.bind(this);

            this.chart = LightweightCharts.createChart(this.chartContainerRef.current)
            var series = this.chart.addAreaSeries({

            })

            // this.chart.priceScale().
        }
    }

    public shouldComponentUpdate(nextProps: ChartProps) {
        if(this.chart) {
            
            return false;
        }

        return true;
    }

    public render() {
        return <div ref={this.chartContainerRef}></div>;
    }

    private updateChart(data: ChartData) {
        // this.chart.
    }

    private chartResize() {

    }
}