import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';

import {Template, TemplateMap} from '../templates/types';

import {SHOW_TEMPLATE_CONTROLS} from '../constants/CONFIG';

import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';
import {getTemplateSaveState, classnames} from '../utils';
import {applyConditionals, getMissingFields} from '../hydra-lang';

import {Spec} from 'vega-typings';
import {ColumnHeader, VegaTheme} from '../types';
import {AppState} from '../reducers/default-state';

import ChartArea from './chart-area';
import CodeEditor from './code-editor';
import DataColumn from './data-column';
import DataModal from './data-modal';
import EncodingColumn from './encoding-column';
import EncodingControls from './encoding-controls';
import Header from './header';
import ImportDataColumn from './import-data-column';
import SecondaryControls from './secondary-controls';
import TemplateColumn from './template-column';
import TemplatePreviewColumn from './template-preview-column';

// wrap the split pane functionality into a HOC
const Wrapper = (props: any): JSX.Element => {
  if (props.showProgrammaticMode && props.showGUIView) {
    return (
      <SplitPane
        split="horizontal"
        minSize={60}
        style={{overflow: 'unset', position: 'relative'}}
        defaultSize={parseInt(localStorage.getItem('splitPos'), 10)}
        onChange={(size: any): any => localStorage.setItem('splitPos', size)}
      >
        {props.children}
      </SplitPane>
    );
  }

  return <div className="flex-down full-height">{props.children}</div>;
};

interface RootProps {
  GOOSE_MODE: boolean;
  canRedo: boolean;
  canUndo: boolean;
  codeMode: string;
  columns: ColumnHeader[];
  currentTheme: VegaTheme;
  currentView: string;
  currentlySelectedFile: string;
  data: any; //TODO: define the data type
  dataModalOpen: boolean;
  editMode: boolean;
  editorError: null | string;
  encodingMode: string;
  iMspec: any;
  metaColumns: ColumnHeader[];
  missingFields: string[];
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  showSimpleDisplay: boolean;
  spec: Spec;
  specCode: string;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templateSaveState: string;
  templates: Template[];
  views: List<string>;

  addToNextOpenSlot: GenericAction;
  addWidget: GenericAction;
  chainActions: GenericAction;
  changeMarkType: GenericAction;
  changeSelectedFile: GenericAction;
  changeTheme: GenericAction;
  clearEncoding: GenericAction;
  cloneView: GenericAction;
  coerceType: GenericAction;
  createFilter: GenericAction;
  createNewView: GenericAction;
  deleteFilter: GenericAction;
  deleteTemplate: GenericAction;
  deleteView: GenericAction;
  loadCustomDataset: GenericAction;
  loadDataFromPredefinedDatasets: GenericAction;
  loadTemplates: GenericAction;
  modifyValueOnTemplate: GenericAction;
  moveWidget: GenericAction;
  readInTemplate: GenericAction;
  removeWidget: GenericAction;
  saveCurrentTemplate: GenericAction;
  setBlankTemplate: GenericAction;
  setCodeMode: GenericAction;
  setEditMode: GenericAction;
  setEncodingMode: GenericAction;
  setEncodingParameter: GenericAction;
  setGuiView: GenericAction;
  setNewSpec: GenericAction;
  setNewSpecCode: GenericAction;
  setProgrammaticView: GenericAction;
  setRepeats: GenericAction;
  setSimpleDisplay: GenericAction;
  setTemplateValue: GenericAction;
  setWidgetValue: GenericAction;
  swapXAndYChannels: GenericAction;
  switchView: GenericAction;
  toggleDataModal: GenericAction;
  triggerRedo: GenericAction;
  triggerUndo: GenericAction;
  updateFilter: GenericAction;
}

class RootComponent extends React.Component<RootProps> {
  componentDidMount(): void {
    // on start load the default selected file
    if (!this.props.GOOSE_MODE) {
      this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    }
    this.props.loadTemplates();
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error('ERRPR', error, errorInfo);
  }

  chartArea(): JSX.Element {
    const {
      cloneView,
      createNewView,
      currentTheme,
      currentView,
      data,
      deleteView,
      iMspec,
      missingFields,
      spec,
      switchView,
      template,
      templateComplete,
      views,
    } = this.props;
    return (
      <ChartArea
        cloneView={cloneView}
        createNewView={createNewView}
        currentTheme={currentTheme}
        currentView={currentView}
        data={data}
        deleteView={deleteView}
        iMspec={iMspec}
        missingFields={missingFields}
        spec={spec}
        switchView={switchView}
        template={template}
        templateComplete={templateComplete}
        views={views}
      />
    );
  }

  leftColumn(): JSX.Element {
    const {
      addToNextOpenSlot,
      coerceType,
      columns,
      createFilter,
      currentlySelectedFile,
      deleteFilter,
      iMspec,
      metaColumns,
      setRepeats,
      showGUIView,
      spec,
      template,
      toggleDataModal,
      updateFilter,
    } = this.props;
    return (
      <div className="flex-down full-height column background-2">
        <ImportDataColumn currentlySelectedFile={currentlySelectedFile} toggleDataModal={toggleDataModal} />
        <DataColumn
          addToNextOpenSlot={addToNextOpenSlot}
          coerceType={coerceType}
          columns={columns}
          createFilter={createFilter}
          deleteFilter={deleteFilter}
          iMspec={iMspec}
          metaColumns={metaColumns}
          onDropFilter={(item: any): any => createFilter({field: item.text})}
          setRepeats={setRepeats}
          showGUIView={showGUIView}
          spec={spec}
          template={template}
          updateFilter={updateFilter}
        />
      </div>
    );
  }

  centerColumn(): JSX.Element {
    const {
      addWidget,
      chainActions,
      changeMarkType,
      clearEncoding,
      columns,
      createFilter,
      deleteTemplate,
      editMode,
      encodingMode,
      iMspec,
      metaColumns,
      modifyValueOnTemplate,
      moveWidget,
      removeWidget,
      saveCurrentTemplate,
      setBlankTemplate,
      setEditMode,
      setEncodingMode,
      setEncodingParameter,
      setNewSpec,
      setTemplateValue,
      setSimpleDisplay,
      setWidgetValue,
      showGUIView,
      showSimpleDisplay,
      spec,
      swapXAndYChannels,
      template,
      templateMap,
      templateSaveState,
      templates,
    } = this.props;

    return (
      <div className=" full-height full-width flex-down">
        {SHOW_TEMPLATE_CONTROLS && (
          <EncodingControls
            chainActions={chainActions}
            clearEncoding={clearEncoding}
            deleteTemplate={deleteTemplate}
            editMode={editMode}
            encodingMode={encodingMode}
            modifyValueOnTemplate={modifyValueOnTemplate}
            saveCurrentTemplate={saveCurrentTemplate}
            setBlankTemplate={setBlankTemplate}
            setEditMode={setEditMode}
            setEncodingMode={setEncodingMode}
            showSimpleDisplay={showSimpleDisplay}
            template={template}
            templateSaveState={templateSaveState}
            templates={templates}
          />
        )}
        <div className="input-mode-selector">
          {['CHOOSER', 'SHELVES'].map(mode => {
            return (
              <div
                key={mode}
                onClick={(): any => setSimpleDisplay(mode === 'CHOOSER')}
                className={classnames({
                  'mode-option': true,
                  'selected-mode':
                    (mode === 'SHELVES' && !showSimpleDisplay) || (mode === 'CHOOSER' && showSimpleDisplay),
                })}
              >
                {mode}
              </div>
            );
          })}
        </div>{' '}
        {encodingMode === 'grammer' && showGUIView && (
          <EncodingColumn
            changeMarkType={changeMarkType}
            columns={columns}
            iMspec={iMspec}
            metaColumns={metaColumns}
            onDrop={(item: any): void => {
              if (item.disable) {
                return;
              }
              setEncodingParameter(item);
            }}
            onDropFilter={(item: any): any => createFilter({field: item.text})}
            setEncodingParameter={setEncodingParameter}
            setNewSpec={setNewSpec}
            showSimpleDisplay={showSimpleDisplay}
            spec={spec}
            swapXAndYChannels={swapXAndYChannels}
          />
        )}
        {encodingMode !== 'grammer' && template && showGUIView && (
          <TemplateColumn
            addWidget={addWidget}
            columns={columns}
            editMode={editMode}
            moveWidget={moveWidget}
            removeWidget={removeWidget}
            setTemplateValue={setTemplateValue}
            setWidgetValue={setWidgetValue}
            showSimpleDisplay={showSimpleDisplay}
            template={template}
            templateMap={templateMap}
          />
        )}
      </div>
    );
  }

  codeEditor(): JSX.Element {
    const {
      addWidget,
      codeMode,
      editorError,
      readInTemplate,
      setCodeMode,
      setNewSpecCode,
      setProgrammaticView,
      showProgrammaticMode,
      spec,
      specCode,
      template,
      templateMap,
    } = this.props;
    return (
      <div
        className={classnames({
          'full-width': true,
          'flex-down': true,
          'full-height': showProgrammaticMode,
        })}
      >
        <CodeEditor
          addWidget={addWidget}
          codeMode={codeMode}
          editorError={editorError}
          readInTemplate={readInTemplate}
          setCodeMode={setCodeMode}
          setNewSpecCode={setNewSpecCode}
          setProgrammaticView={setProgrammaticView}
          showProgrammaticMode={showProgrammaticMode}
          spec={spec}
          specCode={specCode}
          template={template}
          templateMap={templateMap}
        />
      </div>
    );
  }

  render(): JSX.Element {
    const {
      canRedo,
      canUndo,
      chainActions,
      changeSelectedFile,
      dataModalOpen,
      encodingMode,
      loadCustomDataset,
      toggleDataModal,
      triggerRedo,
      triggerUndo,
      showProgrammaticMode,
      setEncodingMode,
      templates,
    } = this.props;

    return (
      <div className="flex-down full-width full-height">
        {dataModalOpen && (
          <DataModal
            chainActions={chainActions}
            changeSelectedFile={changeSelectedFile}
            loadCustomDataset={loadCustomDataset}
            toggleDataModal={toggleDataModal}
          />
        )}
        <Header canRedo={canRedo} canUndo={canUndo} triggerRedo={triggerRedo} triggerUndo={triggerUndo} />
        <div className="flex full-height relative">
          <DndProvider backend={HTML5Backend}>
            <Wrapper showProgrammaticMode={showProgrammaticMode} showGUIView={true}>
              <div className="flex-down full-height">
                <TemplatePreviewColumn
                  encodingMode={encodingMode}
                  setEncodingMode={setEncodingMode}
                  templates={templates}
                />
                <div className="flex" style={{height: 'calc(100% - 77px)'}}>
                  {this.leftColumn()}
                  {this.centerColumn()}
                </div>
              </div>
              {this.codeEditor()}
            </Wrapper>
            {this.chartArea()}
          </DndProvider>
        </div>
      </div>
    );
  }
}

export function mapStateToProps({base}: {base: AppState}): any {
  const template = base.get('currentTemplateInstance');
  const templateMap = base.get('templateMap').toJS();
  const missingFields = (template && getMissingFields(template.toJS(), templateMap)) || [];

  return {
    GOOSE_MODE: base.get('GOOSE_MODE'),
    canRedo: base.get('redoStack').size >= 1,
    canUndo: base.get('undoStack').size >= 1,
    codeMode: base.get('codeMode'),
    columns: base.get('columns'),
    currentTheme: base.get('currentTheme'),
    currentView: base.get('currentView'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    data: base.get('data'),
    dataModalOpen: base.get('dataModalOpen'),
    editMode: base.get('editMode'),
    editorError: base.get('editorError'),
    encodingMode: base.get('encodingMode'),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    missingFields,
    showProgrammaticMode: base.get('showProgrammaticMode'),
    showSimpleDisplay: base.get('showSimpleDisplay'),
    showGUIView: base.get('showGUIView'),
    spec: applyConditionals(base.get('spec').toJS(), templateMap),
    specCode: base.get('specCode'),
    template: template && template.toJS(),
    templateComplete: !missingFields.length,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.get('templates'),
    views: base.get('views'),
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
