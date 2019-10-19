import { Page, PageMode } from "Components/Page";
import { TradeViewProps } from "Components/TradeView/TradeView";
import { DataStream } from "DataStream";
import { ChartData, Dictionary, MessageType, Order, PlatformConfiguration, Position, ProtocolMessage, ReporterInit, Wallet } from "Model/Contracts";
import { Network } from "Network";
import React = require("react");
import ReactDOM = require("react-dom");

class Reporter {

    private readonly page: Page;
    private socket: WebSocket;
    private network: Network;
    private chartDataStream: DataStream<Dictionary<ChartData>>;
    private orderStream: DataStream<Order>;
    private positionStream: DataStream<Position>;
    private walletStream: DataStream<Wallet>;

    constructor() {
        this.page = ReactDOM.render(React.createElement(Page), document.querySelector("#platform-content"));
        this.network = new Network();
        this.chartDataStream = new DataStream();
        this.orderStream = new DataStream();
        this.positionStream = new DataStream();
        this.walletStream = new DataStream();
    }

    public init() {
        this.network.get('/api/init', {}).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/init', res.status);
            } else {
                try {
                    const info = JSON.parse(res.responseText);
                    this.loadConfigForm(info as ReporterInit);
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

    private loadConfigForm(info: ReporterInit) {
        this.page.setState({
            configProps: {
                newConfigCallback: this.configSelected.bind(this),
                selectInstanceCallback: this.instanceSelected.bind(this),
                reporterInit: info
            },
            pageMode: PageMode.Configuration
        })
    }

    private configSelected(config: PlatformConfiguration) {
        this.network.post('/api/create', JSON.stringify(config)).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/create', res.status);
            } else {
                const { key, config } = JSON.parse(res.responseText);

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

    private instanceSelected(platformKey: string) {
        this.subscribeWebSocket(platformKey);
    }

    private subscribeWebSocket(platformId: string) {
        this.network.get('/api/connect', { id: platformId }).then((res: XMLHttpRequest) => {
            if (res.status != 200) {
                console.error('/api/connect?id=' + platformId, res.status);
            } else {
                const connection = res.responseText;

                console.log(connection);
                this.subscribeToSocket(connection);
            }
        }, (why) => {
            console.error('failed', 'api/connect', why);
        });
    }

    private subscribeToSocket(connection: string) {
        this.socket = new WebSocket(connection);

        this.socket.onmessage = (ev) => {
            // JSON.parse(ev.data);
            this.processMessage(ev.data);
        }

        this.socket.onerror = function (ev) {
            console.log(ev);
        };
        this.socket.onopen = function () {
            // showMessage('WebSocket connection established');
        };
        this.socket.onclose = function () {
            // showMessage('WebSocket connection closed');
            // ws = null;
        };
    }

    private processMessage(rawMessage: string) {
        const message: ProtocolMessage<MessageType> = JSON.parse(rawMessage);

        switch (message.Type) {
            case 'ReporterData':
                const reporterData = (message as ProtocolMessage<'ReporterData'>).Data;

                console.log(new Date().getTime(), reporterData);

                if (reporterData.ChartData) {
                    this.chartDataStream.push(reporterData.ChartData);
                }

                if(reporterData.Account) {
                    if(reporterData.Account.OrderBook) {
                        this.orderStream.push(reporterData.Account.OrderBook);
                    }
                }

                // if(reporterData.Orders) {
                //     this.orderStream.push(reporterData.Orders);
                // }

                // if(reporterData.Positions) {
                //     this.positionStream.push(reporterData.Positions);
                // }

                break;

            case 'ReporterConfig':
                const plotConfigs = (message as ProtocolMessage<'ReporterConfig'>).PlotConfig;
                console.log(plotConfigs);

                this.updatePage({
                    tradeStreams: {
                        chart: this.chartDataStream,
                        order: this.orderStream,
                        position: this.positionStream,
                        wallet: this.walletStream
                    },
                    plotConfigMap: plotConfigs
                });

                break;
        }
    }

    private updatePage(props: TradeViewProps) {
        this.page.Actions.RenderCharts(props);
    }
}

const reporter = new Reporter();

reporter.init();