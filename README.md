# chrome-meta-debugger

This Chrome extension streamlines your daily tasks by analyzing and displaying webpage metadata like Titles, Descriptions, Canonicals, Open Graph, Social Sharing Tags and more.

## Features

- **Standardized view**: \
  Displays the document's head elements in a consistent format:\
  `<title>`, `<meta>`, `<base>`, `<link>`, ~~`<style>`~~, ~~`<script>`~~, ~~`<noscript>`~~
- **Integrated panel**: \
  Access the "Meta" panel directly within Chrome DevTools.
- **Advanced filter**: \
  Searches across all metadata. Options allow focusing on specific purposes.
- **Real-Time updates**: \
  All metadata is dynamically updated in real-time.
- **Element Inspector**: \
  Provides direct links into the Chrome Element Inspector Panel.
- **Duplicate Detection**: \
  Automatically identifies and highlights duplicate metadata elements.
- **SEO Analysis**: \
  Automatically detects and highlights (potential) SEO issues.

## How to install

- Open Google Chrome (if you are not already using it ;)
- Navigate to [Chrome Web Store / Extensions / Meta Debugger](https://chrome.google.com/webstore/detail/meta-debugger/jfpdemgdamgplelnlmaecbonkfgfgomp)
- Press "Install" / "Add"

A little icon should now appear right next to your address bar.
If you now open the DevTools a new panel "Meta" should be provided.

## How to use

- Results are displayed in their source code order
- The result list is always kept up-to-date. When (for whatever reason) it seems stucked,
  you may press the reload button located at the upper right.
- The filter can be easily used by starting typing (the input doesn't need to be focused before)
- You can filter by multiple arguments if you use `,` as delimiter (e.g. "title, canonical")
- To show up result options/actions simply hover its row

## How to build

- Clone this repository
- Run `npm ci` to install exactly the packages that have been checked in
- Run `npm run build` to create a new build
- Open Chrome / Chromium
- Navigate to `chrome://extensions/`
- Click "_Load unpacked extension_" and select the `dist` folder from your local copy

## Future Plans

- better handling of search event within meta panel
- highlight real time changes within the list
- provide a history of all changes made after the initial page load to track JavaScript behaviors
- add image preview
- add option to exclude stylesheets

## Icons

The SVG icons used in this project have been created by Google Inc. and
are licensed under the [Apache-2.0 License](https://github.com/google/material-design-icons/blob/master/LICENSE).
Have a look into the [Material Design Icons](https://github.com/google/material-design-icons) for more of these.

---

Created with ❤️ in Hamburg, Germany\
Updated with 🔥 in Lüneburg, Germany
