import React, { useContext, useState } from 'react';
import { PanelBlockFooter } from '../common/panel-block';
import { withRouter } from 'react-router-dom';
import Dropdown, { DropTitle } from './dropdown';
import Button from '../../styles/button/button';
import SubmitIssueTray from '../explore/submit-issue-tray';
import styled from 'styled-components';

const ButtonDiv = styled.span`
  width: 3rem;
  height: 3rem;
  button {
    width: 3rem;
    height: 3rem;
  }
  button::before {
    margin-top: -5px;
    margin-left: -5px;
  }
`;

function FeedbackForm() {
  return (
    <Dropdown
      className='feedback'
      alignment='right'
      direction='down'
      triggerElement={
        <ButtonDiv>
          <Button
            id='toggle-feedback-tray'
            variation='achromic-plain'
            title='Toggle Feedback Form'
            hideText
            useIcon='feedback'
          >
            <span>Feedback Form</span>
          </Button>
        </ButtonDiv>
      }
    >
      <span style={{ color: 'white' }}>Feedback Form</span>
      <div
        style={{
          align: 'center',
          display: 'grid',
          backgroundColor: '#23a7f5'
        }}
      >
        <SubmitIssueTray
          show={true}
          className='submit-issue-tray'
          style={{ padding: '0' }}
        />
      </div>
    </Dropdown>
  );
}

export default withRouter(FeedbackForm);
