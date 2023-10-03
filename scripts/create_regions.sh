#!/bin/zsh

# Set path references
GEO_PATH=./.geo
GADM_PATH=$GEO_PATH/gadm
GADM_UNZIPPED_PATH=$GEO_PATH/ 
COUNTRIES_PATH=$GEO_PATH/country
REGIONS_PATH=$GEO_PATH/region
PUBLIC_ZONES_PATH=app/public/zones

# Create diretories

mkdir -p $GEO_PATH
mkdir -p $COUNTRIES_PATH/simplified
mkdir -p $COUNTRIES_PATH/quantized
mkdir -p $PUBLIC_ZONES_PATH/country # output dir

mkdir -p $REGIONS_PATH/simplified
mkdir -p $REGIONS_PATH/quantized
mkdir -p $PUBLIC_ZONES_PATH/region # output dir

# Download original file, if not already downloaded
# wget -c https://geodata.ucdavis.edu/gadm/gadm4.1/gadm_410-levels.zip -P $GADM_PATH

# Expand
unzip -o $GADM_PATH/gadm_410-levels.zip -d $GADM_PATH/

# Convert GeoPackage to multiple ESRI Shapefiles
ogr2ogr -f "ESRI Shapefile" $GADM_UNZIPPED_PATH $GADM_PATH/gadm_410-levels.gpkg

echo "ogr2ogr done"

################### 
# PROCESS REGIONS
###################

# Parse shapes to GeoJSON
./node_modules/.bin/shp2json --newline-delimited $GADM_UNZIPPED_PATH/ADM_0.shp > $GADM_UNZIPPED_PATH/ADM_0.geojson

# Split gadm41_0 GeoJSON into regions
node ./scripts/split-gadm41_0.js $GADM_UNZIPPED_PATH/ADM_0.geojson $REGIONS_PATH

# For each country, generate optimized TopoJSON
for region in $REGIONS_PATH/*.geojson; do
  filename=$(basename -- "$region")
  regioncode="${filename%.*}"
  regionfile="$REGIONS_PATH/${regioncode}"
  echo "Parsing ${regionfile}"
  cat $region | ./node_modules/.bin/simplify-geojson -t 0.01 > $REGIONS_PATH/simplified/${regioncode}.geojson
  ./node_modules/.bin/geo2topo $REGIONS_PATH/simplified/${regioncode}.geojson > $REGIONS_PATH/simplified/${regioncode}.topojson
  ./node_modules/.bin/topoquantize 1e5 < $REGIONS_PATH/simplified/${regioncode}.topojson > $REGIONS_PATH/quantized/${regioncode}.topojson
  cp $REGIONS_PATH/quantized/${regioncode}.topojson $PUBLIC_ZONES_PATH/region
done

#####################
# PROCESS COUNTRIES
#####################

# Parse shapes to GeoJSON
./node_modules/.bin/shp2json --newline-delimited $GADM_UNZIPPED_PATH/ADM_1.shp > $GADM_UNZIPPED_PATH/ADM_1.geojson

# Explode into countries
node ./scripts/split-gadm41_1.js $GADM_UNZIPPED_PATH/ADM_1.geojson $COUNTRIES_PATH

# Generate single area countries
cat $GADM_UNZIPPED_PATH/ADM_0.geojson | python ./scripts/produce_single_area_countries.py $COUNTRIES_PATH

# For each country, generate optimized TopoJSON
for country in $COUNTRIES_PATH/*.geojson; do
  filename=$(basename -- "$country")
  countrycode="${filename%.*}"
  countryfile="$COUNTRIES_PATH/${countrycode}"
  echo "Parsing ${countryfile}"
  python ./scripts/split_antimeridian_crossing.py $country
  cat $country | ./node_modules/.bin/simplify-geojson -t 0.01 > $COUNTRIES_PATH/simplified/${countrycode}.geojson
  ./node_modules/.bin/geo2topo $COUNTRIES_PATH/simplified/${countrycode}.geojson > $COUNTRIES_PATH/simplified/${countrycode}.topojson
  ./node_modules/.bin/topoquantize 1e5 < $COUNTRIES_PATH/simplified/${countrycode}.topojson > $COUNTRIES_PATH/quantized/${countrycode}.topojson
  cp $COUNTRIES_PATH/quantized/${countrycode}.topojson $PUBLIC_ZONES_PATH/country
;done

# Clear temporary folder (uncomment to execute)
# rm -rf $GADM_PATH
# rm -rf $GADM_UNZIPPED_PATH
# rm -rf $REGIONS_PATH
# rm -rf $COUNTRIES_PATH
