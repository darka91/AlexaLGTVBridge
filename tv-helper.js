// for SSDP discover of TV on the LAN
var dgram = require('dgram');


class LgDiscover {

    // send the SSDP discover message that the TV will respond to.
    _send_ssdp_discover(socket) {
        var ssdp_rhost = "239.255.255.250";
        var ssdp_rport = 1900;

        // these fields are all required
        var ssdp_msg = 'M-SEARCH * HTTP/1.1\r\n';
        ssdp_msg += 'HOST: 239.255.255.250:1900\r\n';
        ssdp_msg += 'MAN: "ssdp:discover"\r\n';
        ssdp_msg += 'MX: 5\r\n';
        ssdp_msg += "ST: urn:dial-multiscreen-org:service:dial:1\r\n";
        ssdp_msg += "USER-AGENT: iOS/5.0 UDAP/2.0 iPhone/4\r\n\r\n";
        var message = new Buffer(ssdp_msg);

        socket.send(message, 0, message.length, ssdp_rport, ssdp_rhost, function (err, bytes) {
            if (err) throw err;
            // console.log('SSDP message sent to ' + ssdp_rhost +':'+ ssdp_rport);
            // console.log(message.toString());
        });
    };

    discover(retry_timeout_seconds, tv_ip_found_callback) {
        var server = dgram.createSocket('udp4');
        var timeout = 0;
        var cb = tv_ip_found_callback || undefined;

        // sanitize parameters and set default otherwise
        if (retry_timeout_seconds && typeof (retry_timeout_seconds) === 'number') {
            timeout = retry_timeout_seconds;
        } else if (!tv_ip_found_callback && typeof (retry_timeout_seconds) === 'function') {
            // overloading, the first parameter was not a timeout, but the callback
            // and we thus assume no timeout is given
            cb = retry_timeout_seconds;
        }

        // when server has opened, send a SSDP discover message
        server.on('listening', () => {
            this._send_ssdp_discover(server);

            // retry automatically if set
            if (timeout > 0) {
                // set timeout before next probe
                // XXXXX
                // after timeout seconds, invoke callback indicating failure
                // cb(true, "");
            }
        });

        // scan incoming messages for the magic string
        server.on('message', function (message, remote) {
            const strMessage = message.toString('utf-8')
            if (strMessage.indexOf("WebOS") > 0) {
                server.close();
                // retrieve MAC
                const macIndex = strMessage.indexOf('MAC=')
                let mac = null
                if (macIndex > 0) {
                    mac = strMessage.substr(macIndex+4, 17)
                }
                if (cb) {
                    cb(false, {
                        ipaddr: remote.address,
                        mac: mac
                    });
                }
            }
        });

        server.bind(); // listen to 0.0.0.0:random
        return server;
    }
}

module.exports = class LgTvWrapper {

    constructor() {
        this.retry_timeout = 10; // seconds
        this.ipaddr = null;
        this.mac = null;
    }

    async discover() {
        const discover = new LgDiscover()
        return new Promise((resolve, reject) =>
            discover.discover(this.retry_timeout, (err, info) => {
                if (err) {
                    reject("Failed to find TV IP address on the LAN. Verify that TV is on, and that you are on the same LAN/Wifi.");
                } else {
                    this.ipaddr = info.ipaddr
                    this.mac = info.mac
                    resolve("TV ip addr is: " + this.ipaddr);
                }
            }
            )
        )
    }

    async connect() {
        if (this.ipaddr == null) throw 'Discover or set ipaddr first'
        return new Promise((resolve, reject) => {
            this.lgtv = require("lgtv2")({
                url: `ws://${this.ipaddr}:3000`
            });
            this.lgtv.on('connect', () => {
                resolve()
            })
            this.lgtv.on('error', function (err) {
                console.log(err);
                reject()
            });
        });
    }

    async turnOff() {
        await this.internal_request('ssap://system/turnOff')
        this.lgtv.disconnect();
    }

    turnOn() {
        if (!this.mac) console.error('Try to turn on but MAC not set')
        var wol = require('node-wol')
        return wol.wake(this.mac, ()=>{})
    }

    internal_request(request) {
        return new Promise((resolve, reject) => {
            this.lgtv.request(request, (err, res) => {
                if (err) reject(err)
                else resolve(res)
            })
        })
    }
};
