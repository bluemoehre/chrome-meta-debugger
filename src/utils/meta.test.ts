import { expect, describe, test } from 'vitest'
import { getMeta } from 'utils/meta'

describe('getMeta', () => {
  test('should read base element correctly', () => {
    document.head.innerHTML = '<base href="/"/>'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'base',
        tag: 'base',
        value: '/',
        valueLink: document.baseURI,
        attributes: {},
      },
    ])
  })

  test('should read title element correctly', () => {
    document.head.innerHTML = '<title>test</title>'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'title',
        tag: 'title',
        value: 'test',
        valueLink: null,
        attributes: {},
      },
    ])
  })

  test('should read meta element correctly', () => {
    document.head.innerHTML =
      '<meta charset="utf-8" />' +
      '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
      '<meta name="title" content="Meta Title"/>' +
      '<meta property="og:title" content="OpenGraph Title" />'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'charset',
        tag: 'meta',
        value: 'utf-8',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 1,
        key: 'X-UA-Compatible',
        tag: 'meta',
        value: 'IE=edge',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 2,
        key: 'title',
        tag: 'meta',
        value: 'Meta Title',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 3,
        key: 'og:title',
        tag: 'meta',
        value: 'OpenGraph Title',
        valueLink: null,
        attributes: {},
      },
    ])
  })

  test('should read link element correctly', () => {
    document.head.innerHTML =
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />' +
      '<link rel="shortcut icon" href="/favicon.ico" />' +
      '<link rel="canonical" href="https://example.com" />' +
      '<link rel="search" type="application/opensearchdescription+xml" title="Open Search" href="/opensearch.xml" />' +
      '<link rel="alternate" type="application/atom+xml" title="XML Feed" href="/feed/atom" />'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'icon',
        tag: 'link',
        value: '/favicon-32x32.png',
        valueLink: document.baseURI + 'favicon-32x32.png',
        attributes: {
          sizes: '32x32',
          type: 'image/png',
        },
      },
      {
        idx: 1,
        key: 'shortcut icon',
        tag: 'link',
        value: '/favicon.ico',
        valueLink: document.baseURI + 'favicon.ico',
        attributes: {},
      },
      {
        idx: 2,
        key: 'canonical',
        tag: 'link',
        value: 'https://example.com',
        valueLink: 'https://example.com/',
        attributes: {},
      },
      {
        idx: 3,
        key: 'search',
        tag: 'link',
        value: '/opensearch.xml',
        valueLink: document.baseURI + 'opensearch.xml',
        attributes: {
          title: 'Open Search',
          type: 'application/opensearchdescription+xml',
        },
      },
      {
        idx: 4,
        key: 'alternate',
        tag: 'link',
        value: '/feed/atom',
        valueLink: document.baseURI + 'feed/atom',
        attributes: {
          title: 'XML Feed',
          type: 'application/atom+xml',
        },
      },
    ])
  })

  test('should link values correctly', () => {
    document.head.innerHTML =
      '<base href="/test/"/>' + '<link rel="icon" href="/favicon.ico" />' + '<link rel="canonical" href="index.html" />'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'base',
        tag: 'base',
        value: '/test/',
        valueLink: document.baseURI,
        attributes: {},
      },
      {
        idx: 1,
        key: 'icon',
        tag: 'link',
        value: '/favicon.ico',
        valueLink: document.location.href + 'favicon.ico',
        attributes: {},
      },
      {
        idx: 2,
        key: 'canonical',
        tag: 'link',
        value: 'index.html',
        valueLink: document.baseURI + 'index.html',
        attributes: {},
      },
    ])
  })

  test('should ignore scripts', () => {
    document.head.innerHTML =
      '<base href="/"/>' +
      '<title>test</title>' +
      '<script src="/some.js"></script>' +
      '<link rel="shortcut icon" href="/favicon.ico" />'
    expect(getMeta(document.head)).toEqual([
      {
        idx: 0,
        key: 'base',
        tag: 'base',
        value: '/',
        valueLink: document.baseURI,
        attributes: {},
      },
      {
        idx: 1,
        key: 'title',
        tag: 'title',
        value: 'test',
        valueLink: null,
        attributes: {},
      },
      {
        idx: 3,
        key: 'shortcut icon',
        tag: 'link',
        value: '/favicon.ico',
        valueLink: document.baseURI + 'favicon.ico',
        attributes: {},
      },
    ])
  })
})
