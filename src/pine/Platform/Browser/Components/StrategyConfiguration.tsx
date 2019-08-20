import * as React from 'react';
import { BotConfiguration } from 'Model/BotConfiguration';
import { Carousel, CarouselItem, CarouselProps, Button, ListGroup, Form } from 'react-bootstrap'

export interface StrategyConfigurationProps {
    submitCallback: (config: BotConfiguration) => void;
    availableStrategies: string[],
    availableExchanges: string[]
}

interface StrategyConfigurationState {
    activeIndex: number;
    isSliding: boolean;
    selectedExec: string;
    selectedExchange?: string;
    selectedStrategy?: string;
}

enum Orientation {
    Horizontal,
    Vertical
}

interface ListSelectorProps {
    direction?: Orientation,
    list: string[],
    onSelect?: (value: string, index: number) => void,
    default?: number
}

export class StrategyConfiguration extends React.Component<StrategyConfigurationProps, StrategyConfigurationState> {

    private readonly TotalPanes = 3;

    public constructor(props) {
        super(props);
        this.state = {
            activeIndex: undefined,
            isSliding: false,
            selectedExec: "Trade"
        }
    }

    public shouldComponentUpdate(_, nextState: StrategyConfigurationState) {
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

        const done = this.TotalPanes - 1 == this.state.activeIndex;

        return (
            <div className="config-selector-container">
                <div className="config-selector">
                    <Carousel onSlideEnd={() => this.setState({ activeIndex: this.state.activeIndex, isSliding: false })} activeIndex={this.state.activeIndex | 0} {...carouselProps} className="config-carousel">
                        <CarouselItem className="config-pane">
                            <ConfigPane heading="Bot Strategy">
                                <ListSelector onSelect={(strategy) => this.setState({
                                    ...this.state,
                                    selectedStrategy: strategy
                                })} list={this.props.availableStrategies}></ListSelector>
                            </ConfigPane>
                        </CarouselItem>
                        <CarouselItem className="config-pane">
                            <ConfigPane heading="Exchange">
                                <ListSelector onSelect={(exchange) => this.setState({
                                    ...this.state,
                                    selectedExchange: exchange
                                })} list={this.props.availableExchanges}></ListSelector>
                            </ConfigPane>
                        </CarouselItem>
                        <CarouselItem className="config-pane">
                            <ConfigPane heading="Execution">
                                <ListSelector onSelect={(execution) => this.setState({
                                    ...this.state,
                                    selectedExec: execution
                                })} default={0} direction={Orientation.Horizontal} list={["Trade", "Backtest"]}></ListSelector>
                                {
                                    this.state.selectedExec == "Trade" ?
                                    <Form.Group controlId="trade-form">
                                        <Form.Label>Exchange auth token</Form.Label>
                                        <Form.Control type="password" placeholder="Auth token"></Form.Control>
                                    </Form.Group>
                                    :
                                    <Form.Group>
                                        <Form.Label>✔ All set</Form.Label>
                                    </Form.Group>
                                }
                            </ConfigPane>
                        </CarouselItem>
                    </Carousel>
                    <div className="carousel-buttons">
                        <Button variant="light" className={this.state.activeIndex ? "" : "disabled"} onClick={() => this.configButton_OnClick(false)}>Prev</Button>
                        <Button variant={done ? "info" : "light"} onClick={() => this.configButton_OnClick(true)}>{done ? "Done" : "Next"}</Button>
                    </div>
                </div>
            </div>
        )
    }

    private submit() {
        const config = {
            Strategy: this.state.selectedStrategy,
            Exchange: this.state.selectedExchange
        } as BotConfiguration

        if(this.state.selectedExec === "Trade") {
            config.TradeSettings = {
                AuthToken: (document.querySelector("#trade-form") as HTMLInputElement).value
            }
        } else {
            config.BacktestSettings = {}
        }

        console.log(config);

        if(this.props.submitCallback) {
            this.props.submitCallback(config);
        }
    }

    private configButton_OnClick(next: boolean) {
        if (!this.state.isSliding) {
            const index = this.state.activeIndex | 0;
            if (next) {
                if (index + 1 < this.TotalPanes) {
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

export class ConfigPane extends React.Component<{ heading: string }> {

    public render() {
        return (
            <div className="pane-container">
                <h1>{this.props.heading}</h1>
                <div className="pane-content scroll">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export class ListSelector extends React.Component<ListSelectorProps, { selectedItem: number }> {

    public constructor(props) {
        super(props);

        this.state = {
            selectedItem: this.props.default !== undefined ? this.props.default : -1
        }
    }

    public render() {
        if (!this.props.list || this.props.list.length == 0) {
            return [];
        }
        return (
            <ListGroup className={this.props.direction === Orientation.Horizontal ? "list-group-horizontal" : ""}>
                {this.props.list.map((element, index) => <Button onClick={() => this.onSelect(element, index)} className={"list-group-item " + (index == this.state.selectedItem ? "active" : "")}>{element}</Button>)}
            </ListGroup>
        )
    }

    private onSelect(element, index) {
        if (this.props.onSelect) {
            this.props.onSelect(element, index);
        }

        this.setState({
            selectedItem: index
        });
    }
}