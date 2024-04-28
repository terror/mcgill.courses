import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMarkerRef,
} from '@vis.gl/react-google-maps';
import { Fragment } from 'react';

import * as buildingCodes from '../assets/buildingCodes.json';
import * as buildingCoordinates from '../assets/buildingCoordinates.json';
import { getGoogleAPIKey } from '../lib/utils';
import type { Course } from '../model/Course';

type LocationProps = {
  course: Course;
  selectedTerm: string;
};

type MarkerProps = {
  position: google.maps.LatLngLiteral;
  buildingName: string;
};

const BuildingMarker = ({ position, buildingName }: MarkerProps) => {
  const [markerRef, marker] = useMarkerRef();
  return (
    <Fragment>
      <Marker ref={markerRef} position={position} />
      <InfoWindow anchor={marker}>
        <h2>{buildingName}</h2>
      </InfoWindow>
    </Fragment>
  );
};

export const BuildingLocation = ({ course, selectedTerm }: LocationProps) => {
  const codes = new Set<string>();
  for (const schedule of course.schedule ?? []) {
    if (schedule.term != selectedTerm) continue;
    for (const block of schedule.blocks) {
      if (block.location.trim().length == 0) continue;
      block.location
        .split('; ')
        .map((x) => x.split(' ')[0])
        .forEach((x) => codes.add(x));
    }
  }

  const buildings = Array.from(codes).map((building) => ({
    coord: buildingCoordinates[
      building as keyof typeof buildingCoordinates
    ] as google.maps.LatLngLiteral,
    name: buildingCodes[building as keyof typeof buildingCodes],
  }));

  const center = { lat: 0, lng: 0 };
  buildings.forEach((building) => {
    center.lat += building.coord.lat / buildings.length;
    center.lng += building.coord.lng / buildings.length;
  });

  return (
    <div
      className={
        'relative w-full rounded-md bg-slate-50 shadow-sm dark:bg-neutral-800'
      }
    >
      <div className='p-6'>
        <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
          Building Location for {selectedTerm}
        </h2>

        <div style={{ height: 350 }}>
          <APIProvider apiKey={getGoogleAPIKey()}>
            <Map center={center} defaultZoom={16}>
              {buildings.map((building) => (
                <BuildingMarker
                  key={building.name}
                  position={building.coord}
                  buildingName={building.name}
                />
              ))}
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );
};
