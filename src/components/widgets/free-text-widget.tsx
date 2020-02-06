import React from 'react';
import {FreeTextWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';
import {EditParameterName, EditDisplayName, Reset} from './widget-common';

export default function FreeTextWidgetComponent(
  props: GeneralWidget<TemplateWidget<FreeTextWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, setTemplateValue, templateMap} = props;
  const field = widget.widgetName;
  return (
    <div className="flex free-text-widget">
      {editMode && <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />}
      {editMode && <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />}
      {<div className="widget-title">{widget.displayName || widget.widgetName}</div>}
      <input
        value={templateMap[widget.widgetName] || ''}
        type="text"
        onChange={(event): any => setTemplateValue({field, text: event.target.value})}
      />
      <Reset
        tooltipLabel={'Reset to free text widget to be empty'}
        onClick={(): any => setTemplateValue({field, text: ''})}
      />
    </div>
  );
}
