import React, { useState } from 'react';

import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize
} from 'react-papaparse';

import { zoneTypesList } from './panel-data';
import { timeout } from '../../utils/utils';

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = '#686868';

const styles = {
  zone: {
    alignItems: 'center',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: GREY,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
  },
  file: {
    background: 'linear-gradient(to bottom, #EEE, #DDD)',
    borderRadius: 20,
    display: 'flex',
    height: 120,
    width: 120,
    position: 'relative',
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: '0.5em',
    justifyContent: 'center',
    display: 'flex'
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: '0.5em'
  },
  progressBar: {
    bottom: 14,
    position: 'absolute',
    paddingLeft: 10,
    paddingRight: 10
  },
  zoneHover: {
    borderColor: GREY_DIM
  },
  default: {
    borderColor: GREY
  },
  remove: {
    height: 23,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 23
  }
};

// eslint-disable-next-line react/prop-types
export default function CSVReader({ setSelectedAreaId, setSelectedResource, setSelectedZoneType, selectedZoneType, handleImportCSV }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );

  return (
    <CSVReader
      onUploadAccepted={async (results, fileInfo) => {
        setZoneHover(false);
        const successful = handleImportCSV(results, fileInfo);
        await timeout(200);
        if (successful) {
          const parsedFileName = fileInfo.name.match(/^WBG-REZoning-([A-Z]{3})-([^-]*)-(.*)-(spatial-filters|economic-parameters|zone-weights).*\.csv$/);
          const countryCode = parsedFileName[1];
          const selectedResource = parsedFileName[2];
          const _selectedZoneType = parsedFileName[3];
          setSelectedAreaId(countryCode);
          setSelectedResource(selectedResource);
          let zoneTypeObj = zoneTypesList.find(zoneType => zoneType.name === _selectedZoneType);
          if (!zoneTypeObj) { zoneTypeObj = zoneTypesList[2]; }
          try {
            if (zoneTypeObj.name !== selectedZoneType.name) {
              setSelectedZoneType(zoneTypeObj);
            }
          } catch (e) {
          }
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove
      }) => (
        <>
          <div
            {...getRootProps()}
            style={Object.assign(
              {},
              styles.zone,
              zoneHover && styles.zoneHover
            )}
          >
            {acceptedFile ? (
              <>
                <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.size}>
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span style={styles.name}>{acceptedFile.name}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    onMouseOver={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div>
              </>
            ) : (
              'Drop CSV file here or click to upload'
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
}
