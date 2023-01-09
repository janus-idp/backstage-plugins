import { configApiRef, useApi } from '@backstage/core-plugin-api'
import React, { useState } from 'react'
import { useAsync } from 'react-use'
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { Tag, TagsResponse } from '../types';

function request<TResponse>(
  url: string,
  config: RequestInit = {}

): Promise<TResponse> {

  return fetch(url, config)
    .then((response) => response.json())
    .then((data) => data as TResponse);

}

export function QuayRepository(props: RepositoryProps) {
  const config = useApi(configApiRef)
  const classes = useStyles();
  const [tags, setTags] = useState<Tag[]>([]);
  const title = 'Quay repository: ' + config.getString('quay.baseUrl') +'/'+ props.organization + '/' + props.repository;

  const backendUrl = config.getString('backend.baseUrl')

  const { loading } = useAsync(async () => {
    const tagsResponse = await request<TagsResponse>(
      `${backendUrl}/api/quay/tag?org=${props.organization}&repo=${props.repository}`
    )
    if (tagsResponse.page == 1) {
      setTags(tagsResponse.tags);
    } else {
      setTags((currentTags) => [...currentTags, ...tagsResponse.tags]);
    }
    return (tagsResponse)
    }  
  )

  if (loading) {
    return <Progress />
  }
  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={title}
        options={{ paging: true, padding: 'dense' }}
        data={tags}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet,&nbsp;
            <Link to="http://backstage.io/">learn how to add data</Link>.
          </div>
        }

      />
    </div>
  )
}

QuayRepository.defaultProps = {
  title: 'Docker Images',
}
interface RepositoryProps {
  widget: boolean
  organization: string
  repository: string
  title: string
}