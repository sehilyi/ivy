import React from 'react';
import {TiDelete, TiCog} from 'react-icons/ti';
import Selector from '../selector';
import Tooltip from 'rc-tooltip';
import {widgetInUse} from '../../utils';
import {TemplateMap, TemplateWidget, WidgetSubType} from '../../templates/types';
import {ColumnHeader} from '../../types';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, SetTemplateValuePayload} from '../../actions';
import {AddLabelToWidget} from './widget-common';

interface PlacementControlsProps {
  allowedWidgets: Set<string>;
  code: string;
  columns: ColumnHeader[];
  editMode: boolean;
  controls: JSX.Element;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  templateMap: TemplateMap;
  widget: TemplateWidget<WidgetSubType>;
}
const dontShowUsedIf = new Set(['Section', 'Text']);
interface ValidationBuilderProps {
  idx: number;
  setWidgetValue: any;
  widget: TemplateWidget<WidgetSubType>;
}

function ValidationBuilder(props: ValidationBuilderProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  const validations = widget.validations || [];
  return (
    <React.Fragment>
      <h3>Validations</h3>
      <h5>(Logic for showing/hiding this widget)</h5>
      {validations.map((validation, jdx) => {
        return (
          <div className="flex" key={`validation-${jdx}`}>
            <AddLabelToWidget label="Query Result">
              <Selector
                options={['show', 'hide'].map(key => ({display: key, value: key}))}
                selectedValue={validation.queryResult}
                onChange={(value: any): any => {
                  const updatedValidations = validations.map((d, kdx) => {
                    if (jdx === kdx) {
                      return {...d};
                    }
                    return {...d, queryResult: value};
                  });
                  setWidgetValue('validations', updatedValidations, idx);
                }}
              />
            </AddLabelToWidget>
            <AddLabelToWidget label="Query">
              <IgnoreKeys style={{height: '100%'}}>
                <input
                  value={validation.query}
                  type="text"
                  onChange={(event): any => {
                    const updatedValidations = validations.map((d, kdx) => {
                      if (jdx === kdx) {
                        return {...d};
                      }
                      return {...d, query: event.target.value};
                    });
                    setWidgetValue('validations', updatedValidations, idx);
                  }}
                />
              </IgnoreKeys>
            </AddLabelToWidget>
          </div>
        );
      })}
      <button
        onClick={(): void => {
          setWidgetValue('validations', validations.concat({query: 'true', queryResult: 'show'}), idx);
        }}
      >
        Add a validation
      </button>
    </React.Fragment>
  );
}

export default function WidgetConfigurationControls(props: PlacementControlsProps): JSX.Element {
  const {allowedWidgets, code, controls, editMode, removeWidget, widget, setWidgetValue, idx} = props;
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle flex">
      <Tooltip
        placement="right"
        trigger="click"
        overlay={
          <div className="flex-down">
            <h3>{widget.type}</h3>
            {!dontShowUsedIf.has(widget.type) && (
              <h5>{`Widget is currently ${widgetInUse(code, widget.name) ? 'in use' : 'not used'}`}</h5>
            )}
            {controls}
            <ValidationBuilder widget={widget} setWidgetValue={setWidgetValue} idx={idx} />
            <h3>Other Actions</h3>
            <button onClick={removeWidget}>
              Delete Widget <TiDelete />
            </button>
          </div>
        }
      >
        <div className="flex center">
          <div className="flex-down">
            <div className="code-edit-controls-button cursor-pointer">
              <TiCog />
            </div>
            <div className="in-use-status">{allowedWidgets.has(widget.name) ? 'Shown' : 'Hidden'}</div>
          </div>
          <span className="grippy" />
        </div>
      </Tooltip>
    </div>
  );
}
