/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

// Importing JSON files with dynamic import since require is not supported in ES modules
const jsonFiles = {
  ri: import('@iconify/json/json/ri.json'),
  lineMd: import('@iconify/json/json/line-md.json'),
}

// Convert the imported JSON files to a promise array
const sources = {
  json: [
    jsonFiles.ri,
    {
      filename: jsonFiles.lineMd,
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',
    'twemoji-auto-rickshaw'
  ],
  svg: [
    /* {
      dir: 'src/assets/iconify-icons/svg',
      monotone: false,
      prefix: 'custom'
    } */
    /* {
      dir: 'src/assets/iconify-icons/emojis',
      monotone: false,
      prefix: 'emoji'
    } */
  ]
}

// File to save bundle to
const target = join(__dirname, 'generated-icons.css')

;(async function () {
  // Create directory for output if missing
  const dir = dirname(target)

  try {
    await fs.mkdir(dir, {
      recursive: true
    })
  } catch (err) {
    //
  }

  const allIcons = []

  /**
   * Convert sources.icons to sources.json
   */
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = [])

    // Sort icons by prefix
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const filename = await jsonFiles[prefix]?.default // Dynamic import for JSON files

      sourcesJSON.push({
        filename,
        icons: organizedList[prefix]
      })
    }
  }

  /**
   * Bundle JSON files and collect icons
   */
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]

      // Load icon set
      const filename = typeof item === 'string' ? item : item.filename
      const content = await filename // Await dynamic import result
      const iconsContent = await content

      // Filter icons
      if (typeof item !== 'string' && item.icons?.length) {
        const filteredContent = getIcons(iconsContent, item.icons)

        if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)

        // Collect filtered icons
        allIcons.push(filteredContent)
      } else {
        // Collect all icons from the JSON file
        allIcons.push(iconsContent)
      }
    }
  }

  /**
   * Bundle custom SVG icons and collect icons
   */
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i]

      // Import icons
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      // Validate, clean up, fix palette, etc.
      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return

        // Get SVG instance for parsing
        const svg = iconSet.toSVG(name)

        if (!svg) {
          // Invalid icon
          iconSet.remove(name)

          return
        }

        // Clean up and optimise icons
        try {
          // Clean up icon code
          await cleanupSVG(svg)

          if (source.monotone) {
            // Replace color with currentColor, add if missing
            // If icon is not monotone, remove this code
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }

          // Optimise
          await runSVGO(svg)
        } catch (err) {
          // Invalid icon
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)

          return
        }

        // Update icon from SVG instance
        iconSet.fromSVG(name, svg)
      })

      // Collect the SVG icon
      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS from collected icons
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  // Save the CSS to a file
  await fs.writeFile(target, cssContent, 'utf8')
  console.log(`Saved CSS to ${target}!`)
})().catch(err => {
  console.error(err)
})

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons) {
  const sorted = Object.create(null)

  icons.forEach(icon => {
    const item = stringToIcon(icon)

    if (!item) return
    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])
    const name = item.name

    if (!prefixList.includes(name)) prefixList.push(name)
  })

  return sorted
}
