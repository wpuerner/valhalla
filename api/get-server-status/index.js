const {
  GetObjectCommand,
  S3Client,
  ServerSideEncryptionByDefaultFilterSensitiveLog,
} = require("@aws-sdk/client-s3");
const {
  DescribeInstancesCommand,
  EC2Client,
  GetConsoleOutputCommand,
} = require("@aws-sdk/client-ec2");

const Gamedig = require("gamedig");

exports.handler = async function (event, context) {
  const serverConfiguration = await getServerConfiguration();

  const instanceIds = [
    ...new Set(
      serverConfiguration.gameServers.map((server) => server.instanceId)
    ),
  ];
  const instanceDetails = await getInstanceDetails(instanceIds);

  // for ec2 instances that are running, get statuses and details of game servers
  const response = {};
  for (const server of serverConfiguration.gameServers) {
    response[server.id] = await getServerDetails(
      server,
      instanceDetails.get(server.instanceId)
    );
  }
  console.log(response);
};

async function getServerDetails(server, instance) {
  if (instance.state !== "running") {
    return {
      instanceState: instance.state,
      serverState: "stopped",
    };
  }

  try {
    const response = await Gamedig.query({
      type: server.gamedigType,
      host: instance.publicIpAddress,
      port: server.queryPort,
    });

    return {
      instanceState: "running",
      serverState: "running",
      connect: response.connect,
      name: response.name,
      players: response.players,
    };
  } catch (error) {
    return {
      instanceState: "running",
      serverState: "stopped",
    };
  }
}

async function getServerConfiguration() {
  const client = new S3Client({ region: "us-east-2" });
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: "kestrel-valhalla-resources",
        Key: "global_config.json",
      })
    );
    return JSON.parse(await response.Body.transformToString());
  } catch (error) {
    console.error(error);
  }
}

async function getInstanceDetails(instanceIds) {
  const client = new EC2Client({ region: "us-east-2" });
  try {
    const response = await client.send(
      new DescribeInstancesCommand({
        instanceIds: instanceIds,
      })
    );

    const instanceStates = new Map();
    response.Reservations.forEach((reservation) => {
      const instance = reservation.Instances[0];
      instanceStates.set(instance.InstanceId, {
        state: instance.State.Name,
        privateIpAddress: instance.PrivateIpAddress,
        publicIpAddress: instance.PublicIpAddress,
      });
    });
    return instanceStates;
  } catch (error) {
    console.error(error);
  }
}
