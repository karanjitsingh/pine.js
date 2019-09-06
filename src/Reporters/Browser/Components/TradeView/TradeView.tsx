import * as React from 'react';
import SplitWrapper from '../../lib/react-split';
import { TradeLog } from './TradeLog';
import { ReporterData, PlotConfigMap } from "Model/Contracts";
import { DataStream } from 'DataStream';
import { Spinner } from 'Components/Spinner';
import { Chart } from './Chart';

export interface TradeViewProps {
    dataStream: DataStream<ReporterData>,
    Plot: PlotConfigMap
}

interface TradeViewState {
    dataInit: boolean
}

type MappedChart = {[id: string]: React.RefObject<Chart>};

export class TradeView extends React.Component<TradeViewProps, TradeViewState> {

    private chartSplit: JSX.Element;
    private chartRefMap: MappedChart;

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
        // this.chartSplit = this.getChartSplit(this.props.dataStream.pop());
    }

    public render() {
        if(!this.chartSplit && this.state.dataInit) {
            this.chartSplit = this.getChartSplit(this.props.Plot);
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

    private getChartSplit(plotConfig: PlotConfigMap): JSX.Element {
        const plots = Object.keys(plotConfig);
        const chartCount = plots.length;
        
        const sizes = new Array(chartCount).fill(Math.floor(100/chartCount));
        const sum = sizes.reduce((total, value) => (total + value));

        sizes[0] += 100 - sum;

        this.chartRefMap = plots.reduce<MappedChart>((map, id) => {
            map[id] = React.createRef<Chart>();
            return map;
        }, {});
        
        const charts = plots.map((id) => (<Chart ref={this.chartRefMap[id]}></Chart>));

        return (
            <SplitWrapper sizes={sizes} minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                {charts}
            </SplitWrapper>
        );
    }
}