// 9/9/2022
// use treecover to create regular grid

//treecover
var dataset = ee.Image("UMD/hansen/global_forest_change_2018_v1_6")
              .select('treecover2000')
              .gte(1)
Map.addLayer(dataset.mask(dataset),{palette: ['000000', '00FF00'],}, 'treecover');   

var generateGrid = function(xmin, ymin, xmax, ymax, dx, dy) {
  var xx = ee.List.sequence(xmin, ee.Number(xmax).subtract(dx), dx)
  var yy = ee.List.sequence(ymin, ee.Number(ymax).subtract(dy), dy)
  
  var cells = xx.map(function(x) {
    return yy.map(function(y) {
      var x1 = ee.Number(x)
      var x2 = ee.Number(x).add(ee.Number(dx))
      var y1 = ee.Number(y)
      var y2 = ee.Number(y).add(ee.Number(dy))
      
      var coords = ee.List([x1, y1, x2, y2]);
      var rect = ee.Algorithms.GeometryConstructors.Rectangle(coords);   //生成矩形
      return ee.Feature(rect)
    })
  }).flatten();   //变成单个数组

  return ee.FeatureCollection(cells);
}

var dx = 20
var dy = 20
var xmin = -180
var xmax = 180
var ymin = -60
var ymax = 90
var grid = generateGrid(xmin, ymin, xmax, ymax, dx, dy)    //设置参数，生成格网

//print(grid)

var grid = grid.map(function(i) {         //这一步是通过treecover数据来只留下包含森林的格网
  return i.set('treecover2000', dataset.reduceRegion(ee.Reducer.anyNonZero(), i.geometry(), 10000).get('treecover2000')) 
                //如果格网内不全为0(有森林）则给格网添加属性treecover2000=1，否则添加属性treecover2000=0
}).filter(ee.Filter.eq('treecover2000', 1)) // 只保留treecover2000=1的格网(有森林)

print(grid.size()) //查看生成所有格网数量
Map.addLayer(grid, {}, 'grid')

var gridlist = grid.getInfo()["features"]   
print (gridlist)    //显示所有的格网（列表）

// Export an ee.FeatureCollection as an Earth Engine asset.

// select grid based on forest area > 2000 sq km
var grid2 = grid.map(function(i) {         //这一步是通过treecover数据来只留下包含森林的格网
  return i.set('treecover2000', dataset.multiply(ee.Image.pixelArea()).reduceRegion(ee.Reducer.sum(), i.geometry(), 1000).getNumber('treecover2000').divide(1000000)) 
                //如果格网内不全为0(有森林）则给格网添加属性treecover2000=1，否则添加属性treecover2000=0
}).filter(ee.Filter.gte('treecover2000', 2000)) // 只保留treecover2000=1的格网(有森林)

print(grid2.size()) //查看生成所有格网数量
Map.addLayer(grid2, {}, 'grid')

var gridlist2 = grid2.getInfo()["features"]   
print (gridlist2)    //显示所有的格网（列表）

