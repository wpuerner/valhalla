const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { DescribeInstancesCommand, EC2Client } = require("@aws-sdk/client-ec2");
const { InvokeCommand, LambdaClient } = require("@aws-sdk/client-lambda");

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
  if (instance.state !== "running") {
    Object.values(instance.servers).map((server) => {
      server.state = "stopped";
    });
    return;
  }

  const client = new LambdaClient({});
  const response = await client
    .send(
      new InvokeCommand({
        FunctionName: "valhalla-get-internal-server-status",
        Payload: JSON.stringify(instance),
      })
    )
    .then((res) => {
      return JSON.parse(Buffer.from(res.Payload).toString("utf-8"));
    });

  console.log(response.servers);

  instance.servers = response.servers;
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
      InstanceIds: instanceIds,
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
