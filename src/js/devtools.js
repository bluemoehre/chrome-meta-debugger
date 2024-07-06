;(function () {
  // prevent double init
  if (window[chrome.runtime.id]) return
  window[chrome.runtime.id] = true
  // console.log('DevTools:Meta', 'content script injected')

  /**
   * @type {string}
   */
  var PORT_NAME = 'devtools.panel.meta'

  /**
   * @type {string}
   */
  var ACTION_UPDATE = 'update'

  /**
   * Returns the given object but without the excluded keys
   * @param {DOMNodeMap} attributes
   * @param {Array} exclude
   * @return {null}
   */
  function filterAttributes(attributes, exclude) {
    exclude = exclude || []
    var result = Object.create(null)

    Array.prototype.slice.call(attributes).forEach(function (attribute) {
      if (exclude.indexOf(attribute.name) < 0) {
        result[attribute.name] = attribute.value
      }
    })

    return result
  }

  /**
   * Returns a list of objects representing the page's meta informations.
   * Each object contains
   * - tag: tag name
   * - key: the identification key for the devpanel
   * - value: the main value
   * - valueLink: the main value linked (if available)
   * - attributes: all other attributes which have not been in use by the properties above
   * @return {Array}
   */
  function getPageMeta() {
    var result = []
    var headTags = document.querySelectorAll('head title, head base, head meta, head link')
    var tagAttributeMap = {
      //'< tag name >': [
      //     {
      //         keyAttribute: < null|String >,
      //         keyNameBy: '< tagName|tagValue|attrName|attrValue >', // the key name is the tag name or the key's attribute name or key's attribute value
      //         valueAttribute: '< value attribute >' // the main value of this tag
      //     }
      //],
      TITLE: [
        {
          keyAttribute: null,
          keyNameBy: 'tagName',
          valueAttribute: null,
        },
      ],
      BASE: [
        {
          keyAttribute: null,
          keyNameBy: 'tagName',
          valueAttribute: 'href',
        },
      ],
      META: [
        {
          keyAttribute: 'charset',
          keyNameBy: 'attrName',
          valueAttribute: 'charset',
        },
        {
          keyAttribute: 'name',
          keyNameBy: 'attrValue',
          valueAttribute: 'content',
        },
        {
          keyAttribute: 'property',
          keyNameBy: 'attrValue',
          valueAttribute: 'content',
        },
        {
          keyAttribute: 'http-equiv',
          keyNameBy: 'attrValue',
          valueAttribute: 'content',
        },
      ],
      LINK: [
        {
          keyAttribute: 'rel',
          keyNameBy: 'attrValue',
          valueAttribute: 'href',
        },
      ],
    }

    var attributeMap, i, j
    for (i = 0; i < headTags.length; i++) {
      attributeMap = tagAttributeMap[headTags[i].tagName]
      for (j = 0; j < attributeMap.length; j++) {
        if (attributeMap[j].keyAttribute == null || attributeMap[j].keyAttribute in headTags[i].attributes) {
          var item = {
            idx: i,
            tag: headTags[i].tagName.toLowerCase(),
            valueLink: headTags[i].href,
            attributes: filterAttributes(headTags[i].attributes, [
              attributeMap[j].keyAttribute,
              attributeMap[j].valueAttribute,
            ]),
          }
          if (attributeMap[j].valueAttribute && attributeMap[j].valueAttribute in headTags[i].attributes) {
            item.value = headTags[i].attributes[attributeMap[j].valueAttribute].value
          } else {
            item.value = headTags[i].textContent
          }
          switch (attributeMap[j].keyNameBy) {
            case 'tagName':
              item.key = item.tag
              break
            case 'tagValue':
              item.key = headTags[i].textContent
              break
            case 'attrName':
              item.key = headTags[i].attributes[attributeMap[j].keyAttribute].name
              break
            case 'attrValue':
              item.key = headTags[i].attributes[attributeMap[j].keyAttribute].value
              break
          }
          result.push(item)
          break
        }
      }
    }

    return result
  }

  /**
   * Sends current meta data to devtools panel
   * @param {chrome.runtime.Port} port
   * @param {*} message
   */
  function sendMessage(port, message) {
    // console.log('DevTools:Meta', 'sending message to panel', { message })
    port.postMessage(message)
  }

  // handle connects from devtools panel
  chrome.runtime.onConnect.addListener(function (newPort) {
    if (newPort.name !== PORT_NAME) return
    port = newPort
    // console.info('DevTools:Meta', 'panel connected', { port: port.name, sender: port.sender })

    // listen for messages
    port.onMessage.addListener(function (message, port) {
      // console.log('DevTools:Meta', 'received message', { message, port: port.name, sender: port.sender })
      switch (message.action) {
        case ACTION_UPDATE:
          sendMessage(port, { action: ACTION_UPDATE, data: getPageMeta() })
          break
        default:
          // console.error('DevTools:Meta', 'unknown action "' + message.action + '" in message')
      }
    })

    // handle disconnect
    port.onDisconnect.addListener(function (port) {
      // console.info('DevTools:Meta', 'panel disconnected', { port: port.name, sender: port.sender })
      port = null
    })

    // initially send the current data
    sendMessage(port, { action: ACTION_UPDATE, data: getPageMeta() })
  })

  // observe changes to the HEAD
  document.addEventListener('DOMContentLoaded', function () {
    new MutationObserver(function (mutations) {
      // console.log('DevTools:Meta', 'DOM mutation detected', { mutations })
      if (port) {
        sendMessage(port, { action: ACTION_UPDATE, data: getPageMeta() })
      }
    }).observe(document.querySelector('head'), {
      attributes: true,
      childList: true,
      subtree: true,
    })
  })
})()
