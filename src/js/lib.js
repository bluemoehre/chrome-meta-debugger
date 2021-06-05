/**
 * Returns a HTML escaped string
 * @param {string} text
 * @returns {string}
 */
function htmlEncode(text) {
  return document.createElement('div').appendChild(document.createTextNode(text)).parentNode.innerHTML
}

/**
 * Returns the given string where all placeholders have been replaced with the given data
 * @param {string} html
 * @param {Object} data
 * @param {Boolean} [escape=true]
 * @returns {string}
 */
function replacePlaceholders(html, data, escape) {
  var placeholder
  var replacement
  escape = escape !== false
  for (placeholder in data) {
    if (data.hasOwnProperty(placeholder)) {
      placeholder = placeholder.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1') // escape regex special characters
      replacement = escape ? htmlEncode(data[placeholder]) : data[placeholder]
      html = html.replace(new RegExp('__' + placeholder + '__', 'g'), replacement)
    }
  }
  return html
}

/**
 * Returns a template's HTML as string identified by ID.
 * Template tags and script templates will be unwrapped, normal elements will be converted to string.
 * @param {string} tplId
 * @returns {string}
 */
function getTemplate(tplId) {
  var tpl = document.getElementById(tplId)
  return tpl
    ? tpl.tagName === 'TEMPLATE' || (tpl.tagName === 'SCRIPT' && tpl.getAttribute('type') === 'text/template')
      ? tpl.innerHTML
      : tpl.outerHTML
    : null
}

/**
 * Returns the closest comment optionally filtered by a string.
 * @param DOMNode node
 * @param string filter
 * @returns DOMNode|null
 */
function getClosestComment(node, filter) {
  while (node && (node.parentElement || node.previousSibling)) {
    while ((node = node.previousSibling)) {
      if (node.nodeType === HTMLElement.COMMENT_NODE && (!filter || node.textContent.indexOf(filter) > -1)) {
        return node
      }
    }
    if (node) {
      node = node.parentElement
    }
  }
  return null
}

/**
 * Returns all comment nodes as array structure optionally filtered by a string.
 * @param DOMNode node
 * @param string [filter] optional - filter string
 * @param boolean [linear] optional - return a simple array (no tree)
 * @returns []
 */
function getAllComments(node, filter, linear) {
  var comments = []
  var tmp
  for (var i = 0; i < node.childNodes.length; i++) {
    if (
      node.childNodes[i].nodeType === HTMLElement.COMMENT_NODE &&
      (!filter || node.childNodes[i].textContent.indexOf(filter) > -1)
    ) {
      comments.push(node.childNodes[i])
    } else if (node.childNodes[i].nodeType === HTMLElement.ELEMENT_NODE) {
      tmp = getAllComments(node.childNodes[i], filter, linear)
      if (!linear) {
        if (tmp.length == 1) {
          comments.push(tmp[0])
        } else if (tmp.length > 1) {
          comments.push(tmp)
        }
      } else {
        comments = comments.concat(tmp)
      }
    }
  }
  return comments
}

/**
 * Returns a two way encrypted string (very basic)
 * @param {string} text
 * @param {number} saltId
 * @returns {string}
 */
function crypt(text, saltId) {
  saltId = saltId || 42
  var result = ''
  for (var i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ saltId)
  }
  return btoa(result)
}

/**
 * Decrypt a string which was encrypted with crypt using same salt ID
 * @param {string} text
 * @param {number} saltId
 * @returns {string}
 */
function decrypt(text, saltId) {
  saltId = saltId || 42
  text = atob(text)
  var result = ''
  for (var i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ saltId)
  }
  return result
}

/**
 * Decode template name
 * @param {string} name
 * @returns {string}
 */
function decodeTemplateName(name) {
  return decrypt(name, 42)
}
