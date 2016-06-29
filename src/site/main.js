var appState = {
  loading: true,
  loadingStep: 'data',
  loadingProgress: 0,
  searchResult: 0
}

// Worker
var worker = Rx.DOM.fromWorker('js/search.js');
var workerSharedObservable = worker.share();

workerSharedObservable.filter(function(item){
  return item.data.event === 'loading';
}).subscribe(function (e) {
  appState.loadingProgress = e.data.value;
});

workerSharedObservable.filter(function(item){
  return item.data.event === 'result';
}).subscribe(function (e) {
  appState.searchResult = e.data.value;
});

worker.onNext('some data');

var app = new Vue({
  el: '#app',
  data: appState
});


setTimeout(function(){
  appState.loading = false;
}, 5000)
