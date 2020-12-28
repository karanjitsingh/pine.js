import { Table, TableColumn } from "Components/Fabric/Table";
import { DataStream } from "DataStream";
import { LogMessage } from "Model/Contracts";
import * as React from "react";

export interface LogTableProps {
    stream: DataStream<LogMessage>;
}

interface LogTableState {
    logs: LogMessage[];
}

enum Month {
    Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
}

export class LogTable extends React.Component<LogTableProps, LogTableState> {

    constructor(props: LogTableProps) {
        super(props);

        this.state = {
            logs: []
        };

        this.props.stream.subscribe(this.dataListener.bind(this));

        if (this.props.stream.hasUpdate()) {
            this.state = {
                logs: this.props.stream.flush()
            };
        }
    }

    public render() {

        const columns: TableColumn<LogMessage>[] = [
            {
                title: "Timestamp",
                render: (log: LogMessage) => {
                    const datetime = new Date(log.Timestamp);

                    const month = Month[datetime.getMonth()];
                    const date = datetime.getDate();
                    const hours = datetime.getHours();
                    const minutes = datetime.getMinutes();
                    const seconds = datetime.getSeconds();

                    const time = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

                    return `${month} ${date} ${time}`;
                }
            },
            {
                title: "Message",
                render: (log: LogMessage) => log.Message
            }
        ];

        return <Table hideColumns className={"trade-table log-table"} columns={columns} data={this.state.logs}></Table>;
    }

    private dataListener() {
        this.state.logs.push(...this.props.stream.flush());
        this.setState(this.state);
    }
}