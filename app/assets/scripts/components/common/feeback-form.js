import React, { useContext, useState } from 'react';
import { PanelBlockFooter } from '../common/panel-block';
import { withRouter } from 'react-router-dom';
import Dropdown, { DropTitle } from './dropdown';
import Button from '../../styles/button/button';
import SubmitIssueTray from '../explore/submit-issue-tray';

function FeedbackForm() {
  return (
    <Dropdown
      className='feedback'
      alignment='right'
      direction='down'
      triggerElement={
        <Button
          id='toggle-feedback-tray'
          variation='achromic-plain'
          title='Toggle Feedback Form'
          hideText
          useIcon='feedback'
        >
          <span>Feedback Form</span>
        </Button>
      }
    >
      <span style={{color:'white'}}>Feedback Form</span>
      <PanelBlockFooter>
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
      </PanelBlockFooter>
    </Dropdown>
  );
}

export default withRouter(FeedbackForm);
