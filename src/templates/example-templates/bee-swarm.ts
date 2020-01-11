import stringify from 'json-stringify-pretty-compact';
import {Template} from '../types';
import {VEGA_CATEGORICAL_COLOR_SCHEMES} from './vega-common';
import {toList} from '../../utils';

const BEESWARM_EXAMPLE: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 800,
  height: 100,
  padding: {left: 5, right: 5, top: 0, bottom: 20},
  autosize: 'none',

  signals: [
    {name: 'cx', update: 'width / 2'},
    {name: 'cy', update: 'height / 2'},
    {name: 'radius', update: '[radius]'},
    {name: 'collide', update: '[collide]'},
    {name: 'gravityX', update: '[gravityX]'},
    {name: 'gravityY', update: '[gravityY]'},
    {name: 'static', update: '[static]'},
  ],

  data: [
    {
      name: 'table',
      values: 'myData',
    },
  ],

  scales: [
    {
      name: 'xscale',
      type: 'band',
      domain: {
        data: 'table',
        field: '[category]',
        sort: true,
      },
      range: 'width',
    },
    {
      name: 'color',
      type: 'ordinal',
      domain: {data: 'table', field: '[category]'},
      range: {scheme: '[colorScheme]'},
    },
  ],

  axes: [{orient: 'bottom', scale: 'xscale'}],

  marks: [
    {
      name: 'nodes',
      type: 'symbol',
      from: {data: 'table'},
      encode: {
        enter: {
          fill: {scale: 'color', field: '[category]'},
          xfocus: {scale: 'xscale', field: '[category]', band: 0.5},
          yfocus: {signal: 'cy'},
        },
        update: {
          size: {signal: 'pow(2 * radius, 2)'},
          stroke: {value: 'white'},
          strokeWidth: {value: 1},
          zindex: {value: 0},
        },
        hover: {
          stroke: {value: 'purple'},
          strokeWidth: {value: 3},
          zindex: {value: 1},
        },
      },
      transform: [
        {
          type: 'force',
          iterations: 300,
          static: {signal: 'static'},
          forces: [
            {
              force: 'collide',
              iterations: {signal: 'collide'},
              radius: {signal: 'radius'},
            },
            {force: 'x', x: 'xfocus', strength: {signal: 'gravityX'}},
            {force: 'y', y: 'yfocus', strength: {signal: 'gravityY'}},
          ],
        },
      ],
    },
  ],
};

const BeeSwarm: Template = {
  templateName: 'BeeSwarm chart',
  templateDescription: 'A unit approach to showing the sizes of groups',
  templateLanguage: 'vega',
  widgets: [
    {
      widgetName: 'category',
      widgetType: 'DataTarget',
      widget: {
        allowedTypes: ['DIMENSION'],
        required: true,
      },
    },
    {
      widgetName: 'radius',
      widgetType: 'Slider',
      widget: {
        minVal: 2,
        maxVal: 15,
        step: 1,
        defaultValue: 5,
      },
    },
    {
      widgetName: 'collide',
      widgetType: 'Slider',
      widget: {
        minVal: 1,
        maxVal: 10,
        step: 1,
        defaultValue: 1,
      },
    },
    {
      widgetName: 'gravityX',
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 1,
        step: 0.01,
        defaultValue: 0.2,
      },
    },
    {
      widgetName: 'gravityY',
      widgetType: 'Slider',
      widget: {
        minVal: 0,
        maxVal: 1,
        step: 0.01,
        defaultValue: 0.1,
      },
    },
    {
      widgetName: 'static',
      widgetType: 'Switch',
      widget: {
        activeValue: 'true',
        inactiveValue: 'false',
        defaultsToActive: false,
      },
    },
    {
      widgetName: 'colorScheme',
      widgetType: 'List',
      widget: {
        allowedValues: toList(VEGA_CATEGORICAL_COLOR_SCHEMES),
        defaultValue: '"category20"',
      },
    },
  ],
  widgetValidations: [],
  code: stringify(BEESWARM_EXAMPLE),
};
export default BeeSwarm;
