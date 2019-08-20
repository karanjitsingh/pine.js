import * as React from 'react';
import { Strategy } from 'Model/Strategy/Strategy';
import { TradeView, TradeViewProps } from './TradeView/TradeView';
import { BotConfiguration } from 'Model/BotConfiguration';
import { PlatformEventEmitter } from 'Model/Events';
import { StrategyConfigurationProps, StrategyConfiguration } from './StrategyConfiguration';
import { ReporterData } from 'Model/Platform/Reporter';

export interface PageProps {
    strategySelectCallback: (config: BotConfiguration) => void;
    availableStrategies: string[];
    availableExchanges: string[];
}

interface PageState {
    Mode: string,
    TradeViewProps?: TradeViewProps;
}

export enum PageActions {
    RenderCharts = "render-charts"
}

export class Page extends React.Component<PageProps, PageState> {
    private selectedStrategy: Strategy;

    private static PageActionCreator: PlatformEventEmitter<PageActions> = new PlatformEventEmitter<PageActions>();

    public constructor(props) {
        super(props);

        this.state = {
            Mode: "Configuration"
        };

        Page.PageActionCreator.subscribe(PageActions.RenderCharts, this.RenderCharts, this);

    }

    public render() {
        const configSelectorProps: StrategyConfigurationProps = {
            availableExchanges: this.props.availableExchanges,
            availableStrategies: this.props.availableStrategies,
            submitCallback: this.props.strategySelectCallback,
        }

        if (this.state.Mode === "Configuration") {
            return <StrategyConfiguration {...configSelectorProps} />
        } else {
            return <TradeView {...this.state.TradeViewProps}></TradeView>
        }
    }

    private RenderCharts(data: ReporterData) {
        this.setState({
            Mode: "View",
            TradeViewProps: { data }
        });
    }
}

