// https://github.com/RoonLabs/node-roon-api
var RoonApi       = require("node-roon-api"),
    RoonApiStatus = require("node-roon-api-status"),
    RoonApiTransport = require("node-roon-api-transport"),
    DiscordRPC = require('discord-rpc');


let song, artist, album, np;

let discord_client_id = '464873958232162353';

var roon = new RoonApi({
    extension_id:        'aidan.roon.gameactivity',
    display_name:        "Roon Discord Game Activity",
    display_version:     "1.0.0",
    publisher:           'Aidan Irish',
    email:               'aidanpirish@gmail.com',
    website:             'https://github.com/aidanpirish/RoonDiscordGameActivity',

    core_paired: function(core) {
        let transport = core.services.RoonApiTransport;
        console.dir(transport);
        transport.subscribe_zones(function(cmd, data) {
            // If event is 'zone changed', Roon has played a new song

            if(data.hasOwnProperty('zones_changed')) {

                let temp = data.zones_changed[0].now_playing.three_line;

                if (np !== temp) {
                    np = temp;
                
                    let song = np.line1;
                    let artist = np.line2;
                    let album = np.line3;

                    console.log("Artist: " + artist);
                    console.log("Album: " + album);
                    console.log("Song: " + song);

                }

            }

        });
    },
    
    core_unpaired: function(core) {
        console.log(core.core_id, core.display_name, core.display_version, "-", "LOST");
    }

});


var svc_status = new RoonApiStatus(roon);

roon.init_services({
    required_services: [ RoonApiTransport ],
    provided_services: [ svc_status ],
});

svc_status.set_status("All is good", false);

roon.start_discovery();