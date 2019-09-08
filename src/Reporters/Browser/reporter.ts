import { Page, PageMode } from "Components/Page";
import React = require("react");
import ReactDOM = require("react-dom");
import { PlatformConfiguration, ProtocolMessage, MessageType, ChartData, Dictionary, Trade } from "Model/Contracts";
import { Network } from "Network";
import { TradeViewProps } from "Components/TradeView/TradeView";
import { DataStream } from "DataStream";

interface InitInfo {
    availableExchanges: string[];
    availableStrategies: string[];
}

class Reporter {

    private readonly page: Page;
    private socket: WebSocket;
    private network: Network;
    private chartDataStream: DataStream<Dictionary<ChartData>>;
    private tradeDataStream: DataStream<Trade>;

    constructor() {
        this.page = ReactDOM.render(React.createElement(Page), document.querySelector("#platform-content"));
        this.network = new Network();
    }

    public init() {
        this.network.get('/api/init', {}).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/init', res.status);
            } else {
                try {
                    const info = JSON.parse(res.responseText);
                    this.loadConfigForm(info as InitInfo);
                    console.log(info);
                }
                catch (ex) {
                    console.error('failed', '/api/init', ex);
                }

            }
        }, (why) => {
            console.error('failed', '/api/init', why);
        })
    }

    private loadConfigForm(info: InitInfo) {
        this.page.setState({
            configProps: Object.assign({
                strategySelectCallback: this.strategySelected.bind(this)
            }, info),
            pageMode: PageMode.Configuration
        })
    }

    private strategySelected(config: PlatformConfiguration) {
        this.network.post('/api/config', JSON.stringify(config)).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/config', res.status);
            } else {

                const {key, config} = JSON.parse(res.responseText);

                this.page.setState({
                    pageMode: PageMode.Loading
                });

                if (!key) {
                    console.error('platform id was empty');
                }

                console.log(key, config);

                this.subscribeWebSocket(key);
            }
        }, (why) => {
            console.error('failed', 'api/config', why);
        });
    }

    private subscribeWebSocket(platformId: string) {
        this.network.get('/api/datastream', { id: platformId }).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/datastream?id=' + platformId, res.status);
            } else {
                const connection = res.responseText;

                console.log(connection);
                this.subscribeToSocket(connection);
            }
        }, (why) => {
            console.error('failed', 'api/config', why);
        });
    }

    private subscribeToSocket(connection: string) {
        const ws = this.socket = new WebSocket(connection);
        ws.onmessage = (ev) => {
            // JSON.parse(ev.data);
            this.processMessage(ev.data);
        }

        ws.onerror = function (ev) {
            console.log(ev);
        };
        ws.onopen = function () {
            // showMessage('WebSocket connection established');
        };
        ws.onclose = function () {
            // showMessage('WebSocket connection closed');
            // ws = null;
        };
    }

    private processMessage(rawMessage: string) {
        const message: ProtocolMessage<MessageType> = JSON.parse(rawMessage);

        switch(message.Type) {
            case 'ReporterData':
                const reporterData = (message as ProtocolMessage<'ReporterData'>).Data;
                console.log(reporterData);
                break;

            case 'ReporterConfig':
                const plotConfigs = (message as ProtocolMessage<'ReporterConfig'>).PlotConfig;
                console.log(plotConfigs);

                this.chartDataStream = new DataStream();
                this.tradeDataStream = new DataStream();

                this.updatePage({
                    dataStream: this.chartDataStream,
                    plotConfigMap: plotConfigs
                })
                break;
        }
    }

    private updatePage(props: TradeViewProps) {
        this.page.Actions.RenderCharts(props);
    }
}

const reporter = new Reporter();

reporter.init();