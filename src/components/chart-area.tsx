import React from 'react';
import {
  Template,
  ColumnHeader,
  Json,
  HydraExtension,
  ViewsToMaterialize,
  TemplateMap,
  RendererProps,
} from '../types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiDeleteOutline, TiInputChecked} from 'react-icons/ti';
import ViewControls from './view-controls';
import {GenericAction, DataRow, SetTemplateValuePayload} from '../actions';
import Gallery from './gallery';
import GALLERY from '../templates/gallery';
import {evaluateHydraProgram} from '../hydra-lang';
import {HoverTooltip} from './tooltips';
import {wrangle} from '../utils/wrangle';

interface ChartAreaProps {
  changeViewName: GenericAction<{idx: number; value: string}>;
  cloneView: GenericAction<void>;
  columns: ColumnHeader[];
  createNewView: GenericAction<void>;
  currentView: string;
  data: DataRow[];
  deleteTemplate: GenericAction<string>;
  deleteView: GenericAction<string>;
  encodingMode: string;
  languages: {[x: string]: HydraExtension};
  missingFields: string[];
  setAllTemplateValues: GenericAction<TemplateMap>;
  setEncodingMode: GenericAction<string>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  spec: Json;
  switchView: GenericAction<string>;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templates: Template[];
  userName: string;
  views: string[];
}

function* cartesian(head?: any, ...tail: any): any {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
}
interface MaterializeWrapperProps {
  data: DataRow[];
  materializedViews: TemplateMap[];
  renderer: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  spec: any;
  template: Template;
  templateMap: TemplateMap;
}

function prepareUpdate(
  oldTemplateMap: TemplateMap,
  newTemplateMap: TemplateMap,
  view: TemplateMap,
): TemplateMap {
  return {
    ...newTemplateMap,
    systemValues: {
      ...newTemplateMap.systemValues,
      viewsToMaterialize: Object.keys(view.paramValues).reduce(
        (acc, row) => {
          delete acc[row];
          return acc;
        },
        {...oldTemplateMap.systemValues.viewsToMaterialize},
      ),
    },
  };
}

function materializeWrapper(props: MaterializeWrapperProps): JSX.Element {
  const {
    data,
    materializedViews,
    renderer,
    setAllTemplateValues,
    setMaterialization,
    template,
    templateMap,
  } = props;
  const keySet = Object.entries(templateMap.systemValues.viewsToMaterialize)
    .filter(d => d[1].length)
    .reduce((acc, d: [string, string[]]) => acc.add(d[0]), new Set());
  function removeButton(name: string, key: string, value: string): JSX.Element {
    return (
      <div
        className="cursor-pointer"
        key={key}
        onClick={(): void => {
          setMaterialization({
            // eslint-disable-next-line react/prop-types
            ...templateMap.systemValues.viewsToMaterialize,
            // eslint-disable-next-line react/prop-types
            [key]: (templateMap.systemValues.viewsToMaterialize[key] || []).filter(d => d !== value),
          });
        }}
      >
        <HoverTooltip message="remove this option from the fan out">
          <TiDeleteOutline />
        </HoverTooltip>
      </div>
    );
  }
  return (
    <React.Fragment>
      {materializedViews.map((view, idx) => {
        const newTemplateMap: TemplateMap = {
          ...templateMap,
          paramValues: {...templateMap.paramValues, ...view.paramValues},
        };
        const spec = evaluateHydraProgram(template, newTemplateMap);
        const cardName = Object.entries(view.paramValues)
          .map(row => row.join(': '))
          .join(' ');
        return (
          <div key={`view-${idx}-${cardName}`} className="render-wrapper">
            <div className="render-wrapper-header">
              <span className="render-wrapper-title">{cardName}</span>
              <div className="flex render-wrapper-controls">
                <div
                  className="cursor-pointer"
                  onClick={(): any => setAllTemplateValues(prepareUpdate(templateMap, newTemplateMap, view))}
                >
                  <HoverTooltip message="select this view">
                    <TiInputChecked />
                  </HoverTooltip>
                </div>
                {keySet.size === 1 &&
                  removeButton(
                    'REMOVE',
                    Array.from(keySet)[0] as string,
                    view.paramValues[Array.from(keySet)[0] as string] as string,
                  )}
                {keySet.size > 1 && (
                  <Tooltip
                    placement="top"
                    trigger="click"
                    overlay={
                      <div className="flex-down">
                        <h3>Remove which of the following keys</h3>
                        {Array.from(keySet).map((key: string) => {
                          return removeButton(
                            `${key}: ${view.paramValues[key as string]}`,
                            key,
                            view.paramValues[key as string] as string,
                          );
                        })}
                      </div>
                    }
                  >
                    <div>
                      <TiDeleteOutline />
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
            {/* TODO memoize */}
            {renderer({
              data,
              spec,
              onError: (e: any): void => {
                console.log('upper error', e);
              },
            })}
          </div>
        );
      })}{' '}
    </React.Fragment>
  );
}

interface MemoizerProps {
  renderer: (props: RendererProps) => JSX.Element;
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
}

const MemoizeRender = React.memo(
  function Memoizer(props: MemoizerProps): JSX.Element {
    const {renderer, onError, data, spec} = props;
    return renderer({data, spec, onError});
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.spec) === JSON.stringify(nextProps.spec) &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  },
);

export default function ChartArea(props: ChartAreaProps): JSX.Element {
  const {
    changeViewName,
    cloneView,
    columns,
    createNewView,
    currentView,
    data,
    deleteTemplate,
    deleteView,
    encodingMode,
    languages,
    missingFields,
    setAllTemplateValues,
    setEncodingMode,
    setMaterialization,
    spec,
    switchView,
    template,
    templateComplete,
    templateMap,
    templates,
    userName,
    views,
  } = props;
  // TODO memoize
  const preparedData = wrangle(data, templateMap.systemValues.dataTransforms);

  const templateGallery = template.templateLanguage === GALLERY.templateLanguage;
  const renderer = languages[template.templateLanguage] && languages[template.templateLanguage].renderer;
  const showChart = !templateGallery && renderer && templateComplete;

  const preCart = Object.entries(templateMap.systemValues.viewsToMaterialize).map(([key, values]) => {
    return values.map(value => ({key, value}));
  });
  const materializedViews = preCart.length
    ? [...cartesian(...preCart)].map(combo => {
        return combo.reduce((acc: any, row: any) => ({...acc, [row.key]: row.value}), {});
      })
    : [];

  return (
    <div
      style={{overflow: 'hidden'}}
      className={classnames({
        'flex-down': true,
        'full-width': true,
        'full-height': true,
      })}
    >
      <div
        className={classnames({
          'chart-container': true,
          'multi-view-container': materializedViews.length > 0,
          center: true,
          'full-width': encodingMode !== GALLERY.templateName,
          'full-height': true,
        })}
      >
        {templateGallery && (
          <Gallery
            columns={columns}
            deleteTemplate={deleteTemplate}
            setEncodingMode={setEncodingMode}
            spec={spec}
            templates={templates}
            userName={userName}
          />
        )}
        {showChart && materializedViews.length === 0 && (
          <MemoizeRender
            renderer={renderer}
            data={preparedData}
            spec={spec}
            onError={(e): void => {
              console.log('upper error', e);
            }}
          />
        )}
        {showChart &&
          materializedViews.length > 0 &&
          materializeWrapper({
            data: preparedData,
            materializedViews: materializedViews.map(
              (paramValues: {[x: string]: string | string[]}): TemplateMap => ({
                systemValues: {viewsToMaterialize: {}, dataTransforms: []},
                paramValues,
              }),
            ),
            renderer,
            setAllTemplateValues,
            setMaterialization,
            spec,
            template,
            templateMap,
          })}
        {!templateGallery && !showChart && (
          <div className="chart-unfullfilled">
            <h2> Chart is not yet filled out </h2>
            <h5>Select values for the following fields: {missingFields.join(', ')}</h5>
          </div>
        )}
      </div>
      <ViewControls
        changeViewName={changeViewName}
        cloneView={cloneView}
        columns={columns}
        createNewView={createNewView}
        currentView={currentView}
        deleteView={deleteView}
        setEncodingMode={setEncodingMode}
        switchView={switchView}
        template={template}
        templateMap={templateMap}
        templates={templates}
        views={views}
        userName={userName}
      />
    </div>
  );
}
