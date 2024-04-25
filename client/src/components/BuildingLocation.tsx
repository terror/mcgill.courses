import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMarkerRef,
} from '@vis.gl/react-google-maps';
import { useState } from 'react';

import { getGoogleAPIKey } from '../lib/utils';
import type { Course } from '../model/Course';

type LocationProps = {
  course: Course;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BuildingLocation = ({ course }: LocationProps) => {
  const [position, setPosition] = useState({ lat: 45.5048, lng: -73.5772 });
  const [markerRef1, marker1] = useMarkerRef();
  const [markerRef2, marker2] = useMarkerRef();

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
              <Marker ref={markerRef1} position={position} />
              <InfoWindow anchor={marker1}>
                <h2>Building 1</h2>
              </InfoWindow>
              <Marker
                ref={markerRef2}
                position={{ lat: 45.5018, lng: -73.5732 }}
              />
              <InfoWindow anchor={marker2}>
                <h2>Building 2</h2>
              </InfoWindow>
            </Map>
          </APIProvider>
        </div>
      </div>
    </div>
  );
};
