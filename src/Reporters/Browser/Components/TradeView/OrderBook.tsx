import * as React from 'react';
import { DataStream } from 'DataStream';
import { Order, Dictionary } from 'Model/Contracts';
import { Table, TableColumn } from 'Components/Fabric/Table'

export interface OrderBookProps {
    orderStream: DataStream<Dictionary<Order>>;
}

interface OrderBookState {
    orders: Dictionary<Order>;
}

export class OrderBook extends React.Component<OrderBookProps, OrderBookState> {


    constructor(props: OrderBookProps) {
        super(props);

        this.state = {
            orders: {},
        };

        this.props.orderStream.subscribe(this.dataListener.bind(this));

        if(this.props.orderStream.hasUpdate()) {
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
                title: "Filled Remaining",
                render: (order: Order) => order.FilledRemaining
            },
            {
                title: "Order Value",
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

        return <Table className={"orderbook-table"} columns={columns} rows={Object.values(this.state.orders).filter((order) => !order.Closed)} ></Table>
    }

    private dataListener() {
        this.setState(this.getOrderBookState());
    }

    private getOrderBookState(): OrderBookState {

        const newState: OrderBookState = {
            orders: {}
        }

        this.props.orderStream.flush().forEach(orders => {
            Object.assign(newState.orders, orders, this.state.orders);
        });

        return newState;
    }
}