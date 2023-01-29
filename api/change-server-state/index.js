const {
  StopInstancesCommand,
  EC2Client,
  StartInstancesCommand,
} = require("@aws-sdk/client-ec2");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

exports.handler = async function (event, context) {
  try {
    const request = JSON.parse(event.body);
    switch (request.state) {
      case "start":
        await startServer(request);
        break;
      case "stop":
        await stopServer(request);
        break;
      default:
        return getHttpResponse("Got an invalid server state from client", 400);
    }

    return { statusCode: 204 };
  } catch (error) {
    return getHttpResponse(
      `Encountered a problem while changing the server state: ${error}`,
      500
    );
  }
};

function getHttpResponse(message, httpStatus) {
  return {
    statusCode: httpStatus,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // don't ever do this in your job
    },
    body: JSON.stringify(message),
  };
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

async function startServer(request) {
  const s3client = new S3Client({ region: "us-east-2" });
  const response = await s3client.send(
    new GetObjectCommand({
      Bucket: "kestrel-valhalla-resources",
      Key: "valhalla_data.json",
    })
  );
  const data = JSON.parse(await response.Body.transformToString());

  if (!(request.instanceId in data.instances)) {
    throw new Error("The client requested an instance that wasn't there");
  }

  const instance = data.instances[request.instanceId];

  if (!(request.serverId in instance.servers)) {
    throw new Error("The client requested a server that wasn't there");
  }

  instance.startupServerId = request.serverId;
  await s3client.send(
    new PutObjectCommand({
      Bucket: "kestrel-valhalla-resources",
      Key: "valhalla_data.json",
      Body: JSON.stringify(data),
    })
  );

  const ec2client = new EC2Client({ region: "us-east-2" });
  await ec2client.send(
    new StartInstancesCommand({ InstanceIds: [request.instanceId] })
  );
}

async function stopServer(request) {
  const s3client = new S3Client({ region: "us-east-2" });
  const response = await s3client.send(
    new GetObjectCommand({
      Bucket: "kestrel-valhalla-resources",
      Key: "valhalla_data.json",
    })
  );
  const data = JSON.parse(await response.Body.transformToString());

  if (!(request.instanceId in data.instances)) {
    throw new Error("The client requested an instance that wasn't there");
  }

  const ec2client = new EC2Client({ region: "us-east-2" });
  await ec2client.send(
    new StopInstancesCommand({
      InstanceIds: [request.instanceId],
    })
  );
}
