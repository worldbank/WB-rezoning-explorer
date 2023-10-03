import React from 'react';
import styled from 'styled-components';
import T from 'prop-types';
import Button from '../../styles/button/button';
import Dl from '../../styles/type/definition-list';
import ShadowScrollbar from '../common/shadow-scrollbar';
import { themeVal } from '../../styles/utils/general';
import { formatThousands, toTitleCase } from '../../utils/format.js';
import config from '../../config';
const { indicatorsDecimals } = config;
import Heading from '../../styles/type/heading';
import { makeTitleCase } from '../../styles/utils/general';
import {
  Accordion,
  AccordionFold,
  AccordionFoldTrigger
} from '../../components/accordion';
import { useContext } from 'react';
import FormContext from '../../context/form-context';

const Details = styled.div`
  /* stylelint-disable */
  dd {
    font-weight: ${themeVal('type.base.bold')};
    color: ${themeVal('color.primary')};
  }
`;

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  gap: 0.5rem;
  > ${Button} {
    text-align: left;
    margin-left: -1.5rem;
    padding-left: 1.5rem;
    width: calc(100% + 3rem);
  }
`;
const FocusZoneFooter = styled.div`
  /*display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;*/

  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-gap: 0.25rem;
`;

export const formatIndicator = function (id, value) {
  if (typeof value !== 'number') return value;

  switch (id) {
    case 'zone_score':
      return formatThousands(value, {
        forceDecimals: true,
        decimals: indicatorsDecimals.zone_score
      });
    case 'lcoe':
      return formatThousands(value, {
        forceDecimals: true,
        decimals: indicatorsDecimals.lcoe
      });
    case 'zone_output_density':
      return formatThousands(value, {
        forceDecimals: true,
        decimals: indicatorsDecimals.zone_output_density
      });
    case 'suitable_area':
      return formatThousands(value / 1000000);
    default:
      return formatThousands(value);
  }
};

export const formatLabel = function (id, titleCased = false) {
  const label = id.replace(/_/g, ' '); // replace spaces;
  switch (id) {
    case 'lcoe':
      return `${id.replace(/_/g, ' ')} (USD/MWh)`;
    case 'generation_potential':
      return `${id.replace(/_/g, ' ')} (GWH)`;
    case 'zone_output_density':
      return `${id.replace(/_/g, ' ')} (GWh/km²)`;
    case 'icp':
      return 'Installed Capacity Potential (MW)';
    case 'suitable_area':
      return `${id.replace(/_/g, ' ')} (km²)`;
    case 'cf':
      return 'Capacity Factor';
    default:
      return titleCased ? toTitleCase(label) : label;
  }
};

export function renderZoneDetailsList (zone, detailsList) {
  const { id, properties } = zone;

  let summary = properties.summary;

  const { weightsList } = useContext(FormContext);

  // Some feature summaries are JSON strings
  if (typeof summary === 'string' || summary instanceof String) {
    summary = JSON.parse(summary);
  }

  // Filter summary to include selected details
  if (detailsList) {
    summary = detailsList.reduce((acc, key) => {
      acc[key] = summary[key];
      return acc;
    }, {});
  }

  const flatZone = {
    id,
    name: zone.name || properties.name || id,
    ...summary
  };
  
  let lst = [];

  for (const [label, data] of Object.entries(flatZone))
  {
    if ( label != "criterion_average" && label != "criterion_contribution" )
    {
      lst.push(
        <Dl key={`${id}-${label}`}>
          <dt>{formatLabel(label)}</dt>
          <dd>{formatIndicator(label, data)}</dd>
        </Dl> );
    };
  };

  if ( flatZone.criterion_average )
  {
    let avg_list = [];
    for (const [label, data] of Object.entries(flatZone.criterion_average) )
    {
      let weight_ind = weightsList.find( w => w.id == label );
      avg_list.push(
        <Dl key={`${id}-${label}-mean`}>
          <dt>{`Average ${weight_ind?.title}`}</dt>
          <dd>{formatIndicator(label, data)}</dd>
        </Dl>
      );
    };
    let avg_accordion = (
      <Accordion
        initialState={[false]}
      >
      {({ checkExpanded, setExpanded }) => (
        <AccordionFold
          // forwardedAs={FormGroupWrapper}
          isFoldExpanded={checkExpanded(0)}
          setFoldExpanded={(v) => setExpanded(0, v)}
          renderHeader={({ isFoldExpanded, setFoldExpanded }) => (
            <AccordionFoldTrigger
              isExpanded={isFoldExpanded}
              onClick={() => setFoldExpanded(!isFoldExpanded)}
            >
              <Heading size='small' variation='primary'>
                {makeTitleCase('Weights average')}
              </Heading>
            </AccordionFoldTrigger>
          )}
          renderBody={({ isFoldExpanded }) => (
            isFoldExpanded ? avg_list : null
          )}
        />
      )}
    </Accordion> );
    lst.push( avg_accordion );
  }

  if ( flatZone.criterion_contribution )
  {
    let contrib_lst = [];
    for (const [label, data] of Object.entries(flatZone.criterion_contribution) )
    {
      let weight_ind = weightsList.find( w => w.id == label );
      contrib_lst.push(
        <Dl key={`${id}-${label}-contrib`}>
          <dt>{`Contribution of ${weight_ind?.title}`}</dt>
          <dd>{formatIndicator(label, data)}</dd>
        </Dl>
      );
    };
    let contrib_accordion = (
      <Accordion
        initialState={[false]}
      >
      {({ checkExpanded, setExpanded }) => (
        <AccordionFold
          // forwardedAs={FormGroupWrapper}
          isFoldExpanded={checkExpanded(0)}
          setFoldExpanded={(v) => setExpanded(0, v)}
          renderHeader={({ isFoldExpanded, setFoldExpanded }) => (
            <AccordionFoldTrigger
              isExpanded={isFoldExpanded}
              onClick={() => setFoldExpanded(!isFoldExpanded)}
            >
              <Heading size='small' variation='primary'>
                {makeTitleCase('Weights contribution')}
              </Heading>
            </AccordionFoldTrigger>
          )}
          renderBody={({ isFoldExpanded }) => (
            isFoldExpanded ? contrib_lst : null
          )}
        />
      )}
    </Accordion> );
    lst.push( contrib_accordion );
  }

  return lst;
}

function FocusZone (props) {
  const { zone } = props;

  return (
    <Wrapper>
      <ShadowScrollbar>
        <Details>
          {renderZoneDetailsList(zone)}
        </Details>
        <FocusZoneFooter />
      </ShadowScrollbar>
    </Wrapper>
  );
}

FocusZone.propTypes = {
  zone: T.object.isRequired
};

export default FocusZone;
