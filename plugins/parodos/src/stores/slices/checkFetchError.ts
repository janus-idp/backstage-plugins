export const checkFetchError = (response: Response): void => {
  if (response.status !== 200) {
    // eslint-disable-next-line no-throw-literal
    throw {
      name: 'Failed to load data',
      message: `Error fetching projects: ${response.status} ${response.statusText}`,
      status: response.status,
    };
  }
};
