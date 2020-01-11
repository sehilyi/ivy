import Immutable from 'immutable';
import stringify from 'json-stringify-pretty-compact';
import {ActionResponse, EMPTY_SPEC, AppState} from './default-state';

const BLANK_CATALOG_ENTRY = Immutable.fromJS({
  spec: Immutable.fromJS(EMPTY_SPEC),
  encodingMode: 'grammer',
  templateMap: {},
});
function updateCatalogView(state: AppState, view: string): AppState {
  const catalogEntry = Immutable.fromJS({
    spec: state.get('spec').toJS(),
    encodingMode: state.get('encodingMode'),
    templateMap: state.get('templateMap'),
  });
  return state.setIn(['viewCatalog', view], catalogEntry);
}

export const switchView: ActionResponse = (state, payload) => {
  const newCatalog = state.getIn(['viewCatalog', payload]);
  return updateCatalogView(state, state.get('currentView'))
    .set('currentView', payload)
    .set('spec', newCatalog.get('spec'))
    .set('specCode', stringify(newCatalog.get('spec').toJS()))
    .set('encodingMode', newCatalog.get('encodingMode'))
    .set('templateMap', newCatalog.get('templateMap'));
};

export const createNewView: ActionResponse = state => {
  const newViewName = `view${state.get('views').size + 1}`;
  const newState = state
    .set('views', state.get('views').push(newViewName))
    .setIn(['viewCatalog', newViewName], BLANK_CATALOG_ENTRY);

  return switchView(newState, newViewName);
};
export const deleteView: ActionResponse = (state, payload) => {
  console.log('TODO', payload);
  return state;
};

export const cloneView: ActionResponse = state => {
  const newViewName = `view${state.get('views').size + 1}`;
  const updatedState = updateCatalogView(state, state.get('currentView'));
  const newState = updatedState
    .set('views', updatedState.get('views').push(newViewName))
    .setIn(['viewCatalog', newViewName], updatedState.getIn(['viewCatalog', state.get('currentView')]));

  return switchView(newState, newViewName);
};
