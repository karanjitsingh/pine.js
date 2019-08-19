import * as React from 'react';
import SplitWrapper from '../lib/react-split';
import { TradeLog } from './TradeLog';
import { Plot } from 'Model/Data/Trading';

export interface StrategyViewerProps {
    Plot : Plot[];
}

export class StrategyViewer extends React.Component<StrategyViewerProps> {

    

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