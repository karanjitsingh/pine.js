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

    private appliedSeries: Series;

    public constructor(props: ChartProps) {
        super(props);
        this.chartContainerRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount() {
        const container = this.chartContainerRef.current;
        
        if (container && !this.chart) {
            container.onresize = this.chartResize.bind(this);


            
            this.chart = LightweightCharts.createChart(container, {
                width: container.offsetWidth,
                height: container.offsetHeight,
                priceScale: {
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.25,
                    },
                    borderVisible: false,
                },
                layout: {
                    backgroundColor: '#131722',
                    textColor: '#d1d4dc',
                },
            })

            this.props.data.Data

            this.appliedSeries.mainSeries = this.chart.addCandlestickSeries()

            // var series = this.chart.addAreaSeries({

            // })
        }
    }

    public shouldComponentUpdate(nextProps: ChartProps) {
        if (this.chart) {

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
        if(this.chart && this.chartContainerRef.current) {
            this.chart.applyOptions({
                width: this.chartContainerRef.current.offsetWidth,
                height: this.chartContainerRef.current.offsetHeight
            })
        }
    }
}