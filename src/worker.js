/**
 * Search Engine WebWorker file
 * On startup (onmessage 'start') :
 *  - download the database
 *  - create the lunr index
 * When it receives a search query (onmessage 'search'), it triggers a search in lunr index and postMessage the results
 */

// Download lunr search library (kind of a light lucene in the browser)
importScripts('./lunr.min.js');

/**
 * Console.log a message : preprend 'worker' to identify messages coming from webpage and webworker
 *
 * @param {string}  message - the message to log
 * @param {*}       [value] - any type of value to log
 * @param {string}  [color] - hexadecimal color code to change the page prefix color
 * @param {boolean} [error] - if true use console.error
 */
function logInfo(message, value, color, error) {
  color = color || '#357ca5';
  var data = ['%cworker', 'color: ' + color, message];
  if (value) {
    data.push(value);
  }
  if (error) {
    console.error.apply(console, data);
  } else {
    console.log.apply(console, data);
  }
};

/**
 * Wrapper around the standard 'postMessage' method in a webworker to log when we post a message
 *
 * @param {string} message - the message to send back to
 */
function logAndPostMessage(message) {
  logInfo('postMessage', message);
  postMessage(message);
};

/**
 * Create a loader to dowload the database from an URL
 * Like jQuery.getJSON
 *
 * @constructor
 *
 * @param {string} url - the url to the database
 */
function UrlDataLoader(url) {
  this.url = url;

  /** @function load - takes 3 callback : success, error, onprogress. Each with one argument. */
  this.load = function(successCallback, errorCallback, progressCallbak) {
    logInfo('downloading from database at ' + this.url);

    // Create request
    var request = new XMLHttpRequest();
    request.open('GET', this.url, true);

    // Manage onprogress
    if (request.onprogress) {
      request.onprogress = function(evt) {
        if (evt.lengthComputable) {  // If computable, returns percents. The view will display a progress bar.
          progressCallbak(Math.round((evt.loaded / evt.total) * 100));
        } else {  // If not computable, returns null. The view will display a spinner.
          progressCallbak(null);
        }
      };
    } else {  // If XHR2 not available, fallback to spinner in the view
      progressCallbak(null);
    }

    // Download ended (successfully or server error)
    request.onload = function() {
      logInfo('database downloaded');
      if (this.status >= 200 && this.status < 400) {
        successCallback(JSON.parse(this.response));
      } else {
        errorCallback('Unable to download database');
      }
    };

    // Error on transfert (most of the time connection error)
    request.onerror = function() {
      errorCallback('Unable to download database');
    };

    // Start the XHR request
    request.send();
  };
};

/**
 * The SearchEngine encapsulating lunr index
 *
 * @constructor
 *
 * @param {Function} workerEventEmitter - a function to send messages when an event occurred in the engine.
 *                                        Most of the time, the WebWorker postMessage function
 */
function SearchEngine(workerEventEmitter) {
  /** Provide method for each kind of events raised by the search engine */
  this.emitter = {
    /** @function sendDownloadEvent - called when download start and each time the download has progressed by a bit */
    sendDownloadEvent: function(downloaded) {
      workerEventEmitter({event: 'loading', type: 'download', value: downloaded});
    },
    /** @function sendIndexingEvent - called when indexing start and each time indexing has progressed by a bit */
    sendIndexingEvent: function(indexed) {
      workerEventEmitter({event: 'loading', type: 'indexing', value: indexed});
    },
    /** @function sendIndexingEvent - called when search engine is ready to received search queries */
    sendReadyEvent: function() {
      workerEventEmitter({event: 'loading', type: 'ready', value: null});
    },
    /** @function sendIndexingEvent - called when search engine has finished to compute a search query. send results */
    sendResultEvent: function(articles) {
      workerEventEmitter({event: 'result', value: articles});
    },
    /** @function sendIndexingEvent - called when an error occured. kills the webworker. */
    sendErrorEvent: function(message) {
      workerEventEmitter({event: 'error', value: message});
      throw Error(message);
    }
  };

  // While loaded is false, no search query can be processed. Swithes to true when the search engine is ready.
  this.loaded = false;

  // The lunr index
  this._index = lunr(function(){
    this.field('title', {boost: 10})
    this.field('body')
    this.ref('id')
  });

  /** Build the lunr index. Called when the data have been downloaded */
  this._build = function(articles) {
    this.emitter.sendIndexingEvent(0);
    console.log(articles);
    this.emitter.sendReadyEvent();
    this.loaded = true;
  };

  /** Trigger a search query and returns the results */
  this.search = function(term) {
    if (!this.loaded) this.emitter.sendErrorEvent('Searchengine not started yet');
    return this._index.search(term);
  };

  /** Starts the search engine (download data, build index and switch state to loaded) */
  this.start = function(dataLoader) {
    if (this.loaded) this.emitter.sendErrorEvent('Searchengine already started');
    dataLoader.load(
      this._build.bind(this),
      this.emitter.sendErrorEvent,
      this.emitter.sendDownloadEvent
    );
  };
};

// The search engine instance
var edSearchEngine = new SearchEngine(logAndPostMessage);

logInfo('started');

// WebWorker message input (coming from webpage)
onmessage = function(e) {
  logInfo('onmessage', e.data);
  switch (e.data.action) {
    case 'start':
      logInfo('starting search engine');
      edSearchEngine.start(new UrlDataLoader(e.data.url));
      break;
    case 'search':
      break;
    default:
      logInfo('unrecognized action ', e.data.action);
  };
};
