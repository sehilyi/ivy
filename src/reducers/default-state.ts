import Immutable from 'immutable';
import {OLD_EXAMPLE} from '../constants/vega-examples';
// import {ColumnHeader} from '../types';
// import {Spec, Data} from 'vega-typings/types';
export type AppState = Immutable.Map<any, any>;

// {
//   spec: Spec;
//   specCode: string;
//   data: Data;
//   columns: ColumnHeader[];
//   currentlySelectedFile: string;
//   selectedGUIMode: string;
//   // selectedGUIMode: 'PROGRAMMATIC';
//   dataModalOpen: boolean;
//   currentTheme: string;
//   undoStack: any;
//   redoStack: any;
// }
export interface ActionResponse {
  (state: AppState, payload: any): AppState;
}
// export type AppState = any;
// TODO undo this embarrasment
const defaultEmpty = Immutable.fromJS({
  transform: [],
  mark: {type: 'point', tooltip: true},
  encoding: {},
});
export const EMPTY_SPEC = defaultEmpty;
export const DEFAULT_STATE: AppState = Immutable.fromJS({
  spec: EMPTY_SPEC,
  specCode: JSON.stringify(EMPTY_SPEC, null, 2),
  editorError: null,
  columns: [],
  metaColumns: [],
  // currentlySelectedFile: 'barley.json',
  currentlySelectedFile: null,
  unprouncableInGrammer: false,
  selectedGUIMode: 'GRAMMAR',
  // selectedGUIMode: 'PROGRAMMATIC',
  dataModalOpen: true,
  currentTheme: 'default',
  undoStack: Immutable.fromJS([]),
  redoStack: Immutable.fromJS([]),
})
  // need data to have a consistant type, i.e POJO, not immutable
  .set('data', []);
