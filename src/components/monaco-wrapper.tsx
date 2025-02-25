import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {IgnoreKeys} from 'react-hotkeys';
import {debounce} from 'vega';

import {EDITOR_OPTIONS, JSON_OUTPUT, TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';

interface Props {
  codeMode: string;
  currentCode: string;
  editMode: boolean;
  editorFontSize: number;
  editorLineWrap: boolean;
  handleCodeUpdate: (x: string) => void;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
}

interface State {
  offsetStore: {[x: string]: number};
}

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.state = {offsetStore: {}};
  }
  editorDidMount(editor: any): void {
    editor.focus();
    /* eslint-disable */
    // @ts-ignore
    import('monaco-themes/themes/Chrome DevTools.json').then(data => {
      // @ts-ignore
      monaco.editor.defineTheme('cobalt', data);
      // @ts-ignore
      monaco.editor.setTheme('cobalt');
    });
    /* eslint-enable */
  }

  getSnapshotBeforeUpdate(prevProps: Props): void {
    const oldMode = prevProps.codeMode;
    const newMode = this.props.codeMode;

    // on change code mode scroll to top
    /* eslint-disable */
    // @ts-ignore
    return oldMode !== newMode ? this.refs.monaco.editor.getScrollTop() : null;
    /* eslint-enable */
  }

  componentDidUpdate(prevProps: Props, prevState: State, currentTop: number): void {
    const oldMode = prevProps.codeMode;
    const newMode = this.props.codeMode;
    if (oldMode !== newMode) {
      const {offsetStore} = this.state;
      /* eslint-disable */
      this.setState({offsetStore: {...offsetStore, [oldMode]: currentTop}});
      // @ts-ignore
      this.refs.monaco.editor.setScrollPosition({scrollTop: offsetStore[newMode]});
      /* eslint-enable */
    }
  }

  render(): JSX.Element {
    const {
      codeMode,
      currentCode,
      editMode,
      editorFontSize,
      editorLineWrap,
      handleCodeUpdate,
      setCodeMode,
      setEditMode,
    } = this.props;
    return (
      /*eslint-disable react/no-string-refs*/
      <IgnoreKeys style={{height: '100%'}}>
        <MonacoEditor
          ref="monaco"
          key={codeMode}
          language="json"
          theme="monokai"
          height="100%"
          value={currentCode}
          options={{
            ...EDITOR_OPTIONS,
            fontSize: editorFontSize,
            wordWrap: editorLineWrap ? 'on' : 'off',
            colorDecorators: true,
            dragAndDrop: true,
          }}
          onChange={debounce(700, (code: string): void => {
            if (!editMode) {
              setEditMode(true);
            }
            if (codeMode === JSON_OUTPUT) {
              setCodeMode(TEMPLATE_BODY);
              return;
            }

            handleCodeUpdate(code);
          })}
          editorDidMount={this.editorDidMount}
        />
      </IgnoreKeys>
      /*eslint-en able react/no-string-refs*/
    );
  }
}
