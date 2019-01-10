/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import mapboxgl from 'mapbox-gl';
import turfBbox from '@turf/bbox';
import turfCenter from '@turf/center';

import React, { Component } from 'react';

export class Map extends Component {

  static isSupported() {
    return mapboxgl.supported();
  }

  constructor(props) {
    super(props);

    this._overlaySourceId = 'overlay-source';
    this._overlayFillLayerId = 'overlay-fill-layer';
    this._overlayLineLayerId = 'overlay-line-layer';
    this._overlayFillHighlightId = 'overlay-fill-highlight-layer';
  }

  componentDidMount() {
    this._mapboxMap = new mapboxgl.Map({
      container: this.refs.mapContainer,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [this.props.baseLayer.getUrlTemplate()],
            tileSize: 256,
            scheme: 'xyz',
            attribution: this.props.baseLayer.getHTMLAttribution() || ''
          },
        },
        layers: [{
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22,
        }],
      },
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
      if (key === '__id__') {
        return;
      }
      rows += `<dt>${key}</dt><dd>${feature.properties[key]}</dd>`;
    });
    const html = `<div class="euiText euiText--extraSmall"><dl class="eui-definitionListReverse">${rows}</dl></div>`;

    this._currentPopup = new mapboxgl.Popup();
    this._currentPopup.setLngLat(lngLat);
    this._currentPopup.setHTML(html);
    this._currentPopup.addTo(this._mapboxMap);

    this._mapboxMap.setFilter(this._overlayFillHighlightId, ['==', '__id__', feature.properties.__id__]);
  }

  highlightFeature(feature) {
    const center = turfCenter(feature);
    this._highlightFeature(feature, new mapboxgl.LngLat(center.geometry.coordinates[0], center.geometry.coordinates[1]));

    const bbox = turfBbox(feature);
    this._mapboxMap.fitBounds(bbox);
  }


  filterFeatures(features) {

    const idFilterPrefix = ['in', '__id__'];
    const filterArgs = features.map((f) => f.properties.__id__);
    const filter = idFilterPrefix.concat(filterArgs);

    this._mapboxMap.setFilter(this._overlayFillLayerId, filter);
    this._mapboxMap.setFilter(this._overlayLineLayerId, filter);

  }

  _removeOverlayLayer() {
    if (this._mapboxMap.getLayer(this._overlayFillLayerId)) {
      this._mapboxMap.removeLayer(this._overlayFillLayerId);
    }
    if (this._mapboxMap.getLayer(this._overlayLineLayerId)) {
      this._mapboxMap.removeLayer(this._overlayLineLayerId);
    }
    if (this._mapboxMap.getLayer(this._overlayFillHighlightId)) {
      this._mapboxMap.removeLayer(this._overlayFillHighlightId);
    }
    if (this._mapboxMap.getSource(this._overlaySourceId)) {
      this._mapboxMap.removeSource(this._overlaySourceId);
    }
    this._removePopup();
  }

  _removePopup() {
    if (this._currentPopup) {
      this._currentPopup.remove();
      this._currentPopup = null;
    }
  }

  setOverlayLayer(featureCollection) {
    this._removeOverlayLayer();

    this._mapboxMap.addSource(this._overlaySourceId, {
      type: 'geojson',
      data: featureCollection,
    });

    this._mapboxMap.addLayer({
      id: this._overlayFillLayerId,
      source: this._overlaySourceId,
      type: 'fill',
      paint: {
        'fill-color': 'rgb(220,220,220)',
        'fill-opacity': 0.6,
      },
    });

    this._mapboxMap.addLayer({
      id: this._overlayLineLayerId,
      source: this._overlaySourceId,
      type: 'line',
      paint: {
        'line-color': 'rgb(0,0,0)',
        'line-width': 1,
      },
    });

    this._mapboxMap.addLayer({
      id: this._overlayFillHighlightId,
      source: this._overlaySourceId,
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': '#627BC1',
        'fill-opacity': 1,
      },
      filter: ['==', 'name', ''],
    });


    const bbox = turfBbox(featureCollection);

    //bug in mapbox-gl dealing with wrapping bounds
    //without normalization, mapboxgl will throw on the world layer
    //seems to be fixed when cropping the bounds slightly.
    if (bbox[2] - bbox[0] > 360) {
      bbox[0] = -175;
      bbox[1] = -85;
      bbox[2] = 175;
      bbox[3] = 85;
    }
    this._mapboxMap.fitBounds(bbox);
  }

  render() {
    return (<div className="mapContainer" ref="mapContainer" />);
  }
}