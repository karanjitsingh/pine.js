import * as React from 'react';
import SplitWrapper from '../../lib/react-split';
import { TradeLog } from './TradeLog';
import { ReporterData } from 'Model/Platform/Reporter';

export interface TradeViewProps {
    data: ReporterData
}

export class TradeView extends React.Component<TradeViewProps> {
    render() {
        return (
            <div style={{height: "100%", width: "100%"}}>
                <SplitWrapper sizes={[70,30]} minSize={100} dragInterval={1} gutterSize={5} direction={"horizontal"}>
                    <SplitWrapper minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                        <div>a</div>
                        <div>a</div>
                    </SplitWrapper>
                    <TradeLog></TradeLog>
                </SplitWrapper>
            </div>
        )
    }
}