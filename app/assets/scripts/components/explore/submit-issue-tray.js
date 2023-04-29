import React, { useState } from 'react';
import T from 'prop-types';
import styled from 'styled-components';
import Button from '../../styles/button/button';
import ShadowScrollbar from '../common/shadow-scrollbar';
import { AccordionFold } from '../accordion';

import config from '../../config';

import { FormWrapper } from '../../styles/form/form';

import FormSelect from '../../styles/form/select';
import { FormGroup } from '../../styles/form/group';


import FormLabel from '../../styles/form/label';
import FormTextarea from '../../styles/form/textarea';
import FormInput from '../../styles/form/input';
import toasts from '../common/toasts';

const TrayWrapper = styled(ShadowScrollbar)`
  padding: 0.25rem;
  height: ${({ show }) => show ? 21 : 0}rem;
`;

const LayersWrapper = styled.div`
  opacity: ${({ show }) => show ? 1 : 0};
  transition: opacity .16s ease 0s;
  padding: 0.5rem;
  overflow-x: hidden;
  ${AccordionFold} {
    padding-bottom: 1rem;

    &:first-of-type {
      padding-top: 2rem;
    }
  }
`;

function SubmitIssueTray (props) {
  const { show, className } = props;

  const [issueTitle, setIssueTitle] = useState("");
  const [issueDetails, setIssueDetails] = useState("");
  const [issueType, setIssueType] = useState("bug");
  const [email,setEmail] = useState("")

  let handleSubmit = async (e) => {
    // Prevent the browser from reloading the page
    e.preventDefault();

    const res = await fetch(
      config.githubIssuesApi,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json' , 
          "Authorization": config.githubIssuesAccessToken,
        },
        body: JSON.stringify(
          {
            "title": issueTitle,
            "body": issueDetails,
            "labels":[issueType],
            "email": email,
          }
        )
      }
    ).then( res =>{
      if(res.status===200){
      toasts.success('Feedback successfully submitted')
      setIssueTitle("");
      setIssueDetails("");
      setIssueType("bug");
      setEmail("");
    }
  }
    ).catch(err => console.log(err))
  }

  let availableLabels = [
    {title: "Bug report", value: "bug"},
    {title: "Feature request", value: "feature request"},
    {title: "Help wanted", value: "help wanted"},
  ];


  return (
    <TrayWrapper
      className={className}
      show={show}
    >
      <LayersWrapper show={show}>
        <FormWrapper active={true} disabled={false}>
          <form method="post" onSubmit={handleSubmit}>
            <FormLabel style={{color: '#fff'}}>
              Title:
            </FormLabel>
            <FormInput defaultValue="" value={issueTitle} onChange={e => { setIssueTitle(e.target.value) }} />
        
            <FormLabel style={{color: '#fff'}}>
              Email:
            </FormLabel>
            <FormInput defaultValue="" value={email} onChange={e => { setEmail(e.target.value) }} />
           

            <FormLabel style={{color: '#fff'}}>
              Feedback type:
            </FormLabel>
            <FormGroup>
              <FormSelect
                id={"submit-issue-form-select"}
                onChange={e => { setIssueType(e.target.value) }}
                value={issueType}
              >
                {availableLabels.map(({title, value}) => {
                  return (
                    <option value={value} key={"dropdown-option-"+value}>
                      {title}
                    </option>
                  );
                })}
              </FormSelect>
            </FormGroup>
         

            <FormLabel style={{color: '#fff'}}>
              Feedback details
            </FormLabel>
            <FormTextarea
                defaultValue=""
                rows={4}
                cols={40}
                onChange={e => { setIssueDetails(e.target.value) }}
                value={issueDetails}
              />
            <Button style={{width: "100%",marginTop:'10px',border:'1px solid #dfe1e7','text-transform':'none', background: '#fff'}} type="submit">Submit feedback</Button>
          </form>
        </FormWrapper>
      </LayersWrapper>
    </TrayWrapper>
  );
}

SubmitIssueTray.propTypes = {
  show: T.bool,
  className: T.string,
};

export default SubmitIssueTray;
