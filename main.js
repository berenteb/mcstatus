const util = require('minecraft-server-util');
const Discord = require('discord.js');
const token = require("./config.json").token;
const ip = require("./config.json").ip;
const port = require("./config.json").port;
const rcon_port = require("./config.json").rcon_port;
const rcon_password = require("./config.json").rcon_password || "";
const update_interval = require("./config.json").update_interval;
const client = new Discord.Client();
const rcon = new util.RCON(ip, {port: rcon_port, password: rcon_password});

rcon.on('output', message=>{
    console.log(message);
});

if(!ip || !port || !update_interval || !token){
    console.log("You need to specify everything in the config file!");
    process.exit(1);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activity: { name: 'Starting', type: "PLAYING" }, status: 'online' })
});

client.on('message', msg => {
    switch (msg.content) {
        case "!mc-status":
            sendStatus(msg);
            break;
        case "!mc-players":
            sendPlayers(msg);
            break;
        case "!mc-update":
            console.log("Manual presence update");
            updatePrescence();
            break;
        case "!mc-help":
            sendHelp(msg);
            break;
        default:
            if(msg.content.startsWith("!say ")){
                sendMessage(msg);
            }
            break;
    }
});

client.login(token);

var sendMessage = function(msg) {
    msg.react("🐑");
    var msgText = msg.content.substr(5);
    rcon.connect().then(async ()=>{
        await rcon.run('say '+msgText);
        rcon.close();
        msg.channel.send("Üzenet elküldve!");
    }).catch((reason)=>{
        console.log("RCON failed");
        msg.channel.send("Az üzenetet nem sikerült elküldeni!");
    });
}

var updatePrescence = () => {
    util.status(ip, {port: port}).then(response => {
        client.user.setPresence({ activity: { name: `Online 🟢 - 👨‍💻 ${response.onlinePlayers}/${response.maxPlayers} - 📶 ${response.host}:${response.port}`, type: "PLAYING" }, status: 'online' })
    }).catch(err => {
        client.user.setPresence({ activity: { name: `Offline 🔴`, type: "PLAYING" }, status: 'dnd' });
    });
}

var sendStatus = function (msg) {
    msg.react("🐑");
    util.queryFull(ip, {port:port}).then(response => {
        console.log("Got request, sending response");
        msg.channel.send(`Szerver állapota 🌍:\n🟢 Online\n👨‍💻 ${response.onlinePlayers}/${response.maxPlayers} játékos játszik éppen\n📶 ${response.host}:${response.port}\nℹ️ Verzió: ${response.version}`)
    }).catch((reason) => {
        console.log("Server unreachable");
        msg.channel.send("🔴 A Szerver Offline")
    })
}

var sendPlayers = function (msg) {
        msg.react("🐑")
        util.queryFull(ip, {port:port}).then(response => {
            console.log(response)
        if (response.players.length > 0) {
            responseText = "🎮 Elérhető játékosok:"
            for (let i = 0; i < response.players.length; i++) {
                const name = response.players[i];
                responseText += `\n${name}${i + 1 != response.players.length ? "," : ""}`;
            }
        }else{
            responseText = "Nincs online játékos 👻";
        }
        console.log("Got request, sending response");
        msg.channel.send(responseText);
    }).catch((reason) => {
        console.log("Server unreachable")
        msg.channel.send("🔴 A Szerver Offline")
    })
}

var sendHelp = function (msg) {
    msg.react("🐑")
    msg.channel.send("Itt egy kis segítség:\n!mc-status - Manuális státuszlekérés\n!mc-players - Játékoslista lekérése\n!mc-update - Státusz frissítése a bot leírásában ("+update_interval+"mp-enként frissül)\n!say <üzenet> - Beküld egy üzenetet a játékba")
}

var loop = setInterval(updatePrescence, update_interval*1000);