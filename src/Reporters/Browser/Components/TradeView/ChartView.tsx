import * as LightweightCharts from 'lib/lightweight-charts';
import { ChartData } from 'Model/Contracts';
import * as React from 'react';

interface Series {
    mainSeries: LightweightCharts.ISeriesApi<'Candlestick'>;
    volumeData: LightweightCharts.ISeriesApi<'Histogram'>;
    indicators: LightweightCharts.ISeriesApi<'Line' | 'Area'>[];
}

export class ChartView extends React.Component {

    private chartContainerRef: React.RefObject<HTMLDivElement>;
    private chart: LightweightCharts.IChartApi;

    private appliedSeries: Series;

    public constructor() {
        super({});
        this.chartContainerRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount() {
        const container = this.chartContainerRef.current;
        
        if (container && !this.chart) {
            container.onresize = this.chartResize.bind(this);

        }
    }

    public render() {
        return <div ref={this.chartContainerRef}></div>;
    }

    private updateChart(data: ChartData) {
        // this.chart.
    }

    private chartResize() {
        if(this.chart && this.chartContainerRef.current) {
            this.chart.applyOptions({
                width: this.chartContainerRef.current.offsetWidth,
                height: this.chartContainerRef.current.offsetHeight
            })
        }
    }
}