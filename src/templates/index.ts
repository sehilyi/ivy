import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SliderWidget,
  SwitchWidget,
  Template,
  TemplateWidget,
  TextWidget,
  WidgetSubType,
  ShortcutsWidget,
} from './types';
import {EMPTY_SPEC} from '../reducers/default-state';
import {DataType} from '../types';
import {toList} from '../utils';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './example-templates/vega-common';
import ATOM from './example-templates/atom';
import BEESWARM_TEMPLATE from './example-templates/bee-swarm';
import DATATABLE from './example-templates/table';
import NONE_TEMPLATE from './example-templates/none';
import PIECHART_TEMPLATE from './example-templates/pie-chart';
import SCATTERPLOT_TEMPLATE from './example-templates/scatterplot';
import SHELF from './example-templates/polestar-template';
import UNITVIS from './example-templates/unit-vis';

export const BLANK_TEMPLATE: Template = {
  templateLanguage: 'vega-lite',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: stringify(EMPTY_SPEC),
  widgets: [],
  widgetValidations: [],
};

// META COLUMNS NOT CURRENTLY ALLOWED IN TEMPLATES
const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
// const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];
type WidgetFactoryFunc = (idx: number) => TemplateWidget<WidgetSubType>;
export const widgetFactory: {[widgetType: string]: WidgetFactoryFunc} = {
  DataTarget: idx =>
    ({
      widgetName: `Dim${idx}`,
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: DATA_TYPES,
        required: true,
      },
    } as TemplateWidget<DataTargetWidget>),
  MultiDataTarget: idx =>
    ({
      widgetName: `MultiDim${idx}`,
      widgetType: 'MultiDataTarget',
      widget: {
        allowedTypes: DATA_TYPES,
        required: true,
        minNumberOfTargets: 0,
      },
    } as TemplateWidget<MultiDataTargetWidget>),
  List: idx =>
    ({
      widgetName: `ListItem${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: [] as {display: string; value: string}[],
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),

  Switch: idx =>
    ({
      widgetName: `Switch${idx}`,
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: true,
      },
    } as TemplateWidget<SwitchWidget>),
  Text: idx =>
    ({widgetName: `Text${idx}`, widgetType: 'Text', widget: {text: ''}} as TemplateWidget<TextWidget>),
  Slider: idx =>
    ({
      widgetName: `Slider${idx}`,
      widgetType: 'Slider',
      widget: {minVal: 0, maxVal: 10, step: 1, defaultValue: 5},
    } as TemplateWidget<SliderWidget>),
  Section: idx =>
    ({
      widgetName: `Section${idx}`,
      widgetType: 'Section',
      widget: null,
    } as TemplateWidget<SectionWidget>),
  Shortcuts: idx =>
    ({
      widgetName: `Shortcut${idx}`,
      widgetType: 'Shortcut',
      widget: {shortcuts: []},
    } as TemplateWidget<ShortcutsWidget>),
  FreeText: idx =>
    ({
      widgetName: `FreeText${idx}`,
      widgetType: 'FreeText',
      widget: {},
    } as TemplateWidget<ShortcutsWidget>),
};

export const preconfiguredWidgets: {[widgetType: string]: WidgetFactoryFunc} = {
  'Discrete Color Options': idx =>
    ({
      widgetName: `ColorList${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),
  'Data Types Options': idx =>
    ({
      widgetName: `DataTypeOptions${idx}`,
      widgetType: 'List',
      widget: {
        allowedValues: toList(['quantitative', 'temporal', 'ordinal', 'nominal']),
        defaultValue: null,
      },
    } as TemplateWidget<ListWidget>),
};

export const DEFAULT_TEMPLATES: Template[] = [
  SHELF,
  ATOM,
  DATATABLE,
  SCATTERPLOT_TEMPLATE,
  PIECHART_TEMPLATE,
  BEESWARM_TEMPLATE,
  UNITVIS,
  NONE_TEMPLATE,
];
