import mapboxgl from 'mapbox-gl';
import turf from 'turf';

import React, {
Component,
} from 'react';


export class Map extends Component {

  constructor(props) {
    super(props);

    this._overlaySourceId = "overlay-source";
    this._overlayFillLayerId = "overlay-fill-layer";
    this._overlayLineLayerId = "overlay-line-layer";
  }

  componentDidMount() {
    this._mapboxMap = new mapboxgl.Map({
      container: this.refs.mapContainer,
      style: {
        "version": 8,
        "sources": {
          "raster-tiles": {
            "type": "raster",
            "tiles": ["https://tiles-stage.elastic.co/v2/default/{z}/{x}/{y}.png?elastic_tile_service_tos=agree"],
            "tileSize": 256,
            "scheme": "xyz"
          }
        },
        "layers": [{
          "id": "simple-tiles",
          "type": "raster",
          "source": "raster-tiles",
          "minzoom": 0,
          "maxzoom": 22
        }]
      }
    });
    this._mapboxMap.dragRotate.disable();
    this._mapboxMap.touchZoomRotate.disableRotation();

    this._mapboxMap.on('click', this._overlayFillLayerId, (e) => {
      this._highlightFeature(e.features[0], e.lngLat);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this._mapboxMap.on('mouseenter', this._overlayFillLayerId, () => {
      this._mapboxMap.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this._mapboxMap.on('mouseleave', this._overlayFillLayerId, () => {
      this._mapboxMap.getCanvas().style.cursor = '';
    });

  }

  _highlightFeature(feature, lngLat) {
    this._removePopup();
    const keys = Object.keys(feature.properties);
    let rows = '';
    keys.forEach((key) => {
      const fieldname = key;
      rows += `<dt>${fieldname}</dt><dd>${feature.properties[key]}</dd>`
    });
    const html = `<dl>${rows}</dl>`;

    this._currentPopup = new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(this._mapboxMap);
  }

  highlightFeature(feature) {
    const center = turf.center(feature);
    this._highlightFeature(feature, new mapboxgl.LngLat(center.geometry.coordinates[0], center.geometry.coordinates[1]));
  }

  _removeOverlayLayer() {
    if (this._mapboxMap.getLayer(this._overlayFillLayerId)) {
      this._mapboxMap.removeLayer(this._overlayFillLayerId);
    }
    if (this._mapboxMap.getLayer(this._overlayLineLayerId)) {
      this._mapboxMap.removeLayer(this._overlayLineLayerId);
    }
    if (this._mapboxMap.getSource(this._overlaySourceId)) {
      this._mapboxMap.removeSource(this._overlaySourceId);
    }

    this._removePopup();

  }

  _removePopup(){
    if (this._currentPopup) {
      this._currentPopup.remove();
      this._currentPopup = null;
    }
  }

  setOverlayLayer(featureCollection) {

    this._removeOverlayLayer();

    this._mapboxMap.addSource(this._overlaySourceId, {
      type: "geojson",
      data: featureCollection
    });

    this._mapboxMap.addLayer({
      id: this._overlayFillLayerId,
      source: this._overlaySourceId,
      "type": "fill",
      "paint": {
        "fill-color": "rgb(220,220,220)",
        "fill-opacity": 0.6,
      }
    });

    this._mapboxMap.addLayer({
      id: this._overlayLineLayerId,
      source: this._overlaySourceId,
      "type": "line",
      "paint": {
        "line-color": "rgb(0,0,0)",
        "line-width": 1
      }
    });


    const bbox = getBoundingBox(featureCollection);
    this._mapboxMap.fitBounds(bbox);

  }

  render() {
    return (<div className="mapContainer" ref="mapContainer"></div>);
  }

}


//MapboxGL doesn't have bounding-box functionality
function getBoundingBox(featureCollection) {
  const mapboxBB = new mapboxgl.LngLatBounds();
  for (let i = 0; i < featureCollection.features.length; i++) {
    extendBoundingBoxWidthCoordinates(mapboxBB, featureCollection.features[i].geometry);
  }
  return mapboxBB;
}


function extendBoundingBoxWidthCoordinates(bbox, geometryOrCoordinates) {

  if (geometryOrCoordinates.type === 'GeometryCollection') {
    for (let i = 0; i < geometryOrCoordinates.geometries.length; i++) {
      extendBoundingBoxWidthCoordinates(bbox, geometryOrCoordinates.geometries[i]);
    }
    return;
  }

  const coordinates = typeof geometryOrCoordinates.coordinates === 'object' ? geometryOrCoordinates.coordinates : geometryOrCoordinates;
  if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    //relies on the fact that all geojson coordinates are just nested arrays of numbers
    bbox.extend(coordinates);
  } else {
    for (let i = 0; i < coordinates.length; i++) {
      extendBoundingBoxWidthCoordinates(bbox, coordinates[i]);
    }
  }

}