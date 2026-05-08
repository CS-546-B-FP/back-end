import { Router } from 'express';
import { buildingData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';
import { userData } from '../data/index.js';
import { createApiHandler } from '../utils/api-response.js';
import {
  BUILDING_RISK_LEVEL_VALUES,
  BUILDING_SORT_ORDER_VALUES,
  BUILDING_SORT_VALUES,
  BUILDINGS_DEFAULT_LIMIT,
  BUILDINGS_MAX_LIMIT,
  BUILDINGS_NEIGHBORHOOD_MAX_LENGTH,
  BUILDINGS_SEARCH_MAX_LENGTH
} from '../data/buildings.js';
import {
  checkOptionalBoundedText,
  checkOptionalBorough,
  checkOptionalEnum,
  checkQueryInt
} from '../data/validation.js';

const router = Router();

router.get(
  '/buildings',
  createApiHandler(
    async (req) => {
      const {
        search: rawSearch,
        borough: rawBorough,
        neighborhood: rawNeighborhood,
        riskLevel: rawRiskLevel,
        sortBy: rawSortBy,
        sort: rawSort,
        sortOrder: rawSortOrder,
        page: rawPage,
        limit: rawLimit
      } = req.query;
      const search = checkOptionalBoundedText(rawSearch, 'search', {
        maxLength: BUILDINGS_SEARCH_MAX_LENGTH,
        emptyValue: undefined
      });
      const borough = checkOptionalBorough(rawBorough, 'borough');
      const neighborhood = checkOptionalBoundedText(rawNeighborhood, 'neighborhood', {
        maxLength: BUILDINGS_NEIGHBORHOOD_MAX_LENGTH,
        emptyValue: undefined
      });
      const riskLevel = checkOptionalEnum(rawRiskLevel, BUILDING_RISK_LEVEL_VALUES, 'riskLevel', {
        caseInsensitive: true
      });
      const sortBy = checkOptionalEnum(rawSortBy ?? rawSort, BUILDING_SORT_VALUES, 'sortBy', {
        caseInsensitive: true
      });
      const sortOrder = checkOptionalEnum(
        rawSortOrder,
        BUILDING_SORT_ORDER_VALUES,
        'sortOrder',
        {
          caseInsensitive: true,
          emptyValue: 'desc'
        }
      );
      const page = checkQueryInt(rawPage, 'page', {
        defaultValue: 1,
        min: 1
      });
      const limit = checkQueryInt(rawLimit, 'limit', {
        defaultValue: BUILDINGS_DEFAULT_LIMIT,
        min: 1,
        max: BUILDINGS_MAX_LIMIT
      });

      return buildingData.getAllBuildings({
        search,
        borough,
        neighborhood,
        riskLevel,
        sortBy,
        sortOrder,
        page,
        limit
      });
    },
    {
      getErrorStatus: (error) => (typeof error === 'string' ? 400 : 500)
    }
  )
);

router.get(
  '/buildings/:id',
  createApiHandler(
    async (req) => buildingData.getBuildingById(req.params.id),
    { errorStatus: 404 }
  )
);

router.get(
  '/portfolios/:ownerName',
  createApiHandler(
    async (req) => buildingData.getBuildingsByOwner(req.params.ownerName),
    { errorStatus: 404 }
  )
);

router.post(
  '/watchlist/toggle',
  requireAuth,
  createApiHandler(
    async (req) => {
      await buildingData.getBuildingById(req.body.buildingId);
      return userData.toggleWatchlist(req.session.user._id, req.body.buildingId)
    },
    { getErrorStatus: (error) =>
        error === 'building not found' ? 404 : 400
    }
  )
);

export default router;
