import sys
import json
from shapely.geometry import Polygon, MultiPolygon, shape, mapping


def split_geometry(geometry):
    """
    Split a geometry that crosses the antimeridian.
    """
    if isinstance(geometry, Polygon):
        # If the geometry is a polygon, split it into multiple polygons
        # by duplicating the points that cross the antimeridian.
        coords = list(geometry.exterior.coords)
        for i, (x, y) in enumerate(coords):
            if x < -180:
                coords[i] = (x + 360, y)
            elif x > 180:
                coords[i] = (x - 360, y)
        if any(x < -180 or x > 180 for x, y in coords):
            # If any point still crosses the antimeridian, split the
            # polygon into multiple polygons.
            west = [(x, y) for x, y in coords if x < 0 or x == 180]
            east = [(x, y) for x, y in coords if x > 0 or x == -180]
            if east:
                polygons = [Polygon(east)]
                if west:
                    polygons.append(Polygon(west))
                return MultiPolygon(polygons)
            else:
                return Polygon(coords)
        else:
            return Polygon(coords)
    elif isinstance(geometry, MultiPolygon):
        # If the geometry is a multipolygon, split each polygon in the
        # multipolygon recursively.
        polygons = []
        for polygon in geometry.geoms:
            extension = split_geometry(polygon)
            polygons.append(extension)
        return MultiPolygon(polygons)
    else:
        # If the geometry is not a polygon or multipolygon, return it
        # unchanged.
        return geometry

geojson_file_dir = sys.argv[-1]

print( "geojson_file_dir:", geojson_file_dir )
with open(geojson_file_dir, 'r') as f:
    data = json.load(f)

features = []
for feature in data['features']:
    geometry = feature['geometry']
    geometry = split_geometry( shape( geometry ) )
    features.append({
        'type': 'Feature',
        'properties': feature['properties'],
        'geometry': mapping(geometry),
    })

output = {
    'type': 'FeatureCollection',
    'features': features,
}

with open(geojson_file_dir, 'w') as f:
    json.dump(output, f)
