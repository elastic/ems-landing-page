import mapboxgl from 'mapbox-gl';

import React, {
Component,
} from 'react';


export class Map extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhvbWFzbmVpcnluY2siLCJhIjoiY2o4bzMxOHpiMWVxYjJxbXo3eWdiNHRqbSJ9.6ojCKqS6rGX4N2dBK7ojsA';
    const mapboxMap = new mapboxgl.Map({
      // container: '<your HTML element id>',
      container: this.refs.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9'
    });
  }

  render() {
    return (<div className="mapContainer" ref="mapContainer"></div>);
  }


}