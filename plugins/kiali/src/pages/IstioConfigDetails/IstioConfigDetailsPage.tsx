import * as React from 'react';
import AceEditor from 'react-ace';
import { useParams } from 'react-router-dom';

import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Grid } from '@material-ui/core';
import jsYaml from 'js-yaml';

import { BreadcrumbView } from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { IstioConfigDetails } from '../../types/IstioConfigDetails';
import { getIstioObject } from '../../utils/IstioConfigUtils';
// Enables ACE editor YAML themes
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-twilight';

import { useCallback, useEffect } from 'react';

import {
  AceValidations,
  parseKialiValidations,
} from '../../types/AceValidations';
import { IstioConfigDetailsOverview } from './IstioConfigDetailsOverview';

export const IstioConfigDetailsPage = (): React.JSX.Element => {
  const { namespace, objectType, object } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [istioConfig, setIstioConfig] = React.useState<IstioConfigDetails>();

  const fetchIstioConfig = useCallback(() => {
    if (!namespace || !objectType || !object) {
      kialiState.alertUtils!.add(
        `Could not fetch Istio Config: Empty namespace, object type or object name`,
      );
      return;
    }

    kialiClient
      .getIstioConfigDetail(namespace, objectType, object, true)
      .then((istioConfigResponse: IstioConfigDetails) => {
        setIstioConfig(istioConfigResponse);
      });
  }, [kialiClient, kialiState.alertUtils, namespace, objectType, object]);

  useEffect(() => {
    fetchIstioConfig();
  }, [fetchIstioConfig, namespace, objectType, object]);

  const fetchYaml = () => {
    const safeDumpOptions = {
      styles: {
        '!!null': 'canonical', // dump null as ~
      },
    };

    const istioObject = getIstioObject(istioConfig);
    return istioObject ? jsYaml.dump(istioObject, safeDumpOptions) : '';
  };

  let editorValidations: AceValidations = {
    markers: [],
    annotations: [],
  };
  const yamlSource = fetchYaml();

  editorValidations = parseKialiValidations(
    yamlSource,
    istioConfig?.validation,
  );

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView />
        <DefaultSecondaryMasthead
          elements={[]}
          onRefresh={() => fetchIstioConfig()}
        />
        <Grid container>
          <Grid item xs={9} style={{ paddingTop: 0 }}>
            <AceEditor
              mode="yaml"
              setOptions={{ useWorker: false }}
              theme="eclipse"
              width="100%"
              readOnly
              wrapEnabled
              value={yamlSource}
              annotations={editorValidations.annotations}
              markers={editorValidations.markers}
            />
          </Grid>
          <Grid xs={3}>
            {istioConfig && <IstioConfigDetailsOverview {...istioConfig} />}
          </Grid>
        </Grid>
      </Content>
    </div>
  );
};
