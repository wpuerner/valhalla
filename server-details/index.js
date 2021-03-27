const Gamedig = require("gamedig");

exports.handler = async function(event, context) {

    const instanceIp = event.pathParameters.serverIp;

    let response = {};

    try {
        console.log("Querying game server at " + instanceIp + "...");

        await Gamedig.query({
            type: 'protocol-valve',
            host: instanceIp,
            port: 2457
        }).then((state) => {
            response.name = state.name;
            response.map = state.map;
            response.numPlayers = state.raw.numplayers;
            response.isServerAvailable = true;
        }).catch((error) => {
            console.log("Encountered an error requesting status from the server: " + error.message);
            response.isServerAvailable = false;
        })

    } catch(error) {
        return formatError(error)
    }

    return formatResponse(response);
}

var formatResponse = function(response) {
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": JSON.stringify(response)
    }
}

var formatError = function(error) {
    return {
        "statusCode": 500,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": error.message
    }
}

var formatError = function(error, statusCode) {
    return {
        "statusCode": statusCode,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": error.message
    }
}
