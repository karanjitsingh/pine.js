import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { PlatformBase } from "Platform/PlatformBase";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Page, PageProps, PageActions } from "./Components/Page";
import { BotConfiguration } from "Model/BotConfiguration";
import { IReporter, ReporterData } from "Model/Platform/Reporter";

export class Platform extends PlatformBase {
    protected readonly Network: INetwork;
    protected readonly Reporter: IReporter;

    constructor() {
        super();
        this.Network = new BrowserNetwork();
        this.Reporter = new BrowserReporter();
    }

    protected _init(availableStrategies: string[],availableExchanges: string[]) {
        ReactDOM.render(React.createElement(Page, {
            configProps: {
                availableStrategies,
                availableExchanges,
                strategySelectCallback: (config: BotConfiguration) => {
                    this.setConfig(config);
                }
            }
        } as PageProps), document.querySelector("#platform-content"));
    }
}

export class BrowserReporter implements IReporter {
    
    // constructor(pageInstance: Instance) {

    // }

    public plotUpdate() {
        throw new Error("Method not implemented.");
    }
    
    public tradeBookUpdate() {
        throw new Error("Method not implemented.");
    }

    public init(reporterData: ReporterData) {
        Page.EmitAction(PageActions.RenderCharts, reporterData);
    }
}