import { PlatformConfiguration, ReporterInit } from 'Model/Contracts';
import * as React from 'react';
import { ConfigDialog, ConfigDialogProps } from './Config/ConfigDialog';
import { Spinner } from './Spinner';
import { TradeView, TradeViewProps } from './TradeView/TradeView';

export interface PageState {
    configProps?: {
        newConfigCallback: (config: PlatformConfiguration) => void;
        selectInstanceCallback: (platformKey: string) => void;
        reporterInit: ReporterInit;
    };
    tradeViewProps?: TradeViewProps;
    pageMode: PageMode;
}

export enum PageMode {
    Configuration,
    Loading,
    TradeView
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

    public Actions = {
        RenderCharts: (props: TradeViewProps) => {
            this.setState({
                tradeViewProps: props,
                pageMode: PageMode.TradeView
            });
        }
    }

    public render() {
        switch (this.state.pageMode) {
            case PageMode.Configuration:

                const configSelectorProps: ConfigDialogProps = {
                    submitNewConfig: this.submitNewConfig.bind(this),
                    selectRunningInstance: this.selectRunningInstance.bind(this),
                    ...this.state.configProps.reporterInit
                }

                return <ConfigDialog {...configSelectorProps} />
            case PageMode.Loading:
                return <Spinner />
            case PageMode.TradeView:
                return <TradeView {...this.state.tradeViewProps} />
        }
    }

    private submitNewConfig(config: PlatformConfiguration) {
        this.setState({
            pageMode: PageMode.Loading
        });

        this.state.configProps.newConfigCallback(config);
    }

    private selectRunningInstance(key: string) {
        this.setState({
            pageMode: PageMode.Loading
        });

        this.state.configProps.selectInstanceCallback(key);
    }
}