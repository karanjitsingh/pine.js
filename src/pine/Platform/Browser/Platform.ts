import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { PlatformBase } from "Platform/PlatformBase";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Page, PageProps } from "./Components/Page";
import { Reporter } from "Model/Platform/Reporter";
import { BotConfiguration } from "Model/BotConfiguration";

export class Platform extends PlatformBase {
    protected readonly Network: INetwork;
    protected readonly Reporter: Reporter;

    constructor() {
        super();
        this.Network = new BrowserNetwork();
    }

    protected _init(availableStrategies: string[],availableExchanges: string[]) {
        ReactDOM.render(React.createElement(Page, {
            availableStrategies,
            availableExchanges,
            strategySelectCallback: (config: BotConfiguration) => {
                this.startBot(config);
            }
        } as PageProps), document.querySelector("#platform-content"));
    }
}