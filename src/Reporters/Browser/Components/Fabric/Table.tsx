import * as React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';

export interface TableColumn<T> {
    title: string,
    cssClass?: string,
    render: (item: T) => JSX.Element | string | number;
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    comparer?: (a: T, b: T) => number;
    data: T[];
    className?: string,
    hideColumns?: boolean
}

export class Table<T> extends React.Component<TableProps<T>> {

    constructor(props: TableProps<T>) {
        super(props);
    }

    public render() {
        return (
            <BootstrapTable className={this.props.className}>
                {this.props.hideColumns ? null : <tr>{this.getColumns()}</tr>}
                {this.getRows()}
            </BootstrapTable>
        )
    }

    private getColumns(): JSX.Element[] {
        return this.props.columns.map((col) => {
            return <th className={col.cssClass}>{col.title}</th>
        });
    }

    private getRows(): JSX.Element[] {
        const cols = this.props.columns;

        return this.props.data.map((row) => (
            <tr>{
                cols.map((col) => <td>{col.render(row)}</td>)
            }</tr>
        ));
    }
}