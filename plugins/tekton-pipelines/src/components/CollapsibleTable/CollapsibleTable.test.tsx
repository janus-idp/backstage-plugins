/*
 * Copyright 2022 The Plugin Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { render } from '@testing-library/react';
import {
  wrapInTestApp,
} from "@backstage/test-utils";
import { CollapsibleTable } from './CollapsibleTable';
import * as pipelineRunFileMock from './__fixtures__/pipelinerun.json';

jest.mock('../../hooks/usePipelineRunObjects')

describe('CollapsibleTable', () => {
  it('should render a pipelinerun', async () => {
    const { getByText } = render(
      wrapInTestApp(<CollapsibleTable pipelineruns={[pipelineRunFileMock as any]}/>),
    );
    expect(getByText('feature-added-catalog-info-xdjk9')).toBeInTheDocument();
  });
  
});
