import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { Platform as PlatformBase } from "Platform/Platform";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { StrategyViewer } from "Platform/Browser/Components/StrategyViewer";

export class Platform extends PlatformBase {
    public readonly PlatformType: PlatformType;
    public readonly Network: INetwork;

    constructor() {
        super();
        this.Network = new BrowserNetwork();
        this.PlatformType = PlatformType.Node;
    }

    public init() {
        ReactDOM.render(React.createElement(StrategyViewer), document.querySelector("#platform-content"));
    }
}