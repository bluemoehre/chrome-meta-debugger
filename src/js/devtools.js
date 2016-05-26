(function () {
    // prevent double init
    if (window[chrome.runtime.id]) return;
    window[chrome.runtime.id] = true;

    //console.info('devtools injected');

    /**
     * Returns the given object but without the excluded keys
     * @param {DOMNodeMap} attributes
     * @param {Array} exclude
     * @return {null}
     */
    function filterAttributes(attributes, exclude) {
        exclude = exclude || [];
        var result = Object.create(null);

        Array.prototype.slice.call(attributes).forEach(function (attribute) {
            if (exclude.indexOf(attribute.name) < 0) {
                result[attribute.name] = attribute.value;
            }
        });

        return result;
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
        var result = [];
        var headTags = document.querySelectorAll('head title, head base, head meta, head link');
        var tagAttributeMap = {
            //'< tag name >': [
            //     {
            //         keyAttribute: < null|String >,
            //         keyNameBy: '< tagName|tagValue|attrName|attrValue >', // the key name is the tag name or the key's attribute name or key's attribute value
            //         valueAttribute: '< value attribute >' // the main value of this tag
            //     }
            //],

            'TITLE': [
                {
                    keyAttribute: null,
                    keyNameBy: 'tagName',
                    valueAttribute: null
                }
            ],
            'BASE': [
                {
                    keyAttribute: null,
                    keyNameBy: 'tagName',
                    valueAttribute: 'href'
                }
            ],
            'META': [
                {
                    keyAttribute: 'charset',
                    keyNameBy: 'attrName',
                    valueAttribute: 'charset'
                },
                {
                    keyAttribute: 'name',
                    keyNameBy: 'attrValue',
                    valueAttribute: 'content'
                },
                {
                    keyAttribute: 'property',
                    keyNameBy: 'attrValue',
                    valueAttribute: 'content'
                },
                {
                    keyAttribute: 'http-equiv',
                    keyNameBy: 'attrValue',
                    valueAttribute: 'content'
                }
            ],
            'LINK': [
                {
                    keyAttribute: 'rel',
                    keyNameBy: 'attrValue',
                    valueAttribute: 'href'
                }
            ]
        };

        var attributeMap, i, j;
        for (i = 0; i < headTags.length; i++) {
            attributeMap = tagAttributeMap[headTags[i].tagName];
            for (j = 0; j < attributeMap.length; j++) {
                if (attributeMap[j].keyAttribute == null || attributeMap[j].keyAttribute in headTags[i].attributes) {
                    var item = {
                        idx: i,
                        tag: headTags[i].tagName.toLowerCase(),
                        valueLink: headTags[i].href,
                        attributes: filterAttributes(headTags[i].attributes, [attributeMap[j].keyAttribute, attributeMap[j].valueAttribute])
                    };
                    if (attributeMap[j].valueAttribute) {
                        item.value = headTags[i].attributes[attributeMap[j].valueAttribute].value;
                    } else {
                        item.value = headTags[i].textContent;
                    }
                    switch (attributeMap[j].keyNameBy) {
                        case 'tagName':
                            item.key = item.tag;
                            break;
                        case 'tagValue':
                            item.key = headTags[i].textContent;
                            break;
                        case 'attrName':
                            item.key = headTags[i].attributes[attributeMap[j].keyAttribute].name;
                            break;
                        case 'attrValue':
                            item.key = headTags[i].attributes[attributeMap[j].keyAttribute].value;
                            break;

                    }
                    result.push(item);
                    break;
                }
            }
        }

        return result;
    }


    // listen for messages
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        //console.info('got message', message, 'from extension', sender.id);
        if (typeof sendResponse !== 'function') {
            sendResponse = function () {};
        }
        switch (message.action) {
            case 'getPageMeta':
                sendResponse({
                    action: 'updatePageMeta',
                    data: getPageMeta()
                });
                break;
            default:
            //console.error('unknown action "'+ message.action +'" in message');
        }
    });

    // observe changes to the HEAD
    document.addEventListener('DOMContentLoaded', function () {
        new MutationObserver(function (mutations) {
            chrome.runtime.sendMessage({
                action: 'updatePageMeta',
                data: getPageMeta()
            });
        }).observe(document.querySelector('head'), {
            attributes: true,
            childList: true,
            subtree: true
        });
    });

})();