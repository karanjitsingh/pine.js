import * as React from 'react';

export class SectionContainer extends React.Component {
    public render() {
        return (
            <div className="section-container">
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}