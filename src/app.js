var five = require("johnny-five");
var board = new five.Board();
var PubNub = require("pubnub");

var pubnub = new PubNub({
  subscribeKey: "sub-c-27e2838a-9063-11e8-8f26-6259b27be313",
  publishKey: "pub-c-74ecb1be-61d9-4190-94b6-c66d3f3bdbcf",
  ssl: true,
  no_wait_for_pending: true
})

board.on("ready", accel);

function accel() {
  this.samplingInterval(200);

  var led = new five.Led(13);
  led.off();

  var accelerometer = new five.Accelerometer({
    controller: "MPU6050"
  });

  let isFall = false;
  let blink = 2000;
  let falls = 0;
  let waiting = 0;

  accelerometer.on("change", function () {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");

    isFall = this.z < 0.9;
    if (waiting > 0) waiting = waiting - 200; // every 200 ms interval sampling

    if (isFall && !waiting) {
      falls++;
      waiting = 2000; // wait 2 sec
      led.blink(blink);
      blink = blink / falls;
    }

    console.log(falls);
    console.log(blink);
    console.log(isFall);

    pubnub.publish({
        message: {
          eon: {
            'x': new Date().getTime(),
            'Sensor': isFall ? this.z : 1
          }
        },
        channel: 'pubnub-eon-iot',
        sendByPost: false, // true to send via post
        storeInHistory: false, //override default storage options
      },
      function (status, response) {
        if (status.error) {
          // handle error
          console.log(status);
        } else {}
      }
    );
  });
}

function sendData() {
  var led = new five.Led(13);
  led.off();
  var sent = 0;

  setInterval(function () {
    pubnub.publish({
        message: {
          eon: {
            'x': new Date().getTime(),
            'Sensor': Math.floor(Math.random() * 99)
          }
        },
        channel: 'pubnub-eon-iot',
        sendByPost: false, // true to send via post
        storeInHistory: false, //override default storage options
        meta: {
          "cool": "meta"
        } // publish extra meta with the request
      },
      function (status, response) {
        if (status.error) {
          // handle error
          console.log(status);
        } else {
          console.log("message Published w/ timetoken", response.timetoken);
          sent++;
          if (sent == 20) {
            led.on();
            console.log("Done")
          }
        }
      }
    );
  }, 1000);
}