var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var deviceAddress;
var language;

var device = function(name, lang = 'en') {
    device = name;
    language = lang;
    return this;
};

var ip = function(ip) {
  deviceAddress = ip;
  return this;
}

var googletts = require('google-tts-api');
var googlettsaccent = 'us';
var accent = function(accent) {
  googlettsaccent = accent;
  return this;
}

var notify = function(message, callback) {
    getSpeechUrl(message, deviceAddress, function(res) {
      callback(res);
    });
  }

var play = function(mp3_url, callback) {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      callback(res);
    });
};

var getSpeechUrl = function(text, host, callback) {
  googletts(text, language, 1, 1000, googlettsaccent).then(function (url) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, host, callback) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
};

var onDeviceUp = function(host, url, callback) {
  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

exports.ip = ip;
exports.device = device;
exports.accent = accent;
exports.notify = notify;
exports.play = play;
