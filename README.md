# MC Server Status Discord Bot
![Version: see package.json](https://img.shields.io/github/package-json/v/berenteb/mcstatus)
Discord bot for querying a Minecraft Server.
**You need to enable query, RCON and set the RCON password in the server.properties file!**
# Config required
```
{
    "token": <Discord token>,
    "ip": <Server ip address>,
    "port": <Server port>,
    "rcon_port": <RCON port>,
    "rcon_password": <RCON password>,
    "update_interval": <update interval in seconds>
}
```
