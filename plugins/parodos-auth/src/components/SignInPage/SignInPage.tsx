import { type SignInPageProps } from '@backstage/core-plugin-api';
import { LoginForm } from '../LoginForm/LoginForm';
import React, { useCallback } from 'react';
import { Content, Page } from '@backstage/core-components';
import { Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import { type IChangeEvent } from '@rjsf/core-v5';
import { CitiIcon } from '../icons/citi';
import { Link } from 'react-router-dom';
import { assert } from 'assert-ts';
import { Buffer } from 'buffer';

type ParodosSignInPageProps = SignInPageProps;

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
      fontWeight: 'normal'
    }
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
  
  // console.log(props)
  
  const submitHandler = useCallback(async (data: IChangeEvent<{userName: string, password: string}>, e: React.FormEvent<any>) => {
    assert(!!data.formData);
    const { formData: { userName, password } } = data;
    
    onSignInSuccess({
      async getBackstageIdentity() {
        return {
          type: 'user',
          userEntityRef: 'user:default/mock',
          ownershipEntityRefs: ['user:default/mock'],
        };
      },
      async getProfileInfo() {
        return {
          displayName: 'Mock',
          email: 'mock@redhat.com',
        };
      },
      async getCredentials() {
        console.log('here')
        return {
          token: Buffer.from(`${userName}:${password}`).toString('base64')
        };
      },
      async signOut() {
        return undefined;
      },
    });
  }, []);
  
  return (
    <Page themeId="tool">
      <Content className={styles.container}>
        <Grid container justifyContent="center">
          <Grid item xs={8} md={5} lg={4} xl={3} className={styles.grid}>
            <Paper elevation={4} className={styles.paper}>
              <CitiIcon style={{ fontSize: '5rem' }} />
              <h1>Parodos</h1>
              <Typography paragraph>Please enter your SOEID and password to continue.</Typography>
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
              <Button component={Link} to="">Need help signing in?</Button>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
