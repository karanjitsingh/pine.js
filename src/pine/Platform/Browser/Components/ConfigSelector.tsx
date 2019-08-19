import * as React from 'react';
import { BotConfiguration } from 'Model/BotConfiguration';
import { Carousel, CarouselItem, CarouselProps, Button } from 'react-bootstrap'

export interface ConfigSelectorProps {
    strategySelectedCallback: (config: BotConfiguration) => void;
}

interface ConfigSelectorState {
    activeIndex: number;
    isSliding: boolean
}

export class ConfigSelector extends React.Component<ConfigSelectorProps, ConfigSelectorState> {

    private carouselRef: React.RefObject<Carousel>;
    private readonly TotalPanes = 3;

    public constructor(props) {
        super(props);
        this.state = {
            activeIndex: undefined,
            isSliding: false
        }
        this.carouselRef = React.createRef();
    }

    public shouldComponentUpdate(_, nextState) {
        return this.state.activeIndex != nextState.activeIndex;
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
                            <ConfigPane heading="Strategy"></ConfigPane>
                        </CarouselItem>
                        <CarouselItem className="config-pane">
                            <ConfigPane heading="Strategy2"></ConfigPane>
                        </CarouselItem>
                        <CarouselItem className="config-pane">
                            <ConfigPane heading="Strategy"></ConfigPane>
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

    private configButton_OnClick(next: boolean) {
        if(!this.state.isSliding) {
            const index = this.state.activeIndex | 0;
            if (next) {
                if (index + 1 < this.TotalPanes) {
                    this.setState({
                        activeIndex: index + 1,
                        isSliding: true
                    })
                } else {
                    // submit
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
                <div className="pane-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}