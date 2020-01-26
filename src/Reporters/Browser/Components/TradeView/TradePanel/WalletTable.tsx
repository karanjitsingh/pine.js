import { Table, TableColumn } from 'Components/Fabric/Table';
import { DataStream } from 'DataStream';
import { Wallet } from 'Model/Contracts';
import * as React from 'react';

export interface WalletTableProps {
    stream: DataStream<Wallet>;
}

interface WalletTableState {
    wallet: Wallet;
}

export class WalletTable extends React.Component<WalletTableProps, WalletTableState> {

    constructor(props: WalletTableProps) {
        super(props);

        this.state = {
            wallet: {
                AvailableMargin: 0,
                Balance: 0,
                OrderMargin: 0,
                PositionMargin: 0
            }
        };

        this.props.stream.subscribe(this.dataListener.bind(this));

        if (this.props.stream.hasUpdate()) {
            const update = this.props.stream.flush();
            this.state = {
                wallet: update[update.length - 1]
            }
        }
    }

    public render() {

        const columns: TableColumn<Wallet>[] = [
            {
                title: "Balance",
                render: (wallet: Wallet) => wallet.Balance
            },
            {
                title: "Margin",
                render: (wallet: Wallet) => wallet.AvailableMargin
            },
            {
                title: "Order",
                render: (wallet: Wallet) => wallet.OrderMargin
            },
            {
                title: "Position",
                render: (wallet: Wallet) => wallet.PositionMargin
            },
        ];

        return <Table className={"trade-table"} columns={columns} data={[this.state.wallet]} ></Table>
    }

    private dataListener() {
        const update = this.props.stream.flush();

        this.setState({
            wallet: update[update.length - 1]
        });
    }
}