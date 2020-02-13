import stringify from 'json-stringify-pretty-compact';
import {Template, TemplateWidget, WidgetSubType, Validation} from '../types';
import {toList} from '../../utils';
import {
  makeDataTarget,
  makeText,
  makeSection,
  simpleList,
  simpleSwitch,
  simpleValidation,
  // addValidation,
  used,
  unused,
  toQuote,
  makeFullAgg,
  makeSimpleAgg,
  makeTypeSelect,
} from './polestar-template-utils';

const MARK_TYPES = [
  'AREA',
  'BAR',
  'CIRCLE',
  'LINE',
  'POINT',
  'RECT',
  'SQUARE',
  'TEXT',
  'TICK',
  'TRAIL',
].map(x => x.toLowerCase());

// associated channel must have simple and full aggregates for this to work
function aggregateConditional(key: string): any {
  return {
    CONDITIONAL: {
      query: `(parameters.${key} && parameters.${key}AggFull !== "\\"none\\"") || (!parameters.${key} && parameters.${key}AggSimple !== "\\"none\\"")`,
      true: {
        CONDITIONAL: {
          query: `parameters.${key}`,
          true: `[${key}AggFull]`,
          false: `[${key}AggSimple]`,
        },
      },
      deleteKeyOnFalse: true,
    },
  };
}

const renderObjectIf = (object: any, query: string, fieldName: string): any => ({
  [fieldName]: {CONDITIONAL: {query, true: object, deleteKeyOnFalse: true}},
});
const shelfProgram: any = {
  $schema: 'https:vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
  encoding: {
    ...['X', 'Y'].reduce((acc: any, key) => {
      return {
        ...acc,
        [key.toLowerCase()]: {
          field: {CONDITIONAL: {query: used(key), true: `[${key}]`, deleteKeyOnFalse: true}},
          type: `[${key}Type]`,
          aggregate: aggregateConditional(key),
          scale: {
            // zero: `[${key}IncludeZero]`,
            zero: {CONDITIONAL: {query: used(key), true: `[${key}IncludeZero]`, deleteKeyOnFalse: true}},
            type: {CONDITIONAL: {query: used(key), true: `[${key}ScaleType]`, deleteKeyOnFalse: true}},
            // CONDITIONAL: {true: {zero: `[${key}IncludeZero]`}, false: null, query: used(key)}
          },
        },
      };
    }, {}),

    ...renderObjectIf({field: '[Size]', type: '[SizeType]'}, used('Size'), 'size'),
    ...renderObjectIf(
      {
        field: {CONDITIONAL: {query: 'parameters.Color', true: '[Color]', deleteKeyOnFalse: true}},
        type: '[ColorType]',
        aggregate: aggregateConditional('Color'),
      },
      'parameters.Color || (parameters.ColorAggSimple !== "\\"none\\"")',
      'color',
    ),
    ...renderObjectIf({field: '[Shape]', type: '[ShapeType]'}, used('Shape'), 'shape'),
    ...renderObjectIf({field: '[Text]', type: '[TextType]'}, used('Text'), 'text'),
    ...renderObjectIf({field: '[Detail]', type: '[DetailType]'}, used('Detail'), 'detail'),
    ...['Row', 'Column'].reduce((acc, key) => {
      const newObj = renderObjectIf({field: `[${key}]`, type: 'nominal'}, used(key), key.toLowerCase());
      return {...acc, ...newObj};
    }, {}),
  },
  mark: {type: '[markType]', tooltip: true},
};

const SHELF: Template = {
  templateName: 'Polestar',
  templateDescription:
    'A tableau-style shelf builder, facilitates a wide variety of charting and exploration tasks.',
  templateLanguage: 'vega-lite',
  templateAuthor: 'BUILT_IN',
  code: stringify(shelfProgram),
  widgets: [
    // x & y dimensions
    makeSection('Encoding header'),
    makeText('Encoding'),
    ...['X', 'Y'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'quantitative'),
        simpleList({
          name: `${key}ScaleType`,
          list: ['linear', 'log'],
          displayName: 'Scale type',
          defaultVal: toQuote('linear'),
          validations: [
            simpleValidation(key),
            {
              queryResult: 'show',
              query: `Boolean(parameters.${key}) && parameters.${key}Type === "\\"quantitative\\""`,
            },
          ],
        }),
        simpleSwitch({
          name: `${key}IncludeZero`,
          displayName: 'Include Zero',
          validations: [simpleValidation(key)],
        }),
        simpleSwitch({name: `${key}bin`, displayName: 'Bin', validations: [simpleValidation(key)]}),
        makeFullAgg(key),
        makeSimpleAgg(key),
      ]);
    }, []),

    // Mark type
    makeSection('MarkDivider'),
    simpleList({name: 'markType', list: toList(MARK_TYPES), defaultVal: toQuote('circle')}),
    {
      type: 'Shortcut',
      name: 'main-shortcuts',
      config: {
        shortcuts: [
          {
            label: 'SWAP X & Y',
            shortcutFunction:
              "Object.keys(parameters).reduce((acc, d) => ({...acc, [d[0] === 'X' ? `Y${d.slice(1)}` : d[0] === 'Y' ? `X${d.slice(1)}` : d]: parameters[d]}), {})",
          },
        ],
      },
    },

    // size & color dimensions
    ...['Color', 'Size'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([
        makeDataTarget(key),
        makeTypeSelect(key, 'ordinal'),
        simpleSwitch({name: `${key}bin`}),
        makeFullAgg(key),
        makeSimpleAgg(key),
      ]);
    }, []),

    // size & color dimensions
    ...['Shape', 'Detail'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key), makeTypeSelect(key, 'nominal')]);
    }, []),
    // text
    makeDataTarget('Text'),
    makeTypeSelect('Text', 'nominal'),
    makeFullAgg('Text'),
    makeSimpleAgg('Text'),

    // row / column
    makeSection('Facet Divider'),
    makeText('Repeat Small Multiply'),
    ...['Row', 'Column'].reduce((acc: TemplateWidget<WidgetSubType>[], key: string) => {
      return acc.concat([makeDataTarget(key)]);
    }, []),
  ],
  // TODO UGH
  // widgetValidations: [
  //   ...['X', 'Y'].reduce((acc: WidgetValidation[], key: string) => {
  // simpleValidation()
  //     [`${key}Type`, `${key}ScaleType`, `${key}IncludeZero`, `${key}bin`].forEach(addValidation(acc, key));
  //     // remove the scale type options for order/nominal/temporal as it doesn't make sense
  //     acc.push({
  //       queryTarget: `${key}ScaleType`,
  //       queryResult: 'show',
  //       query: `Boolean(parameters.${key}) && parameters.${key}Type === "\\"quantitative\\""`,
  //     });
  //     return acc;
  //   }, []),

  //   ...['Color', 'Size'].reduce((acc: WidgetValidation[], key: string) => {
  //     [`${key}Type`, `${key}bin`].forEach(addValidation(acc, key));
  //     return acc;
  //   }, []),

  //   ...['Shape', 'Detail'].reduce((acc: WidgetValidation[], key: string) => {
  //     [`${key}Type`].forEach(addValidation(acc, key));
  //     return acc;
  //   }, []),
  //   // simple and full aggregate are paired
  //   ...['X', 'Y', 'Size', 'Color', 'Text'].reduce((acc, key) => {
  //     return acc.concat([
  //       {queryTarget: `${key}AggFull`, query: unused(key), queryResult: 'hide'},
  //       {queryTarget: `${key}AggSimple`, query: used(key), queryResult: 'hide'},
  //     ]);
  //   }, []),
  // ],
};
export default SHELF;
