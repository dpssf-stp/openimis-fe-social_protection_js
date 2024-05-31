import React, { useState } from 'react';
import { TextField, Tooltip } from '@material-ui/core';

import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';
import { BENEFIT_PLANS_QUANTITY_LIMIT, BENEFIT_PLAN_TYPE } from '../constants';

function BenefitPlanPicker(props) {
  const {
    multiple,
    required,
    label,
    nullLabel,
    withLabel = false,
    placeholder,
    withPlaceholder = false,
    readOnly,
    value,
    onChange,
    filter,
    filterSelectedOptions,
    type = BENEFIT_PLAN_TYPE.INDIVIDUAL,
  } = props;

  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({ isDeleted: false });
  const [currentString, setCurrentString] = useState('');
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query BenefitPlanPicker(
    $search: String, $first: Int, $isDeleted: Boolean
    ) {
      benefitPlan(search: $search, first: $first, isDeleted: $isDeleted, sortAlphabetically: true) {
        edges {
          node {
            id
            code
            name
            type
            jsonExt
          }
        }
      }
    }
  `,
    filters,
    { skip: true },
  );

  let benefitPlans = [];
  const edges = data?.benefitPlan?.edges?.map((edge) => edge.node) ?? [];
  if (type === BENEFIT_PLAN_TYPE.EVERY_TYPE) {
    benefitPlans = edges;
  } else {
    benefitPlans = edges.filter((node) => node.type === type);
  }
  const shouldShowTooltip = benefitPlans?.length >= BENEFIT_PLANS_QUANTITY_LIMIT && !value && !currentString;

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={benefitPlans ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={(value) => onChange(value, value ? `${value.code} ${value.name}` : null)}
      setCurrentString={setCurrentString}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ search, isDeleted: false })}
      renderInput={(inputProps) => (
        <Tooltip
          title={
            shouldShowTooltip
              ? formatMessageWithValues('BenefitPlansPicker.aboveLimit', { limit: BENEFIT_PLANS_QUANTITY_LIMIT })
              : ''
          }
        >
          <TextField
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...inputProps}
            required={required}
            label={(withLabel && (label || nullLabel)) || formatMessage('BenefitPlan')}
            placeholder={(withPlaceholder && placeholder) || formatMessage('BenefitPlanPicker.placeholder')}
          />
        </Tooltip>
      )}
    />
  );
}

export default BenefitPlanPicker;
