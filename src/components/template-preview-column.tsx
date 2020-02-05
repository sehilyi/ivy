import React from 'react';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import {GenericAction} from '../actions/index';
import {TiThLargeOutline} from 'react-icons/ti';
import {thumbnailLocation} from '../thumbnail';
import {NONE_TEMPLATE} from '../constants/index';

interface Props {
  encodingMode: string;
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  toggleProgramModal: GenericAction<void>;
}

function renderEncodingModeOption(
  templateName: string,
  templateDescription: string,
  idx: number,
  setEncodingMode: GenericAction<string>,
  encodingMode: string,
): JSX.Element {
  return (
    <div
      className={classnames({
        'encoding-selection-option': true,
        'flex-down': true,
        'selected-encoding-option': encodingMode === templateName,
      })}
      key={`${templateName}-${idx}`}
      onClick={(): any => setEncodingMode(templateName)}
    >
      <div className="encoding-selection-option-img-container">
        <img src={thumbnailLocation(templateName)} />
      </div>
      <div className="flex-down">
        <h5>{templateName}</h5>
      </div>
    </div>
  );
}

export default class TemplatePreviewColumn extends React.Component<Props> {
  render(): JSX.Element {
    const {templates, setEncodingMode, encodingMode, toggleProgramModal} = this.props;

    return (
      <div className="template-preview-column background-2">
        <div className="scroll-container">
          <div
            className="flex-down encoding-selection-modal-button"
            onClick={(): void => {
              toggleProgramModal();
            }}
          >
            <TiThLargeOutline />
            <h3>Add more</h3>
          </div>
          {renderEncodingModeOption(
            'grammer',
            'Tableau-style grammar of graphics',
            -1,
            setEncodingMode,
            encodingMode,
          )}
          {templates
            .filter(template => template.templateName !== NONE_TEMPLATE)
            .map((template, idx) =>
              renderEncodingModeOption(
                template.templateName,
                template.templateDescription,
                idx,
                setEncodingMode,
                encodingMode,
              ),
            )}
        </div>
      </div>
    );
  }
}
