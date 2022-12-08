import 'package:flutter/material.dart';
import 'package:reward_app/common/my_log.dart';
import 'package:reward_app/common/my_service.dart';
import 'package:reward_app/job_list_page.dart';
import 'dart:convert';
import 'package:image_pickers/image_pickers.dart';

class JobDetailPage extends StatefulWidget {
  const JobDetailPage({super.key, required this.jobInfo});
  final double DEF_SIZE = 12;
  final double TITLE_SIZE = 15;
  final Color FONT_COLOR = Colors.black26;
  final jobInfo;

  @override
  State<JobDetailPage> createState() => _JobDetailPageState();
}

class _JobDetailPageState extends State<JobDetailPage> {
  @override
  Widget build(BuildContext context) {
    final childrenArr = [
      Row(
        children: [
          Text.rich(
            style: TextStyle(
              fontSize: widget.TITLE_SIZE,
            ),
            TextSpan(
              text: "任务步骤",
              children: [
                TextSpan(
                  text: " (请参照以下步骤完成做单)",
                  style: TextStyle(
                    color: Colors.black26,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ];
    try {
      final stepArr = json.decode(
        widget.jobInfo["steps"],
      ); //import 'dart:convert';
      for (var i = 0; i < stepArr.length; i++) {
        childrenArr.add(
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                child: Center(
                  child: Text(
                    "${i + 1}",
                    style: TextStyle(
                      color: Colors.white,
                    ),
                  ),
                ),
                width: widget.TITLE_SIZE,
                height: widget.TITLE_SIZE,
                margin: EdgeInsets.only(
                  right: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.all(
                    Radius.circular(
                      widget.TITLE_SIZE,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stepArr[i]["title"],
                    ),
                    getStepObj(stepArr[i]),
                    Divider(),
                  ],
                ),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      MyLog.err(e);
    }

    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Text(
            "任务详情",
          ),
        ),
        actions: [
          Icon(
            Icons.more_horiz,
          ),
        ],
      ),
      body: DefaultTextStyle.merge(
        style: TextStyle(
          fontSize: widget.DEF_SIZE,
        ),
        child: SingleChildScrollView(
          child: Container(
            color: Colors.white10,
            child: Column(
              children: [
                Container(
                  height: 80,
                  color: Colors.white,
                  child: Flex(
                    direction: Axis.horizontal,
                    children: [
                      Expanded(
                        flex: 1,
                        child: Image.network(
                          "${MyService.parentUrl}/images/title.png",
                          width: 80,
                        ),
                      ),
                      Expanded(
                        flex: 4,
                        child: Container(
                          padding: EdgeInsets.all(
                            10,
                          ),
                          child: Flex(
                            direction: Axis.vertical,
                            children: [
                              Expanded(
                                child: Flex(
                                  direction: Axis.horizontal,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        widget.jobInfo["title"],
                                        textAlign: TextAlign.left,
                                        style: TextStyle(
                                          fontSize: widget.TITLE_SIZE,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Text.rich(
                                        textScaleFactor: 1.4,
                                        TextSpan(
                                          children: [
                                            TextSpan(text: "￥"),
                                            TextSpan(
                                              text: widget.jobInfo["money"]
                                                  .toString(),
                                            ),
                                          ],
                                          style: TextStyle(
                                            color: Colors.red,
                                            fontSize: widget.TITLE_SIZE,
                                          ),
                                        ),
                                        textAlign: TextAlign.right,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Expanded(
                                child: Flex(
                                  direction: Axis.horizontal,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        widget.jobInfo["job_type"],
                                        style: TextStyle(
                                          color: widget.FONT_COLOR,
                                        ),
                                        textAlign: TextAlign.left,
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        "支持设备:${widget.jobInfo["system_type"]}",
                                        style: TextStyle(
                                          color: widget.FONT_COLOR,
                                        ),
                                        textAlign: TextAlign.right,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  height: 80,
                  padding: EdgeInsets.only(
                    top: 20,
                    left: 10,
                    right: 10,
                  ),
                  // margin: EdgeInsets.only(right: 10),
                  color: Colors.white,
                  child: Container(
                    padding: EdgeInsets.only(
                      bottom: 10,
                    ),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.black26,
                        ),
                      ),
                    ),
                    child: Flex(
                      direction: Axis.horizontal,
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border(
                                right: BorderSide(
                                  color: Colors.black26,
                                ),
                              ),
                            ),
                            child: Flex(
                              direction: Axis.vertical,
                              children: [
                                Expanded(
                                  child: Text(
                                    "${(widget.jobInfo["avg_used_seconds"] / 60).toStringAsFixed(2)}分钟",
                                    style: TextStyle(
                                      fontSize: widget.TITLE_SIZE,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    "人均用时",
                                    style: TextStyle(
                                      color: widget.FONT_COLOR,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border(
                                right: BorderSide(
                                  color: Colors.black26,
                                ),
                              ),
                            ),
                            child: Flex(
                              direction: Axis.vertical,
                              children: [
                                Expanded(
                                  child: Text(
                                    "${widget.jobInfo["success_count"]}",
                                    style: TextStyle(
                                      fontSize: widget.TITLE_SIZE,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    "完成人数",
                                    style: TextStyle(
                                      color: widget.FONT_COLOR,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border(
                                right: BorderSide(
                                  color: Colors.black26,
                                ),
                              ),
                            ),
                            child: Flex(
                              direction: Axis.vertical,
                              children: [
                                Expanded(
                                  child: Text(
                                    "${(widget.jobInfo["avg_check_seconds"] / 60).toStringAsFixed(2)}分钟",
                                    style: TextStyle(
                                      fontSize: widget.TITLE_SIZE,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    "平均审核",
                                    style: TextStyle(
                                      color: widget.FONT_COLOR,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Expanded(
                          child: Flex(
                            direction: Axis.vertical,
                            children: [
                              Expanded(
                                child: Text(
                                  "${widget.jobInfo["success_ratio"]}%",
                                  style: TextStyle(
                                    fontSize: widget.TITLE_SIZE,
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  "总通过率",
                                  style: TextStyle(
                                    color: widget.FONT_COLOR,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Container(
                  color: Colors.white,
                  height: 40,
                  padding: EdgeInsets.only(
                    left: 10,
                  ),
                  child: Row(
                    children: [
                      Text(
                        "剩余名额${widget.jobInfo["total_count"] - widget.jobInfo["success_count"]}",
                        style: TextStyle(
                          color: widget.FONT_COLOR,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  color: Colors.white,
                  constraints: BoxConstraints(
                    minHeight: 40,
                  ),
                  padding: EdgeInsets.only(
                    left: 10,
                  ),
                  margin: EdgeInsets.only(
                    top: 10,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Text(
                            "任务说明",
                            style: TextStyle(
                              fontSize: widget.TITLE_SIZE,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              widget.jobInfo["job_tip"],
                              softWrap: true,
                              overflow: TextOverflow.clip,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  color: Colors.white,
                  constraints: BoxConstraints(
                    minHeight: 40,
                  ),
                  padding: EdgeInsets.only(
                    left: 10,
                  ),
                  margin: EdgeInsets.only(
                    top: 10,
                  ),
                  child: Column(
                    children: childrenArr,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget getStepObj(stepInfo) {
    switch (stepInfo["type"]) {
      case "image":
        return Flex(
          direction: Axis.horizontal,
          children: [
            Expanded(
              child: Image.network(
                "${MyService.parentUrl}/images/${stepInfo["value"]}",
                color: Colors.blue,
                width: 360,
              ),
            ),
            Expanded(
              child: Center(child: ElevatedButton.icon(
                icon: Icon(Icons.camera_alt),
                label: Text("添加图片"),
                onPressed: () async {
                  ImagePickers.pickerPaths().then((List medias){
                    print("aaaaaaaaaaaaaaaaa");
                    print(medias);
                  });
                },
              ),),
            ),
          ],
        );
      default:
        return Text("not find type");
    }
  }
}
