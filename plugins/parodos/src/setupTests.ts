import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

jest.mock('@material-ui/core/styles', () => ({
  createStyles: () => () => ({}),
  makeStyles: () => () => ({}),
  withStyles: () => () => ({}),
}));
