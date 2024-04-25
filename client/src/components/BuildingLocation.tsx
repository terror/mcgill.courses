import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMarkerRef,
} from '@vis.gl/react-google-maps';
import { Fragment, useState } from 'react';

import * as buildingCodes from '../assets/buildingCodes.json';
import * as buildingCoordinates from '../assets/buildingCoordinates.json';
import { getGoogleAPIKey } from '../lib/utils';
import type { Course } from '../model/Course';

type LocationProps = {
  course: Course;
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

export const BuildingLocation = ({ course }: LocationProps) => {
  const [position, setPosition] = useState({ lat: 45.5048, lng: -73.5772 });

  const codes = new Set<string>();
  for (const schedule of course.schedule) {
    // not sure what blocks are, defaulting to taking first element
    for (const block of schedule.blocks) {
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

  return (
    <div
      className={
        'relative w-full rounded-md bg-slate-50 shadow-sm dark:bg-neutral-800'
      }
    >
      <div className='p-6'>
        <h2
          onClick={() => {
            setPosition({ lat: 45.5048, lng: -73.5762 });
          }}
          className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'
        >
          Building Location
        </h2>

        <div style={{ height: 350 }}>
          <APIProvider apiKey={getGoogleAPIKey()}>
            <Map defaultCenter={position} defaultZoom={15}>
              {buildings.map((building) => (
                <BuildingMarker
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
