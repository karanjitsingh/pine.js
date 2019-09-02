import * as React from 'react';
import SplitWrapper from '../../lib/react-split';
import { TradeLog } from './TradeLog';
import { ReporterData } from "Model/Contracts";
import { DataStream } from 'DataStream';
import { Spinner } from 'Components/Spinner';
import { Chart } from './Chart';

export interface TradeViewProps {
    dataStream: DataStream<ReporterData>,
}

interface TradeViewState {
    dataInit: boolean
}

export class TradeView extends React.Component<TradeViewProps, TradeViewState> {

    private chartSplit: JSX.Element;
    private chartRefs: React.RefObject<Chart>[];

    public shouldComponentUpdate() {
        return false;
    }

    constructor(props) {
        super(props);

        this.state = {
            dataInit: false
        };

        this.props.dataStream.addEventListener('data', this.dataListener.bind(this));
    }

    public dataListener() {
        this.chartSplit = this.getChartSplit(this.props.dataStream.pop());
    }

    public render() {
        if(!this.chartSplit && this.state.dataInit) {
            this.chartSplit = this.getChartSplit(this.props.dataStream.pop());
        }

        return (
            <div style={{ height: "100%", width: "100%" }}>
                <SplitWrapper sizes={[70, 30]} minSize={100} dragInterval={1} gutterSize={5} direction={"horizontal"}>
                    { !this.chartSplit ? <Spinner></Spinner> : this.chartSplit }
                    <TradeLog></TradeLog>
                </SplitWrapper>
            </div>
        )
    }

    private getChartSplit(reporterData: ReporterData): JSX.Element {
        const chartCount = reporterData.Charts.length;
        
        const sizes = new Array(chartCount).fill(Math.floor(100/chartCount));
        const sum = sizes.reduce((total, value) => (total + value));

        sizes[0] += 100 - sum;

        this.chartRefs = reporterData.Charts.map((chartData) => React.createRef<Chart>());
        
        const charts = reporterData.Charts.map((chartData, index) => (<Chart ref={this.chartRefs[index]} data={chartData}></Chart>));

        return (
            <SplitWrapper sizes={sizes} minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                {charts}
            </SplitWrapper>
        );
    }
}