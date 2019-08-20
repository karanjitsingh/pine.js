import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { PlatformBase } from "Platform/PlatformBase";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Page, PageProps } from "./Components/Page";
import { Reporter } from "Model/Platform/Reporter";

export class Platform extends PlatformBase {
    protected readonly Network: INetwork;
    protected readonly Reporter: Reporter;

    constructor() {
        super();
        this.Network = new BrowserNetwork();
    }

    public init() {
        ReactDOM.render(React.createElement(Page, {
            availableStrategies: [
                'strategy 1',
                'strategy 2',
                'strategy 3',
                'strategy 4',
                'strategy 5',
                'strategy 6',
            ],
            availableExchanges: [
                'ByBit',
                'Binance',
                'Huobi'
            ]
        } as PageProps), document.querySelector("#platform-content"));
    }
}