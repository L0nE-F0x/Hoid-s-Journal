/**
 * Trace a coastline off a published plate into a mask both bakers can read.
 *
 *   npm run trace:coast              # rewrites src/cartography/coastlines.ts
 *   npm run trace:coast -- --preview /tmp   # and writes a PNG to look at
 *
 * Roshar's globe used to be twelve hand-tuned gaussian blobs, so the atlas
 * showed Kholinar on Alethkar and the globe showed the same pin in an ocean.
 * `Location.u/v` are 0–1 on the plate, and the globe reads the same 0–1 as
 * longitude and latitude, so a land mask sampled off the plate in plate
 * coordinates puts the coast under the pins by construction. Whether that is
 * a correct projection of Roshar is a question the plate already answered;
 * this only makes the globe agree with it.
 *
 * `rule` selects WATER, not land — Roshar's reads "is this blue" — and land is
 * whatever is left. Then a sweep drops land too small to be an island and
 * water too small to be a lake. Text is the only thing that
 * fools it — gold lettering over water is not blue — so the labels large
 * enough to survive the sweep are listed below as rectangles and painted out
 * first. They are stable: the plate is a file in this repo and will not move.
 *
 * Needs `npm run dev` running, because it decodes the image in the browser.
 */
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const BROWSERS = ['/usr/bin/chromium', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'];
const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error('No chromium/chrome binary found');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return acc;
  }, []),
);

const URL = args.url ?? 'http://127.0.0.1:5174/';
/** Working grid. Equirectangular, so 2:1 whatever the plate's own aspect. */
const WORK_W = 1536;
const WORK_H = 768;
/** Shipped grid. One bit per texel; the bakers blur it back into a coverage field. */
const OUT_W = 512;
const OUT_H = 256;

/**
 * Label blocks that sit on open water, in plate UV. Painted ocean before the
 * flood fill so the lettering does not come out as an archipelago.
 */
const ROSHAR_TEXT = [
  [0.010, 0.870, 0.205, 0.975],   // the "Roshar" title, bottom left
  [0.028, 0.025, 0.108, 0.425],   // "Endless Ocean", up the left edge
  [0.948, 0.250, 1.000, 0.680],   // "Ocean of Origins", down the right edge
  [0.725, 0.168, 0.912, 0.220],   // "Steamwater Ocean"
  [0.380, 0.030, 0.610, 0.095],   // "Northern Depths"
  [0.380, 0.885, 0.610, 0.965],   // "Southern Depths"
  [0.388, 0.178, 0.602, 0.232],   // "Reshi Isles"
  [0.412, 0.276, 0.570, 0.368],   // "Reshi Sea"
  [0.120, 0.455, 0.156, 0.650],   // "Aimian Sea", vertical
];

/**
 * Everything outside the oval on the Final Empire plate is frame: an ornate
 * border, a title medallion, a compass rose. All of it is warm parchment, so
 * all of it classifies as land unless it is painted out first.
 */
const FINAL_EMPIRE_FRAME = [
  [0.000, 0.000, 0.235, 0.270],   // "THE FINAL EMPIRE 1021" medallion
  [0.000, 0.690, 0.245, 1.000],   // compass rose, bottom left
  [0.000, 0.000, 0.060, 1.000],   // left ornament strip
  [0.935, 0.000, 1.000, 1.000],   // right ornament strip
  [0.000, 0.000, 1.000, 0.045],   // top band
  [0.000, 0.955, 1.000, 1.000],   // bottom band
];

/**
 * Scadrial's post-Catacendre world, digitised by hand off
 * `public/maps/scadrial_full.png`.
 *
 * This one is drawn, not classified, and that is not laziness — three
 * classifiers were tried and the plate defeats all of them. Its inland seas
 * are printed on the same white paper as its land (Sea of Yomend 253, Sea of
 * Lennes 248, against Southern Continent 200 and Kalling 202), so no
 * brightness threshold can cut between them; local maxima saturate at 255 on
 * both; and flooding the ocean in from the margin fails because the map's own
 * lat/long grid partitions the sea into cells the flood cannot cross, while
 * any ink threshold loose enough to pass the sea's hatch lets the coastlines
 * leak and swallows both continents.
 *
 * So these rings follow the printed coast in plate UV. The standard is
 * honest about itself: right landmass, right bays, roughly right headlands,
 * not survey-grade. `audit:data` is what holds it to account — it reports
 * any pin that ends up in open water.
 */
const SCADRIAL_BASIN_LAND = [
  // The northern continent, the Southern Islands, and the Southern Continent.
  // Sea of Yomend and Sea of Lennes are bays opening west; the continents
  // connect east of Lennes the way the plate draws them.
  [
    [0.183, 0.029], [0.185, 0.039], [0.194, 0.051], [0.205, 0.056], [0.213, 0.053],
    [0.221, 0.058], [0.225, 0.071], [0.252, 0.083], [0.250, 0.093], [0.261, 0.093],
    [0.271, 0.097], [0.271, 0.115], [0.286, 0.124], [0.286, 0.146], [0.274, 0.163],
    [0.275, 0.181], [0.269, 0.188], [0.279, 0.193], [0.275, 0.204], [0.286, 0.209],
    [0.283, 0.216], [0.296, 0.221], [0.296, 0.229], [0.304, 0.237], [0.302, 0.247],
    [0.319, 0.254], [0.332, 0.249], [0.340, 0.260], [0.349, 0.254], [0.355, 0.254],
    [0.371, 0.275], [0.394, 0.279], [0.415, 0.295], [0.435, 0.300], [0.444, 0.299],
    [0.440, 0.289], [0.446, 0.285], [0.473, 0.280], [0.491, 0.285], [0.518, 0.286],
    [0.524, 0.282], [0.534, 0.283], [0.548, 0.293], [0.541, 0.299], [0.537, 0.296],
    [0.530, 0.297], [0.529, 0.305], [0.518, 0.314], [0.498, 0.319], [0.499, 0.326],
    [0.485, 0.337], [0.433, 0.336], [0.424, 0.329], [0.412, 0.331], [0.385, 0.323],
    [0.368, 0.323], [0.354, 0.315], [0.349, 0.316], [0.343, 0.309], [0.326, 0.307],
    [0.308, 0.292], [0.316, 0.287], [0.316, 0.273], [0.330, 0.266], [0.330, 0.262],
    [0.319, 0.257], [0.305, 0.260], [0.293, 0.258], [0.265, 0.270], [0.265, 0.282],
    [0.279, 0.290], [0.266, 0.297], [0.254, 0.297], [0.252, 0.305], [0.268, 0.309],
    [0.286, 0.302], [0.293, 0.306], [0.304, 0.323], [0.289, 0.326], [0.289, 0.333],
    [0.319, 0.347], [0.319, 0.364], [0.355, 0.364], [0.363, 0.358], [0.382, 0.367],
    [0.433, 0.369], [0.440, 0.379], [0.494, 0.377], [0.499, 0.363], [0.510, 0.355],
    [0.502, 0.344], [0.505, 0.337], [0.513, 0.329], [0.524, 0.330], [0.520, 0.323],
    [0.529, 0.318], [0.545, 0.325], [0.556, 0.323], [0.562, 0.327], [0.560, 0.342],
    [0.567, 0.350], [0.545, 0.359], [0.562, 0.365], [0.563, 0.372], [0.599, 0.370],
    [0.615, 0.382], [0.606, 0.394], [0.595, 0.389], [0.585, 0.390], [0.579, 0.397],
    [0.552, 0.393], [0.545, 0.398], [0.546, 0.406], [0.534, 0.413], [0.537, 0.421],
    [0.526, 0.433], [0.501, 0.429], [0.477, 0.440], [0.462, 0.422], [0.438, 0.413],
    [0.419, 0.414], [0.410, 0.406], [0.393, 0.406], [0.387, 0.402], [0.382, 0.390],
    [0.376, 0.390], [0.361, 0.401], [0.363, 0.413], [0.349, 0.416], [0.338, 0.410],
    [0.340, 0.405], [0.332, 0.394], [0.333, 0.385], [0.322, 0.382], [0.258, 0.382],
    [0.260, 0.385], [0.243, 0.398], [0.236, 0.393], [0.230, 0.393], [0.210, 0.400],
    [0.211, 0.405], [0.224, 0.403], [0.230, 0.408], [0.219, 0.415], [0.210, 0.412],
    [0.203, 0.405], [0.191, 0.407], [0.191, 0.411], [0.208, 0.426], [0.224, 0.423],
    [0.236, 0.415], [0.246, 0.425], [0.265, 0.423], [0.275, 0.426], [0.280, 0.429],
    [0.279, 0.443], [0.293, 0.445], [0.300, 0.450], [0.311, 0.471], [0.324, 0.482],
    [0.326, 0.491], [0.319, 0.501], [0.307, 0.508], [0.285, 0.507], [0.283, 0.524],
    [0.272, 0.529], [0.274, 0.534], [0.293, 0.535], [0.302, 0.531], [0.308, 0.536],
    [0.297, 0.544], [0.296, 0.554], [0.322, 0.564], [0.313, 0.588], [0.329, 0.595],
    [0.327, 0.601], [0.316, 0.608], [0.307, 0.609], [0.305, 0.615], [0.311, 0.622],
    [0.319, 0.622], [0.333, 0.631], [0.329, 0.648], [0.352, 0.656], [0.355, 0.682],
    [0.365, 0.686], [0.361, 0.698], [0.352, 0.707], [0.326, 0.717], [0.318, 0.735],
    [0.335, 0.734], [0.355, 0.728], [0.379, 0.735], [0.387, 0.741], [0.413, 0.744],
    [0.421, 0.734], [0.412, 0.728], [0.402, 0.728], [0.393, 0.721], [0.405, 0.713],
    [0.427, 0.732], [0.430, 0.745], [0.454, 0.740], [0.463, 0.744], [0.468, 0.758],
    [0.463, 0.761], [0.465, 0.771], [0.459, 0.776], [0.449, 0.782], [0.443, 0.782],
    [0.435, 0.789], [0.418, 0.779], [0.410, 0.779], [0.405, 0.790], [0.410, 0.797],
    [0.426, 0.805], [0.443, 0.803], [0.459, 0.797], [0.468, 0.803], [0.446, 0.817],
    [0.424, 0.820], [0.422, 0.829], [0.427, 0.836], [0.446, 0.835], [0.451, 0.844],
    [0.474, 0.840], [0.480, 0.845], [0.476, 0.850], [0.465, 0.853], [0.466, 0.867],
    [0.474, 0.874], [0.466, 0.879], [0.468, 0.885], [0.463, 0.889], [0.448, 0.889],
    [0.452, 0.897], [0.449, 0.906], [0.484, 0.924], [0.487, 0.930], [0.480, 0.934],
    [0.480, 0.945], [0.494, 0.949], [0.499, 0.957], [0.512, 0.948], [0.524, 0.952],
    [0.537, 0.940], [0.545, 0.940], [0.549, 0.943], [0.546, 0.953], [0.562, 0.959],
    [0.563, 0.968], [0.582, 0.963], [0.598, 0.969], [0.627, 0.970], [0.635, 0.975],
    [0.711, 0.975], [0.718, 0.970], [0.732, 0.971], [0.742, 0.966], [0.753, 0.968],
    [0.761, 0.964], [0.775, 0.966], [0.793, 0.975], [0.864, 0.975], [0.870, 0.970],
    [0.883, 0.970], [0.892, 0.964], [0.914, 0.967], [0.923, 0.959], [0.939, 0.967],
    [0.952, 0.964], [0.959, 0.967], [0.961, 0.932], [0.953, 0.935], [0.947, 0.930],
    [0.928, 0.932], [0.915, 0.926], [0.945, 0.896], [0.952, 0.855], [0.933, 0.854],
    [0.936, 0.865], [0.930, 0.871], [0.931, 0.889], [0.917, 0.901], [0.912, 0.898],
    [0.911, 0.880], [0.903, 0.868], [0.873, 0.859], [0.850, 0.834], [0.811, 0.834],
    [0.804, 0.830], [0.804, 0.825], [0.822, 0.818], [0.840, 0.821], [0.848, 0.816],
    [0.840, 0.807], [0.828, 0.809], [0.823, 0.806], [0.828, 0.799], [0.842, 0.797],
    [0.853, 0.799], [0.873, 0.811], [0.878, 0.822], [0.875, 0.827], [0.887, 0.832],
    [0.894, 0.844], [0.906, 0.845], [0.919, 0.839], [0.937, 0.839], [0.945, 0.831],
    [0.950, 0.834], [0.948, 0.842], [0.959, 0.850], [0.961, 0.825], [0.941, 0.824],
    [0.934, 0.819], [0.919, 0.818], [0.906, 0.821], [0.911, 0.827], [0.906, 0.834],
    [0.900, 0.830], [0.903, 0.828], [0.887, 0.822], [0.881, 0.805], [0.864, 0.793],
    [0.853, 0.791], [0.829, 0.790], [0.823, 0.793], [0.817, 0.789], [0.784, 0.790],
    [0.782, 0.794], [0.792, 0.800], [0.804, 0.799], [0.809, 0.802], [0.806, 0.808],
    [0.790, 0.809], [0.779, 0.802], [0.771, 0.802], [0.771, 0.812], [0.782, 0.821],
    [0.782, 0.828], [0.795, 0.832], [0.795, 0.837], [0.804, 0.841], [0.819, 0.842],
    [0.825, 0.839], [0.831, 0.843], [0.850, 0.845], [0.856, 0.850], [0.856, 0.858],
    [0.870, 0.867], [0.855, 0.882], [0.844, 0.888], [0.831, 0.886], [0.831, 0.891],
    [0.842, 0.899], [0.839, 0.905], [0.834, 0.908], [0.811, 0.896], [0.778, 0.888],
    [0.767, 0.893], [0.761, 0.890], [0.751, 0.897], [0.737, 0.894], [0.737, 0.907],
    [0.732, 0.910], [0.703, 0.913], [0.703, 0.918], [0.709, 0.921], [0.768, 0.928],
    [0.773, 0.931], [0.771, 0.945], [0.767, 0.948], [0.762, 0.945], [0.726, 0.948],
    [0.704, 0.935], [0.693, 0.937], [0.671, 0.926], [0.646, 0.927], [0.645, 0.933],
    [0.663, 0.948], [0.701, 0.954], [0.715, 0.961], [0.706, 0.968], [0.671, 0.968],
    [0.663, 0.960], [0.653, 0.961], [0.643, 0.950], [0.635, 0.951], [0.635, 0.956],
    [0.629, 0.960], [0.614, 0.955], [0.596, 0.956], [0.587, 0.948], [0.574, 0.944],
    [0.576, 0.935], [0.565, 0.918], [0.585, 0.910], [0.595, 0.909], [0.609, 0.913],
    [0.620, 0.908], [0.638, 0.909], [0.648, 0.903], [0.654, 0.910], [0.663, 0.908],
    [0.685, 0.911], [0.690, 0.903], [0.700, 0.898], [0.695, 0.883], [0.682, 0.877],
    [0.695, 0.856], [0.717, 0.845], [0.729, 0.850], [0.743, 0.847], [0.751, 0.850],
    [0.764, 0.849], [0.764, 0.821], [0.745, 0.811], [0.732, 0.820], [0.717, 0.815],
    [0.723, 0.806], [0.709, 0.798], [0.704, 0.778], [0.689, 0.767], [0.674, 0.768],
    [0.670, 0.765], [0.667, 0.748], [0.673, 0.737], [0.648, 0.723], [0.663, 0.714],
    [0.678, 0.731], [0.692, 0.731], [0.703, 0.741], [0.715, 0.738], [0.718, 0.717],
    [0.706, 0.699], [0.692, 0.690], [0.700, 0.677], [0.690, 0.670], [0.701, 0.657],
    [0.720, 0.658], [0.729, 0.649], [0.726, 0.633], [0.734, 0.610], [0.739, 0.607],
    [0.754, 0.608], [0.761, 0.621], [0.768, 0.616], [0.771, 0.618], [0.776, 0.615],
    [0.781, 0.618], [0.753, 0.636], [0.761, 0.652], [0.771, 0.656], [0.771, 0.677],
    [0.776, 0.678], [0.782, 0.673], [0.782, 0.656], [0.792, 0.650], [0.792, 0.635],
    [0.817, 0.615], [0.812, 0.605], [0.817, 0.596], [0.837, 0.587], [0.850, 0.587],
    [0.855, 0.584], [0.853, 0.568], [0.845, 0.564], [0.858, 0.543], [0.836, 0.527],
    [0.839, 0.515], [0.855, 0.511], [0.869, 0.486], [0.901, 0.472], [0.909, 0.462],
    [0.926, 0.459], [0.945, 0.450], [0.939, 0.425], [0.934, 0.422], [0.920, 0.423],
    [0.911, 0.413], [0.900, 0.414], [0.895, 0.411], [0.898, 0.396], [0.879, 0.388],
    [0.884, 0.373], [0.870, 0.360], [0.887, 0.354], [0.909, 0.354], [0.915, 0.344],
    [0.926, 0.338], [0.923, 0.333], [0.911, 0.329], [0.911, 0.324], [0.923, 0.320],
    [0.936, 0.321], [0.939, 0.312], [0.956, 0.302], [0.956, 0.290], [0.961, 0.287],
    [0.961, 0.202], [0.936, 0.207], [0.934, 0.215], [0.926, 0.220], [0.909, 0.208],
    [0.906, 0.201], [0.919, 0.193], [0.939, 0.189], [0.947, 0.183], [0.961, 0.183],
    [0.961, 0.157], [0.942, 0.150], [0.933, 0.138], [0.915, 0.127], [0.904, 0.128],
    [0.900, 0.124], [0.895, 0.116], [0.900, 0.110], [0.883, 0.105], [0.869, 0.094],
    [0.869, 0.087], [0.851, 0.075], [0.834, 0.082], [0.842, 0.094], [0.837, 0.097],
    [0.833, 0.094], [0.836, 0.092], [0.828, 0.085], [0.833, 0.081], [0.822, 0.075],
    [0.822, 0.068], [0.807, 0.060], [0.833, 0.045], [0.833, 0.037], [0.814, 0.026],
    [0.656, 0.026], [0.660, 0.033], [0.653, 0.037], [0.638, 0.034], [0.631, 0.040],
    [0.620, 0.031], [0.609, 0.035], [0.612, 0.038], [0.607, 0.041], [0.599, 0.032],
    [0.588, 0.032], [0.582, 0.037], [0.587, 0.040], [0.581, 0.044], [0.576, 0.041],
    [0.581, 0.038], [0.578, 0.033], [0.563, 0.032], [0.560, 0.036], [0.565, 0.039],
    [0.556, 0.043], [0.546, 0.042], [0.532, 0.055], [0.524, 0.047], [0.535, 0.042],
    [0.538, 0.033], [0.520, 0.031], [0.513, 0.041], [0.520, 0.045], [0.515, 0.048],
    [0.510, 0.045], [0.512, 0.040], [0.504, 0.036], [0.505, 0.032], [0.491, 0.034],
    [0.494, 0.040], [0.490, 0.043], [0.485, 0.040], [0.487, 0.034], [0.476, 0.031],
    [0.466, 0.035], [0.466, 0.040], [0.457, 0.043], [0.449, 0.037], [0.449, 0.032],
    [0.430, 0.026], [0.366, 0.026], [0.363, 0.034], [0.376, 0.037], [0.380, 0.044],
    [0.390, 0.048], [0.390, 0.053], [0.385, 0.056], [0.382, 0.054], [0.377, 0.057],
    [0.379, 0.061], [0.369, 0.065], [0.361, 0.060], [0.365, 0.057], [0.358, 0.056],
    [0.352, 0.076], [0.347, 0.079], [0.330, 0.079], [0.318, 0.090], [0.318, 0.095],
    [0.308, 0.097], [0.296, 0.106], [0.277, 0.095], [0.279, 0.086], [0.255, 0.076],
    [0.217, 0.046], [0.232, 0.036], [0.229, 0.027], [0.185, 0.028],
  ],
  // The Shrouded Isles, a drowned ridge northwest of everything.
  [
    [0.044, 0.172], [0.055, 0.180], [0.053, 0.184], [0.059, 0.185], [0.064, 0.182],
    [0.077, 0.191], [0.078, 0.201], [0.092, 0.205], [0.092, 0.210], [0.074, 0.223],
    [0.092, 0.224], [0.102, 0.230], [0.102, 0.239], [0.113, 0.243], [0.119, 0.256],
    [0.124, 0.259], [0.138, 0.257], [0.144, 0.261], [0.142, 0.281], [0.149, 0.279],
    [0.153, 0.282], [0.142, 0.289], [0.142, 0.298], [0.152, 0.302], [0.153, 0.318],
    [0.167, 0.319], [0.175, 0.313], [0.189, 0.312], [0.205, 0.287], [0.210, 0.284],
    [0.222, 0.285], [0.238, 0.271], [0.238, 0.266], [0.229, 0.266], [0.222, 0.262],
    [0.207, 0.251], [0.207, 0.245], [0.171, 0.245], [0.166, 0.236], [0.135, 0.224],
    [0.135, 0.217], [0.124, 0.212], [0.125, 0.204], [0.120, 0.201], [0.125, 0.183],
    [0.119, 0.177], [0.127, 0.171], [0.127, 0.161], [0.124, 0.155], [0.103, 0.143],
    [0.108, 0.132], [0.105, 0.122], [0.089, 0.121], [0.083, 0.126], [0.088, 0.135],
    [0.081, 0.139], [0.081, 0.144], [0.094, 0.150], [0.088, 0.169], [0.083, 0.172],
    [0.059, 0.169], [0.045, 0.171],
  ],
  // Northern Crescent islets, off the north-east cape.
  [
    [0.836, 0.026], [0.844, 0.043], [0.851, 0.049], [0.845, 0.059], [0.851, 0.068],
    [0.867, 0.071], [0.884, 0.053], [0.901, 0.052], [0.901, 0.043], [0.906, 0.040],
    [0.919, 0.045], [0.926, 0.062], [0.945, 0.060], [0.955, 0.074], [0.961, 0.076],
    [0.961, 0.056], [0.952, 0.052], [0.937, 0.057], [0.933, 0.054], [0.926, 0.039],
    [0.934, 0.034], [0.933, 0.027], [0.911, 0.026], [0.904, 0.031], [0.894, 0.030],
    [0.892, 0.045], [0.887, 0.048], [0.876, 0.048], [0.869, 0.053], [0.861, 0.039],
    [0.850, 0.035], [0.850, 0.029], [0.837, 0.026],
  ],
  // Isle west of the Malwish coast.
  [
    [0.208, 0.465], [0.208, 0.469], [0.224, 0.481], [0.224, 0.488], [0.236, 0.491],
    [0.239, 0.485], [0.235, 0.478], [0.257, 0.471], [0.263, 0.466], [0.263, 0.460],
    [0.249, 0.461], [0.238, 0.451], [0.227, 0.450], [0.210, 0.464],
  ],
  // Enclosed southern arm of the Sea of Lennes (even-odd hole).
  [
    [0.540, 0.356], [0.548, 0.342], [0.548, 0.329], [0.543, 0.326], [0.548, 0.323],
    [0.552, 0.325], [0.556, 0.323], [0.562, 0.327], [0.560, 0.342], [0.567, 0.350],
    [0.557, 0.356], [0.552, 0.355], [0.545, 0.359], [0.541, 0.357],
  ],
];

const PLATES = [
  {
    id: 'roshar',
    file: 'maps/roshar_full.jpg',
    erase: ROSHAR_TEXT,
    // Deep ocean is navy, shallows are cyan; land is tan, green or grey-brown.
    // Both waters are blue-dominant and no land on this plate is.
    rule: 'b - Math.max(r, g) > 10',
    // Below this many working texels, a landmass is a letter or a speck of
    // ink; below the second, a sea is a pinhole inside one.
    minIsland: 26,
    minLake: 14,
  },
  {
    id: 'scadrial-basin',
    file: 'maps/scadrial_full.png',
    polygons: SCADRIAL_BASIN_LAND,
    minIsland: 20,
    minLake: 20,
  },
  {
    id: 'scadrial-ash',
    file: 'maps/final_empire.jpg',
    erase: FINAL_EMPIRE_FRAME,
    // Everything outside the map's oval is frame; paint it ocean.
    vignette: [0.505, 0.500, 0.452, 0.487],
    // NOT blue-dominance. This sea is a neutral slate — measured, open water
    // is rgb(106,108,106) and rgb(116,118,115), so `b > max(r, g)` finds
    // nothing and a previous pass concluded the plate was 0% water. What
    // actually separates them is warmth: the parchment land runs
    // rgb(148,135,113), about 35 levels of red over blue, and the water sits
    // at zero. Red lettering is warmer still and lands on the right side.
    rule: 'r - b < 14',
    minIsland: 30,
    minLake: 18,
  },
];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--headless=new', '--disable-dev-shm-usage'],
});

const out = [];
try {
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  for (const plate of PLATES) {
    const r = await page.evaluate(async (plate, W, H, outW, outH) => {
      const img = new Image();
      img.src = plate.file;
      await img.decode();

      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      // Stretched to 2:1 on purpose: the plate's own 0–1 is what the pins use
      // and what the globe reads as longitude and latitude.
      ctx.drawImage(img, 0, 0, W, H);

      // Paint the lettering out before anything looks at colour. The fill is
      // any colour the plate's own rule will call water.
      const WET = plate.wet ?? '#0a3a66';
      ctx.fillStyle = WET;
      for (const [u0, v0, u1, v1] of plate.erase ?? []) {
        ctx.fillRect(u0 * W, v0 * H, (u1 - u0) * W, (v1 - v0) * H);
      }

      // Everything outside the printed map is frame, not geography.
      if (plate.frame) {
        const [fu0, fv0, fu1, fv1] = plate.frame;
        ctx.fillRect(0, 0, W, fv0 * H);
        ctx.fillRect(0, fv1 * H, W, H - fv1 * H);
        ctx.fillRect(0, 0, fu0 * W, H);
        ctx.fillRect(fu1 * W, 0, W - fu1 * W, H);
      }
      if (plate.vignette) {
        const [cu, cv, ru, rv] = plate.vignette;
        // Even-odd: fill the whole plate except the ellipse.
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.ellipse(cu * W, cv * H, ru * W, rv * H, 0, 0, Math.PI * 2);
        ctx.fill('evenodd');
      }

      const isBlue = new Uint8Array(W * H);
      if (plate.polygons) {
        // Hand-drawn land. Paint the polygons white on black and read that
        // back, so the shapes go through exactly the same sweep, downsample
        // and packing as a classified plate does.
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for (const ring of plate.polygons) {
          ring.forEach(([u, v], k) => (k ? ctx.lineTo(u * W, v * H) : ctx.moveTo(u * W, v * H)));
          ctx.closePath();
        }
        ctx.fill('evenodd');
        const pd = ctx.getImageData(0, 0, W, H).data;
        for (let i = 0; i < W * H; i++) isBlue[i] = pd[i * 4] > 127 ? 0 : 1;
      } else {
        const px = ctx.getImageData(0, 0, W, H).data;
        const test = new Function('r', 'g', 'b', `return ${plate.rule};`);
        for (let i = 0; i < W * H; i++) {
          if (test(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])) isBlue[i] = 1;
        }
      }

      // Land is simply what is not water. A flood fill from the border would
      // have been tidier against lettering, but Roshar's inland seas — the
      // Reshi Sea, the Purelake, the Tarat — are enclosed by their own coasts,
      // and a flood that cannot reach them fills them in as continent.
      const land = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) land[i] = isBlue[i] ? 0 : 1;

      // Sweep both ways: land too small to be an island is a letter or a speck
      // of ink, water too small to be a lake is a pinhole inside a letter.
      const sweep = (grid, want, minSize) => {
        const seen = new Uint8Array(W * H);
        let killed = 0;
        for (let s = 0; s < W * H; s++) {
          if (grid[s] !== want || seen[s]) continue;
          const comp = [s];
          seen[s] = 1;
          for (let k = 0; k < comp.length; k++) {
            const i = comp[k];
            const x = i % W;
            const y = (i / W) | 0;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              const j = ny * W + nx;
              if (grid[j] === want && !seen[j]) { seen[j] = 1; comp.push(j); }
            }
          }
          if (comp.length < minSize) {
            for (const i of comp) grid[i] = want ? 0 : 1;
            killed++;
          }
        }
        return killed;
      };
      const dropped = sweep(land, 1, plate.minIsland) + sweep(land, 0, plate.minLake);

      // Box-average down to the shipped grid, then threshold at a half. One bit
      // per texel is plenty: the bakers blur it back into a coverage field and
      // the recipe's own noise puts the fractal detail back on the coast.
      const bits = new Uint8Array(outW * outH);
      const sx = W / outW;
      const sy = H / outH;
      let landCount = 0;
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          let n = 0; let t = 0;
          for (let j = Math.floor(y * sy); j < Math.floor((y + 1) * sy); j++) {
            for (let i = Math.floor(x * sx); i < Math.floor((x + 1) * sx); i++) {
              t += land[j * W + i]; n++;
            }
          }
          const on = t / Math.max(1, n) >= 0.5 ? 1 : 0;
          bits[y * outW + x] = on;
          landCount += on;
        }
      }

      // Pack to bytes, MSB first, and base64 it.
      const bytes = new Uint8Array((outW * outH) / 8);
      for (let i = 0; i < outW * outH; i++) {
        if (bits[i]) bytes[i >> 3] |= 0x80 >> (i & 7);
      }
      let bin = '';
      for (const b of bytes) bin += String.fromCharCode(b);

      // A picture of what we just decided, for a human to check.
      const pc = document.createElement('canvas');
      pc.width = outW; pc.height = outH;
      const pctx = pc.getContext('2d');
      const pim = pctx.createImageData(outW, outH);
      for (let i = 0; i < outW * outH; i++) {
        const v = bits[i] ? 232 : 24;
        pim.data[i * 4] = v; pim.data[i * 4 + 1] = v; pim.data[i * 4 + 2] = bits[i] ? 200 : 64;
        pim.data[i * 4 + 3] = 255;
      }
      pctx.putImageData(pim, 0, 0);

      return {
        b64: btoa(bin),
        land: landCount / (outW * outH),
        dropped,
        preview: pc.toDataURL('image/png'),
      };
    }, plate, WORK_W, WORK_H, OUT_W, OUT_H);

    console.log(
      `  ${plate.id.padEnd(10)} ${(r.land * 100).toFixed(1)}% land, `
      + `${r.dropped} speck(s) dropped, ${r.b64.length} chars`,
    );
    if (args.preview) {
      const path = `${args.preview}/coast-${plate.id}.png`;
      writeFileSync(path, Buffer.from(r.preview.split(',')[1], 'base64'));
      console.log(`  -> ${path}`);
    }
    out.push({ id: plate.id, b64: r.b64, land: r.land });
  }
} finally {
  await browser.close();
}

// Quoted: recipe ids are hyphenated, and `scadrial-ash:` is not an identifier.
const body = out.map((o) => `  '${o.id}': '${o.b64}',`).join('\n');
writeFileSync('src/cartography/coastlines.ts', `/**
 * Land masks traced off the published plates by \`npm run trace:coast\`.
 * Generated — edit the tracer, not this file.
 *
 * One bit per texel on a ${OUT_W}x${OUT_H} equirectangular grid, MSB first,
 * base64. \`coastCoverage\` blurs it back into a smooth 0–1 field that
 * \`recipes.ts\` hands to both bakers in place of a world's \`shape\` blobs, so
 * the continent on the globe is the continent on the plate and a pin lands on
 * the ground it names.
 */

export const COAST_W = ${OUT_W};
export const COAST_H = ${OUT_H};

const PACKED: Record<string, string> = {
${body}
};

const fields = new Map<string, Float32Array>();

/**
 * Unpack and blur. The mask is one bit per texel and a hard edge would make a
 * coastline of staircases; three passes of a small box turn it into a
 * coverage field the recipe noise can then ruffle into something fractal.
 */
function fieldFor(id: string): Float32Array | null {
  const hit = fields.get(id);
  if (hit) return hit;
  const packed = PACKED[id];
  if (!packed) return null;

  const n = COAST_W * COAST_H;
  let src = new Float32Array(n);
  const bin = atob(packed);
  for (let i = 0; i < n; i++) {
    src[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  }

  let dst = new Float32Array(n);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < COAST_H; y++) {
      for (let x = 0; x < COAST_W; x++) {
        let t = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const sy = y + dy;
          if (sy < 0 || sy >= COAST_H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            // Longitude wraps; latitude does not.
            const sx = (x + dx + COAST_W) % COAST_W;
            t += src[sy * COAST_W + sx]!; k++;
          }
        }
        dst[y * COAST_W + x] = t / k;
      }
    }
    const swap = src; src = dst; dst = swap;
  }
  fields.set(id, src);
  return src;
}

/** Bilinear, wrapping in u. 0 is open ocean, 1 is deep inland. */
export function coastCoverage(id: string, u: number, v: number): number {
  const f = fieldFor(id);
  if (!f) return 0;
  const fx = u * COAST_W - 0.5;
  const fy = Math.min(COAST_H - 1, Math.max(0, v * COAST_H - 0.5));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const wrap = (x: number) => ((x % COAST_W) + COAST_W) % COAST_W;
  const row = (y: number) => Math.min(COAST_H - 1, Math.max(0, y)) * COAST_W;
  const a = f[row(y0) + wrap(x0)]!;
  const b = f[row(y0) + wrap(x0 + 1)]!;
  const c = f[row(y0 + 1) + wrap(x0)]!;
  const d = f[row(y0 + 1) + wrap(x0 + 1)]!;
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

/** The blurred field as bytes, for uploading to the GPU. */
export function coastBytes(id: string): Uint8Array | null {
  const f = fieldFor(id);
  if (!f) return null;
  const out = new Uint8Array(f.length);
  for (let i = 0; i < f.length; i++) out[i] = Math.round(f[i]! * 255);
  return out;
}

export function hasCoast(id: string): boolean {
  return id in PACKED;
}
`);
console.log('\nwrote src/cartography/coastlines.ts');
