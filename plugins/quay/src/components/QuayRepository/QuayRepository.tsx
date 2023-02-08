import { useApi } from '@backstage/core-plugin-api';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { Tag } from '../../types';
import { quayApiRef } from '../../api';
import { formatDate, formatSize } from '../utils';

export function QuayRepository(props: RepositoryProps) {
  const quayClient = useApi(quayApiRef);
  const classes = useStyles();
  const [tags, setTags] = useState<Tag[]>([]);
  const title = `Quay repository: ${props.organization}/${props.repository}`;

  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(
      props.organization,
      props.repository,
    );
    if (tagsResponse.page == 1) {
      setTags(tagsResponse.tags);
    } else {
      setTags(currentTags => [...currentTags, ...tagsResponse.tags]);
    }
    return tagsResponse;
  });

  if (loading) {
    return <Progress />;
  }

  const data = tags?.map((tags: Tag) => {
      return {
          name: tags.name,
          last_modified: formatDate(tags.last_modified),
          size: formatSize(tags.size),
          manifest_digest: tags.manifest_digest.substring(0, 19),
          // expiration: tags.expiration,
          // is_manifest_list: tags.is_manifest_list,
          // reversion: tags.reversion,
          // start_ts: tags.start_ts,
          // end_ts: tags.end_ts,
          // manifest_list: tags.manifest_list,
          
      };
  });


  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={title}
        options={{ paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet,&nbsp;
            <Link to="http://backstage.io/">learn how to add data</Link>.
          </div>
        }
      />
    </div>
  );
}

QuayRepository.defaultProps = {
  title: 'Docker Images',
};
interface RepositoryProps {
  widget: boolean;
  organization: string;
  repository: string;
  title: string;
}
