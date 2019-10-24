import { Table, TableColumn } from 'Components/Fabric/Table';
import { DataStream } from 'DataStream';
import { Dictionary, Position } from 'Model/Contracts';
import * as React from 'react';

export interface PositionTableProps {
    stream: DataStream<Dictionary<Position>>;
}

interface PositionTableState {
    positions: Dictionary<Position>;
}

export class PositionTable extends React.Component<PositionTableProps, PositionTableState> {

    constructor(props: PositionTableProps) {
        super(props);

        this.state = {
            positions: {},
        };

        this.props.stream.subscribe(this.dataListener.bind(this));

        if (this.props.stream.hasUpdate()) {
            this.state = this.getOrderBookState();
        }
    }

    // Contract  qty     value       price       liq.price  margin              unrealized p&l          TP/SL
    // btcusd    1000    0.1210 btc  8237.80     7523.50     0.0122 btc (10x)    0.0004 BTC (3.56%)     -/- (-)
    //                                                      ~101.23 usd         ~3.30 usd
    public render() {

        const columns: TableColumn<Position>[] = [
            {
                title: "Contract",
                render: (position: Position) => position.Symbol
            },
            {
                title: "Qty",
                render: (position: Position) => position.Size
            },
            {
                title: "Value",
                render: (position: Position) => position.PositionValue
            },
            {
                title: "Price",
                render: (position: Position) => position.EntryPrice.toFixed(2)
            },
            {
                title: "Liq.Price",
                render: (position: Position) => position.LiquidationPrice.toFixed(2)
            },
            {
                title: "Margin",
                render: (position: Position) => position.PositionMargin
            },
            {
                title: "P&L",
                render: (position: Position) => "0"
            },
            {
                title: "TP/SL",
                render: (position: Position) => `${(position.TakeProfit || "-")}/${(position.StopLoss || "-")} (${position.TrailingStop})`
            }
        ];

        return <Table className={"orderbook-table"} columns={columns} data={Object.values(this.state.positions).filter((position) => !position.Closed)} ></Table>
    }

    private dataListener() {
        this.setState(this.getOrderBookState());
    }

    private getOrderBookState(): PositionTableState {

        const newState: PositionTableState = {
            positions: {}
        }

        this.props.stream.flush().forEach(orders => {
            Object.assign(newState.positions, orders, this.state.positions);
        });

        return newState;
    }
}