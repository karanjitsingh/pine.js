import { PlatformType } from "Model/Platform/PlatformType";
import { INetwork } from "Model/Platform/Network";
import { BrowserNetwork } from "Platform/Browser/BrowserNetwork";
import { Platform as PlatformBase } from "Platform/Platform";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Page } from "Platform/Browser/Components/Page";

export class Platform implements PlatformBase {
    public readonly PlatformType: PlatformType;
    public readonly Network: INetwork;

    constructor() {
        this.Network = new BrowserNetwork();
        this.PlatformType = PlatformType.Node;
    }

    public init() {
        ReactDOM.render(React.createElement(Page), document.querySelector("#platform-content"));
    }
}