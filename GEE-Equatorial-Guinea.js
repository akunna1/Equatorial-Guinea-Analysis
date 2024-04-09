// Load the SRTM DEM dataset
var srtm = ee.Image('CGIAR/SRTM90_V4');

// Clip the SRTM DEM to the country boundary of Equatorial Guinea
var equatorialGuinea = ee.FeatureCollection('FAO/GAUL/2015/level0')
  .filter(ee.Filter.eq('ADM0_NAME', 'Equatorial Guinea'));
var roi = equatorialGuinea.geometry();
var dem = srtm.clip(roi);

// Compute slope from the clipped DEM
var slope = ee.Terrain.slope(dem);

// Define period for GPP calculation
var startdate = ee.Date.fromYMD(2012, 1, 1);
var enddate = ee.Date.fromYMD(2012, 12, 31);

// Filter GPP data
var gppCollection = ee.ImageCollection('MODIS/006/MYD17A2H')
  .filterDate(startdate, enddate)
  .filterBounds(roi)
  .select('Gpp')
  .sum();

// Visualization settings for GPP
var gpp_viz = {min:0.0, max:15000, palette: 'ff0000, f0ff00, 004717'};

// Normalized Burn Ratio Thermal (NBRT) calculation
var landsat = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterDate('2019-06-01', '2019-12-31')
  .filterBounds(roi)
  .median();

var nbrt = landsat.expression(
  '(NIR - 0.001 * SWIR * Temp) / (NIR + 0.001 * SWIR * Temp)', {
    'NIR': landsat.select('B5'),
    'SWIR': landsat.select('B7'),
    'Temp': landsat.select('B11')
});

// Visualization settings for NBRT
var nbrt_viz = {min: 0.0, max: 0.9, palette: ['blue', 'yellow', 'red']};

// NDVI calculation
var ndvi = landsat.normalizedDifference(['B5', 'B4']);

// Visualization settings for NDVI
var ndvi_viz = {min: -1, max: 1, palette: ['red', 'yellow', 'green']};

// Display layers on the map
Map.addLayer(roi, {}, 'Equatorial Guinea'); // Add Equatorial Guinea layer first
Map.addLayer(slope, {min: 0, max: 90, palette: ['blue', 'green', 'yellow', 'red']}, 'Slope');
Map.addLayer(gppCollection.clip(roi), gpp_viz, 'GPP');
Map.addLayer(nbrt.clip(roi), nbrt_viz, 'NBRT');
Map.addLayer(ndvi.clip(roi), ndvi_viz, 'NDVI');

// Center the map on Equatorial Guinea
Map.centerObject(roi, 6);

// Print out the computed slope image
print('Slope Image:', slope);
