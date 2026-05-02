import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"DM Sans", sans-serif',
    body: '"DM Sans", sans-serif',
    mono: '"DM Sans", monospace',
  },
  colors: {
    brand: {
      50: '#e8fdf5',
      100: '#c6f9e3',
      200: '#91f0c4',
      300: '#52e0a0',
      400: '#1ec97a',
      500: '#00b563',
      600: '#009250',
      700: '#00713e',
      800: '#00542e',
      900: '#003a20',
    },
    kigali: {
      green: '#00b563',
      gold: '#f5a623',
      blue: '#1a73e8',
      dark: '#0f1923',
      surface: '#1a2635',
      card: '#1e2d40',
      muted: '#8899aa',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: any) => ({
      body: {
        fontFamily: '"DM Sans", sans-serif',
        bg: props.colorMode === 'dark' ? '#0f1923' : '#f0f4f8',
        color: props.colorMode === 'dark' ? '#e2e8f0' : '#1a202c',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'brand' },
      baseStyle: {
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: '600',
        borderRadius: 'xl',
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? '#1e2d40' : 'white',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200',
        },
      }),
    },
    Input: {
      variants: {
        filled: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.50',
            borderRadius: 'xl',
            _hover: { bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.100' },
            _focus: { bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'white', borderColor: 'brand.400' },
          },
        }),
      },
      defaultProps: { variant: 'filled' },
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#1a2635' : 'white',
          borderRadius: '2xl',
        },
      }),
    },
  },
});

export default theme;
