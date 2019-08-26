import * as React from 'react';
import SplitWrapper from '../../lib/react-split';
import { TradeLog } from './TradeLog';
import { ReporterData } from "Model/Contracts";

export interface TradeViewProps {
    data: ReporterData,
}

export class TradeView extends React.Component<TradeViewProps> {

    public shouldComponentUpdate() {
        return false;
    }

    public render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <SplitWrapper sizes={[70, 30]} minSize={100} dragInterval={1} gutterSize={5} direction={"horizontal"}>
                    {this.getChartSplit(this.props.data)}
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

        return (
            <SplitWrapper minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                <div>a</div>
                <div>a</div>
            </SplitWrapper>
        );
    }
}