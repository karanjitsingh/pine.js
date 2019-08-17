import { INetwork } from "../Model/Platform/Network";


function isNode(): boolean {
    return typeof process === 'object';
}

export class NetworkFactory {

    private static instance: INetwork;

    public static getInstance(): INetwork {

        if(!this.instance) {
            let network;
            if(isNode()) {
                network = require('./NodeNetwork').NodeNetwork
            } else {
                network = require('./BrowserNetwork').BrowserNetwork
            }

            console.log(network);

            this.instance = new network();
        }

        return this.instance;
    }
}