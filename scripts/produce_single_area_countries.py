import json 

from os import path
import sys

countries_dir = sys.argv[-1]

line = input()

# loop through countries, if that country has no geojson created 
# that means it has a single area and we need to produce its file
while line:
    country = json.loads( line )
    country_id = country["properties"]["GID_0"]
    res = dict()
    res["type"] = "FeatureCollection"
    single_area = dict()
    single_area["type"] = "Feature"
    single_area["properties"] = { 
        "id": country_id,
        "name": country["properties"]["COUNTRY"]
        }
    single_area["geometry"] = country["geometry"]
    res["features"] = [single_area]
    res_json = json.dumps(res, indent=4)
    if res_json == "":
        continue

    if not path.exists( f"{countries_dir}/{country_id}.geojson" ):
        with open( f"{countries_dir}/{country_id}.geojson" , "w+") as file:
            file.write( res_json )

    line = input()
