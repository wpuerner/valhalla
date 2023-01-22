import { createServer } from "miragejs";

export default function startMockServer() {
  createServer({
    routes() {
      this.get("/api/reminders", () => ({
        text: "Hello server!",
      }));

      this.get("/api/server-state", () => ({
        servers: [
          {
            instanceId: "i-008b88e0c451f0725",
            instanceState: "running",
            serverState: "running",
            connect: "18.191.195.145:2456",
            name: "Valheim Server",
            players: [],
            serverId: "server id 1",
          },
          {
            instanceId: "i-008b88e0c451f0725",
            instanceState: "running",
            serverState: "running",
            connect: "18.191.195.145:2456",
            name: "Valheim Server",
            players: [],
            serverId: "server id 1",
          },
          {
            instanceId: "i-008b88e0c451f0725",
            instanceState: "running",
            serverState: "stopped",
            serverId: "server id 1",
          },
          {
            instanceId: "i-043822a6585ffc35b",
            instanceState: "stopped",
            serverState: "stopped",
            serverId: "server id 2",
          },
        ],
      }));
    },
  });
}
