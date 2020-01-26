import { Section } from 'Components/Fabric/Section';
import { SectionContainer } from 'Components/Fabric/SectionContainer';
import { Spinner } from 'Components/Fabric/Spinner';
import { Chart } from 'Components/TradeView/Chart';
import { LogTable } from 'Components/TradeView/TradePanel/LogTable';
import { OrderTable } from 'Components/TradeView/TradePanel/OrderTable';
import { PositionTable } from 'Components/TradeView/TradePanel/PositionTable';
import { WalletTable } from 'Components/TradeView/TradePanel/WalletTable';
import { DataStream } from 'DataStream';
import SplitWrapper from 'lib/react-split';
import { ChartData, Dictionary, LogGlyph, LogMessage, Order, PlotConfig, Position, Wallet } from "Model/Contracts";
import * as React from 'react';

export interface TradeStreams {
    chart: DataStream<Dictionary<ChartData>>,
    wallet: DataStream<Wallet>,
    position: DataStream<Dictionary<Position>>,
    order: DataStream<Dictionary<Order>>,
    logs: DataStream<LogMessage>,
    glyphs: DataStream<LogGlyph>,
}

export interface TradeViewProps {
    tradeStreams: TradeStreams;
    plotConfigMap: Dictionary<PlotConfig>
}

export class TradeView extends React.Component<TradeViewProps> {

    private chartSplit: JSX.Element;
    private chartContainerMap: Dictionary<React.RefObject<HTMLDivElement>>;
    private chartMap: Dictionary<Chart>;
    private chartLoaded: boolean;
    private ref: React.RefObject<any>;

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        window['ref'] = this.ref;

        this.props.tradeStreams.chart.subscribe(this.chartUpdate.bind(this));
        this.props.tradeStreams.glyphs.subscribe(this.glyphUpdate.bind(this));
    }

    public chartUpdate() {
        this.props.tradeStreams.chart.flush().forEach(data => {
            Object.keys(data).forEach((key) => {
                this.chartMap[key].updateChartData(data[key]);
            });
        });
    }

    public glyphUpdate() {
        this.props.tradeStreams.glyphs.flush().forEach(data => {
            Object.keys(this.chartMap).forEach((key) => {
                this.chartMap[key].updateGlyphData(data);
            });
        });
    }

    public render() {
        if (!this.chartSplit) {
            this.chartSplit = this.getChartSplit(this.props.plotConfigMap);
        }

        return (
            <div style={{ height: "100%", width: "100%" }}>
                <SplitWrapper ref={this.ref} onDragStart={(...args) => console.log(args)} onDragEnd={this.triggerResize.bind(this)} sizes={[70, 30]} minSize={450} dragInterval={1} gutterSize={5} direction={"horizontal"}>
                    {!this.chartSplit ? <Spinner></Spinner> : this.chartSplit}
                    <SectionContainer>
                        <Section header="Wallet">
                            <WalletTable stream={this.props.tradeStreams.wallet} />
                        </Section>
                        <Section dynamicHeight scrollBar={true} header="Orders">
                            <OrderTable stream={this.props.tradeStreams.order} />
                        </Section>
                        <Section dynamicHeight header="Position">
                            <PositionTable stream={this.props.tradeStreams.position}></PositionTable>
                        </Section>
                        <Section dynamicHeight header="Trade Logs">
                            <LogTable stream={this.props.tradeStreams.logs} />
                        </Section>
                    </SectionContainer>
                </SplitWrapper>
            </div>
        );
    }

    public componentDidMount() {
        if (this.chartContainerMap && !this.chartMap && !this.chartLoaded) {

            this.chartMap = Object.keys(this.chartContainerMap).reduce((map, key) => {
                map[key] = Chart.Create(this.chartContainerMap[key].current, this.props.plotConfigMap[key]);
                return map;
            }, {});

            this.chartLoaded = true;
        }

        window.addEventListener('resize', this.triggerResize.bind(this));
    }

    private getChartSplit(plotConfig: Dictionary<PlotConfig>): JSX.Element {
        const plotIds = Object.keys(plotConfig);
        const chartCount = plotIds.length;

        const sizes = new Array(chartCount).fill(Math.floor(100 / chartCount));
        const sum = sizes.reduce((total, value) => (total + value));

        sizes[0] += 100 - sum;

        this.chartContainerMap = plotIds.reduce<Dictionary<React.RefObject<HTMLDivElement>>>((map, id) => {
            map[id] = React.createRef<HTMLDivElement>();
            return map;
        }, {});

        const charts = plotIds.map((id) => (<div className="chart-container" ref={this.chartContainerMap[id]}></div>));

        return (
            <SplitWrapper onDragEnd={this.triggerResize.bind(this)} sizes={sizes} minSize={100} dragInterval={1} gutterSize={5} direction={"vertical"}>
                {charts}
            </SplitWrapper>
        );
    }

    private triggerResize() {
        Object.values(this.chartMap).forEach((chart) => {
            chart.resize();
        })
    }
}