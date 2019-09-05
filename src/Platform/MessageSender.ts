import { ReporterData, ProtocolMessage, MessageType } from "Model/Contracts";
import * as WebSocket from 'ws';

export class MessageSender {

    public SendReporterData(reporterData: ReporterData, sockets: WebSocket[]) {
        const message: ProtocolMessage<'ReporterData'> = {
            type: 'ReporterData',
            data: reporterData
        };

        this.send(message, sockets);
    }

    public SendReporterInit(chartCount: number, sockets: WebSocket[]) {
        const message: ProtocolMessage<'ReporterInit'> = {
            type: 'ReporterInit',
            chartCount: chartCount
        }

        this.send(message, sockets);
    }

    private send(message: ProtocolMessage<any>, sockets: WebSocket[]) {
        if (sockets && sockets.length) {
            const messageString = JSON.stringify(message);

            sockets.forEach(socket => {
                socket.send(messageString);
            });
        }
    }
}