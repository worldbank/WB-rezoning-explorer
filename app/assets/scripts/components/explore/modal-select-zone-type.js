import React, { useState } from 'react';
import T from 'prop-types';

import Button from '../../styles/button/button';
import ModalSelect from './modal-select';
import { ModalHeadline } from '@devseed-ui/modal';
import { GRID } from './panel-data';
import { CardWrapper } from '../common/card-list';

function ModalSelectZoneType (props) {
  const {
    revealed,
    availableZoneTypes,
    selectedZoneType,
    setSelectedZoneType,
    setShowSelectZoneTypeModal
  } = props;

  return (
    <ModalSelect
      revealed={revealed}
      onOverlayClick={() => setShowSelectZoneTypeModal(false)}
      onCloseClick={() => setShowSelectZoneTypeModal(false)}
      data={availableZoneTypes}
      closeButton={typeof selectedZoneType !== 'undefined'}
      renderHeadline={() => (
        <ModalHeadline
          id='select-zone-type-modal-header'
          title='Select Zone Type And Size'
          style={{ flex: 1, textAlign: 'center' }}
        >
          <h1>Select Zone Type And Size</h1>
        </ModalHeadline>
      )}
      renderCard={(zoneType) => (
        <CardWrapper
          id={`resource-${zoneType.name}-card`}
          key={zoneType.name}
          size='large'
        >
          <Button
            style={{ width: '100%', height: '100%' }}
            useIcon={[(zoneType.type === GRID ? 'layout-grid-3x3' : 'globe'), 'before']}
            onClick={() => {
              setShowSelectZoneTypeModal(false);
              setSelectedZoneType(zoneType);
            }}
          >
            { zoneType.size > 0 ? `${zoneType.size} km² Grid` : 'Administrative Boundaries'}
          </Button>
        </CardWrapper>
      )}
      nonScrolling
    />
  );
}

ModalSelectZoneType.propTypes = {
  revealed: T.bool,
  availableZoneTypes: T.array,
  selectedZoneType: T.object,
  setSelectedZoneType: T.func,
  setShowSelectZoneTypeModal: T.func
};

export default ModalSelectZoneType;
