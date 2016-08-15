/**
 * Site JS File
 * Create the search engine webworker, bind events with the search field and manage communication between the 2.
 * A VuJS component is tasked to update the view
 */

;(function(document, Vue, Rx){

/**
 * -----------------------------------------------
 * Vue Component and MISC functions
 * -----------------------------------------------
 */

/**
 * Object used in VueJS Component to bind values to the view
 *
 * @namespace
 * @property {boolean}   loading           - while true display loading animation
 * @property {string}    loadingStep       - switch loading message (download, indexing)
 * @property {number}    loadingProgress   - update progress bar if supported by loadingStep
 *                                           (integer : progressbar, null: spinner, undefined: nothing)
 * @property {boolean}   atLeastOneSearch  - true if the user has started at least one search
 * @property {Article[]} searchResult      - display search results
 * @property {boolean}   searchInProgress  - if the webworker is computing the result of the search query
 * @property {string}    latestSearchTerms - latest terms searched. Used to compare with webworker search result to see if
 *                                           we need to trigger a new search query
 * @property {boolean}   displayError      - if we need to disable search and display error message
 */
var appState = {
  loading: true,
  loadingStep: 'download',
  loadingProgress: undefined,
  atLeastOneSearch: false,
  searchResult: [],
  searchInProgress: false,
  latestSearchTerms: null,
  displayError: false
};

// VueJS component to update HTML when object appState changes
var appComponent = new Vue({
  el: '#app',
  data: appState,
  methods: {
    onSubmit: function() {}  // Prevent standard HTML form submit. We use RxJS to watch for input changes
  }
});

/**
 * Console.log a message : preprend page to identify messages coming from webpage and webworker
 *
 * @param {string}  message - the message to log
 * @param {*}       [value] - any type of value to log
 * @param {string}  [color] - hexadecimal color code to change the page prefix color
 * @param {boolean} [error] - if true use console.error
 */
function logInfo(message, value, color, error) {
  color = color || '#008d4c';
  var data = ['%cpage', 'color: ' + color, message];
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
 * Function to handle any error.
 * It logs the error and display the error message
 *
 * @param {Error} e - the error raised
 */
function handleError(e) {
  appState.displayError = true;
  appState.searchInProgress = false;
  appState.searchResult = [];
  logInfo(e, null, null, true);
}


/**
 * -----------------------------------------------
 * SearchEngine Webworker
 * -----------------------------------------------
 */

// Create SearchEngine in a WebWorker
var searchEngineWorker = Rx.DOM.fromWorker('worker.js');
searchEngineWorker.sendMessage = function(message) {
  logInfo('onNext', message);
  this.onNext(message);
};
var searchEngineSharedObservable = searchEngineWorker
  .share()
  .map(function(e) {
    return e.data;
  });

// Listen for loading (database downloading and indexing) messages from SearchEngine WebWorker
searchEngineSharedObservable.filter(function(data) {
  return data.event === 'loading';
}).subscribe(
  function (data) {
    logInfo('loading', data);
    appState.loadingProgress = data.value;
    appState.loadingStep = data.type;
    appState.loading = data.type !== 'ready';  // Final step when SearchEngine is ready
  },
  handleError
);

// Listen for search result messages from SearchEngine WebWorker
searchEngineSharedObservable.filter(function(data) {
  return data.event === 'result';
}).map(function(data) {
  data.value = JSON.parse(data.value);
  return data;
}).subscribe(
  function (data) {
    logInfo('result', data);
    if (data.term === appState.latestSearchTerms) {
      logInfo('result display', '"' + data.term + '"');
      appState.searchInProgress = false;
      appState.searchResult = data.value;
    } else {
      logInfo('result does not match latest search term. Trigger new one', {received: data.term, latest: appState.latestSearchTerms});
      searchEngineWorker.sendMessage({action: 'search', value: appState.latestSearchTerms});
    }
  },
  handleError
);

// Trigger SearchEngine WebWorker indexation.
searchEngineWorker.sendMessage({action: 'start', url: 'https://raw.githubusercontent.com/ed-search/database/data/articles.json'});


/**
 * -----------------------------------------------
 * Search Field event Streams
 * -----------------------------------------------
 */

var searchField = document.querySelector('#search-input');
var keyUpSearchStream = Rx.DOM.keyup(searchField);
var enterKeyPressedStream = keyUpSearchStream  // Returns input field value when Enter key is pressed
  .filter(function (e) {
    return e.keyCode == 13
  })
  .pluck('target', 'value');
var keyUpThrottledSearchStream = keyUpSearchStream  // Returns input field value debounced
    .pluck('target', 'value')
    .debounce(500)
    .distinctUntilChanged();

// Watch for first key pushed in search field to stick the search field at the top of the page (kind of like Google Search)
keyUpSearchStream.take(1).subscribe(function(e) {
  appState.atLeastOneSearch = true;
});

// Handle form submit or clicks on submit button
var submitButton = document.querySelector('#search-submit');
var clickSubmitStream = Rx.Observable.fromEvent(submitButton, 'click')  // Returns input field value when form submitted or submit button clicked
  .map(function(){
    return searchField.value;
  });

// Watch for all streams which can trigger a search
Rx.Observable.merge([clickSubmitStream, enterKeyPressedStream, keyUpThrottledSearchStream])
  .distinctUntilChanged()
  .subscribe(function(searchTerms) {
    // Trigger search
    appState.latestSearchTerms = searchTerms;
    if (!appState.searchInProgress && searchTerms) {  // If no search in progress, launch one
      appState.searchInProgress = true;
      searchEngineWorker.sendMessage({action: 'search', value: searchTerms});
    } else if (!searchTerms) {  // If empty search terms, cancel search
      appState.searchInProgress = false;
      appState.searchResult = [];
      logInfo('empty terms - stop search');
    } else {  // Else if search already in progress, stores term to launch search when the current one ends
      appState.searchInProgress = true;
      logInfo('search already in progress - storing term', '"' + searchTerms + '"');
    }
  });

})(document, Vue, Rx);