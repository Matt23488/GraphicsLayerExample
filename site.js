require([
    "esri/basemaps",
    "esri/map",
    "esri/request",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol"
], function (esriBasemaps, Map, esriRequest, SpatialReference, Point, Polyline, Graphic, GraphicsLayer, SimpleLineSymbol, SimpleMarkerSymbol) {
    // KYTC basemap
    esriBasemaps.kytc = {
        baseMapLayers: [{ url: "https://maps.kytc.ky.gov/arcgis/rest/services/BaseMap/KYTCBaseMap/MapServer" }],
        thumbnailUrl: "https://maps.kytc.ky.gov/arcgis/rest/services/BaseMap/KYTCBaseMap/MapServer/info/thumbnail",
        title: "KYTC Basemap"
    };

    var map = new Map("map", {
        basemap: "kytc"
    });

    // Create symbols
    var routeSymbol = new SimpleLineSymbol({
        type: "esriSLS",
        style: "esriSLSSolid",
        color: [ 128, 0, 255 ],
        width: 4
    });

    var bmpSymbol = new SimpleMarkerSymbol({
        type: "esriSMS",
        style: "esriSMSSquare",
        color: [ 50, 200, 10 ],
        size: 10,
        outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            color: [ 0, 0, 0 ],
            width: 0.75
        }
    });

    var empSymbol = new SimpleMarkerSymbol({
        type: "esriSMS",
        style: "esriSMSCircle",
        color: [ 255, 0, 0 ],
        size: 10,
        outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            color: [ 0, 0, 0 ],
            width: 0.75
        }
    });

    map.on("load", function () {
        // Create GraphicsLayer and add it to the map
        var customGraphics = new GraphicsLayer();
        map.addLayer(customGraphics);

        // Hardcoded route and milepoints for demo purposes
        esriRequest({
            url: "https://maps.kytc.ky.gov/arcgis/rest/services/MeasuredRoute/MapServer/exts/RouteMetrics/GetRouteAndMPs",
            content: {
                RT_UNIQUE: "037-KY-0420  -000",
                BP: 4.2,
                EP: 4.6,
                f: "json"
            },
            handleAs: "json",
            callbackParamName: "callback"
        }).then(function (response) {
            var bmpJson = response.geometries[1];
            var empJson = response.geometries[2];

            // Create geometry objects from the JSON. BMP and EMP geometries are a bit malformed coming from the service, so we have to finagle it a bit
            var routeGeom = new Polyline(response.geometries[0]);
            var bmpGeom = new Point(bmpJson.points[0], new SpatialReference(bmpJson.spatialReference));
            var empGeom = new Point(empJson.points[0], new SpatialReference(empJson.spatialReference));

            // Create graphics from the geometry and symbols
            var routeGraphic = new Graphic(routeGeom, routeSymbol);
            var bmpGraphic = new Graphic(bmpGeom, bmpSymbol);
            var empGraphic = new Graphic(empGeom, empSymbol);

            // Add graphics to the GraphicsLayer
            customGraphics.add(routeGraphic);
            customGraphics.add(bmpGraphic);
            customGraphics.add(empGraphic);

            // Zoom to extent
            map.setExtent(routeGeom.getExtent());
        });
    });
});