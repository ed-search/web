/**
 * Object used in VueJS Component to bind values to the view
 *
 * loading: while true display loading animation
 * loadingStep: switch loading message (download, indexing)
 * loadingProgress: update progress bar if supported by loadingStep
 * atLeastOnSearch: true if the user has started at least one search
 * searchResult: display search results
 */
var appState = {
  loading: true,
  loadingStep: 'download',
  loadingProgress: 0,
  atLeastOnSearch: false,
  searchResult: []
};

function logInfo(message, value, color) {
  color = color || '#008d4c';
  var data = ['%cpage', 'color: ' + color, message];
  if (value) {
    data.push(value);
  }
  console.log.apply(console, data);
};

function handleError(e) {
  console.log(e);
}

// Create SearchEngine in a WebWorker
var searchEngineWorker = Rx.DOM.fromWorker('js/search.js');
var searchEngineSharedObservable = searchEngineWorker.share();

// Listen for loading (database downloading and indexing) messages from SearchEngine WebWorker
searchEngineSharedObservable.filter(function(item){
  return item.data.event === 'loading';
}).subscribe(
  function (e) {
    logInfo('loading', e.data);
    appState.loadingProgress = e.data.value;
    appState.loadingStep = e.data.type;
    if (appState.loadingStep == 'ready') {  // Final step when SearchEngine is ready
      appState.loading = false;
    }
  },
  handleError
);

// Listen for search result messages from SearchEngine WebWorker
searchEngineSharedObservable.filter(function(item){
  return item.data.event === 'result';
}).subscribe(
  function (e) {
    logInfo('result', e.data);
    appState.searchResult = e.data.value;
  },
  handleError
);

// Trigger SearchEngine WebWorker indexation.
searchEngineWorker.onNext({action: 'startEngine', url: 'https://raw.githubusercontent.com/ed-search/database/data/articles.json'});

// VueJS component to update HTML when object appState changes
var appComponent = new Vue({
  el: '#app',
  data: appState,
  methods: {
    onSubmit: function() {}  // Prevent standard HTML form submit. We use RxJS to watch for input changes
  }
});
