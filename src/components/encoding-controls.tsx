import React from 'react';
import {FaEraser, FaSave} from 'react-icons/fa';
import {TiExport} from 'react-icons/ti';
import {IoIosCreate, IoIosSettings} from 'react-icons/io';
import {GenericAction} from '../actions/index';
import EncodingModeSelector from './encoding-mode-selector';
import {Template} from '../templates/types';
import {classnames} from '../utils';

interface Props {
  encodingMode: string;
  templates?: Template[];
  template?: Template;
  editMode: boolean;
  templateSaveState: string;

  chainActions: GenericAction;
  setEncodingMode: GenericAction;
  deleteTemplate: GenericAction;
  clearEncoding: GenericAction;
  saveCurrentTemplate: GenericAction;
  setBlankTemplate: GenericAction;
  modifyValueOnTemplate: GenericAction;
  setEditMode: GenericAction;
}

const UPDATE_TEMPLATE: {[x: string]: boolean} = {
  'NOT FOUND': true,
  DIFFERENT: true,
};
// const UPDATE_TEMPLATE: {[x: string]: boolean} = {
//   DIFFERENT: true,
// };

export default function EncodingControls(props: Props) {
  const {
    encodingMode,
    deleteTemplate,
    templates,
    setEncodingMode,
    clearEncoding,
    editMode,
    saveCurrentTemplate,
    setEditMode,
    setBlankTemplate,
    chainActions,
    template,
    templateSaveState,
    modifyValueOnTemplate,
  } = props;
  return (
    <div className="encoding-mode-selector">
      <div className="flex-down full-width space-between">
        <div className="flex">
          <div className="flex">
            <img src="logo.png" />
            <div className="flex-down">
              {!editMode && (
                <h1 className="section-title">{`MODE: ${encodingMode}`}</h1>
              )}
              {editMode && template && (
                <React.Fragment>
                  <h1 className="section-title">MODE:</h1>
                  <input
                    value={template.templateName}
                    onChange={event =>
                      modifyValueOnTemplate({
                        value: event.target.value,
                        key: 'templateName',
                      })
                    }
                  />
                </React.Fragment>
              )}
              {!editMode && (
                <h3>
                  {template
                    ? template.templateDescription
                    : 'Tableau-style grammar of graphics'}
                </h3>
              )}
              {editMode && template && (
                <input
                  value={template.templateDescription}
                  onChange={event =>
                    modifyValueOnTemplate({
                      value: event.target.value,
                      key: 'templateDescription',
                    })
                  }
                />
              )}
            </div>
          </div>
          <EncodingModeSelector
            setEditMode={setEditMode}
            chainActions={chainActions}
            deleteTemplate={deleteTemplate}
            templates={templates}
            setEncodingMode={setEncodingMode}
            clickTarget={<TiExport />}
          />
        </div>

        <div className="flex space-between full-width flex-wrap">
          {/* <div
            className={classnames({
              'template-modification-control': true,
              'template-modification-control--disabled': !MAKE_NEW_TEMPLATE[
                templateSaveState
              ],
            })}
          >
            <IoIosCreate />{' '}
            <span className="template-modification-control-label">NEW</span>
          </div> */}
          <div
            className={classnames({
              'template-modification-control': true,
            })}
            onClick={() => {
              setBlankTemplate();
            }}
          >
            <IoIosCreate />{' '}
            <span className="template-modification-control-label">NEW</span>
          </div>
          <div
            className={classnames({
              'template-modification-control': true,
              'template-modification-control--disabled':
                editMode || !UPDATE_TEMPLATE[templateSaveState],
            })}
            onClick={() => {
              if (!editMode || !UPDATE_TEMPLATE[templateSaveState]) {
                return;
              }
              saveCurrentTemplate();
            }}
          >
            <FaSave />
            <span className="template-modification-control-label">SAVE</span>
          </div>

          <div
            className="template-modification-control"
            onClick={() => setEditMode(!editMode)}
          >
            <IoIosSettings />
            <span className="template-modification-control-label">
              {editMode ? 'STOP EDIT' : 'START EDIT'}
            </span>
          </div>

          <div
            className="template-modification-control"
            onClick={clearEncoding}
          >
            <FaEraser />

            <span className="template-modification-control-label">RESET</span>
          </div>
        </div>
      </div>
    </div>
  );
}
