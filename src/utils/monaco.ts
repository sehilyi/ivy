// Cribbed from vega-editor
import stringify from 'json-stringify-pretty-compact';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {mergeDeep} from 'vega-lite/build/src/util';
import {modifyJSONSchema} from '../ivy-lang';

/**
 * Adds markdownDescription props to a schema. See https://github.com/Microsoft/monaco-editor/issues/885
 */
function addMarkdownProps(value: any): any {
  if (typeof value === 'object' && value !== null) {
    if (value.description) {
      value.markdownDescription = value.description;
    }

    for (const key in value) {
      /* eslint-disable */
      if (value.hasOwnProperty(key)) {
        value[key] = addMarkdownProps(value[key]);
      }
      /* eslint-enable */
    }
  }
  return value;
}

/* eslint-disable @typescript-eslint/no-var-requires */
const vegaLiteSchema = modifyJSONSchema(require('vega-lite/build/vega-lite-schema.json'));
const vegaSchema = modifyJSONSchema(require('vega/build/vega-schema.json'));
const ivySchema = require('../../assets/ivy.json');
const unitVisSchema = require('unit-vis/unit-vis-schema.json');
/* eslint-enable @typescript-eslint/no-var-requires */
addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);
addMarkdownProps(ivySchema);

const schemas = [
  {
    schema: vegaSchema,
    uri: 'https://vega.github.io/schema/vega/v5.json',
  },
  {
    schema: vegaLiteSchema,
    uri: 'https://vega.github.io/schema/vega-lite/v4.json',
  },
  {
    schema: unitVisSchema,
    uri: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
  },
  {
    schema: ivySchema,
    uri: 'https://ivy-vis.netlify.com/assets/ivy.json',
  },
  {
    schema: mergeDeep({}, vegaLiteSchema, {
      $ref: '#/definitions/Config',
      definitions: {
        Config: {
          properties: {
            $schema: {
              type: 'string',
            },
          },
        },
      },
    }),
    uri: 'https://vega.github.io/schema/vega-lite/v4.json#Config',
  },
  {
    schema: {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'object',
    },
    uri: 'https://vega.github.io/schema/vega/v5.json#Config',
  },
];

export default function setupMonaco(): void {
  Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: false,
    enableSchemaRequest: true,
    schemas,
    validate: true,
  });

  Monaco.languages.json.jsonDefaults.setModeConfiguration({
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
  });

  Monaco.languages.registerDocumentFormattingEditProvider('json', {
    provideDocumentFormattingEdits(
      model: Monaco.editor.ITextModel,
      // options: Monaco.languages.FormattingOptions,
      // token: Monaco.CancellationToken,
    ): Monaco.languages.TextEdit[] {
      return [
        {
          range: model.getFullModelRange(),
          text: stringify(JSON.parse(model.getValue())),
        },
      ];
    },
  });
}
