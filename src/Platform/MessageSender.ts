import { PlotConfigMap, ProtocolMessage, ReporterData } from 'Model/Contracts';
import * as WebSocket from 'ws';

export class MessageSender {

    public SendReporterData(reporterData: ReporterData, sockets: WebSocket[]) {
        const message: ProtocolMessage<'ReporterData'> = {
            Type: 'ReporterData',
            Data: reporterData
        };

        this.send(message, sockets);
    }

    public SendReporterInit(plotConfigs: PlotConfigMap, sockets: WebSocket[]) {
        const message: ProtocolMessage<'ReporterConfig'> = {
            Type: 'ReporterConfig',
            PlotConfig: plotConfigs
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