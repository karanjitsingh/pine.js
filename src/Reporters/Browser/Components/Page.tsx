import { PlatformConfiguration } from 'Model/Contracts';
import * as React from 'react';
import { Spinner } from './Spinner';
import { StrategyConfiguration, StrategyConfigurationProps } from './StrategyConfiguration';
import { TradeView, TradeViewProps } from './TradeView/TradeView';

export interface PageState {
    configProps?: {
        strategySelectCallback: (config: PlatformConfiguration) => void;
        availableStrategies: string[];
        availableExchanges: string[];
    };
    tradeViewProps?: TradeViewProps;
    pageMode: PageMode;
}

export enum PageMode {
    Configuration,
    Loading,
    View
}

export enum PageActions {
    RenderCharts = "render-charts"
}

export class Page extends React.Component<{}, PageState> {

    public constructor(props) {
        super(props);

        this.state = {
            pageMode: PageMode.Loading
        };
    }

    public render() {

        switch (this.state.pageMode) {
            case PageMode.Configuration:

                const configSelectorProps: StrategyConfigurationProps = {
                    availableExchanges: this.state.configProps.availableExchanges,
                    availableStrategies: this.state.configProps.availableStrategies,
                    submitCallback: this.strategySelected.bind(this),
                }
                
                return <StrategyConfiguration {...configSelectorProps} />
            case PageMode.Loading:
                return <Spinner />
            case PageMode.View:
                return <TradeView {...this.state.tradeViewProps} />
        }
    }

    private strategySelected(config: PlatformConfiguration) {

        this.setState({
            pageMode: PageMode.Loading
        });

        this.state.configProps.strategySelectCallback(config);
    }
}