/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import maplibre from 'maplibre-gl';
// eslint-disable-next-line import/no-unresolved
import mbRtlPlugin from '!!file-loader!@mapbox/mapbox-gl-rtl-text/mapbox-gl-rtl-text.min.js';
import turfBbox from '@turf/bbox';
import turfCenter from '@turf/center';
import React, { Component } from 'react';
import chroma from 'chroma-js';

maplibre.setRTLTextPlugin(mbRtlPlugin);

export class Map extends Component {

  static isSupported() {
    return maplibre.supported();
  }

  constructor(props) {
    super(props);

    this._overlaySourceId = 'overlay-source';
    this._overlayFillLayerId = 'overlay-fill-layer';
    this._overlayLineLayerId = 'overlay-line-layer';
    this._overlayFillHighlightId = 'overlay-fill-highlight-layer';
    this._tmsSourceId = 'vector-tms-source';
    this._tmsLayerId = 'vector-tms-layer';
  }

  componentDidMount() {
    this._maplibreMap = new maplibre.Map({
      container: this.refs.mapContainer,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      transformRequest: (url) => {
        return { url: new URL(url, window.location.origin).href };
      },
    });
    this._maplibreMap.dragRotate.disable();
    this._maplibreMap.touchZoomRotate.disableRotation();

    this._maplibreMap.on('click', this._overlayFillLayerId, (e) => {
      this._highlightFeature(e.features[0], e.lngLat);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this._maplibreMap.on('mouseenter', this._overlayFillLayerId, () => {
      this._maplibreMap.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this._maplibreMap.on('mouseleave', this._overlayFillLayerId, () => {
      this._maplibreMap.getCanvas().style.cursor = '';
    });
  }

  _getOverlayLayerIds() {
    return [this._overlayFillLayerId, this._overlayLineLayerId, this._overlayFillHighlightId];
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

    this._currentPopup = new maplibre.Popup();
    this._currentPopup.setLngLat(lngLat);
    this._currentPopup.setHTML(html);
    this._currentPopup.addTo(this._maplibreMap);

    this._maplibreMap.setFilter(this._overlayFillHighlightId, ['==', '__id__', feature.properties.__id__]);
  }

  highlightFeature(feature) {
    const center = turfCenter(feature);
    this._highlightFeature(feature, new maplibre.LngLat(center.geometry.coordinates[0], center.geometry.coordinates[1]));

    const bbox = turfBbox(feature);
    this._maplibreMap.fitBounds(bbox);
  }


  filterFeatures(features) {

    const idFilterPrefix = ['in', '__id__'];
    const filterArgs = features.map((f) => f.properties.__id__);
    const filter = idFilterPrefix.concat(filterArgs);

    this._maplibreMap.setFilter(this._overlayFillLayerId, filter);
    this._maplibreMap.setFilter(this._overlayLineLayerId, filter);

  }

  _removeTmsLayer() {
    if (this._maplibreMap.getLayer(this._tmsLayerId)) {
      this._maplibreMap.removeLayer(this._tmsLayerId);
    }
    if (this._maplibreMap.getSource(this._tmsSourceId)) {
      this._maplibreMap.removeSource(this._tmsSourceId);
    }
  }

  _removeOverlayLayer() {
    if (this._maplibreMap.getLayer(this._overlayFillLayerId)) {
      this._maplibreMap.removeLayer(this._overlayFillLayerId);
    }
    if (this._maplibreMap.getLayer(this._overlayLineLayerId)) {
      this._maplibreMap.removeLayer(this._overlayLineLayerId);
    }
    if (this._maplibreMap.getLayer(this._overlayFillHighlightId)) {
      this._maplibreMap.removeLayer(this._overlayFillHighlightId);
    }
    if (this._maplibreMap.getSource(this._overlaySourceId)) {
      this._maplibreMap.removeSource(this._overlaySourceId);
    }
    this._removePopup();
  }

  _removePopup() {
    if (this._currentPopup) {
      this._currentPopup.remove();
      this._currentPopup = null;
    }
  }

  _persistOverlayLayers(source) {
    const overlayLayerIds = this._getOverlayLayerIds();
    const curStyle = this._maplibreMap.getStyle();
    const overlayLayers = curStyle.layers.filter(layer => overlayLayerIds.includes(layer.id));
    const overlaySource = { ...curStyle.sources };

    const nonLabelLayers = source.layers.filter(l => l.type !== 'symbol');
    const labelLayers = source.layers.filter(l => l.type === 'symbol');

    const layers = [ ...nonLabelLayers, ...overlayLayers, ...labelLayers];
    const sources = { ...source.sources, ...overlaySource };
    return {
      ...source,
      ...{ layers, sources }
    };
  }

  waitForStyleLoaded(callback) {
    const waiting = () => {
      if (!this._maplibreMap.isStyleLoaded()) {
        setTimeout(waiting, 50);
      } else {
        callback();
      }
    };
    waiting();
  }

  setTmsLayer(source, callback) {
    // The setStyle method removes all layers and sources from the map including the overlays.
    // We must persist the overlay layers and overlay source by creating a new style from
    // the incoming source and the overlay layers.
    const newStyle = this._persistOverlayLayers(source);

    this._maplibreMap.setStyle(newStyle, { diff: false });

    if (callback) {
      this.waitForStyleLoaded(callback);
    }
  }

  setOverlayLayer(featureCollection, skipZoom, fillColor) {
    if (fillColor && !chroma.valid(fillColor)) {
      throw new Error(`${fillColor} is not a valid color representation`);
    }

    this._removeOverlayLayer();

    const fill = fillColor ? chroma(fillColor) :  chroma('rgb(220,220,220)');
    // highlight with the complementary color
    const highlight = fillColor ? fill.set('hsl.h', '+180') : chroma('#627BC1');

    const border = fill.darken(2);

    this._maplibreMap.addSource(this._overlaySourceId, {
      type: 'geojson',
      data: featureCollection,
    });

    //Get the first symbol layer id
    const firstSymbol = this._maplibreMap.getStyle().layers.find(l => l.type ===  'symbol');

    this._maplibreMap.addLayer({
      id: this._overlayFillLayerId,
      source: this._overlaySourceId,
      type: 'fill',
      paint: {
        'fill-color': fill.css(),
        'fill-opacity': 0.6,
      },
    }, firstSymbol?.id);

    this._maplibreMap.addLayer({
      id: this._overlayLineLayerId,
      source: this._overlaySourceId,
      type: 'line',
      paint: {
        'line-color': border.css(),
        'line-width': 1,
      },
    }, firstSymbol?.id);

    this._maplibreMap.addLayer({
      id: this._overlayFillHighlightId,
      source: this._overlaySourceId,
      type: 'fill',
      layout: {},
      paint: {
        'fill-color': highlight.css(),
        'fill-opacity': 1,
      },
      filter: ['==', 'name', ''],
    }, firstSymbol?.id);

    if (!skipZoom) {
      const bbox = turfBbox(featureCollection);

      //bug in mapbox-gl dealing with wrapping bounds
      //without normalization, maplibre will throw on the world layer
      //seems to be fixed when cropping the bounds slightly.
      if (bbox[2] - bbox[0] > 360) {
        bbox[0] = -175;
        bbox[1] = -85;
        bbox[2] = 175;
        bbox[3] = 85;
      }
      this._maplibreMap.fitBounds(bbox);
    }
  }

  render() {
    return (<div className="mapContainer" ref="mapContainer" />);
  }
}
