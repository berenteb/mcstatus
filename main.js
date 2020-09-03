const ping = require('minecraft-server-util');
const Discord = require('discord.js');
const token = require("./config.json").token;
const ip = require("./config.json").ip;
const port = require("./config.json").port;
const rule = require("./config.json").rule;
const schedule = require('node-schedule');
const client = new Discord.Client();



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activity: { name: 'Starting', type: "PLAYING" }, status: 'online' })
});

client.on('message', msg => {
    switch (msg.content) {
        case "?mc-status":
            sendStatus(msg);
            break;
        case "?mc-players":
            sendPlayers(msg);
            break;
        case "?update-status":
            console.log("Manual presence update");
            updatePrescence();
        case "?help":
            sendHelp(msg);
    }
});

client.login(token);

var updatePrescence = () => {
    ping(ip, port).then(response => {
        //console.log("Updating presence")
        client.user.setPresence({ activity: { name: `Online 🟢 - 👨‍💻 ${response.onlinePlayers}/${response.maxPlayers} - 📶 ${response.host}:${response.port}`, type: "PLAYING" }, status: 'online' })
    }).catch(err => {
        console.log(err);
        client.user.setPresence({ activity: { name: `Offline 🔴`, type: "PLAYING" }, status: 'dnd' });
    });
}

var sendStatus = function (msg) {
    ping(ip, port).then(response => {
        msg.react("🤖")
        msg.channel.send(`${response.descriptionText} szerver állapota 🌍:\n🟢 Online\n👨‍💻 ${response.onlinePlayers}/${response.maxPlayers} játékos játszik éppen\n📶 ${response.host}:${response.port}\nℹ️ Verzió: ${response.version}`)
    }).catch((reason) => {
        console.log(reason);
        msg.react("🤖");
        console.log("Server unreachable")
        msg.channel.send("🔴 A Szerver Offline")
    })
}

var sendPlayers = function (msg) {
    ping(ip, port).then(response => {
        msg.react("🤖")
        var players = new Array();
        if (response.samplePlayers) {
            response.samplePlayers.forEach(player => {
                players.push(player.name);
            });
        }
        var responseText = players.length === 0 ? "Nincs online játékos 👻" : "🎮 Elérhető játékosok:";
        if (players.length > 0) {
            for (let i = 0; i < players.length; i++) {
                const name = players[i];
                if (i + 1 >= players.length) {
                    responseText += `\n${name}`;
                } else {
                    responseText += `\n${name},`;
                }
            }
        }
        console.log("Got request, sending response")
        msg.channel.send(responseText);
    }).catch((reason) => {
        console.log(reason);
        msg.react("🤖");
        console.log("Server unreachable")
        msg.channel.send("🔴 A Szerver Offline")
    })
}

var sendHelp = function (msg) {
    msg.react("🤖")
    msg.channel.send("Itt egy kis segítség:\n?mc-status - Manuális státuszlekérés\n?mc-players - Játékoslista lekérése\n?update-status - Státusz frissítése a bot leírásában (30mp-enként frissül)")
}

var loop = new schedule.scheduleJob(rule, updatePrescence);