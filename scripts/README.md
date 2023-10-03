# Create regions scripts:
The script downloads GADM dataset and generate topojson file for areas of each country (Administrative subdivisions) and the countries of each region (western-and-central-africa, east-and-southern-africa, middle-east-and-north-africa, ...).
# Source of the data: 
currently using version 4.1 of GDAM dataset from [GADM](https://gadm.org/)
# How to run:
Make sure `./app/public/zones/country` and `./app/public/zones/region` directories are cleared and run:
```
./scripts/create_regions.sh
``` 
This will result in new files being generated.
