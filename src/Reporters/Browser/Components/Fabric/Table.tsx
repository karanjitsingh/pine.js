import { Dictionary } from "Model/Contracts";
import * as React from 'react';

export interface TableColumn<T> {
    title: string,
    cssClass?: string,
    render: (item: T) => JSX.Element | string | number;
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    comparer?: (a: T, b: T) => number;
    rows: T[];
    className?: string
}

export class Table<T> extends React.Component<TableProps<T>> {

    constructor(props: TableProps<T>) {
        super(props);
    }

    public render() {
        const tableProps: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement> = {};
        
        if(this.props.className) {
            tableProps.className = this.props.className;
        }

        return (
            <table {...tableProps}>
                <th>
                    {this.getColumns()}
                </th>
                {this.getRows()}
            </table>
        )
    }

    private getColumns(): JSX.Element[] {
        return this.props.columns.map((col) => {
            return <td className={col.cssClass}>{col.title}</td>
        });
    }

    private getRows(): JSX.Element[] {

        const cols = this.props.columns;

        return this.props.rows.map((row) => (
            <tr>{
                cols.map((col) => <td>{col.render(row)}</td>)
            }</tr>
        ));
    }
}