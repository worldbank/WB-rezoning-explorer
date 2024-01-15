import React from 'react';
import styled from 'styled-components';
import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../../styles/inpage';
import Prose from '../../styles/type/prose';
import Dl from '../../styles/type/definition-list';
import { themeVal } from '../../styles/utils/general';
import { visuallyHidden } from '../../styles/helpers/index';

const AboutInpage = styled(Inpage)`
  max-height: 100vh;
  overflow: scroll;
`;

const AboutPageBodyInner = styled(InpageBodyInner)`
  max-width: 60rem;
  margin-top: 4rem;
  p, li {
    margin-bottom: 1rem;
  }
  h2, h3 {
    margin-top: 2.5rem;
  }
`;

const LogoList = styled(Dl)`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 0 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 4rem;

  dt {
    grid-column: 1 / span 12;

    &:not(:first-child) {
      margin-top: 1rem;
    }
  }

  dd {
    grid-column: auto / span 6;
  }

  a {
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    height: 6rem;
    position: relative;
    z-index: 1;
    border-radius: ${themeVal('shape.rounded')};
    box-shadow: inset 0 0 0 1px ${themeVal('color.baseAlphaC')};
    transition: all 0.16s ease 0s;
  }

  span {
    ${visuallyHidden()}
  }

  img {
    display: inline-flex;
    width: auto;
    max-width: 100%;
    max-height: 3rem;
  }

  /* Compensate DevSeed logo proportions and alignment */
  .logo-devseed img {
    max-height: 2rem;
  }

  /* Compensate ESMAP logo proportions and alignment */
  .logo-esmap img {
    max-height: 2.25rem;
  }
`;

function About () {
  return (
    <App pageTitle='Explore'>
      <AboutInpage>
        <InpageHeader>
          <InpageHeaderInner>
            <InpageTitle>About REZoning</InpageTitle>
          </InpageHeaderInner>
        </InpageHeader>
        <InpageBody>
          <AboutPageBodyInner>
            <Prose>
              <p>
                The Renewable Energy Zoning (REZoning) tool is an interactive,
                web-based platform designed to identify, visualize, and rank zones
                that are most suitable for the development of solar, wind, or
                offshore wind projects. Custom spatial filters and economic
                parameters can be applied to meet users needs or to represent a
                specific country context.
              </p>
              <p>
                Inspired by and based off{' '}
                <a href='https://www.lbl.gov/' target='_blank' rel='noreferrer'>
                  Lawrence Berkeley National Laboratory&apos;s
                </a>{' '}
                and the{' '}
                <a href='https://www.ucsb.edu/' target='_blank' rel='noreferrer'>
                  University of California Santa Barbara&apos;s (UCSB)
                </a>{' '}
                platform{' '}
                <a href='https://mapre.lbl.gov/' target='_blank' rel='noreferrer'>
                  Multi-criteria Analysis for Planning Renewable Energy (MapRE)
                </a>{' '}
                and developed by ESMAP in partnership with UCSB, the tool
                brings together spatial analysis and economic calculations into an
                online, user-friendly environment that allows users and decision
                makers to obtain insights into the technical and economic
                potential of renewable energy resources for all countries.
              </p>
              <p>
                The REZoning tool is powered by global geospatial datasets and
                uses baseline industry assumptions as default values for economic
                calculations. No input dataset, nor simulation outcome produced by
                the tool represents the official position of the World Bank Group
                or UCSB. The boundaries, colors, denominations and other
                information shown on the outputs do not imply on the part of the
                World Bank any judgement on the legal status of any territory or
                endorsement or acceptance of such boundaries. The
                source code is available {' '}
                <a
                  href='https://github.com/worldbank/WB-rezoning-explorer'
                >
                  here
                </a>{' '}. See the
                {' '}
                <a href='https://gre-website-public.s3.us-east-2.amazonaws.com/rezoning_user_guide.pdf'>
                       Rezoning User Guide
                </a>{' '}
                for a detailed description of the tool and
                the methodology.
              </p>
              <h2>User Flow</h2>
              <p>
                The user first chooses the country and the resource – solar PV,
                wind, or offshore wind. The user is then presented with options
                for the spatial resolution of the analysis – grid of a specific
                resolution or the sub-national boundaries of the chosen country.
                The spatial analysis consists of three steps:
              </p>
              <ol>
                <li>
                  <strong>Technical Potential:</strong> This step estimates the technical
                  potential or the capacity of a technology available for
                  development by filtering on topographic limitations, land-use
                  constraints, and system performance. The technical potential
                  assessment enables the initial identification of study areas
                  that are technically capable of supporting high-quality RE
                  resource development. A range of options are available in the
                  “FILTERS” tab that users can adjust to reflect different land
                  management scenarios for sitting renewable energy projects.
                </li>
                <li>
                  <strong>Economic Potential:</strong> The users can also choose to use the
                  default values for the input parameters to estimate the LCOE of
                  the resulting zones from step 1. Many of the default values were
                  compiled and provided by the International Renewable Energy
                  Agency (IRENA) using their renewable energy cost database. These
                  are median values of a range of estimates from existing projects
                  by country or region. Because renewable energy project costs are
                  evolving rapidly and actual costs depend on various
                  on-the-ground, region-specific factors that are not captured in
                  this economic model, these values serve only as a reference and
                  may not reflect the real-world project cost potential,
                  especially in regions of the world where few projects have been
                  developed.
                </li>
                <li>
                  <strong>Multi-criteria analysis and prioritization:</strong> This step allows
                  the user to include various criteria and factors (both monetized
                  and non-monetized) in addition to the LCOE to select and
                  prioritize suitable renewable energy sites for development. The
                  user can then provide different weights for each
                  of their criteria under the ‘Weights Tab’ in order to estimate a
                  weighted score for each renewable energy zone. The zones are
                  then sorted and ranked by their scores or LCOE and the user can
                  then identify the zones with the highest scores or lowest LCOE.
                </li>
              </ol>
              <h2>Outputs</h2>
              <p>
                At the end of the three steps, the user can use the middle pane to
                visualize and explore the result using the satellite base map but
                also add additional contextual layers, such as roads, grid,
                location of airports, etc. in order to create a meaningful visual
                output. The final map can be printed in .PDF or .PNG format.
              </p>
              <p>
                Furthermore, users can download the results of the analysis in
                .CSV, .SHP (for boundaries selection) or GeoTIFF format (for grid
                selection) for further processing in a different environment.
              </p>
              <h2>Quickstart Videos</h2>
              <ul>
                <li>
                  <strong>Offshore Wind:</strong>
                  <video controls width='100%'>
                    <source src='https://gre-website-public.s3.us-east-2.amazonaws.com/offshore.mkv' type='video/mp4' />
                  </video>
                </li>
                <li>
                  <strong>Onshore Wind:</strong>
                  <video controls width='100%'>
                    <source src='https://gre-website-public.s3.us-east-2.amazonaws.com/onshore.mkv' type='video/mp4' />
                  </video>
                </li>
                <li>
                  <strong>Solar PV:</strong>
                  <video controls width='100%'>
                    <source src='https://gre-website-public.s3.us-east-2.amazonaws.com/solarpv_v2.mkv' type='video/mp4' />
                  </video>
                </li>
                <li>
                  <strong>Upgrades in the 1.2 Release:</strong>
                  <video controls width='100%'>
                    <source src='https://gre-website-public.s3.us-east-2.amazonaws.com/rezoning1_2.m4v' type='video/mp4' />
                  </video>
                </li>
              </ul>
              <h3>Release Notes</h3>
              <h4>REZoning 1.2 (Oct 16, 2023)</h4>
              <p>REZoning 1.2 addressed feedback on the user experience with the tool. This release was developed by Kartoza (Pty) Ltd. 
                  The sections are discussed in greater detail in the user guide.</p>
              <ol>
                <li>
                  <strong>Feedback Tool (new feature):</strong> Allows users to provide feedback, 
                  report bugs and make feature requests for the REZoning tool that is compiled on the REZoning Git Hub page.
                </li>
                <li>
                  <strong>Import and Export Filters (new feature):</strong> Feature to export and import information on countries, resources, filters,
                        grid size, economic and weight filters to recreate outputs.
                </li>
                <li>
                  <strong>Select a 5 km grid zone (new feature):</strong> 5 km solution for countries smaller than 625 km<sup>2</sup> that 
                    cannot support the 25 and 50 km grid zones.
                </li>
                <li>
                  <strong>Grid zone (amended feature):</strong> Grid zone labels accurately reflect the length and width of zones at 25 km (625 km<sup>2</sup>) 
                      and 50 km (2500 km<sup>2</sup>) respectively.
                </li>
                <li>
                  <strong>Contextual layers (amended feature):</strong> Many contextual layers are now available and interactive through the spatial 
                          filters tab to improve the specificity of calculations. 
                </li>   
                <li>
                  <strong>Filter toggle (new feature):</strong> Filter toggle allows the user to see and select the desired range of values for input. 
                            Data sources are now available through information button links adjacent to the layer. 
                </li> 
              </ol>
              <h4>REZoning 1.1 (May 14, 2021)</h4>
              <p>REZoning 1.1 addressed post release bug fixes including.</p>
              <ol>
                <li>Layer names and interpretations</li>
                <li>API URL changes to add resource parameters</li>
                <li>LCOE changes for performance.</li>
              </ol>
              <h4>REZoning 1.0 (May 10, 2021)</h4>
              <p>REZoning 1.0 was the first release. Features include:</p>
              <ol>
                <li>Interactive, web-based platform to identify, visualize, and rank zones using LCOE
                      that are most suitable for the development of RE projects.
                </li>
                <li><strong>Custom spatial filters:</strong>
                  (Solar PVOut​, Elevation​, Slope​, Population Density​, Distance from Transmission Lines, Include/exclude Water Bodies​, Land Cover, Distance to Roads/Airports​, Include/exclude Protected Areas , Distance to UNESCO World Heritage Sites)</li>
                <li>
                <strong>Custom economic parameters:</strong>
                  (Solar Unit Type​, Installed Capacity Area Factor, Generation – capital, Generation – fixed O&M, Economic discount rate, Technical Loss Factor​, Unavailability Factor​, Generation – variable O&M, Transmission – capital​, Transmission – fixed O&M​, Substation – capital​, Road – capital​, Road – fixed O&M, Decommission rate, Lifetime)
                </li>
                <li>
                <strong>Zone weights</strong>
                  LCOE Generation​, Distance to Grid​, Population Density​, Slope​, Distance to Airports, Distance to Ports​, Distance to Roads
                </li>
              </ol>
              <h3>Additional Relevant Tools</h3>
              <p>Other applications and data sources that are relevant for the energy sector.</p>
              <Dl horizontal>
                <dt><strong><a href='https://energydata.info/'>EnergyData.info</a></strong></dt>
                <dd>Open data and analytics for a sustainable energy future.</dd>
                <dt><strong><a href='https://globalsolaratlas.info/map'>Global Solar Atlas</a></strong></dt>
                <dd> Access to solar resource and photovoltaic power potential around the globe.</dd>
                <dt><strong><a href='https://globalwindatlas.info/'>Global Wind Atlas</a></strong></dt>
                <dd>Identify high-wind areas for wind power generation virtually anywhere in the world.</dd>
              </Dl>
            </Prose>
            <LogoList>
              <dt>Partners</dt>
              <dd>
                <a
                  href='https://www.worldbank.org/'
                  title='Visit World Bank'
                  target='_blank'
                  rel='noreferrer'
                >
                  <img
                    alt='WBG Logo'
                    src='/assets/graphics/content/logos/logo-wbg-GOST.png'
                  />
                  <span>World Bank Group</span>
                </a>
              </dd>
              <dd>
                <a
                  href='https://www.esmap.org/'
                  title='Visit Energy Sector Management Assistance Program'
                  className='logo-esmap'
                  target='_blank'
                  rel='noreferrer'
                >
                  <img
                    alt='ESMAP Logo'
                    src='/assets/graphics/content/logos/logo-esmap.png'
                  />
                  <span>ESMAP</span>
                </a>
              </dd>
              <dd>
                <a
                  href='https://www.ucsb.edu/'
                  title='Visit University of California Santa Barbara'
                  className='logo-ucsb'
                  target='_blank'
                  rel='noreferrer'
                >
                  <img
                    alt='UCSB Logo'
                    src='/assets/graphics/content/logos/logo-ucsb.png'
                  />
                  <span>University of California Santa Barbara</span>
                </a>
              </dd>
              <dd>
                <a
                  href='https://www.developmentseed.org/'
                  title='Visit Development Seed'
                  className='logo-ds'
                  target='_blank'
                  rel='noreferrer'
                >
                  <img
                    alt='Development Seed Logo'
                    src='/assets/graphics/content/logos/logo-ds.png'
                  />
                  <span>Development Seed</span>
                </a>
              </dd>
            </LogoList>
          </AboutPageBodyInner>
        </InpageBody>
      </AboutInpage>
    </App>
  );
}

export default About;
