export const FALLBACK_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M2,2H20V20H2V2M3,3V19H19V3H3Z" /></svg>'

export class IconElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const iconName = (this.textContent ?? '').trim()
    this.loadIcon(iconName)
  }

  async loadIcon(name: string) {
    try {
      if (!name) throw new Error(`Icon name is required`)
      const response = await fetch(`/icons/${name}.svg`)
      if (!response.ok) throw new Error(`Failed to fetch icon: ${name}`)
      const svgContent = await response.text()
      this.render(svgContent)
    } catch (error) {
      console.error(error)
      this.render(FALLBACK_SVG)
    }
  }

  render(content: string) {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 1lh;
          height: 1lh;
          vertical-align: middle;
        }
        svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
      </style>
      ${content}
    `
  }
}
