import * as React from 'react';
import * as LighweightCharts from '../../lib/lightweight-charts';
import { Plot } from 'Model/Data/Trading';

export class Chart extends React.Component<Plot> {

    private chartContainerRef: React.RefObject<HTMLDivElement>;


    public constructor(props: Plot) {
        super(props);
        this.chartContainerRef = React.createRef<HTMLDivElement>();
    }

    public componentDidMount() {
        if(this.chartContainerRef.current) {
            LighweightCharts.createChart(this.chartContainerRef.current)
        }
        // charts.createChart(this.)
    }

    public shouldComponentUpdate() {
        return false;
    }

    public render() {
        return <div ref={this.chartContainerRef}></div>;
    }
}