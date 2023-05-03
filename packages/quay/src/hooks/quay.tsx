import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { Box, Chip, makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useAsync } from 'react-use';
import { quayApiRef } from '../api';
import { formatDate, formatSize } from '../lib/utils';
import { Layer, Tag } from '../types';
import { useEntity } from '@backstage/plugin-catalog-react';

const useLocalStyles = makeStyles({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
});

export const useTags = (organization: string, repository: string) => {
  const quayClient = useApi(quayApiRef);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [tagManifestLayers, setTagManifestLayers] = React.useState<
    Record<string, Layer>
  >({});
  const localClasses = useLocalStyles();

  const fetchSecurityDetails = async (tag: Tag) => {
    const securityDetails = await quayClient.getSecurityDetails(
      organization,
      repository,
      tag.manifest_digest,
    );
    return securityDetails;
  };

  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(organization, repository);
    Promise.all(
      tagsResponse.tags.map(async tag => {
        const securityDetails = await fetchSecurityDetails(tag);
        const securityData = securityDetails.data;
        if (!securityData) {
          return;
        }
        setTagManifestLayers(prevState => ({
          ...prevState,
          [tag.manifest_digest]: securityData.Layer,
        }));
      }),
    );
    setTags(prevTags => [...prevTags, ...tagsResponse.tags]);
    return tagsResponse;
  });

  const data = useMemo(() => {
    return Object.values(tags)?.map(tag => {
      const hashFunc = tag.manifest_digest.substring(0, 6);
      const shortHash = tag.manifest_digest.substring(7, 19);
      return {
        name: tag.name,
        last_modified: formatDate(tag.last_modified),
        size: formatSize(tag.size),
        manifest_digest: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={hashFunc} className={localClasses.chip} />
            {shortHash}
          </Box>
        ),
        expiration: tag.expiration,
        securityDetails: tagManifestLayers[tag.manifest_digest],
        manifest_digest_raw: tag.manifest_digest,
        // is_manifest_list: tag.is_manifest_list,
        // reversion: tag.reversion,
        // start_ts: tag.start_ts,
        // end_ts: tag.end_ts,
        // manifest_list: tag.manifest_list,
      };
    });
  }, [tags, tagManifestLayers, localClasses.chip]);

  return { loading, data };
};

export const QUAY_ANNOTATION_REPOSITORY = 'quay.io/repository-slug';

export const useQuayAppData = ({ entity }: { entity: Entity }) => {
  const repositorySlug =
    entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY] ?? '';

  if (!repositorySlug) {
    throw new Error("'Quay' annotations are missing");
  }
  return { repositorySlug };
};

export const useRepository = () => {
  const { entity } = useEntity();
  const { repositorySlug } = useQuayAppData({ entity });
  const info = repositorySlug.split('/');

  const organization = info.shift() as 'string';
  const repository = info.join('/');
  return {
    organization,
    repository,
  };
};

export const useTagDetails = (org: string, repo: string, digest: string) => {
  const quayClient = useApi(quayApiRef);
  const result = useAsync(async () => {
    const manifestLayer = await quayClient.getSecurityDetails(
      org,
      repo,
      digest,
    );
    return manifestLayer;
  });
  return result;
};
