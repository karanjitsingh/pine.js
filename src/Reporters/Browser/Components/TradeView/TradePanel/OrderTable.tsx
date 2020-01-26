import { Table, TableColumn } from 'Components/Fabric/Table';
import { DataStream } from 'DataStream';
import { Dictionary, Order } from 'Model/Contracts';
import * as React from 'react';

export interface OrderTableProps {
    stream: DataStream<Dictionary<Order>>;
}

interface OrderTableState {
    orders: Dictionary<Order>;
}

export class OrderTable extends React.Component<OrderTableProps, OrderTableState> {

    constructor(props: OrderTableProps) {
        super(props);

        this.state = {
            orders: {},
        };

        this.props.stream.subscribe(this.dataListener.bind(this));

        if (this.props.stream.hasUpdate()) {
            this.state = this.getOrderBookState();
        }
    }

    public render() {

        const columns: TableColumn<Order>[] = [
            {
                title: "Contract",
                render: (order: Order) => order.Symbol
            },
            {
                title: "Qty",
                render: (order: Order) => order.Quantity
            },
            {
                title: "Price",
                render: (order: Order) => order.Price
            },
            {
                title: "Left Qty",
                render: (order: Order) => order.FilledRemaining
            },
            {
                title: "Order",
                render: (order: Order) => (order.Quantity / order.Price).toFixed(8)
            },
            {
                title: "Type",
                render: (order: Order) => order.OrderType
            },
            {
                title: "Status",
                render: (order: Order) => order.OrderStatus
            },
            {
                title: "Time",
                render: (order: Order) => order.CreatedAt
            }
        ];

        return <Table className={"trade-table"} columns={columns} data={Object.values(this.state.orders).filter((order) => !order.Closed)} ></Table>
    }

    private dataListener() {
        this.setState(this.getOrderBookState());
    }

    private getOrderBookState(): OrderTableState {

        const newState: OrderTableState = {
            orders: {}
        }

        this.props.stream.flush().forEach(orders => {
            Object.assign(newState.orders, orders, this.state.orders);
        });

        return newState;
    }
}