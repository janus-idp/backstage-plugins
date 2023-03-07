import { withTheme } from '@rjsf/core-v5';

// TODO(blam): We require here, as the types in this package depend on @rjsf/core explicitly
// which is what we're using here as the default types, it needs to depend on @rjsf/core-v5 because
// of the re-writing we're doing. Once we've migrated, we can import this the exact same as before.
/** @alpha */
export const Form = withTheme(require('@rjsf/material-ui-v5').Theme);
