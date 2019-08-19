import * as React from 'react';
import SplitWrapper from '../../lib/react-split';
import { TradeLog } from './TradeLog';
import { Plot, Trade } from 'Model/Data/Trading';
import { Series } from 'Model/Data/Series';

export interface StrategyViewerProps {
    Plot: Plot[];
    TradeBook: Series<Trade>;
}

export class TradeView extends React.Component<StrategyViewerProps> {
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