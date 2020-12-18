"""LCOE endpoints."""

from fastapi import APIRouter, Depends

from rezoning_api.models.zone import ZoneRequest, ZoneResponse, Filters, Weights
from rezoning_api.utils import (
    lcoe_generation,
    lcoe_interconnection,
    lcoe_road,
    get_capacity_factor,
    get_distances,
)

router = APIRouter()


@router.post(
    "/zone/",
    responses={200: dict(description="return an LCOE calculation for a given area")},
    response_model=ZoneResponse,
)
def zone(query: ZoneRequest, filters: Filters = Depends()):
    """calculate LCOE, then weight for zone score"""
    # spatial temporal inputs
    ds, dr, calc, mask = get_distances(query.aoi.dict(), filters)
    cf = get_capacity_factor(query.aoi.dict(), query.lcoe.capacity_factor)

    # lcoe component calculation
    lg = lcoe_generation(query.lcoe, cf)
    li = lcoe_interconnection(query.lcoe, cf, ds)
    lr = lcoe_road(query.lcoe, cf, dr)
    # TODO: restore mask
    lcoe = lg + li + lr

    # zone score
    zone_score = (
        query.weights.lcoe_gen * lg.sum()
        + query.weights.lcoe_transmission * li.sum()
        + query.weights.lcoe_road * lr.sum()
        # technology_colocation: float = 0.5
        # human_footprint: float = 0.5
        + query.weights.worldpop * calc[0].sum()
        + query.weights.slope * calc[1].sum()
        # + query.weights.capacity_value * cf.sum()
    )

    return dict(
        lcoe=lcoe.sum() / 1000,
        zone_score=zone_score,
        zone_output=cf.sum(),
        zone_output_density=cf.sum() / (500 ** 2),
    )


@router.get("/zone/schema", name="weights_schema")
def get_filter_schema():
    """Return weights schema"""
    return Weights.schema()["properties"]