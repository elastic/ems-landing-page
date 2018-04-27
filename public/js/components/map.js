import mapboxgl from 'mapbox-gl';

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

  componentDidMount(){
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
        "line-color": "rgb(255,10,10)",
        "line-width": 1
      }
    });

  }

  render() {
    return (<div className="mapContainer" ref="mapContainer"></div>);
  }


}