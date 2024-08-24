chrome.devtools.panels.create('Meta', 'icon128.png', '/panel-meta.html', (panel) => {
  let initialized = false

  panel.onShown.addListener(() => {
    if (initialized) return
    initialized = true
    console.log('panel rendered')
  })

  panel.onSearch.addListener((action, queryString) => {
    console.log('panel search triggered', action, queryString)
    //chrome.runtime.sendMessage({
    //    action: 'search',
    //    data: queryString
    //});
  })
})
