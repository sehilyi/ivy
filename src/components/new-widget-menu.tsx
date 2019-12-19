import React, {Fragment} from 'react';
import Popover from './popover';
import {AiOutlinePlusCircle} from 'react-icons/ai';
import {GenericAction} from '../actions';
import {TemplateWidget, WidgetSubType} from '../templates/types';
import {widgetFactory, preconfiguredWidgets} from '../templates';

interface Props {
  addWidget: GenericAction;
  widgets: TemplateWidget<WidgetSubType>[];
}

export default function NewWidgetMenu(props: Props) {
  const {addWidget, widgets} = props;
  const options = Object.entries(widgetFactory).concat(
    Object.entries(preconfiguredWidgets),
  );
  return (
    <Popover
      className="new-widget-menu"
      clickTarget={
        <Fragment>
          Add Widget <AiOutlinePlusCircle />
        </Fragment>
      }
      body={(toggle: any) => {
        return (
          <Fragment>
            <h3>Add New Widget</h3>
            <div className="flex flex-wrap">
              {options.map((row: any) => {
                const [key, widget] = row;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      addWidget(widget(widgets.length));
                      toggle();
                    }}
                  >
                    {`Add ${key}`}
                  </button>
                );
              })}
            </div>
          </Fragment>
        );
      }}
    />
  );
}
