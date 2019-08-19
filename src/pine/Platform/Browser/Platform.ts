import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { Platform as PlatformBase } from "Platform/Platform";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { TradeView } from "Platform/Browser/Components/TradeView/TradeView";
import { Page } from "./Components/Page";

export class Platform extends PlatformBase {
    public readonly PlatformType: PlatformType;
    public readonly Network: INetwork;

    constructor() {
        super();
        this.Network = new BrowserNetwork();
        this.PlatformType = PlatformType.Node;
    }

    public init() {
        ReactDOM.render(React.createElement(Page), document.querySelector("#platform-content"));
    }
}