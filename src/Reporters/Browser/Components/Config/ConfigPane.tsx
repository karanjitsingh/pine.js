import * as React from "react";

export class ConfigPane extends React.Component<{ heading?: string }> {

    public render() {
        return (
            <div className="pane-container">
                {this.props.heading ? <h1>{this.props.heading}</h1> : null}
                <div className="pane-content custom-scroll">
                    {this.props.children}
                </div>
            </div>
        );
    }
}