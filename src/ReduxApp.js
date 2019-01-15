import React from 'react';

import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';

import ReactMapboxGl from 'react-mapbox-gl';

import dotProp from 'dot-prop-immutable';

const defaultLayers = [
  {
    id: 'community-centers',
    name: 'Community Centers',
    visible: false,
  },
  {
    id: 'education',
    name: 'Education',
    visible: false,
  },
  {
    id: 'employment',
    name: 'Employment',
    visible: false,
  },
  {
    id: 'financial-assistance',
    name: 'Financial Assistance',
    visible: false,
  },
  {
    id: 'food-assistance',
    name: 'Food Assistance',
    visible: false,
  },
  {
    id: 'health',
    name: 'Health',
    visible: false,
  },
  {
    id: 'housing',
    name: 'Housing',
    visible: false,
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    visible: false,
  },
  {
    id: 'origin-based-community-center',
    name: 'Origin-based community Center',
    visible: false,
  },
  {
    id: 'resettlement-agency',
    name: 'Resettlement Agency',
    visible: false,
  },
];

// action types
const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';
const UPDATE_LOCATION = 'UPDATE_LOCATION';

/*
 * reducers
 */
function layers(state = defaultLayers, action) {
  switch(action.type) {
    case TOGGLE_VISIBILITY:
      const layerIdx = state.findIndex(l => l.id === action.id);
      return dotProp.toggle(state, `${layerIdx}.visible`);
    default:
      return state;
  }
}

function currentLocation(state = '', action) {
  switch(action.type) {
    case UPDATE_LOCATION:
      return action.location;
    default:
      return state;
  }
}
const reducers = combineReducers({ layers, currentLocation });

/*
 * action creators
 */
function toggleLayerVisibility(layerId) {
  return { id: layerId, type: TOGGLE_VISIBILITY };
}
function updateLocation(location) {
  return { location, type: UPDATE_LOCATION };
}

// the store is the keeper of application state
const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoicmVmdWdlZXN3ZWxjb21lIiwiYSI6ImNqZ2ZkbDFiODQzZmgyd3JuNTVrd3JxbnAifQ.UY8Y52GQKwtVBXH2ssbvgw"
});

function OverlayBox({ layers, toggleLayerVisibility }) {
  return (
    <div style={{ position: 'absolute', zIndex: 1, backgroundColor: 'white' }}>
      <ConnectedLocationBox />
      <LayerMenu layers={layers} toggleLayerVisibility={toggleLayerVisibility} />
    </div>
  );
}

function LayerMenu({ layers, toggleLayerVisibility }) {
  return (
      layers.map(layer => (
        <div key={layer.id}>
          <button onClick={() => toggleLayerVisibility(layer.id)}>{layer.name}</button>
        </div>
      ))
  );
}

class LocationBox extends React.Component {
  onLocationChange = (event) => {
    this.setState({ location: event.target.value });
  }
  render() {
    const { currentLocation, updateLocation } = this.props;
    return (
      <>
        (current location is {currentLocation || 'unknown'})
        <input type="text" name="location" placeholder="Near" onChange={this.onLocationChange} />
        <button onClick={() => updateLocation(this.state.location)}>do it</button>
      </>
    );
  }
}

// connected component - connects LocationBox to props from store, automatically re-renders whenever state changes
const ConnectedLocationBox = connect(({ currentLocation }) => ({ currentLocation }), { updateLocation })(LocationBox);

class MapWithOverlay extends React.Component {
  onStyleLoad = (map) => {
    this.map = map;
    this.props.layers.forEach(this.reflectLayerVisibility);
  }

  reflectLayerVisibility = (layer) => {
    const visibility = layer.visible ? 'visible' : 'none';
    this.map.setLayoutProperty(layer.id, 'visibility', visibility);
  }

  componentDidUpdate() {
    this.props.layers.forEach(this.reflectLayerVisibility);
  }

  render() {
    const { layers, toggleLayerVisibility } = this.props;
    return (
      <>
        <OverlayBox layers={layers} toggleLayerVisibility={toggleLayerVisibility} />
        <Map
          style="mapbox://styles/refugeeswelcome/cjh9k11zz15ds2spbs4ld6y9o"
          center={[-71.066954, 42.359947]}
          onStyleLoad={this.onStyleLoad}
          containerStyle={{
            height: "100vh",
            width: "100vw"
          }}>
        </Map>
      </>
    );
  }
}

// connected component - connects MapWithOverlay to props from store, automatically re-renders whenever state changes
const ConnectedMapWithOverlay = connect(({ layers }) => ({ layers }), { toggleLayerVisibility })(MapWithOverlay);

export default function App() {
  // Provider wraps all components and provides a context for the store
  return (
    <Provider store={store}>
      <ConnectedMapWithOverlay />
    </Provider>
  );
}
