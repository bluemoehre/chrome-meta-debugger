import { expect, describe, test } from 'vitest'
import { filterAttributes, getMeta } from 'utils/meta'

describe('getMeta', () => {
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

  test('should ignore style elements', () => {
    document.head.innerHTML =
      '<base href="/"/>' +
      '<title>test</title>' +
      '<style>:root { display: none; }</style>' +
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

  test('should ignore script elements', () => {
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

  test('should ignore noscript elements', () => {
    document.head.innerHTML =
      '<base href="/"/>' +
      '<title>test</title>' +
      '<noscript>Purist!</noscript>' +
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

describe('filterAttributes', () => {
  const link = document.createElement('link')
  link.setAttribute('rel', 'test')
  link.setAttribute('href', '#test')
  link.setAttribute('data-test', 'some test')

  test('should return all if no exclusion was provided', () => {
    expect(filterAttributes(link.attributes)).toEqual({
      'href': '#test',
      'rel': 'test',
      'data-test': 'some test',
    })
  })

  test('should exclude listed attributes', () => {
    expect(filterAttributes(link.attributes, ['data-test'])).toEqual({
      href: '#test',
      rel: 'test',
    })
  })
})

/**
 * <head>
<meta charset="utf-8">
<meta name="theme-color" content="#333">
<link rel="dns-prefetch" href="//style.sndcdn.com">
<link rel="dns-prefetch" href="//a-v2.sndcdn.com">
<link rel="dns-prefetch" href="//api-v2.soundcloud.com">
<link rel="dns-prefetch" href="//sb.scorecardresearch.com">
<link rel="dns-prefetch" href="//secure.quantserve.com">
<link rel="dns-prefetch" href="//eventlogger.soundcloud.com">
<link rel="dns-prefetch" href="//api.soundcloud.com">
<link rel="dns-prefetch" href="//ssl.google-analytics.com">
<link rel="dns-prefetch" href="//i1.sndcdn.com">
<link rel="dns-prefetch" href="//i2.sndcdn.com">
<link rel="dns-prefetch" href="//i3.sndcdn.com">
<link rel="dns-prefetch" href="//i4.sndcdn.com">
<link rel="dns-prefetch" href="//wis.sndcdn.com">
<link rel="dns-prefetch" href="//va.sndcdn.com">
<link rel="dns-prefetch" href="//pixel.quantserve.com">
<title>Stream Boris Way  | Hör dir kostenlos Musik-Alben online auf SoundCloud an</title>
<meta content="record, sounds, share, sound, audio, tracks, music, soundcloud" name="keywords">
<meta name="referrer" content="origin">
<meta name="google-site-verification" content="dY0CigqM8Inubs_hgrYMwk-zGchKwrvJLcvI_G8631Q">
<link crossorigin="use-credentials" rel="manifest" href="/webmanifest.json">
<meta name="viewport" content="width=device-width,minimum-scale=1,maximum-scale=1,user-scalable=no">
<meta content="19507961798" property="fb:app_id">
<meta content="SoundCloud" property="og:site_name">
<meta content="SoundCloud" property="twitter:site">
<meta content="SoundCloud" property="twitter:app:name:iphone">
<meta content="336353151" property="twitter:app:id:iphone">
<meta content="SoundCloud" property="twitter:app:name:ipad">
<meta content="336353151" property="twitter:app:id:ipad">
<meta content="SoundCloud" property="twitter:app:name:googleplay">
<meta content="com.soundcloud.android" property="twitter:app:id:googleplay">
<link href="/sc-opensearch.xml" rel="search" title="SoundCloud" type="application/opensearchdescription+xml">
<meta name="description" content="Play Boris Way on SoundCloud. 4401 followers. 45 tracks on desktop and mobile.">
<meta property="twitter:app:name:iphone" content="SoundCloud">
<meta property="twitter:app:id:iphone" content="336353151">
<meta property="twitter:app:name:ipad" content="SoundCloud">
<meta property="twitter:app:id:ipad" content="336353151">
<meta property="twitter:app:name:googleplay" content="SoundCloud">
<meta property="twitter:app:id:googleplay" content="com.soundcloud.android">
<meta property="twitter:app:url:googleplay" content="soundcloud://users:2455080">
<meta property="twitter:app:url:iphone" content="soundcloud://users:2455080">
<meta property="twitter:app:url:ipad" content="soundcloud://users:2455080">
<meta property="twitter:title" content="Boris Way">
<meta property="twitter:image" content="https://i1.sndcdn.com/avatars-PmyJOQJxSM3TyF7I-FaSLag-t500x500.jpg">
<meta property="twitter:description" content="Boris Way is a &quot;Love House&quot; DJ-producer-composer hailing from the French Riviera who amassed over 150 million streams on various streaming platforms. Signed to SONY Music Entertainment (Ultra Records "><meta property="twitter:card" content="player"><meta property="twitter:player:height" content="450"><meta property="twitter:player:width" content="435"><meta property="twitter:player" content="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F2455080&amp;auto_play=false&amp;show_artwork=true&amp;visual=true&amp;origin=twitter"><meta property="twitter:url" content="https://soundcloud.com/borisway"><meta property="al:ios:app_name" content="SoundCloud"><meta property="al:ios:app_store_id" content="336353151"><meta property="al:android:app_name" content="SoundCloud"><meta property="al:android:package" content="com.soundcloud.android"><meta property="og:type" content="music.musician"><meta property="og:url" content="https://soundcloud.com/borisway"><meta property="og:title" content="Boris Way"><meta property="og:image" content="https://i1.sndcdn.com/avatars-PmyJOQJxSM3TyF7I-FaSLag-t500x500.jpg"><meta property="og:image:width" content="500"><meta property="og:image:height" content="500"><meta property="og:description" content="Boris Way is a &quot;Love House&quot; DJ-producer-composer hailing from the French Riviera who amassed over 150 million streams on various streaming platforms. Signed to SONY Music Entertainment (Ultra Records ">
<meta property="og:locality" content="">
<meta property="og:country-name" content="undefined">
<meta property="al:ios:url" content="soundcloud://users:2455080">
<meta property="al:android:url" content="soundcloud://users:2455080">
<meta property="al:web:should_fallback" content="false">
<meta property="soundcloud:sound_count" content="45">
<meta property="soundcloud:follower_count" content="4401">
<link rel="canonical" href="https://soundcloud.com/borisway">
<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.soundcloud.com/borisway">
<link rel="alternate" type="text/xml+oembed" href="https://soundcloud.com/oembed?url=https%3A%2F%2Fsoundcloud.com%2Fborisway&amp;format=xml">
<link rel="alternate" type="text/json+oembed" href="https://soundcloud.com/oembed?url=https%3A%2F%2Fsoundcloud.com%2Fborisway&amp;format=json">
<link rel="alternate" href="android-app://com.soundcloud.android/soundcloud/users:2455080">
<link rel="alternate" href="ios-app://336353151/soundcloud/users:2455080">
<meta name="application-name" content="SoundCloud">
<meta name="msapplication-tooltip" content="Launch SoundCloud">
<meta name="msapplication-TileImage" content="https://a-v2.sndcdn.com/assets/images/sc-icons/win8-2dc974a18a.png">
<meta name="msapplication-TileColor" content="#ff5500">
<meta name="msapplication-starturl" content="https://soundcloud.com">
<link href="https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14bdb.ico" rel="icon">
<link href="https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8fe7.png" rel="apple-touch-icon">
<link href="https://a-v2.sndcdn.com/assets/images/sc-icons/fluid-b4e7a64b8b.png" rel="fluid-icon">
<link rel="stylesheet" href="https://style.sndcdn.com/css/inter-43e88497e6ff16c818c5.css">
<link rel="stylesheet" href="https://a-v2.sndcdn.com/assets/css/app-695cb4782df564cc8803.css">
</head>
 */
