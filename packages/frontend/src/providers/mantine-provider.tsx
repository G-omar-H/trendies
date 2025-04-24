'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

// Luxury theme with dark color scheme
const theme = createTheme({
  primaryColor: 'indigo',
  colors: {
    // Custom color palette for luxury brand
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    indigo: [
      '#E0E8FF',
      '#C7D5FE',
      '#A5B4FC',
      '#818CF8',
      '#6366F1',
      '#4F46E5',
      '#4338CA',
      '#3730A3',
      '#312E81',
      '#1E1B4B',
    ],
    gold: [
      '#FFF7CC',
      '#FFEFAA',
      '#FFE788',
      '#FFDF66',
      '#FFD744',
      '#FFD022',
      '#FFB800',
      '#E6A600',
      '#CC9300',
      '#B38000'
    ]
  },
  fontFamily: "'Playfair Display', 'Raleway', sans-serif",
  headings: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
        }
      }
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        p: 'lg',
      }
    }
  },
});

export function MantineProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
}