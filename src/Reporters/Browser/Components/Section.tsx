import * as React from 'react';

export interface SectionProps {
    header: string,
    scrollBar?: boolean
}

export interface SectionState {
    collapsed: boolean;
    contentHeight?: number;

}

export class Section extends React.Component<SectionProps, SectionState> {
    private contentRef: React.RefObject<HTMLDivElement>;

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

    private toggleState() {
        this.setState({
            collapsed: !this.state.collapsed,
            contentHeight: this.state.collapsed ? (this.contentRef.current.scrollHeight + 1) : 0
        });
    }
}