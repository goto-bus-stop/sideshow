import applyStyles from '@f/apply-styles'
import html from 'bel'

const defaultStyles = {
  width: '1em',
  fill: 'currentColor',
  verticalAlign: 'sub',
  // The icons were taken from an SVG icon font so they're upside down. 🙈
  transform: 'scaleY(-1)'
}

export default function makeIcon (path, props = {}) {
  return (style = {}) => {
    const svg = html`
      <svg viewBox=${props.viewBox}>
        <path d=${path} />
      </svg>
    `

    applyStyles(svg, defaultStyles)
    applyStyles(svg, style)

    return svg
  }
}
