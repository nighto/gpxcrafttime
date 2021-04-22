# gpxcrafttime
JavaScript tool to create GPX files interpolating GPX with no time, and a timerange.

## Introduction

This script helps "crafting" a GPX file with valid timestamps (one point per second), which is needed to create sequences on [Mapillary](http://mapillary.com), for instance, based on a GPX file with no timestamps (from OSM for instance).

To start, you must need a GPX with a track with no time information. You could to the following steps to get one:

- Get the OSM way you want to work with (for example: http://www.openstreetmap.org/way/270082121)
- Convert the OSM way to KML (for instance with https://nighto.github.io/ciclorio/antigo/dev/osm/)
- Convert the KML to GPX (for instance with http://kml2gpx.com/)

Then:

- Open https://nighto.github.io/gpxcrafttime/, select the GPX file, enter the datetime information and press Calculate.

If everything works smoothly, a file will be generated locally and then exported ("downloaded"). The file is processed on your browser, it's not uploaded to any server.

## TODO

- Improve the GPX entry (accept KML file and OSM way number).
- Add option to enter duration in seconds instead of end time
- Allow user to input acceleration and deacceleration and interpolate the positions based on that (specially useful for subway trains)
