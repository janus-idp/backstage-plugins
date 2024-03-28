import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

import { AddRepositoriesFormValues } from '../../types';
import { getImageForIconClass } from '../../utils/icons';
import { AddRepositoriesForm } from './AddRepositoriesForm';

export const AddRepositoriesPage = () => {
  const initialValues: AddRepositoriesFormValues = {
    repositoryType: 'repository',
    repositories: [],
    organizations: [],
    approvalTool: 'git',
  };

  return (
    <Page themeId="tool">
      <Header title="Add repositories" type="Bulk import" typeLink=".." />
      <Content>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            id="add-repository-illustrations"
          >
            <Typography variant="h5">
              Steps of adding repositories into Red Hat Developer Hub
            </Typography>
          </AccordionSummary>
          <AccordionDetails id="illustrations-div">
            <div
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                fontSize: '16px',
                maxWidth: '20%',
              }}
            >
              <img
                src={getImageForIconClass('icon-workingman-phone')}
                alt="icon of a working man with a phone"
              />
              <p style={{ display: 'block' }}>Choose repositories</p>
            </div>
            <div
              className="bs-bi-illustrations"
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                textAlign: 'center',
                fontSize: '16px',
                marginLeft: '50px',
              }}
            >
              <span>
                <img
                  src={getImageForIconClass('icon-file-sync')}
                  alt="icon of file sync"
                />
                <p
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    maxWidth: '200px',
                  }}
                >
                  Generate a catalog-info.yaml file for each repository
                </p>
              </span>
            </div>
            <div
              className="bs-bi-illustrations"
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                textAlign: 'center',
                fontSize: '16px',
              }}
            >
              <span>
                <img
                  src={getImageForIconClass('icon-workingman-dog')}
                  alt="icon of a working man with a dog"
                />
                <p
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    maxWidth: '200px',
                  }}
                >
                  Edit the yaml files if necessary
                </p>
              </span>
            </div>
            <div
              className="bs-bi-illustrations"
              style={{
                display: 'inline-block',
                textAlign: 'center',
                verticalAlign: 'top',
                fontSize: '16px',
                marginLeft: '50px',
              }}
            >
              <span>
                <img
                  src={getImageForIconClass('icon-thinking-man')}
                  alt="icon of a man thinking"
                />
                <p
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    maxWidth: '200px',
                  }}
                >
                  Choose approval tool (git/ServiceNow) for PR/ticket creation
                </p>
              </span>
            </div>
            <div
              className="bs-bi-illustrations"
              style={{
                display: 'inline-block',
                textAlign: 'center',
                verticalAlign: 'top',
                fontSize: '16px',
                marginLeft: '50px',
              }}
            >
              <span>
                <img
                  src={getImageForIconClass('icon-app')}
                  alt="icon of an app"
                />
                <p
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    maxWidth: '200px',
                    marginLeft: '50px',
                  }}
                >
                  Track the approval status
                </p>
              </span>
            </div>
          </AccordionDetails>
        </Accordion>
        <br />
        <AddRepositoriesForm initialValues={initialValues} />
      </Content>
    </Page>
  );
};
