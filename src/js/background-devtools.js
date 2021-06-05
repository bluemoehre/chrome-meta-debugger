chrome.devtools.panels.create('Meta', 'icon128.png', '/html/panel-meta.html', function (panel) {
  var inited = false
  panel.onShown.addListener(function () {
    if (inited) return
    inited = true
    console.log('meta panel init')
  })
  panel.onSearch.addListener(function (action, queryString) {
    console.log('onSearch triggered in background-devtools', action, queryString)
    //chrome.runtime.sendMessage({
    //    action: 'search',
    //    data: queryString
    //});
  })
})
