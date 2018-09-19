// create mountain forest cover map
// based upon FAO specifications (not fixed)

// years to process (from start year t0 to end year t1)
var t0 = "2001";
var t1 = "2016";

var min_elev = 300; // as defined by FAO to 300m
var min_slope = 5; // not specified by FAO

// grab DEM + slope values and formulate
// a mask based upon this data
var dataset = ee.Image('CGIAR/SRTM90_V4');
var elevation = dataset.select('elevation');
var slope = ee.Terrain.slope(elevation);

// grab land cover data (median across a number of years)
// for temporal stability
var landcover = ee.ImageCollection('MODIS/006/MCD12Q1').select('LC_Type1')
.filterDate(t0.concat("-01-01"),t1.concat("-12-31"))
.median().int();

// create a mask based upon various parameters
var elevation_slope_mask = elevation
.mask(elevation.gt(min_elev))
.mask(slope.gt(min_slope))
.mask(landcover.gt(0).and(landcover.lt(6)));

// apply mask to igbp data
var igbp = landcover
.mask(elevation_slope_mask);

// Define an SLD style of discrete intervals to apply to the image
// only retain forest cover colour classes
var sld_intervals =
'<RasterSymbolizer>' +
 ' <ColorMap  type="intervals" extended="false" >' +
    '<ColorMapEntry color="#152106" quantity="1" label="Evergreen Needleleaf Forest"/>' +
    '<ColorMapEntry color="#225129" quantity="2" label="Evergreen Broadleaf Forest"/>' +
    '<ColorMapEntry color="#369b47" quantity="3" label="Deciduous Needleleaf Forest"/>' +
    '<ColorMapEntry color="#30eb5b" quantity="4" label="Deciduous Broadleaf Forest"/>' +
    '<ColorMapEntry color="#387242" quantity="5" label="Mixed Deciduous Forest"/>' +
  '</ColorMap>' +
'</RasterSymbolizer>';


var EU = ee.Geometry.Rectangle({coords:[-30, 35, 50, 75], geodesic:false});

// plot map
Map.setCenter(6.746, 46.529, 7);
Map.addLayer(igbp.sldStyle(sld_intervals), {}, 'Mountain Forest');
Map.addLayer(EU)

// export the data to Google Drive
Export.image.toDrive({
  image: igbp,
  description: 'mountain_forest_eu',
  scale: 500,
  maxPixels: 1e13,
  region: EU
});
