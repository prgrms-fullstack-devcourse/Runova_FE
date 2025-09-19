import { geoPath, geoMercator } from 'd3-geo';
import type { Feature, FeatureCollection, LineString } from 'geojson';

interface SvgExportOptions {
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  padding?: number;
}

export function convertRoutesToSvg(
  routes: Feature<LineString>[],
  options: SvgExportOptions,
): string {
  const {
    width,
    height,
    strokeColor = '#000000',
    strokeWidth = 5,
    padding = 20,
  } = options;

  if (routes.length === 0) {
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const featureCollection: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: routes,
  };

  const projection = geoMercator().fitSize(
    [width - padding * 2, height - padding * 2],
    featureCollection,
  );

  const pathGenerator = geoPath(projection);

  const pathElements = featureCollection.features
    .map((feature) => `<path d="${pathGenerator(feature)}" />`)
    .join('');

  const groupElement = `<g transform="translate(${padding}, ${padding})" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round">${pathElements}</g>`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${groupElement}</svg>`;
}

export function convertRoutesToPathData(
  routes: Feature<LineString>[],
  options: SvgExportOptions,
): string {
  const { width, height, padding = 20 } = options;

  if (routes.length === 0) {
    return '';
  }

  const featureCollection: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: routes,
  };

  const projection = geoMercator().fitSize(
    [width - padding * 2, height - padding * 2],
    featureCollection,
  );

  const pathGenerator = geoPath(projection);

  const pathData = featureCollection.features
    .map((feature) => {
      const path = pathGenerator(feature);
      if (!path || path.includes('NaN') || path.includes('Infinity')) {
        console.warn('Invalid path data generated:', path);
        return null;
      }
      return path;
    })
    .filter(Boolean)
    .join(' ');

  return pathData || '';
}
