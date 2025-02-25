import React, {useRef} from 'react';
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd';
import {XYCoord} from 'dnd-core';
import {TiFlash} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';

import Switch from 'react-switch';

import {switchCommon, MATERIALIZING} from '../../constants';

import {TemplateMap, Widget, GenWidget, CustomCard} from '../../types';
import {ColumnHeader} from '../../types';
import {
  GenericAction,
  SetTemplateValuePayload,
  MoveWidgetPayload,
  SetWidgetValuePayload,
  SetMaterializationPayload,
} from '../../actions';
import {classnames} from '../../utils';
import {getDefaultValueForWidget} from '../../ivy-lang';

import WidgetConfigurationControls from './widget-configuration-controls';

import DataTargetBuilder from './data-target-widget';
import FreeTextBuilder from './free-text-widget';
import ListBuilder from './list-widget';
import MultiDataTargetBuilder from './multi-data-target-widget';
import SectionBuilder from './section-widget';
// import ShortcutBuilder from './shortcuts-widget';
import SliderBuilder from './slider-widget';
import SwitchBuilder from './switch-widget';
import TextBuilder from './text-widget';

export interface GeneralWidget<T> {
  columns: ColumnHeader[];
  customCards: CustomCard[];
  disallowFanout: boolean;
  editMode: boolean;
  idx: number;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  widget: Widget<T>;
  widgetValue: any;
  materializations: string[];
}

interface GeneralWidgetComponentProps {
  columns: ColumnHeader[];
  customCards: CustomCard[];
  disallowFanout: boolean;
  editMode: boolean;
  idx: number;
  moveWidget: GenericAction<MoveWidgetPayload>;
  duplicateWidget: GenericAction<number>;
  removeWidget: GenericAction<number>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setMaterialization: GenericAction<SetMaterializationPayload>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  widgetValue: any;
  materializations: string[];
  widget: GenWidget;
  widgetIsAllowed: boolean;
}

export type WidgetBuilder = (
  widget: GenWidget,
  common: GeneralWidgetComponentProps,
) => {
  controls: any;
  uiElement: any;
  materializationOptions: (columns: ColumnHeader[], widget: GenWidget) => {name: string; group?: string}[];
};

const builders = {
  DataTarget: DataTargetBuilder,
  FreeText: FreeTextBuilder,
  List: ListBuilder,
  MultiDataTarget: MultiDataTargetBuilder,
  Section: SectionBuilder,
  Slider: SliderBuilder,
  Switch: SwitchBuilder,
  Text: TextBuilder,
};

interface GenericMaterializationMenuProps {
  allowedValues: {name: string; group?: string}[];
  setMaterialization: GenericAction<SetMaterializationPayload>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  widgetValue: any;
  materializations: string[];
  widget: GenWidget;
}

const GenericMaterializationMenu = (props: GenericMaterializationMenuProps): null | JSX.Element => {
  const {allowedValues, setMaterialization, widget, setTemplateValue, materializations} = props;
  const groups = allowedValues.reduce(
    (acc, row) => {
      acc[row.group || ''] = (acc[row.group || ''] || []).concat(row);
      return acc;
    },
    {Recomended: [], 'Not Recomended': []} as {[x: string]: {group?: string; name: string}[]},
  );
  const foundButtons = Object.entries(groups)
    .filter(([key, vals]) => key.length && vals.length)
    .map(([key, group]) => {
      return (
        <button
          type="button"
          key={`button-${key}`}
          onClick={(): any => {
            setMaterialization({key: widget.name, value: group.map(({name}) => name)});
            setTemplateValue({field: widget.name, text: `"${MATERIALIZING}"`});
          }}
        >
          {key} on
        </button>
      );
    });

  return (
    <div>
      {Object.entries(groups)
        .filter(row => row[1].length)
        .map(([key, group]) => {
          const rows = group.map(({name}, idx) => {
            const checked = (materializations || []).includes(name);
            return (
              <div key={idx} className="flex space-between">
                <span>{name}</span>
                <Switch
                  {...switchCommon}
                  checked={checked}
                  onChange={(): any => {
                    const newVals = checked
                      ? materializations.filter(d => d !== name)
                      : materializations.concat(name);
                    setMaterialization({
                      key: widget.name,
                      value: newVals,
                    });
                    setTemplateValue({
                      field: widget.name,
                      text: newVals.length ? `"${MATERIALIZING}"` : getDefaultValueForWidget(widget),
                    });
                  }}
                />
              </div>
            );
          });
          return (
            <div className="flex-down margin-top" key={key}>
              <h5>{key}</h5>
              {rows}
            </div>
          );
        })}
      <div className="flex margin-top">
        {foundButtons}
        <button
          type="button"
          onClick={(): any => {
            setMaterialization({
              key: widget.name,
              value: allowedValues.map(({name}) => name),
            });
            setTemplateValue({field: widget.name, text: `"${MATERIALIZING}"`});
          }}
        >
          Use all
        </button>
        <button
          type="button"
          onClick={(): any => {
            setMaterialization({key: widget.name, value: []});
            setTemplateValue({field: widget.name, text: getDefaultValueForWidget(widget)});
          }}
        >
          Use none
        </button>
      </div>
    </div>
  );
};

// dragging functionality cribbed from
// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed
function GeneralWidgetComponent(props: GeneralWidgetComponentProps): JSX.Element {
  const {
    columns,
    disallowFanout,
    editMode,
    idx,
    materializations,
    moveWidget,
    setMaterialization,
    setTemplateValue,
    widget,
    widgetValue,
  } = props;

  const widgetType = widget.type;
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover(item: any, monitor: DropTargetMonitor) {
      if (!editMode) {
        return;
      }
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = idx;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      const hoverBoundingRect = ref.current!.getBoundingClientRect();
      /* eslint-enable  @typescript-eslint/no-non-null-assertion */

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveWidget({fromIdx: dragIndex, toIdx: hoverIndex});

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{isDragging}, drag, preview] = useDrag({
    item: {type: 'WIDGET', widget, idx},
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    previewOptions: {anchorX: 1},
  });

  const opacity = isDragging ? 0.4 : 1;
  if (editMode) {
    drag(drop(ref));
  }
  const factory = builders[widgetType];
  if (!factory) {
    return <div>error</div>;
  }

  const {controls, uiElement, materializationOptions} = factory(widget, props);
  const options = materializationOptions(columns, widget);
  return (
    <div
      ref={preview}
      style={{opacity}}
      className={classnames({
        widget: true,
        flex: true,
        'widget-drag': isDragging,
      })}
    >
      <div className="widget-body">{uiElement}</div>
      <div ref={ref}>
        <WidgetConfigurationControls {...props} controls={controls} />
        {options.length > 0 && !disallowFanout && !editMode && (
          <Tooltip
            placement="top"
            trigger="click"
            overlay={
              <div className="fan-out-tooltip">
                <h3>Select Values to Fan Across</h3>
                <h5>Fanning values allows you to consider multiple options in simultaneously</h5>
                <GenericMaterializationMenu
                  allowedValues={options}
                  setMaterialization={setMaterialization}
                  setTemplateValue={setTemplateValue}
                  widget={widget}
                  widgetValue={widgetValue}
                  materializations={materializations}
                />
              </div>
            }
          >
            <div
              className={classnames({
                'materialize-button': true,
                'materialize-button-active': materializations && materializations.length > 0,
              })}
            >
              <TiFlash />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function equalityCheck(prevProps: any, nextProps: any): boolean {
  return Object.keys(prevProps).every(key => {
    if (key === 'materializations') {
      return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
    }
    return prevProps[key] === nextProps[key];
  });
}

export default React.memo(GeneralWidgetComponent, equalityCheck);
