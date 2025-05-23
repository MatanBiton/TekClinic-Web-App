import { AppShell, Burger, Button, Flex, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { FaMoon, FaSun } from 'react-icons/fa'
import React from 'react'

const Header = ({
  toggle,
  opened
}: any): React.JSX.Element => {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light')

  const toggleColorScheme = (): void => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <AppShell.Header>
      <Flex justify="space-between" align="center" style={{ padding: '10px 20px' }}>
        <Burger opened={opened} onClick={toggle} visibleFrom="sm" size="sm"/>
        <div style={{ fontSize: '25px' }}>TekClinic 🩺</div>
        <Button style={{
          backgroundColor: 'transparent',
          fontSize: '17px'
        }} size="sm" variant="link" onClick={toggleColorScheme}>
          {computedColorScheme === 'dark' ? <FaSun style={{ color: '#ccc' }}/> : <FaMoon style={{ color: '#ccc' }}/>}
        </Button>
      </Flex>
    </AppShell.Header>
  )
}

export default Header
