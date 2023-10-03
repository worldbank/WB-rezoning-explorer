import React from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import { Modal } from '@devseed-ui/modal';

const BodyOuter = styled.div`
  height: 45vh;
`;

function ModalUpload (props) {
  const {
    revealed, onOverlayClick, onCloseClick, 
    renderHeadline, children, closeButton
  } = props;
  return (
    <Modal
      id='modal-upload'
      className='upload'
      size='xlarge'
      revealed={revealed}
      closeButton={closeButton}
      onOverlayClick={onOverlayClick}
      onCloseClick={onCloseClick}
      renderHeadline={renderHeadline}
      content={
        <BodyOuter>
          {children}
        </BodyOuter>
      }
    />
  );
}

ModalUpload.propTypes = {
  revealed: T.bool,
  closeButton: T.bool,
  onOverlayClick: T.func,
  onCloseClick: T.func,
  renderHeadline: T.func,
};
export default ModalUpload;
