/* eslint-disable no-console */
import React from 'react';
import { Progress } from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { openshiftImageRegistryApiRef } from '../../api';

export const OcirImagesComponent = () => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreams, setImageStreams] = React.useState([]);

  const { loading: loadingNs } = useAsync(async () => {
    const res = await client.getNamespaces();
    console.log(res, 'namespaces');
  });

  const { loading: loadingImgSt } = useAsync(async () => {
    const res = await client.getImageStreams('div');
    setImageStreams(res);
    console.log(res, 'imagestreams');
  });

  const { loading: loadingImgTags } = useAsync(async () => {
    const res = imageStreams?.length
      ? await client.getImageStreamTags(imageStreams[0])
      : undefined;
    if (res) console.log(res, 'imagestreamtags');
  }, [imageStreams]);

  if (loadingNs && loadingImgSt && loadingImgTags) {
    return <Progress />;
  }

  return null;
};
