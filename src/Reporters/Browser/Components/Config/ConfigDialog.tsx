import { PlatformConfiguration, ReporterInit } from 'Model/Contracts';
import * as React from 'react';
import { Button, Carousel, CarouselItem, CarouselProps, Form } from 'react-bootstrap';
import { ConfigPane } from './ConfigPane';
import { ListSelector, Orientation } from './ListSelector';

export interface ConfigDialogProps extends ReporterInit {
    submitNewConfig: (config: PlatformConfiguration) => void;
    selectRunningInstance: (platformKey: string) => void;
}

interface ConfigDialogState {
    activeIndex: number;
    isSliding: boolean;
    selectedExec: string;
    selectedExchange?: string;
    selectedStrategy?: string;
}


export class ConfigDialog extends React.Component<ConfigDialogProps, ConfigDialogState> {

    private pages: JSX.Element[];

    public constructor(props) {
        super(props);
        this.state = {
            activeIndex: undefined,
            isSliding: false,
            selectedExec: "Trade"
        }
    }

    public shouldComponentUpdate(_, nextState: ConfigDialogState) {
        return this.state.activeIndex != nextState.activeIndex
            || this.state.selectedExec != nextState.selectedExec;
    }

    public render() {

        const carouselProps: CarouselProps = {
            controls: false,
            indicators: false,
            wrap: false,
            touch: false,
            interval: null
        }

        this.pages = this.getPages();
        const done = this.pages.length - 1 == this.state.activeIndex;
        const proceedText = this.state.activeIndex ? (done ? "Done" : "Next") : "Skip";


        return (
            <div className="config-selector-container">
                <div className="config-selector">
                    <Carousel onSlideEnd={() => this.setState({ activeIndex: this.state.activeIndex, isSliding: false })} activeIndex={this.state.activeIndex | 0} {...carouselProps} className="config-carousel">
                        {this.pages}
                    </Carousel>
                    <div className="carousel-buttons">
                        <Button variant="light" className={this.state.activeIndex ? "" : "disabled"} onClick={() => this.configButton_OnClick(false)}>Prev</Button>
                        <Button variant={done ? "info" : "light"} onClick={() => this.configButton_OnClick(true)}>{proceedText}</Button>
                    </div>
                </div>
            </div>
        )
    }

    private getPages(): JSX.Element[] {
        return [

            <CarouselItem className="config-pane">
                <ConfigPane>
                    <Button variant={'primary'} onClick={() => { this.setDefaultConfiguration(); }}>Default Config</Button>

                    <Form.Group>
                        {
                            this.props.runningInstances && this.props.runningInstances.length ?
                                [<Form.Label>Select a running instance</Form.Label>,
                                <ListSelector buttonClass="platform-instance-button" list={this.props.runningInstances} itemRender={(item) => {
                                    return (
                                        <div>
                                            <div>{item.strategy}</div>
                                            <div>{item.exchange}</div>
                                            <div>{item.backtest ? "Backtest" : "Live"}</div>
                                        </div>
                                    )
                                }}></ListSelector>] : null
                        }
                    </Form.Group>
                </ConfigPane>
            </CarouselItem>,

            <CarouselItem className="config-pane">
                <ConfigPane heading="Strategy">
                    <ListSelector onSelect={(strategy) => this.setState({
                        ...this.state,
                        selectedStrategy: strategy
                    })} list={this.props.availableStrategies} sticky={true}></ListSelector>
                </ConfigPane>
            </CarouselItem>,

            <CarouselItem className="config-pane">
                <ConfigPane heading="Exchange">
                    <ListSelector onSelect={(exchange) => this.setState({
                        ...this.state,
                        selectedExchange: exchange
                    })} list={this.props.availableExchanges} sticky={true}></ListSelector>
                </ConfigPane>
            </CarouselItem>,

            <CarouselItem className="config-pane">
                <ConfigPane heading="Execution">
                    <ListSelector onSelect={(execution) => this.setState({
                        ...this.state,
                        selectedExec: execution
                    })} default={0} sticky={true} direction={Orientation.Horizontal} list={["Trade", "Backtest"]}></ListSelector>
                    {
                        this.state.selectedExec == "Trade" ?
                            <Form.Group controlId="trade-form">
                                <Form.Label>Api Key</Form.Label>
                                <Form.Control type="password" placeholder="Api Key" id="apikey"></Form.Control>
                                <Form.Label>Auth Secret</Form.Label>
                                <Form.Control type="password" placeholder="Auth Secret" id="authsecret"></Form.Control>
                            </Form.Group>
                            :
                            <Form.Group>
                                <Form.Label>✔ All set</Form.Label>
                            </Form.Group>
                    }
                </ConfigPane>
            </CarouselItem>

        ];
    }

    private setDefaultConfiguration() {
        this.props.submitNewConfig({
            default: true
        } as any);
    }

    private submit() {
        const config = {
            Strategy: this.state.selectedStrategy,
            Exchange: this.state.selectedExchange
        } as PlatformConfiguration

        if (this.state.selectedExec === "Trade") {
            config.ExchangeAuth = {
                ApiKey: (document.querySelector("#apikey") as HTMLInputElement).value,
                Secret: (document.querySelector("#authsecret") as HTMLInputElement).value
            }
        } else {
            config.BacktestSettings = {}
        }

        console.log(config);

        if (this.props.submitNewConfig) {
            this.props.submitNewConfig(config);
        }
    }

    private configButton_OnClick(next: boolean) {
        if (!this.state.isSliding) {
            const index = this.state.activeIndex | 0;
            if (next) {
                if (index + 1 < this.pages.length) {
                    this.setState({
                        activeIndex: index + 1,
                        isSliding: true
                    })
                } else {
                    this.submit();
                }
            } else {
                if (index > 0) {
                    this.setState({
                        activeIndex: index - 1,
                        isSliding: true
                    })
                }
            }
        }
    }
}

