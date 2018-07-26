var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello!'
  }
});

var pubnub = new PubNub({
  subscribeKey: 'sub-c-27e2838a-9063-11e8-8f26-6259b27be313'
});