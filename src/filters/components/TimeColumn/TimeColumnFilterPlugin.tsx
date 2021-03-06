/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ensureIsArray,
  ExtraFormData,
  GenericDataType,
  styled,
  t,
  tn,
} from '@superset-ui/core';
import React, { useEffect, useState } from 'react';
import { Select } from 'src/common/components';
import { Styles, StyledSelect, StyledFormItem } from '../common';
import { PluginFilterTimeColumnProps } from './types';

const { Option } = Select;

const Error = styled.div`
  color: ${({ theme }) => theme.colors.error.base};
`;

export default function PluginFilterTimeColumn(
  props: PluginFilterTimeColumnProps,
) {
  const {
    data,
    formData,
    height,
    width,
    setDataMask,
    setFocusedFilter,
    unsetFocusedFilter,
    filterState,
  } = props;
  const { defaultValue, inputRef } = formData;

  const [value, setValue] = useState<string[]>(defaultValue || []);

  const handleChange = (value?: string[] | string | null) => {
    const resultValue: string[] = ensureIsArray<string>(value);
    setValue(resultValue);
    const extraFormData: ExtraFormData = {};
    if (resultValue.length) {
      extraFormData.granularity_sqla = resultValue[0];
    }

    setDataMask({
      extraFormData,
      filterState: {
        value: resultValue.length ? resultValue : null,
      },
    });
  };

  useEffect(() => {
    handleChange(filterState.value || null);
  }, [JSON.stringify(filterState.value)]);

  useEffect(() => {
    handleChange(defaultValue || null);
    // I think after Config Modal update some filter it re-creates default value for all other filters
    // so we can process it like this `JSON.stringify` or start to use `Immer`
  }, [JSON.stringify(defaultValue)]);

  const timeColumns = (data || []).filter(
    row => row.dtype === GenericDataType.TEMPORAL,
  );

  const placeholderText =
    timeColumns.length === 0
      ? t('No time columns')
      : tn('%s option', '%s options', timeColumns.length, timeColumns.length);
  return (
    <Styles height={height} width={width}>
      <StyledFormItem
        validateStatus={filterState.validateMessage && 'error'}
        extra={<Error>{filterState.validateMessage}</Error>}
      >
        <StyledSelect
          allowClear
          value={value}
          placeholder={placeholderText}
          // @ts-ignore
          onChange={handleChange}
          onBlur={unsetFocusedFilter}
          onFocus={setFocusedFilter}
          ref={inputRef}
        >
          {timeColumns.map(
            (row: { column_name: string; verbose_name: string | null }) => {
              const {
                column_name: columnName,
                verbose_name: verboseName,
              } = row;
              return (
                <Option key={columnName} value={columnName}>
                  {verboseName || columnName}
                </Option>
              );
            },
          )}
        </StyledSelect>
      </StyledFormItem>
    </Styles>
  );
}
