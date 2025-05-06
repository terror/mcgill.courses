import { useContext } from 'react';

import { ExploreFilterContext } from '../providers/explore-filter-state-provider';

export const useExploreFilterState = () => {
  return useContext(ExploreFilterContext);
};
