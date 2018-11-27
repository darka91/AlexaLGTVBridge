var wemore = require('wemore');

// note that each device needs a separate port:
var tv = wemore.Emulate({friendlyName: "TV", port: 9001}); // choose a port

const tvWrapper = require('./tv-helper')
const tvHelper = new tvWrapper();
const setup = async () => {
    await tvHelper.discover()
    await tvHelper.connect()
    console.log('TVHelper ready')
}

setup()

tv.on('listening', function() {
    // if you want it, you can get it:
    console.log("TV listening on", this.port);
});

// also, 'on' and 'off' events corresponding to binary state
tv.on('on', function(self, sender) {
    tvHelper.turnOn()
    console.log("TV turned on");
});

tv.on('off', function(self, sender) {
    tvHelper.turnOff()
    console.log("TV turned off");
});
