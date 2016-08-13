importScripts('./lunr.min.js');

function logInfo(message, value, color) {
  color = color || '#357ca5';
  var data = ['%cworker', 'color: ' + color, message];
  if (value) {
    data.push(value);
  }
  console.log.apply(console, data);
};

function logAndPostMessage(message) {
  logInfo('postMessage', message);
  postMessage(message);
};

function UrlDataLoader(url) {
  this.url = url;

  this.load = function(successCallback, errorCallback, progressCallbak) {
    logInfo('downloading from database at ' + this.url);
    progressCallbak(0);

    var request = new XMLHttpRequest();
    request.open('GET', this.url, true);

    request.onprogress = function(evt) {
      if (evt.lengthComputable) {
        progressCallbak(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    request.onload = function() {
      logInfo('database downloaded');
      if (this.status >= 200 && this.status < 400) {
        successCallback(JSON.parse(this.response));
      } else {
        errorCallback('Unable to download database');
      }
    };

    request.onerror = function() {
      errorCallback('Unable to download database');
    };

    request.send();
  };
};

function SearchEngine(messageBus) {
  this.messageBus = messageBus;
  this.loaded = false;
  this._index = lunr(function(){
    this.field('title', {boost: 10})
    this.field('body')
    this.ref('id')
  });

  this._build = function(articles) {
    this.messageBus.sendIndexingEvent(0);
    console.log(articles);
    this.messageBus.sendReadyEvent();
    this.loaded = true;
  };

  this.search = function(term) {
    if (!this.loaded) this.messageBus.sendErrorEvent('Searchengine not started yet');
    return this._index.search(term);
  };

  this.start = function(dataLoader) {
    if (this.loaded) this.messageBus.sendErrorEvent('Searchengine already started');
    dataLoader.load(
      this._build.bind(this),
      this.messageBus.sendErrorEvent,
      this.messageBus.sendDownloadEvent
    );
  };
};

var edToWebPageMessageBus = {
  sendDownloadEvent: function(downloaded) {
    logAndPostMessage({event: 'loading', type: 'download', value: downloaded});
  },
  sendIndexingEvent: function(indexed) {
    logAndPostMessage({event: 'loading', type: 'indexing', value: indexed});
  },
  sendReadyEvent: function() {
    logAndPostMessage({event: 'loading', type: 'ready', value: null});
  },
  sendResultEvent: function(articles) {
    logAndPostMessage({event: 'result', value: articles});
  },
  sendErrorEvent: function(message) {
    logAndPostMessage({event: 'error', value: message});
    throw Error(message);
  }
};

var edSearchEngine = new SearchEngine(edToWebPageMessageBus);

logInfo('started');

onmessage = function(e) {
  logInfo('onmessage', e.data);
  switch (e.data.action) {
    case 'startEngine':
      logInfo('starting search engine');
      edSearchEngine.start(new UrlDataLoader(e.data.url));
      break;
    case 'search':
      break;
    default:
      logInfo('unrecognized action ', e.data.action);
  };
};
