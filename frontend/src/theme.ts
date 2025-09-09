import { createTheme, Group } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  defaultRadius: 'md',
  primaryShade: 8,
  fontFamily:
    'sans-serif-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";',
  primaryColor: 'indigo',
  components: {
    Group: Group.extend({
      defaultProps: {
        gap: 'xs',
        wrap: 'nowrap',
      },
    }),
  },
});
