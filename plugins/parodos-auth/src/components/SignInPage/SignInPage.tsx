import {
  configApiRef,
  errorApiRef,
  useApi,
  type SignInPageProps,
} from '@backstage/core-plugin-api';
import { LoginForm } from '../LoginForm/LoginForm';
import React, { useCallback, useEffect, useState } from 'react';
import { Content, Page, Progress } from '@backstage/core-components';
import { Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import { type IChangeEvent } from '@rjsf/core-v5';
import { Link } from 'react-router-dom';
import { assert } from 'assert-ts';
import {
  ParodosSignInIdentity,
  SessionStorageKey,
} from './ParodosSigninIdentity';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import type { User } from './types';
import { getToken } from './getToken';
import { BrandIcon } from '../icons/BrandIcon';

type ParodosSignInPageProps = SignInPageProps;

const LoginUrl = `/api/proxy/parodos/login`;

const useStyles = makeStyles(theme => ({
  container: {
    display: 'grid',
    placeItems: 'center',
    '& h1': {
      margin: 0,
      marginBottom: theme.spacing(4),
      fontSize: '4rem',
      lineHeight: 1,
    },
    '& button': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
    },
    '& a': {
      textTransform: 'none',
      fontWeight: 'normal',
    },
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      marginBottom: theme.spacing(10),
    },
  },
  paper: {
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    textAlign: 'center',
    color: '#000000',
  },
}));

export function SignInPage({ onSignInSuccess }: ParodosSignInPageProps) {
  const styles = useStyles();
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('backend.baseUrl');
  const [checkingToken, setTokenCheck] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(SessionStorageKey);
    // TODO: this is all temporary until basic auth is removed
    if (token) {
      try {
        const [userName, password] = Buffer.from(token, 'base64')
          .toString('binary')
          .split(':');

        onSignInSuccess(new ParodosSignInIdentity(userName, password));
      } catch {
        setTokenCheck(false);
      }
    } else {
      setTokenCheck(false);
    }
  }, [onSignInSuccess]);

  const [{ error, loading }, login] = useAsyncFn(async (user: User) => {
    const token = getToken(user);

    return await fetch(`${baseUrl}${LoginUrl}`, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    });
  });

  const submitHandler = useCallback(
    async (data: IChangeEvent<User>) => {
      assert(!!data.formData);
      const { formData: user } = data;

      const response = await login(user);

      if (response.ok) {
        onSignInSuccess(
          new ParodosSignInIdentity(user.userName, user.password),
        );
      } else {
        errorApi.post(new Error('Unauthorized'));
      }
    },
    [errorApi, login, onSignInSuccess],
  );

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      errorApi.post(new Error('Start workflow failed'));
    }
  }, [errorApi, error]);

  if (loading || checkingToken) {
    return <Progress />;
  }

  return (
    <Page themeId="tool">
      <Content className={styles.container}>
        <Grid container justifyContent="center">
          <Grid item xs={8} md={5} lg={4} xl={3} className={styles.grid}>
            <Paper elevation={4} className={styles.paper}>
              <BrandIcon style={{ fontSize: '5rem' }} />
              <h1>Parodos</h1>
              <Typography paragraph>
                Please enter your SOEID and password to continue.
              </Typography>
              <Grid container justifyContent="center">
                <Grid item xs={7}>
                  <LoginForm onSubmit={submitHandler}>
                    <Button type="submit" variant="contained" color="primary">
                      SIGN IN
                    </Button>
                  </LoginForm>
                </Grid>
              </Grid>
              <Typography paragraph>
                <Button component={Link} to="">
                  Need help signing in?
                </Button>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
