import { PlatformConfiguration, ReporterData } from "Model/Contracts";
import { Platform } from "Platform/Platform";
import * as uuid from 'uuid/v4';
import { PlatformInstance } from "Server/ServerContracts";
import * as WebSocket from 'ws';
import { Server } from "Server/Server";

export class PlatformControl {
    private platformCollection: { [key: string]: PlatformInstance } = {};

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

    public startPlatform(platformKey: string): string {
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
                        instance.platform.start();
                        instance.platform.subscribe((data: ReporterData) => {
                            this.updateData(data, instance.key);
                        }, null);
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
        Object.values(this.platformCollection[platformKey].connections).forEach((socket: WebSocket) => {
            socket.send(JSON.stringify(data));
        });
    }
}
