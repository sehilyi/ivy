import React from 'react';
import {MultiDataTargetWidget, Widget, DataType} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import MultiShelf from '../multi-shelf';
import {trim, classnames} from '../../utils';
import {EditParameterName, EditDisplayName} from './widget-common';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

function MultiDataTargetWidgetConfiguration(props: GeneralWidget<MultiDataTargetWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const allowedTypesSet = new Set(widget.config.allowedTypes);

  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      </div>
      <div className="flex">
        <div className="flex-down">
          <span className="tool-description">Data Types</span>
          <div className="flex">
            {DATA_TYPES.map(type => {
              const checked = allowedTypesSet.has(type);
              const toggleValue = (): void => {
                if (checked) {
                  allowedTypesSet.delete(type);
                } else {
                  allowedTypesSet.add(type);
                }
                setWidgetValue({key: 'allowedTypes', value: Array.from(allowedTypesSet), idx});
              };
              return (
                <div className="flex" key={type} style={{marginRight: '10px'}}>
                  <div
                    onClick={toggleValue}
                    className={classnames({
                      flex: true,
                      'template-card-type-pill': true,
                      [`template-card-type-pill--${type.toLowerCase()}`]: true,
                    })}
                  >
                    {type}
                  </div>
                  <input
                    aria-label={`Allow ${type} in multidatatarget`}
                    type="checkbox"
                    checked={checked}
                    onChange={toggleValue}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex">
          <span className="tool-description">Required:</span>
          <input
            aria-label={`Required`}
            type="checkbox"
            // onChange={(): any => setWidgetValue('required', !widget.config.required, idx)}
            onChange={(): any => setWidgetValue({key: 'required', value: !widget.config.required, idx})}
            checked={!!widget.config.required}
          />
        </div>
      </div>
      <div className="flex">
        <div className="flex-down">
          <span className="tool-description">Min Targets</span>
          <input
            aria-label={`Min number of targets`}
            value={widget.config.minNumberOfTargets}
            type="number"
            onChange={(event): any =>
              setWidgetValue({key: 'minNumberOfTargets', value: event.target.value, idx})
            }
          />
        </div>
        <div className="flex-down">
          <span className="tool-description">Max Targets</span>
          <input
            aria-label={`Max number of targets`}
            type="number"
            value={widget.config.maxNumberOfTargets}
            onChange={(event): any =>
              setWidgetValue({key: 'maxNumberOfTargets', value: event.target.value, idx})
            }
          />
        </div>
      </div>
    </div>
  );
}

function MultiDataTargetComponent(props: GeneralWidget<MultiDataTargetWidget>): JSX.Element {
  const {widget, widgetValue, columns, setTemplateValue, customCards} = props;
  return (
    <div className="multi-data-target-widget">
      <MultiShelf
        shelfValues={(Array.isArray(widgetValue) ? (widgetValue as string[]) : []).map(trim)}
        shelfName={widget.displayName || widget.name}
        fieldKey={widget.name}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
        customCards={customCards}
      />
    </div>
  );
}

const MultiDataTargetBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<MultiDataTargetWidget>;
  return {
    controls: <MultiDataTargetWidgetConfiguration {...common} widget={widg} />,
    uiElement: <MultiDataTargetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] => [],
  };
};

export default MultiDataTargetBuilder;
