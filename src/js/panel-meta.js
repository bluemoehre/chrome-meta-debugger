/**
 * Special char for marking string parts
 * @type {string}
 */
const MARK_CHAR = '\uFEFF'; // using U+FEFF (Zero width no-break space) for marking

/**
 * @type {[string]}
 */
const IGNORED_DUPLICATE_KEYS = [
    'msapplication-task',
    'msapplication-task-separator'
];

/**
 * Connection to background page
 * @type chrome.runtime.Port
 */
var port;

/**
 * @type {Array}
 */
var metaData = [];

/**
 * @type {HTMLFormElement}
 */
var filterForm;

/**
 * @type {HTMLInputElement}
 */
var filterInput;

/**
 * @type {HTMLButtonElement}
 */
var filterClearButton;

/**
 * @type {HTMLButtonElement}
 */
var filterReloadButton;

/**
 * @type {HTMLInputElement}
 */
var filterFlagSearchKeys;

/**
 * @type {HTMLInputElement}
 */
var filterFlagSearchValues;

/**
 * @type {HTMLElement}
 */
var metaList;

/**
 * @type {string}
 */
var metaListItemTemplate;

/**
 * @type {string}
 */
var metaListItemAttributeTemplate;

/**
 * @type {HTMLElement}
 */
var notificationList;

/**
 * @type {HTMLElement}
 */
var notificationWarningTemplate;

/**
 * @type {number}
 */
var statusTimeout;

/**
 * Regular Expression for URLs
 * @see https://gist.github.com/dperini/729294
 * @type {RegExp}
 */
var rxUrl = new RegExp(
    // protocol identifier
    "(?:(?:[a-z-]+:)?//)" +
        // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
    // IP address exclusion
    // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
    // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    // TLD may end with dot
    "\\.?" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#][\\S" + MARK_CHAR + "]*)?"
    ,
    "ig"
);

/**
 * Regular Expression to find all mark chars
 * @type {RegExp}
 */
var rxMarkChar = new RegExp(MARK_CHAR, 'g');


/**
 * Link all URLs within a string
 * @param string
 * @returns {string}
 */
function linkURLs(string) {
    return string.replace(rxUrl, function (match) {
        return '<a href="' + stripWordMarks(match) + '" target="_blank">' + match + '</a>';
    });
}

/**
 * Truncates a string and adds ellipsis at the end
 * @param {string} string
 * @param {number} length
 * @return {string}
 */
function truncate(string, length) {
    return string.length > length
        ? string.substr(0, length) + '…'
        : string
    ;
}

/**
 * Wraps words within string in special chars
 * @param {string} string
 * @param {(null|Array)} words
 * @return {string}
 */
function markWords(string, words) {
    if (words) {
        for (var i = 0; i < words.length; i++) {
            string = words[i].length ? string.replace(new RegExp('(' + words[i] + ')', 'gi'), MARK_CHAR + '$1' + MARK_CHAR) : string;
        }
    }

    return string;
}

/**
 * Strips all mark chars from the given string
 * @param string
 * @return {string}
 */
function stripWordMarks(string) {
    return string.replace(rxMarkChar, '');
}

/**
 * Converts marks added by markWords() to HTML tags
 * @param {string} string
 * @return {string}
 */
function convertMarksToHtml(string) {
    return string.replace(new RegExp(MARK_CHAR + '(.+?)' + MARK_CHAR, 'gm'), '<mark>$1</mark>')
}

/**
 * Rebuilds the meta list
 */
function refreshMetaList() {
    var filterString;
    var filterRx;
    var value;
    var classes;
    var keyMatches = null;
    var valueMatches = null;
    var distinctKeys = [];
    var duplicateKeys = [];
    var items = [];
    var i = 0;

    try {
        filterString = filterInput.value;
        filterRx = new RegExp(filterString
            .replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') // escape Regexp special chars
            .replace(/\s*,\s*(?=\S)/g, '|') // split input by comma for multi filter
            .replace(/\s*,\s*$/, '') // remove standalone comma at end
            , 'i');
    } catch (e) {
    }

    // mark duplicate meta, base and title tags
    for (i = 0; i < metaData.length; i++) {
        if (metaData[i].tag === 'meta' || metaData[i].tag === 'base' || metaData[i].tag === 'title') {
            if (distinctKeys.indexOf(metaData[i].key) < 0) {
                distinctKeys.push(metaData[i].key);
            } else if (IGNORED_DUPLICATE_KEYS.indexOf(metaData[i].key) < 0) {
                duplicateKeys.push(metaData[i].key);
            }
        }
    }

    for (i = 0; i < metaData.length; i++) {
        if (filterString) {
            if (filterFlagSearchKeys.checked) {
                keyMatches = metaData[i].key.match(filterRx);
            }
            if (filterFlagSearchValues.checked) {
                valueMatches = metaData[i].value.match(filterRx);
            }
        }
        if (!filterString || keyMatches || valueMatches) {
            // truncate value if it does not contain any filter match
            value = valueMatches ? metaData[i].value : truncate(metaData[i].value, 900);

            classes = [];
            // test for duplicate keys
            if (duplicateKeys.indexOf(metaData[i].key) >= 0) classes.push('warning');
            // test if value has a whitespace ratio of 1:25 else enable word-break
            if ((value.match(/([\s]+)/g) || []).length < value.length / 25) classes.push('break-value');

            items.push(replacePlaceholders(metaListItemTemplate, {
                idx: metaData[i].idx,
                class: classes.join(' '),
                tag: metaData[i].tag,
                key: convertMarksToHtml(htmlEncode(markWords(metaData[i].key, keyMatches))),
                value: metaData[i].valueLink
                    ? '<a href="' + metaData[i].valueLink + '" target="_blank">' + convertMarksToHtml(htmlEncode(markWords(value, valueMatches))) + '</a>'
                    : convertMarksToHtml(linkURLs(htmlEncode(markWords(value, valueMatches)))),
                attributes: function () {
                    var attributes = [];
                    for (var name in metaData[i].attributes) {
                        if (metaData[i].attributes.hasOwnProperty(name)) {
                            attributes.push(replacePlaceholders(metaListItemAttributeTemplate, {
                                name: name,
                                value: metaData[i].attributes[name]
                            }))
                        }
                    }
                    return attributes.join('');
                },
            }, false));
        }
    }

    metaList.innerHTML = items.join('');


    var notifications = [];

    if (duplicateKeys.length) {
        notifications.push(replacePlaceholders(notificationWarningTemplate, {
            text: 'Duplicate keys found',
            search: duplicateKeys.join(',')
        }));
    }

    notificationList.innerHTML = notifications.join();
}

/**
 * Inspect a HEAD tag within Element Panel
 * @param {number} idx - metaData index key
 */
function inspectInElementsPanel(idx) {
    chrome.devtools.inspectedWindow.eval('inspect($$(\'head title, head base, head meta, head link\')[' + parseInt(idx) + '])');
}


port = chrome.runtime.connect({
    name: 'panel-meta'
});


// listen for messages
port.onMessage.addListener(function (message) {
    console.info('got message', message);
    switch (message['action']) {
        case 'refresh':
            clearTimeout(statusTimeout);
            statusTimeout = setTimeout(function () {
                document.body.setAttribute('data-message', 'Waiting for metadata …');
                statusTimeout = setTimeout(function () {
                    document.body.setAttribute('data-message', 'Timeout while getting metadata. A page reload may help.');
                }, 3000);
            }, 50);
            port.postMessage({
                action: 'getPageMeta',
                tabId: chrome.devtools.inspectedWindow.tabId
            });
            break;
        case 'updatePageMeta':
            clearTimeout(statusTimeout);
            document.body.removeAttribute('data-message');
            metaData = message['data'];
            refreshMetaList();
            break;
        case 'error':
            clearTimeout(statusTimeout);
            document.body.setAttribute('data-message', message['error']);
            break;
        default:
            console.error('unknown action in message');
    }
});


// load templates & select elements & bind event handlers
document.addEventListener('DOMContentLoaded', function () {
    filterForm = document.getElementById('filters');
    metaList = document.getElementById('meta');
    metaListItemTemplate = getTemplate('templateMetaItem');
    metaListItemAttributeTemplate = getTemplate('templateMetaItemAttribute');
    filterInput = filterForm.querySelector('input[name="filterString"]');
    filterClearButton = filterForm.querySelector('button[name="clearFilter"]');
    filterReloadButton = filterForm.querySelector('button[name="reload"]');
    filterFlagSearchKeys = filterForm.querySelector('input[name="searchKeys"]');
    filterFlagSearchValues = filterForm.querySelector('input[name="searchValues"]');
    notificationList = document.getElementById('notifications');
    notificationWarningTemplate = getTemplate('notificationWarning');

    filterForm.addEventListener('reset', function () {
        setTimeout(function () {
            refreshMetaList();
            filterInput.focus();
        }, 0);
    });

    filterInput.addEventListener('input', refreshMetaList);
    filterFlagSearchKeys.addEventListener('change', refreshMetaList);
    filterFlagSearchValues.addEventListener('change', refreshMetaList);
    filterClearButton.addEventListener('click', function () {
        filterInput.value = '';
        refreshMetaList();
    });
    filterReloadButton.addEventListener('click', function () {
        filterReloadButton.classList.add('_animate');
        setTimeout(function () {
            filterReloadButton.classList.remove('_animate');
        }, 1000);
        port.postMessage({
            action: 'getPageMeta',
            tabId: chrome.devtools.inspectedWindow.tabId
        });
    });

    document.addEventListener('click', function (evt) {
        var link = evt.target.closest('a');
        if (link && link.matches('a[href^="#!"]')) {
            var match = link.getAttribute('href').match(/^#!(\w+)=(.*)$/);
            switch (match[1]) {
                case 'inspect':
                    inspectInElementsPanel(match[2]);
                    break;
                case 'searchKeys':
                    filterFlagSearchKeys.checked = true;
                    filterFlagSearchValues.checked = false;
                    filterInput.value = match[2];
                    refreshMetaList();
                    break;
                default:
                    console.error('unknown link action');
            }
        }
    });
});


// automatically focus filter when user starts typing
// but not when Command (OSX) / CTRL (Win) is pressed to keep copy functionality
document.addEventListener('keydown', function (evt) {
    !evt.ctrlKey && !evt.metaKey && filterInput && filterInput.focus();
});


// initially init message channel
port.postMessage({
    action: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});


// initially get page meta
port.postMessage({
    action: 'getPageMeta',
    tabId: chrome.devtools.inspectedWindow.tabId
});