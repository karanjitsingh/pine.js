import { Table, TableColumn } from 'Components/Fabric/Table';
import { DataStream } from 'DataStream';
import { Wallet } from 'Model/Contracts';
import * as React from 'react';

export interface WalletProps {
    walletStream: DataStream<Wallet>;
}

interface WalletState {
    wallet: Wallet;
}

export class WalletTable extends React.Component<WalletProps, WalletState> {

    constructor(props: WalletProps) {
        super(props);

        this.state = {
            wallet: {
                AvailableMargin: 0,
                Balance: 0,
                OrderMargin: 0,
                PositionMargin: 0
            }
        };

        this.props.walletStream.subscribe(this.dataListener.bind(this));

        if (this.props.walletStream.hasUpdate()) {
            const update = this.props.walletStream.flush();
            this.state = {
                wallet: update[update.length - 1]
            }
        }
    }

    public render() {

        const columns: TableColumn<Wallet>[] = [
            {
                title: "Balance",
                render: (order: Wallet) => order.Balance
            },
            {
                title: "Margin",
                render: (order: Wallet) => order.AvailableMargin
            },
            {
                title: "Order",
                render: (order: Wallet) => order.OrderMargin
            },
            {
                title: "Position",
                render: (order: Wallet) => order.PositionMargin
            },
        ];

        return <Table className={"orderbook-table"} columns={columns} data={[this.state.wallet]} ></Table>
    }

    private dataListener() {
        const update = this.props.walletStream.flush();

        this.setState({
            wallet: update[update.length - 1]
        });
    }
}