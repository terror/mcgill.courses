import { useContext } from 'react';

import { ExploreFilterContext } from '../providers/ExploreFilterStateProvider';

export const useExploreFilterState = () => {
  return useContext(ExploreFilterContext);
};
