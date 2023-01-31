import { spawn } from "child_process";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

// const serverHost = "https://4ec4ae46-29c6-4ee3-9a0e-69bdf4b27ea4.mock.pstmn.io";
const serverHost = "http://169.254.169.254";

const commands = {
  valheim: {
    start: { command: "vhserver", args: ["start"] },
    stop: { command: "vhserver", args: ["stop"] },
    backup: { command: "vhserver", args: ["backup"] },
  },
};

export async function startServer() {
  const instanceId = await getHostInstanceId();
  const data = await getServerData();

  if (!(instanceId in data.instances)) {
    throw new Error("Missing instance configuration for this instance");
  }

  const instance = data.instances[instanceId];

  const serverId = instance.startupServerId;
  if (!(serverId in instance.servers)) {
    throw new Error("Missing server configuration for the requested server");
  }

  const server = instance.servers[serverId];
  const type = server.type;

  if (!(type in commands)) {
    throw new Error("Missing configuration for specified game type");
  }

  const command = commands[type].start;
  spawn(`/home/valhalla/servers/${serverId}/${command.command}`, command.args);
}

export async function stopServer() {
  const instanceId = await getHostInstanceId();
  const data = await getServerData();

  if (!(instanceId in data.instances)) {
    throw new Error("Missing instance configuration for this instance");
  }

  const instance = data.instances[instanceId];

  const serverId = instance.startupServerId;
  if (!(serverId in instance.servers)) {
    throw new Error("Missing server configuration for the requested server");
  }

  const server = instance.servers[serverId];
  const type = server.type;
  if (!(type in commands)) {
    throw new Error("Missing configuration for specified game type");
  }

  const command = commands[type].stop;
  spawn(`/home/valhalla/servers/${serverId}/${command.command}`, command.args);
}

async function getServerData() {
  const client = new S3Client({ region: "us-east-2" });
  const response = await client.send(
    new GetObjectCommand({
      Bucket: "kestrel-valhalla-resources",
      Key: "valhalla_data.json",
    })
  );
  return JSON.parse(await response.Body.transformToString());
}

async function getHostInstanceId() {
  return await fetch(`${serverHost}/latest/meta-data/instance-id`).then(
    (response) => response.text()
  );
}

// I can comment out code because it's my project, but if I see anyone else doing this I will hunt you down
// async function backupServer() {
//   //periodically run backup on the running game server and upload to s3
// }

// async function monitorServer() {
//   //periodically monitor the game server and shut itself down if there are no players
// }
