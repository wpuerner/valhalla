const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { DescribeInstancesCommand, EC2Client } = require("@aws-sdk/client-ec2");

const Gamedig = require("gamedig");

exports.handler = async function (event, context) {
  try {
    const data = await getServerData();

    await populateInstances(data);

    for (const instance of Object.values(data.instances)) {
      await populateServers(instance);
    }

    return getHttpResponse(filterResponse(data), 200);
  } catch (error) {
    return getHttpResponse(
      `There was a problem getting data from the server: ${error}`,
      500
    );
  }
};

function getHttpResponse(response, httpStatus) {
  return {
    statusCode: httpStatus,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // don't ever do this in your job
    },
    body: JSON.stringify(response),
  };
}

function filterResponse(data) {
  return data;
}

async function populateServers(instance) {
  const servers = instance.servers;
  for (const server of Object.values(servers)) {
    if (instance.state !== "running") {
      server.state = "stopped";
    }

    try {
      const response = await Gamedig.query({
        type: server.gamedigType ? server.gamedigType : "protocol-valve",
        host: instance.publicIpAddress,
        port: server.queryPort,
      });

      server.state = "running";
      server.connect = response.connect;
      server.players = response.players;
    } catch (error) {
      server.state = "stopped";
    }
  }
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

async function populateInstances(data) {
  const instanceIds = Object.keys(data.instances);

  const client = new EC2Client({ region: "us-east-2" });
  const response = await client.send(
    new DescribeInstancesCommand({
      instanceIds: instanceIds,
    })
  );

  response.Reservations.forEach((reservation) => {
    const instance = reservation.Instances[0];
    data.instances[instance.InstanceId] = {
      ...data.instances[instance.InstanceId],
      state: instance.State.Name,
      privateIpAddress: instance.PrivateIpAddress,
      publicIpAddress: instance.PublicIpAddress,
    };
  });
}
