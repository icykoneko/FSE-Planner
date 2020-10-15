import React from 'react';
import { Map, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import PolylineDecorator from "./PolylineDecorator.js";
import { getDistance, getRhumbLineBearing, getCompassDirection, convertDistance } from "geolib";

import Link from '@material-ui/core/Link';

import icaodata from "./data/icaodata.json";
import { CivilIcon, MilitaryIcon, WaterIcon } from "./Icons.js";


function cleanLegs(jobs, opts) {
  let ids = Object.keys(jobs);
  let markers = new Set();
  let legs = {};
  let tmpLegs = {};
  let max = 0;
  // Add markers where a plane can be rented
  Object.keys(opts.planes).forEach(elm => markers.add(elm));
  // Add markers in filtering options
  if (opts.fromIcao) { markers.add(opts.fromIcao); }
  if (opts.toIcao) { markers.add(opts.toIcao); }
  // Get legs
  for (var i = ids.length - 1; i >= 0; i--) {
    const job = jobs[ids[i]];
    const fr = { latitude: icaodata[job.Location].lat, longitude: icaodata[job.Location].lon };
    const to = { latitude: icaodata[job.ToIcao].lat, longitude: icaodata[job.ToIcao].lon };
    // Filter out non paying jobs
    if (!job.Pay) { continue; }
    // Filter out jobs of wrong type
    if (opts.type !== job.Type) { continue; }
    // Filter out jobs with wrong cargo
    if (opts.cargo !== job.UnitType) { continue; }
    // Filter out jobs too big for plane
    if (opts.max && job.Amount > opts.max) { continue; }
    // Filter out jobs with wrong direction
    if (opts.fromIcao) {
      const fromIcao = { latitude: icaodata[opts.fromIcao].lat, longitude: icaodata[opts.fromIcao].lon };
      if (opts.settings.from.distCoef !== '') {
        if (getDistance(fromIcao, to)/getDistance(fromIcao, fr) < parseFloat(opts.settings.from.distCoef)) { continue; }
      }
      if (opts.settings.from.maxDist !== '') {
        if (convertDistance(getDistance(fromIcao, fr), 'sm') > parseFloat(opts.settings.from.maxDist)) { continue; }
      }
      if (opts.settings.from.angle !== '') {
        if (180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(fromIcao, fr)) - 180) > parseInt(opts.settings.from.angle)) { continue; }
      }
    }
    if (opts.toIcao) {
      const toIcao = { latitude: icaodata[opts.toIcao].lat, longitude: icaodata[opts.toIcao].lon };
      if (opts.settings.to.distCoef !== '') {
        if (getDistance(toIcao, fr)/getDistance(toIcao, to) < parseFloat(opts.settings.to.distCoef)) { continue; }
      }
      if (opts.settings.to.maxDist !== '') {
        if (convertDistance(getDistance(toIcao, to), 'sm') > parseFloat(opts.settings.to.maxDist)) { continue; }
      }
      if (opts.settings.to.angle !== '') {
        if (180 - Math.abs(Math.abs(getRhumbLineBearing(fr, to) - getRhumbLineBearing(to, toIcao)) - 180) > parseInt(opts.settings.to.angle)) { continue; }
      }
    }
    if (opts.direction) {
      const direction = getRhumbLineBearing(fr, to);
      if (180 - Math.abs(Math.abs(direction - opts.direction) - 180) > parseInt(opts.settings.direction.angle)) { continue; }
    }
    if (opts.minDist || opts.maxDist) {
      const distance = convertDistance(getDistance(fr, to), 'sm');
      if (opts.minDist && distance < opts.minDist) { continue; }
      if (opts.maxDist && distance > opts.maxDist) { continue; }
    }
    // Create source FBO
    let key = job.Location+"-"+job.ToIcao;
    if (!legs.hasOwnProperty(key)) {
      if (!tmpLegs.hasOwnProperty(key)) {
        tmpLegs[key] = {
          amount: 0,
          pay: 0,
          list: [],
          direction: getRhumbLineBearing(fr, to),
          distance: Math.round(convertDistance(getDistance(fr, to), 'sm'))
        };
      }
      tmpLegs[key].amount += job.Amount;
      tmpLegs[key].pay += job.Pay;
      tmpLegs[key].list.push(job);
      if (!opts.min || tmpLegs[key].amount >= opts.min) {
        legs[key] = tmpLegs[key];
        delete tmpLegs[key];
        max = Math.max(max, legs[key].amount);
        markers.add(job.Location);
        markers.add(job.ToIcao);
      }
    }
    else {
      legs[key].amount += job.Amount;
      legs[key].pay += job.Pay;
      legs[key].list.push(job);
      max = Math.max(max, legs[key].amount);
    }
  }
  return [[...markers], legs, max];
}

function bonus(icao, plane) {
  if (icao === plane.Home) { return ''; }
  return ' '+getCompassDirection(
    { latitude: icaodata[icao].lat, longitude: icaodata[icao].lon },
    { latitude: icaodata[plane.Home].lat, longitude: icaodata[plane.Home].lon }
  );
}


const FSEMap = React.memo(function FSEMap(props) {

  const s = props.options.settings;
  let [markers, legs, max] = cleanLegs(props.options.jobs, props.options);
  let rentablePlaces = Object.keys(props.options.planes);

  const icons = {
    civil1: CivilIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    military1: MilitaryIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    water1: WaterIcon(s.display.markers.colors.base, s.display.markers.sizes.base),
    civil2: CivilIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    military2: MilitaryIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    water2: WaterIcon(s.display.markers.colors.rentable, s.display.markers.sizes.rentable),
    civil3: CivilIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    military3: MilitaryIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
    water3: WaterIcon(s.display.markers.colors.selected, s.display.markers.sizes.selected),
  }

  return (
    <Map center={[46.5344, 3.42167]} zoom={6}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(marker => {
        const rentable = rentablePlaces.includes(marker);
        let color = '1';
        if (rentable) { color = '2'; }
        if (marker === props.options.fromIcao || marker === props.options.toIcao) { color = '3'; }
        return (
          <Marker position={[icaodata[marker].lat, icaodata[marker].lon]} key={marker} icon={icons[icaodata[marker].type+color]}>
            <Popup>
              <p><b><Link href={"https://server.fseconomy.net/airport.jsp?icao="+marker} target="_blank">{marker}</Link></b></p>
              { rentable ?
                props.options.planes[marker].map(plane => <p key={plane.Registration}>{plane.Registration} : ${plane.RentalDry}/${plane.RentalWet} (${plane.Bonus}{bonus(marker, plane)})</p>)
              :
                null
              }
            </Popup>
          </Marker>
        );
      })}
      {Object.entries(legs).map(([key, leg]) => {
        let icaos = key.split('-');
        if (props.options.cargo === 'passengers') {
          const mw = parseFloat(s.display.legs.weights.passengers);
          const min = props.options.min || 1;
          let weight = parseFloat(s.display.legs.weights.base);
          if (mw) {
            weight = ((leg.amount-min) / (max-min)) * (mw - weight) + weight;
          }
          return (
            <PolylineDecorator
              color={s.display.legs.colors.passengers}
              highlight={s.display.legs.colors.highlight}
              key={key}
              weight={weight}
              positions={[[icaodata[icaos[0]].lat, icaodata[icaos[0]].lon], [icaodata[icaos[1]].lat, icaodata[icaos[1]].lon]]}
            >
              <Tooltip sticky={true}>{leg.distance}NM - {leg.amount} passagers (${leg.pay})</Tooltip>
            </PolylineDecorator>
          )
        }
        else {
          const mw = parseFloat(s.display.legs.weights.cargo);
          const min = props.options.min || 1;
          let weight = parseFloat(s.display.legs.weights.base);
          if (mw) {
            weight = ((leg.amount-min) / (max-min)) * (mw - weight) + weight;
          }
          return (
            <PolylineDecorator
              color={s.display.legs.colors.cargo}
              highlight={s.display.legs.colors.highlight}
              key={key}
              weight={weight}
              positions={[[icaodata[icaos[0]].lat, icaodata[icaos[0]].lon], [icaodata[icaos[1]].lat, icaodata[icaos[1]].lon]]}
            >
              <Tooltip sticky={true}>{leg.amount} kg (${leg.pay})</Tooltip>
            </PolylineDecorator>
          )
        }
      })}
    </Map>
  );
});

export default FSEMap;
