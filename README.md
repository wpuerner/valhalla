# Valhalla

Custom cloud game server

## Using the server

The game server dashboard is used to view details about servers and to start/stop servers. It is available at this URL:  
http://kestrel-valhalla.s3-website.us-east-2.amazonaws.com

To join a running server, verify that it is running and use the IP address and port provided to join the game. Most games will have a password to join (don't save passwords in GitHub, please).

Connecting to a server requires being whitelisted in the instance Security Group. Anyone with AWS console access to Valhalla can edit the security groups. When requesting access to the server, provide your IPv4 address which can be found at whatismyipaddress.com.

To start a stopped server, click the "Start" button next to the server details on the dashboard. To stop a running server, click the "Stop" button next to the instance ID. Multiple servers can live on a single instance, but currently only one server per instance can be running at a time.

## Creating a new server

Creating a new server requires SSH access to the instance that it will live on. Contact Will for details on getting instance access.

Once logged into the instance, switch to the valhalla user using `su - valhalla`. Server files reside in the `~/servers/{serverId}` directories. Make a new directory using a unique serverId and install your game server in that directory. [LinuxGSM](https://linuxgsm.com/) should be used as the server manager if your chosen game is available.

**Important**  
When creating a new server, _always_ provide a unique gameworld name in the server configuration. Some server types have hard coded save paths, so world files from different servers might share the same directory. Giving game worlds unique names helps ensure that game worlds aren't accidentally overwritten.

When your server is set up, update the `valhalla_data.json` config file with the server details and upload it to the root of the `kestrel-valhalla-resources` S3 bucket. This information is pulled by the automated tools when managing instances and servers, and must be accurate.

If setting up a new game type, update the `agent/manager.js` with the start/stop commands of your server type.

## Setting up a new instance

To set up a new instance, provision an EC2 with sufficient EBS storage space and log in through SSH. Follow these steps:

1. Create new user valhalla using `sudo useradd valhalla` and give it a password using `sudo passwd valhalla`
2. If using LinuxGSM, install [dependencies](https://linuxgsm.com/servers/vhserver/#v-pills-dependencies) from the root account
3. Copy the agent files into the home directory,using S3 to port files from a local machine to the instance
4. Set up nvm and npm on the instance (use at least Node v18)
5. Using the root account, copy `agent/valhalla.service` into `/etc/systemd` and then reload the daemon using `sudo systemctl daemon-reload`. Enable the service on startup with `sudo systemctl enable valhalla`.

## How it all works

### Instances and the agent

Individual game servers run on EC2 instances. Multiple game servers can persist on the same instace, but currently only one server can run on a single instance at a time. As low cost is one of the top goals of this project, it's important that we use a small instance size. However, it's also important to be able to keep multiple servers on the same instance, as managing and updating many instances is time consuming.

The instance agent is a Node process that starts on instance startup and manages the game server lifecycle.

### API layer

TODO

### Webpage

TODO
