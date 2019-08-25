import * as React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';


export class Spinner extends React.Component {
    public render() {
        return (
            <div className="spinner-container">
                <BootstrapSpinner animation="border" variant="light"></BootstrapSpinner>
            </div>
        )
    }
}