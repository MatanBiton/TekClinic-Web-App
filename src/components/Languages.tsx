import React from 'react'
import { Badge, Flex, useComputedColorScheme } from '@mantine/core'

interface LanguagesProps {
  languages: string[]
}

function stringHash (str: string): number {
  // https://stackoverflow.com/a/7616484/10045438
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function languageHue (language: string): number {
  return 150 + stringHash(language) % 160
}

function languageColor (language: string, colorScheme: 'light' | 'dark', hueOffset: number = 0): string {
  const hue = languageHue(language) + hueOffset
  const saturation = colorScheme === 'light' ? 100 : 45
  const lightness = colorScheme === 'light' ? 80 : 45
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const Language: React.FC<{ language: string }> = ({ language }) => {
  const colorScheme = useComputedColorScheme()
  const gradient = {
    from: languageColor(language, colorScheme),
    to: languageColor(language, colorScheme, 10),
    deg: 90
  }
  const textColor = colorScheme === 'light' ? 'black' : 'white'
  return <Badge
      key={language}
      variant="gradient"
      gradient={gradient}
      style={{ color: textColor }}
  >
    {language}
  </Badge>
}

/**
 * A custom component to render a list of languages.
 *
 * This component gives each language a unique color.
 *
 * @param languages - The list of languages to render.
 * @returns A React component that renders a list of languages.
 */
const Languages: React.FC<LanguagesProps> = ({ languages }) => {
  const badges = languages.map(language => <Language key={language} language={language} />)
  return <Flex style={{ margin: '2px' }} direction='column' gap='10px'>
        {badges}
    </Flex>
}

export default Languages
