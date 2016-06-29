//lunr(function(){})

console.log('worker');

onmessage = function(e) {
  console.log('Posting message back to main script');
  postMessage(e.data);
}


var loading = 0;
var loadInterval = setInterval(function(){
  postMessage({event: 'loading', value: loading});
  loading++;
}, 1000);

var searchResult = 0;
setTimeout(function(){
  if (loading >= 15) {
    clearInterval(loadInterval);
    setInterval(function(){
      postMessage({event: 'result', value: searchResult});
      searchResult++;
    }, 1000);
  }
}, 20000);
