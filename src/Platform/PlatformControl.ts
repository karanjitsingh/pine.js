import { PlatformConfiguration, ReporterData } from "Model/Contracts";
import { MessageSender } from "Platform/MessageSender";
import { Platform } from "Platform/Platform";
import { PlatformInstance } from "Server/ServerContracts";
import * as uuid from 'uuid/v4';
import * as WebSocket from 'ws';

export class PlatformControl {
    private platformCollection: { [key: string]: PlatformInstance } = {};
    private reporterProtocol: MessageSender;

    public constructor() {
        this.reporterProtocol = new MessageSender();
    }

    public addPlatform(config: PlatformConfiguration) {
        const platformKey = uuid();
        const platform = new Platform(config);

        this.platformCollection[platformKey] = {
            key: platformKey,
            platform,
            server: null,
            connections: {}
        };

        return platformKey;
    }

    public getInstance(platformKey: string) {
        return this.platformCollection[platformKey];
    }

    public createSocketStream(platformKey: string): string {
        const instance = this.platformCollection[platformKey];

        if (instance) {
            const address = `ws://localhost:3001`;
            const path = `/${instance.key}`;

            if (!instance.server) {
                const websocket = instance.server = new WebSocket.Server({
                    host: 'localhost',
                    path,
                    port: 3001
                });

                websocket.on('connection', (socket: WebSocket) => {
                    const key = uuid();

                    if (!instance.platform.isRunning) {

                        instance.platform.subscribe((data: ReporterData) => {
                            this.updateData(data, instance.key);
                        }, null);

                        const plotConfigs = instance.platform.start();

                        this.reporterProtocol.SendReporterInit(plotConfigs, [socket]);
                    }

                    instance.connections[key] = socket;

                    socket.onclose = () => {
                        delete instance.connections[key];
                    }
                });
            }

            return address + path;
        }
        else {
            return null;
        }
    }

    private updateData(data: ReporterData, platformKey: string) {
        const sockets = Object.values(this.platformCollection[platformKey].connections);
        this.reporterProtocol.SendReporterData(data, sockets);
    }
}
