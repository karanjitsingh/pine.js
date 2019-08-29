import * as React from 'react';
import { TradeView, TradeViewProps } from './TradeView/TradeView';
import { BotConfiguration, ReporterData } from 'Model/Contracts';
import { StrategyConfigurationProps, StrategyConfiguration } from './StrategyConfiguration';
import { Spinner } from './Spinner';

export interface PageState {
    configProps?: {
        strategySelectCallback: (config: BotConfiguration) => void;
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
    // private static PageEvents: PlatformEventEmitter<PageActions> = new PlatformEventEmitter<PageActions>();

    // public static EmitAction(action: PageActions, args: any) {
    //     this.PageEvents.emit(action, args);
    // }

    public constructor(props) {
        super(props);

        this.state = {
            pageMode: PageMode.Loading
        };

        // Page.PageEvents.subscribe(PageActions.RenderCharts, this.RenderCharts, this);

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

    private strategySelected(config: BotConfiguration) {

        this.setState({
            pageMode: PageMode.Loading
        });

        this.state.configProps.strategySelectCallback(config);
    }
}