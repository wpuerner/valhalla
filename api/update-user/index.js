const {
  EC2Client,
  DescribeSecurityGroupRulesCommand,
  AuthorizeSecurityGroupIngressCommand,
  RevokeSecurityGroupIngressCommand,
} = require("@aws-sdk/client-ec2");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const VALHALLA_USER_SECURITY_GROUP_ID = "sg-0204ad9a8fea7e6c1";
const INGRESS_FROM_PORT = 2456;
const INGRESS_TO_PORT = 2459;

exports.handler = async function (event, context) {
  try {
    const request = JSON.parse(event.body);

    if (request.action !== "remove" && request.action !== "add") {
      return getHttpResponse("Action not accepted", 400);
    }

    const data = await getServerData();

    if (
      data.users.find((user) => user.name === request.name) !== undefined &&
      request.action === "add"
    ) {
      return getHttpResponse("User already exists", 400);
    }

    await updateSecurityGroup(request);

    await updateServerData(request, data);
    return { statusCode: 204 };
  } catch (error) {
    return getHttpResponse(
      `There was an error updating the user list: ${error}`,
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

async function updateServerData(request, data) {
  if (request.action === "add") {
    data.users.push({
      name: request.name,
      ipAddress: request.ipAddress,
    });
  } else if (request.action === "remove") {
    data.users.filter((value, index, arr) => {
      if (value.name === request.name) {
        arr.splice(index, 1);
        return true;
      }
      return false;
    });
  }

  const client = new S3Client({ region: "us-east-2" });
  await client.send(
    new PutObjectCommand({
      Bucket: "kestrel-valhalla-resources",
      Key: "valhalla_data.json",
      Body: JSON.stringify(data),
    })
  );
}

async function updateSecurityGroup(request) {
  const client = new EC2Client({ region: "us-east-2" });

  if (request.action === "add") {
    await client.send(
      new AuthorizeSecurityGroupIngressCommand({
        GroupId: VALHALLA_USER_SECURITY_GROUP_ID,
        CidrIp: `${request.ipAddress}/32`,
        FromPort: INGRESS_FROM_PORT,
        ToPort: INGRESS_TO_PORT,
        IpProtocol: "udp",
      })
    );
  } else if (request.action === "remove") {
    const response = await client.send(
      new DescribeSecurityGroupRulesCommand({
        Filters: [{ Name: "group-id", Values: ["sg-0204ad9a8fea7e6c1"] }],
      })
    );
    const rule = response.SecurityGroupRules.find(
      (rule) => rule.CidrIpv4 === `${request.ipAddress}/32`
    );
    if (rule !== undefined) {
      await client.send(
        new RevokeSecurityGroupIngressCommand({
          GroupId: VALHALLA_USER_SECURITY_GROUP_ID,
          SecurityGroupRuleIds: [rule.SecurityGroupRuleId],
        })
      );
    }
  }
}
