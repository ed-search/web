var appState = {
  loading: true,
  subattr: {
    data1: 'toto'
  }
}

var app = new Vue({
  el: '#app',
  data: appState
});


setTimeout(function(){
  appState.loading = false;
}, 5000)
