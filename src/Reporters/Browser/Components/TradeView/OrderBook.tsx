import * as React from 'react';
import { DataStream } from 'DataStream';
import { Order, Dictionary } from 'Model/Contracts';
import { Table, TableColumn } from 'Components/Fabric/Table'

export interface OrderBookProps {
    orderStream: DataStream<Order>;
}

interface OrderBookState {
    openOrders: Dictionary<Order>;
    closedOrders: Dictionary<Order>;
}

export class OrderBook extends React.Component<OrderBookProps, OrderBookState> {


    constructor(props: OrderBookProps) {
        super(props);

        this.state = {
            openOrders: {},
            closedOrders: {}
        };

        this.props.orderStream.subscribe(this.dataListener.bind(this));
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

        return <Table columns={columns} rows={Object.values(this.state.openOrders)} ></Table>
    }

    private dataListener() {
        this.props.orderStream.flush().forEach(data => {
            const orders = Object.values(data);

            const stateUpdate = orders.reduce<OrderBookState>((acc, value: Order) => {

                if (value.Closed) {
                    acc.closedOrders[value.OrderId] = value;
                } else {
                    acc.openOrders[value.OrderId] = value;
                }

                return acc;
            }, {
                openOrders: {},
                closedOrders: {}
            });

            const newState: OrderBookState = {
                openOrders: {},
                closedOrders: {}
            }

            Object.assign(newState.openOrders, stateUpdate.openOrders, this.state.openOrders);
            Object.assign(newState.closedOrders, stateUpdate.closedOrders, this.state.closedOrders);

            this.setState(newState);
        });
    }
}