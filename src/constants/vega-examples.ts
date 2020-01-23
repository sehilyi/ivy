// export const splom = {
//   repeat: {
//     row: ['petalWidth', 'petalLength', 'sepalWidth', 'sepalLength'],
//     column: ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'],
//   },
//   spec: {
//     width: 150,
//     height: 150,
//     mark: {type: 'point', tooltip: true},
//     encoding: {
//       x: {
//         field: {repeat: 'column'},
//         type: 'quantitative',
//         scale: {zero: false},
//       },
//       y: {
//         field: {repeat: 'row'},
//         type: 'quantitative',
//         scale: {zero: false},
//       },
//       color: {field: 'species', type: 'nominal'},
//     },
//   },
//   config: {background: 'white'},
// };

// export const OLD_EXAMPLE = {
//   $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
//   width: 900,
//   height: 400,
//   data: {url: 'data/wheat.json'},
//   transform: [{calculate: '+datum.year + 5', as: 'year_end'}],
//   layer: [
//     {
//       mark: {
//         type: 'bar',
//         fill: '#aaa',
//         stroke: '#999',
//       },
//       encoding: {
//         x: {
//           field: 'year',
//           type: 'quantitative',
//           axis: {
//             tickCount: 5,
//             format: 'd',
//           },
//         },
//         x2: {
//           field: 'year_end',
//         },
//         y: {
//           field: 'wheat',
//           type: 'quantitative',
//           axis: {zindex: 1},
//         },
//       },
//     },
//     {
//       data: {
//         values: [{year: '1600'}, {year: '1650'}, {year: '1700'}, {year: '1750'}, {year: '1800'}],
//       },
//       mark: {
//         type: 'rule',
//         stroke: '#000',
//         strokeWidth: 0.6,
//         opacity: 0.5,
//       },
//       encoding: {
//         x: {
//           field: 'year',
//           type: 'quantitative',
//         },
//       },
//     },
//     {
//       mark: {
//         type: 'area',
//         color: '#a4cedb',
//         opacity: 0.7,
//       },
//       encoding: {
//         x: {
//           field: 'year',
//           type: 'quantitative',
//         },
//         y: {
//           field: 'wages',
//           type: 'quantitative',
//         },
//       },
//     },
//     {
//       mark: {
//         type: 'line',
//         color: '#000',
//         opacity: 0.7,
//       },
//       encoding: {
//         x: {
//           field: 'year',
//           type: 'quantitative',
//         },
//         y: {
//           field: 'wages',
//           type: 'quantitative',
//         },
//       },
//     },
//     {
//       mark: {
//         type: 'line',
//         yOffset: -2,
//         color: '#EE8182',
//       },
//       encoding: {
//         x: {
//           field: 'year',
//           type: 'quantitative',
//         },
//         y: {
//           field: 'wages',
//           type: 'quantitative',
//         },
//       },
//     },
//     {
//       data: {
//         url: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/monarchs.json',
//       },
//       transform: [
//         {
//           calculate: '((!datum.commonwealth && datum.index % 2) ? -1: 1) * 2 + 95',
//           as: 'offset',
//         },
//         {calculate: '95', as: 'y'},
//       ],
//       mark: {
//         type: 'bar',
//         stroke: '#000',
//       },
//       encoding: {
//         x: {
//           field: 'start',
//           type: 'quantitative',
//         },
//         x2: {
//           field: 'end',
//         },
//         y: {
//           field: 'y',
//           type: 'quantitative',
//         },
//         y2: {field: 'offset'},
//         fill: {
//           field: 'commonwealth',
//           scale: {range: ['black', 'white']},
//           legend: null,
//           type: 'nominal',
//         },
//       },
//     },
//     {
//       data: {
//         url: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/monarchs.json',
//       },
//       transform: [
//         {
//           calculate: '((!datum.commonwealth && datum.index % 2) ? -1: 1) + 95',
//           as: 'off2',
//         },
//         {calculate: '+datum.start + (+datum.end - +datum.start)/2', as: 'x'},
//       ],
//       mark: {
//         type: 'text',
//         yOffset: 16,
//         fontSize: 9,
//         baseline: 'bottom',
//         fontStyle: 'italic',
//       },
//       encoding: {
//         x: {
//           field: 'x',
//           type: 'quantitative',
//         },
//         y: {field: 'off2', type: 'quantitative'},
//         text: {field: 'name', type: 'nominal'},
//       },
//     },
//   ],
//   config: {
//     axis: {
//       title: null,
//       gridColor: 'white',
//       gridOpacity: 0.25,
//       domain: false,
//     },
//     view: {stroke: 'transparent'},
//   },
// };
