//index.js
const app = getApp()

// add index.json
import * as echarts from 'ec-canvas/echarts'
var echart1 = null
Page({
    data: {
        ec1: {//def key
            onInit: (canvas, width, height, dpr) => {
                try {
                    console.info("init...")
                    const ec = echarts.init(canvas, null, {
                        width: width,
                        height: height,
                        devicePixelRatio: dpr // 像素
                    })
                    canvas.setChart(ec)
                    echart1 = ec
                    return ec
                } catch (e) {
                    app.globalData.mlog.err(e)
                }
            },
        }
    },
    onLoad: function (option) {
        try {
            //傻逼api,必须把数据放到app.ts中,否则第二次进入echarts页面不会渲染
            app.globalData.treeData = JSON.parse(Object.values(option))
            this.initTree()
        } catch (e) {
            app.globalData.mlog.err(e)
        }
    },
    initTree() {
        console.info(app.globalData.treeData)
        if (echart1 != null) {
            echart1.hideLoading()
            echart1.setOption({
                series: [{
                    type: 'tree',

                    initialTreeDepth: -1,

                    name: 'tree1',

                    data: [app.globalData.treeData],

                    top: '5%',
                    left: '20%',
                    bottom: '2%',
                    right: '15%',

                    symbolSize: 20,
                    symbol: 'emptyCircle',

                    label: {
                        normal: {
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right',
                            color: 'black'
                        }
                    }
                }]

                // tooltip: {
                //     trigger: 'item',
                //     triggerOn: 'mousemove'
                // },
                // series: [
                //     {
                //         type: 'tree',
                //         data: [app.globalData.treeData],
                //         top: '18%',
                //         bottom: '14%',
                //         layout: 'radial',
                //         symbol: 'emptyCircle',
                //         symbolSize: 20,
                //         initialTreeDepth: -1,
                //         animationDurationUpdate: 750,
                //         emphasis: {
                //             focus: 'descendant'
                //         },
                //         label: {
                //             normal: {
                //                 show: false,
                //                 position: 'left',
                //                 verticalAlign: 'middle',
                //                 align: 'right',
                //                 color: 'black'
                //             }
                //         }
                //     }
                // ]
            })
        } else {
            console.info("wait echart...")
            setTimeout(this.initTree, 100)
        }
    },
    initD3() {
        if (echart1 != null) {
            echart1.hideLoading()
            initChart(parseData(app.globalData.treeData), 6)
            function parseData(treeData, parentId = "", parentDepth = 0) {
                const id=(parentId==""?"":parentId + ".") + treeData.name
                var d3Arr = [{id: id, depth: parentDepth}]
                if (treeData.children != null) {
                    for (const i in treeData.children) {
                        const child=treeData.children[i]
                        d3Arr=d3Arr.concat(parseData(child,id,parentDepth+1))
                    }
                }else{
                    d3Arr[0].value=treeData.value
                }
                return d3Arr
            }
            function initChart(seriesData, maxDepth) {
                console.info(JSON.stringify(seriesData))
                var displayRoot = stratify();
                function stratify() {
                    return d3
                        .stratify()
                        .parentId(function (d) {
                            return d.id.substring(0, d.id.lastIndexOf('.'));
                        })(seriesData)
                        .sum(function (d) {
                            return d.value || 0;
                        })
                        .sort(function (a, b) {
                            return b.value - a.value;
                        });
                }
                function overallLayout(params, api) {
                    var context = params.context;
                    d3
                        .pack()
                        .size([api.getWidth() - 2, api.getHeight() - 2])
                        .padding(3)(displayRoot);
                    context.nodes = {};
                    displayRoot.descendants().forEach(function (node, index) {
                        context.nodes[node.id] = node;
                    });
                }
                function renderItem(params, api) {
                    var context = params.context;
                    // Only do that layout once in each time `setOption` called.
                    if (!context.layout) {
                        context.layout = true;
                        overallLayout(params, api);
                    }
                    var nodePath = api.value('id');
                    var node = context.nodes[nodePath];
                    if (!node) {
                        // Reder nothing.
                        return;
                    }
                    var isLeaf = !node.children || !node.children.length;
                    var focus = new Uint32Array(
                        node.descendants().map(function (node) {
                            return node.data.index;
                        })
                    );
                    var nodeName = isLeaf
                        ? nodePath
                            .slice(nodePath.lastIndexOf('.') + 1)
                            .split(/(?=[A-Z][^A-Z])/g)
                            .join('\n')
                        : '';
                    var z2 = api.value('depth') * 2;
                    return {
                        type: 'circle',
                        focus: focus,
                        shape: {
                            cx: node.x,
                            cy: node.y,
                            r: node.r
                        },
                        transition: ['shape'],
                        z2: z2,
                        textContent: {
                            type: 'text',
                            style: {
                                // transition: isLeaf ? 'fontSize' : null,
                                text: nodeName,
                                fontFamily: 'Arial',
                                width: node.r * 1.3,
                                overflow: 'truncate',
                                fontSize: node.r / 3
                            },
                            emphasis: {
                                style: {
                                    overflow: null,
                                    fontSize: Math.max(node.r / 3, 12)
                                }
                            }
                        },
                        textConfig: {
                            position: 'inside'
                        },
                        style: {
                            fill: api.visual('color')
                        },
                        emphasis: {
                            style: {
                                fontFamily: 'Arial',
                                fontSize: 12,
                                shadowBlur: 20,
                                shadowOffsetX: 3,
                                shadowOffsetY: 5,
                                shadowColor: 'rgba(0,0,0,0.3)'
                            }
                        }
                    };
                }
                echart1.setOption({
                    dataset: {
                        source: seriesData
                    },
                    tooltip: {},
                    visualMap: [
                        {
                            show: false,
                            min: 0,
                            max: maxDepth,
                            dimension: 'depth',
                            inRange: {
                                color: ['#006edd', '#e0ffff']
                            }
                        }
                    ],
                    hoverLayerThreshold: Infinity,
                    series: {
                        type: 'custom',
                        renderItem: renderItem,
                        progressive: 0,
                        coordinateSystem: 'none',
                        encode: {
                            tooltip: 'value',
                            itemName: 'id'
                        }
                    }
                });
                echart1.on('click', { seriesIndex: 0 }, function (params) {
                    drillDown(params.data.id);
                });
                function drillDown(targetNodeId) {
                    displayRoot = stratify();
                    if (targetNodeId != null) {
                        displayRoot = displayRoot.descendants().find(function (node) {
                            return node.data.id === targetNodeId;
                        });
                    }
                    // A trick to prevent d3-hierarchy from visiting parents in this algorithm.
                    displayRoot.parent = null;
                    echart1.setOption({
                        dataset: {
                            source: seriesData
                        }
                    });
                }
                // Reset: click on the blank area.
                echart1.getZr().on('click', function (event) {
                    if (!event.target) {
                        drillDown();
                    }
                });
            }
        } else {
            console.info("wait echart...")
            setTimeout(this.initD3, 100)
        }
    }
})
