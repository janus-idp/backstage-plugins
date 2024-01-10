import React from 'react';

import { CodeSnippet, EmptyState } from '@backstage/core-components';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    code: {
      width: '100%',
      borderRadius: 6,
      margin: theme.spacing(0, 0),
      background: theme.palette.background.paper,
    },
    accordionGroup: {
      '& > *': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        background: theme.palette.type === 'dark' ? '#333' : '#eee',
      },
    },
    heading: {
      width: '50%',
      fontSize: '1.2rem',
      fontWeight: 600,
    },
    subHeading: {
      color: theme.palette.textSubtle,
    },
    embeddedVideo: {
      top: '50%',
      left: '50%',
      zIndex: 2,
      position: 'relative',
      transform: 'translate(-50%, 15%)',
      '& > iframe': {
        [theme.breakpoints.up('sm')]: {
          width: '100%',
          height: '280px',
        },
        [theme.breakpoints.up('xl')]: {
          width: '768px',
          height: '482px',
        },

        border: '0',
        borderRadius: theme.spacing(1),
      },
    },
  }),
);

const EMAIL_YAML = `metadata:
  annotations:    
    # Set to MAIL, if you want to recevie mail
    # on every feedback.
    feedback/type: 'MAIL'

    # Type in your mail here, it will be kept in cc,
    # while sending mail on feedback generation.
    feedback/email-to: 'example@example.com'`;
const JIRA_YAML = `metadata:
  annotations:    
    # Set to JIRA to create ticket on
    # creating feedbacks.
    feedback/type: 'JIRA'

    # Enter your jira project key,
    jira/project-key: '<your-jira-project-key>'

    # Enter the url of you jira server.
    feedback/host: '<your-jira-host-url>'
    
    # (optional) Type in your mail here, 
    # it will be kept in cc,
    # while sending mail on feedback generation.  
    feedback/email-to: 'example@example.com';`;

export const CustomEmptyState = (props: { [key: string]: string }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState<string | false>('jira');

  const handleChange =
    (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      event.preventDefault();
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <EmptyState
      title="Missing Annotation"
      description={
        <Typography variant="body1">
          Some annotations out of <code>{Object.keys(props).join(', ')}</code>{' '}
          are missing. You need to add proper annotations to your component if
          you want to enable this tool.
        </Typography>
      }
      action={
        <>
          <Typography variant="body1">
            Add the annotation to your component YAML as shown in the
            highlighted example below:
          </Typography>
          <div className={classes.accordionGroup}>
            <Accordion
              expanded={expanded === 'jira'}
              onChange={handleChange('jira')}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography className={classes.heading}>For JIRA</Typography>
                <Typography className={classes.subHeading}>
                  (An email will be sent if <i>'feedback/email-to'</i> is set)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.code}>
                  <CodeSnippet
                    showLineNumbers
                    customStyle={{
                      background: 'inherit',
                      fontSize: '120%',
                      margin: '0px',
                    }}
                    language="yaml"
                    text={JIRA_YAML}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === 'email'}
              onChange={handleChange('email')}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography className={classes.heading}>For E-Mail</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className={classes.code}>
                  <CodeSnippet
                    showLineNumbers
                    customStyle={{
                      background: 'inherit',
                      fontSize: '120%',
                    }}
                    language="yaml"
                    text={EMAIL_YAML}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      }
      missing={{
        customImage: (
          <div className={classes.embeddedVideo}>
            <iframe
              id="kaltura_player"
              src='https://cdnapisec.kaltura.com/p/2300461/embedPlaykitJs/uiconf_id/44630491?iframeembed=true&entry_id=1_5izwmeg1&config[provider]={"widgetId":"1_mlkohqah"}&config[playback]={"startTime":0}'
              allowFullScreen
              allow="autoplay *; fullscreen *; encrypted-media *"
              sandbox="allow-downloads allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
              title="Feedback Plugin Demo"
            />
          </div>
        ),
      }}
    />
  );
};
