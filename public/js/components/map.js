import mapboxgl from 'mapbox-gl';

import React, {
Component,
} from 'react';


export class Map extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    const mapboxMap = new mapboxgl.Map({
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

  render() {
    return (<div className="mapContainer" ref="mapContainer"></div>);
  }


}