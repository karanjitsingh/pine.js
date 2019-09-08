import { Spinner } from 'Components/Spinner';
import { Chart } from 'Components/TradeView/Chart';
import { TradeLog } from 'Components/TradeView/TradeLog';
import { DataStream } from 'DataStream';
import SplitWrapper from 'lib/react-split';
import { ChartData, PlotConfigMap } from "Model/Contracts";
import * as React from 'react';

export interface TradeViewProps {
    dataStream: DataStream<{[id: string]: ChartData}>,
    plotConfigMap: PlotConfigMap
}

type MappedContainer = {[id: string]: React.RefObject<HTMLDivElement>};
type MappedChart = {[id: string]: Chart};

export class TradeView extends React.Component<TradeViewProps> {

    private chartSplit: JSX.Element;
    private chartContainerMap: MappedContainer;
    private chartMap: MappedChart;
    private chartLoaded: boolean;

    constructor(props) {
        super(props);

        this.props.dataStream.addEventListener('data', this.dataListener.bind(this));
    }

    public dataListener() {
        this.props.dataStream.flush()
    }

    public render() {
        if(!this.chartSplit) {
            this.chartSplit = this.getChartSplit(this.props.plotConfigMap);
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

    public componentDidMount() {
        if(this.chartContainerMap && !this.chartMap && !this.chartLoaded) {
         
            this.chartMap = Object.keys(this.chartContainerMap).reduce((map, key) => {
                map[key] = Chart.Create(this.chartContainerMap[key].current, this.props.plotConfigMap[key]);
                return map;
            }, {});

            this.chartLoaded = true;
        }
    }

    private getChartSplit(plotConfig: PlotConfigMap): JSX.Element {
        const plotIds = Object.keys(plotConfig);
        const chartCount = plotIds.length;
        
        const sizes = new Array(chartCount).fill(Math.floor(100/chartCount));
        const sum = sizes.reduce((total, value) => (total + value));

        sizes[0] += 100 - sum;

        this.chartContainerMap = plotIds.reduce<MappedContainer>((map, id) => {
            map[id] = React.createRef<HTMLDivElement>();
            return map;
        }, {});
        
        const charts = plotIds.map((id) => (<div ref={this.chartContainerMap[id]}></div>));

        return (
            <SplitWrapper sizes={sizes} minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                {charts}
            </SplitWrapper>
        );
    }
}