import * as React from 'react';
import { Strategy } from 'Model/Strategy/Strategy';
import { ConfigSelector } from './ConfigSelector';
import { TradeView } from './TradeView/TradeView';
import { BotConfiguration } from 'Model/BotConfiguration';
import { Plot, Trade } from 'Model/Data/Trading';
import { Series } from 'Model/Data/Series';

export interface PageProps {
    strategySelectedCallback: (config: BotConfiguration) => void;
    availableStrategies: string[];
    availableExchanges: string[];
    selectedExchange: string;
    selectedStrategy: string; 
    plots: Plot[];
    tradeBook: Series<Trade>;
}

export class Page extends React.Component<PageProps> {
    private selectedStrategy: Strategy;

    public render() {
        // if(this.selectedStrategy) {
            return <ConfigSelector strategySelectedCallback={this.props.strategySelectedCallback}/>
        // }
        // else return <TradeView Plot={this.selectedStrategy.}></TradeView>
    }

    private strategySelected
}