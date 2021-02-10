var DiscordRPC = require('discord-rpc');

let _core, _transport, _rpc;
let reconnectionTimer, discordConnected = false, roonConnected = false, lastSentStatus = 0;

const settings = {
    discord: {
        //clientId: '807040890983022592',
        clientId: '464873958232162353',
        // const scopes = ['rpc', 'activities.write'];
    },
    zone: {
        zone_id: '1601563aef66097db5cf42339fd8d2051a33'
    },
    core: {
        ip: "192.168.0.27"
    },
    app: {
        auto_shutdown: false,
        use_discovery: false
    }
};

async function connectToDiscord() {
    console.log("Connecting to Discord...");

    if(_rpc && _rpc.transport.socket && _rpc.transport.socket.readyState === 1) {
        await _rpc.destroy();
    }

    _rpc = new DiscordRPC.Client({ transport: 'ipc' });

    _rpc.on('ready', () => {
        console.log(`Authed for user: ${_rpc.user.username}`);

        _rpc.setActivity({
            details: 'CC 2018',
            state: 'IDLE',
            startTimestamp: new Date(),
            largeImageKey: 'pslarge',
            smallImageKey: 'pssmall',
            smallImageKey: 'play-symbol',
            smallImageText: 'Roon',
            instance: false
           });

        // _rpc.user.setPresence({
        //     status: "online",  //You can show online, idle....
        //     game: {
        //         name: "Using !help",  //The message shown
        //         type: "STREAMING" //PLAYING: WATCHING: LISTENING: STREAMING:
        //     }
        // });

        discordConnected = true;
        clearTimeout(reconnectionTimer);
    });

    _rpc.transport.once('close', () => {
        console.log("Disconnected from discord...");
        discordConnected = false;

        scheduleReconnection();
    });

    // (syn): catching connection error is _not_ sufficient, exception is swallowed downstream
    try {
        // (syn): by sending `scopes`, the client constantly prompts for auth.
        // seems to work fine without it.
        await _rpc.login({ clientId: settings.discord.clientId });
    } catch(e) {
        console.error(e);

        scheduleReconnection();
    }
}

function scheduleReconnection() {
    clearTimeout(reconnectionTimer);
    reconnectionTimer = setTimeout(connectToDiscord, 5 * 1000);
}

connectToDiscord();