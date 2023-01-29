# Valhalla

Valheim (and other games) hosting in AWS, with features.

### Creating a new server

Create a new user using `sudo adduser -m <username>`
Change the password of the user using `sudo passwd <username>`
If setting up a new instance, install dependencies from the root user:
For example: [valheim dependencies](https://linuxgsm.com/servers/vhserver/#v-pills-dependencies)
Change to the user using `su - <username>`
Download and install game server, e.g. [valheim server installation](https://linuxgsm.com/servers/vhserver/#v-pills-install)
Update valhalla_data.json and upload to kestrel-valhalla-resources bucket

If setting up a new instance, copy server_manager.js into the home directory of the top level user (usually `ubuntu`)
Configure valhalla.service with systemd to run the server manager on startup
