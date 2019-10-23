import * as React from 'react';

export interface SectionProps {
    header: string;
    scrollBar?: boolean;
    dynamicHeight?: boolean;
}

export interface SectionState {
    collapsed: boolean;
    contentHeight?: number;
}

export class Section extends React.Component<SectionProps, SectionState> {
    private contentRef: React.RefObject<HTMLDivElement>;
    private monitorTimer: number;

    constructor(props: SectionProps) {
        super(props);

        this.contentRef = React.createRef();

        this.state = {
            collapsed: false,
            contentHeight: undefined
        };
    }

    public componentDidMount() {
        if (this.state.contentHeight === undefined) {
            this.contentRef.current.style.maxHeight = this.contentRef.current.scrollHeight + "px";
        }
    }

    public render() {
        if(this.props.dynamicHeight) {
            if(!this.monitorTimer) {
                this.monitorTimer = setInterval(this.monitor.bind(this), 100);
            }
        } else if(this.monitorTimer) {
            this.clearMonitor();
        }

        return (
            <div className="collapsible-section">
                <div className={"header" + (this.state.collapsed ? " collapsed" : "")} onClick={() => this.toggleState()}>{this.props.header}</div>
                <div className={"content" + (this.props.scrollBar ? " custom-scroll" : "")}
                    style={{
                        maxHeight: this.state.contentHeight === undefined
                            ? 'initial'
                            : this.state.contentHeight + 'px'
                    }}
                    ref={this.contentRef}>
                    {this.props.children}
                </div>
            </div>
        );
    }

    private clearMonitor() {
        clearInterval(this.monitorTimer);
        this.monitorTimer = null;
    }

    private monitor() {
        if(!this.props.dynamicHeight) {
            this.clearMonitor();
            return;
        }

        if(!this.state.collapsed) {
            if(this.contentRef && this.contentRef.current && (this.contentRef.current.scrollHeight + 1 != this.state.contentHeight || !this.state.contentHeight)) {
                this.setState({
                    collapsed: false,
                    contentHeight: this.contentRef.current.scrollHeight + 1
                })
            }
        }
    }

    private toggleState() {
        this.clearMonitor();

        this.setState({
            collapsed: !this.state.collapsed,
            contentHeight: !this.state.collapsed ? 0 : (this.contentRef.current.scrollHeight + 1)
        });
    }
}