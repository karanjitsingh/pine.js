import * as React from 'react';
import { TradeView, TradeViewProps } from './TradeView/TradeView';
import { BotConfiguration, ReporterData } from 'Model/Contracts';
import { StrategyConfigurationProps, StrategyConfiguration } from './StrategyConfiguration';
import { Spinner } from './Spinner';

interface SetConfigProps {
    strategySelectCallback: (config: BotConfiguration) => void;
    availableStrategies: string[];
    availableExchanges: string[];
}

export interface PageProps {
    configProps: SetConfigProps;
}

enum PageMode {
    Configuration,
    Loading,
    View
}

interface PageState {
    Mode: PageMode,
    TradeViewProps?: TradeViewProps;
}

export enum PageActions {
    RenderCharts = "render-charts"
}

export class Page extends React.Component<PageProps, PageState> {
    // private static PageEvents: PlatformEventEmitter<PageActions> = new PlatformEventEmitter<PageActions>();

    // public static EmitAction(action: PageActions, args: any) {
    //     this.PageEvents.emit(action, args);
    // }

    public constructor(props) {
        super(props);

        this.state = {
            Mode: PageMode.Configuration
        };

        // Page.PageEvents.subscribe(PageActions.RenderCharts, this.RenderCharts, this);

    }

    public render() {
        const configSelectorProps: StrategyConfigurationProps = {
            availableExchanges: this.props.configProps.availableExchanges,
            availableStrategies: this.props.configProps.availableStrategies,
            submitCallback: this.strategySelected.bind(this),
        }

        switch(this.state.Mode) {
            case PageMode.Configuration:
                return <StrategyConfiguration {...configSelectorProps} />
            case PageMode.Loading:
                return <Spinner />
            case PageMode.View:
                return <TradeView {...this.state.TradeViewProps}/>
        }

        if (this.state.Mode === PageMode.Configuration) {
        } else {
            return <TradeView {...this.state.TradeViewProps}></TradeView>
        }
    }

    private strategySelected(config: BotConfiguration) {

        this.setState({
            Mode: PageMode.Loading
        });

        this.props.configProps.strategySelectCallback(config);
    }

    private RenderCharts(data: ReporterData) {
        this.setState({
            Mode: PageMode.View,
            TradeViewProps: { data }
        });
    }
}

