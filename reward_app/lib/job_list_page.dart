import 'package:flutter/material.dart';
import 'package:reward_app/search_page.dart';
import 'package:reward_app/job_detail_page.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:reward_app/common/my_service.dart';
import 'package:reward_app/common/my_log.dart';

class JobListPage extends StatefulWidget {
  const JobListPage({super.key,});

  @override
  State<JobListPage> createState() => _JobListPageState();
}

class _JobListPageState extends State<JobListPage> {
  final double DEF_SIZE = 12;

  final SEARCH_RIGHT_WIDTH_MAX =
      "                                                                                                                                                  ";
  final SEARCH_HINT_TEXT = "任务标题";
  String searchText = "";

  final JOB_LIST_ERR = "###err###";
  static String JOB_LIST_END = "###end###";
  final jobList = <dynamic>[JOB_LIST_END];
  int jobPageSize = 8;
  int jobPage = 1;
  int jobMaxPage = 1;

  @override
  void initState() {
    // SharedPreferences? prefs;

    // prefs = await SharedPreferences.getInstance();
    // prefs.setStringList("jobList",List());
    MyLog.inf("initState...");
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTextStyle.merge(
      style: TextStyle(
        fontSize: DEF_SIZE,
      ),
      child: Flex(
        direction: Axis.vertical,
        children: [
          Expanded(
            flex: 2,
            child: Container(
              padding: EdgeInsets.only(
                top: 50,
                left: 10,
                bottom: 10,
                right: 10,
              ),
              color: Colors.blue,
              child: ElevatedButton.icon(
                icon: Icon(Icons.search),
                label: Text(
                  "${searchText == "" ? SEARCH_HINT_TEXT : searchText}${SEARCH_RIGHT_WIDTH_MAX}",
                  style: TextStyle(
                    fontSize: DEF_SIZE,
                  ),
                ),
                onPressed: () async {
                  var inputStr = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return SearchPage(
                          defSearchText: searchText,
                          hintText: SEARCH_HINT_TEXT,
                        );
                      },
                    ),
                  );
                  MyLog.inf("search text:$inputStr");
                  if (inputStr != null) {
                    setState(
                      () {
                        jobList.clear();
                        jobList.add(JOB_LIST_END);
                        searchText = inputStr;
                        jobPage = 1;
                        jobMaxPage = 1;
                      },
                    );
                  }
                },
                style: ButtonStyle(
                  shape: MaterialStateProperty.all(StadiumBorder(),),
                  backgroundColor: MaterialStateProperty.resolveWith<Color>(
                    (Set<MaterialState> states) {
                      return Colors.white;
                    },
                  ),
                  foregroundColor: MaterialStateProperty.resolveWith<Color>(
                    (Set<MaterialState> states) {
                      return Colors.black26;
                    },
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            flex: 13,
            child: ListView.builder(
              itemCount: jobList.length,
              itemBuilder: (BuildContext c, int i) {
                //如果到了表尾
                if (jobList[i] == JOB_LIST_END) {
                  //不到最后一页,继续获取数据
                  if (nextPage()) {
                    //加载时显示loading
                    return Container(
                      padding: EdgeInsets.all(16.0),
                      alignment: Alignment.center,
                      child: SizedBox(
                        width: 24.0,
                        height: 24.0,
                        child: CircularProgressIndicator(strokeWidth: 2.0),
                      ),
                    );
                  } else {
                    //已经到最后一页,显示结束
                    return Container(
                      alignment: Alignment.center,
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        "没有更多了",
                        style: TextStyle(color: Colors.grey),
                      ),
                    );
                  }
                } else if (jobList[i] == JOB_LIST_ERR) {
                  //服务端异常
                  return Container(
                    alignment: Alignment.center,
                    padding: EdgeInsets.all(16.0),
                    child: Text(
                      "服务端异常!",
                      style: TextStyle(color: Colors.grey),
                    ),
                  );
                }
                return JobInfoPage(
                  jobInfo: jobList[i],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  bool nextPage() {
    if (jobPage <= jobMaxPage) {
      MyService().getJobList((e, d) {
        if (e != null) {
          setState(() {
            jobList.clear();
            jobList.add(JOB_LIST_ERR);
          },);
          return MyLog.err(e);
        }
        MyLog.inf(d);
        jobPage += 1;
        dynamic newLine = d["data"];
        jobMaxPage = d["maxPage"];

        setState(() {
          if (newLine.length > 0) {
            jobList.insertAll(jobList.length - 1, newLine);
          }
        },);
      }, search: searchText, pageSize: jobPageSize, page: jobPage);
      return true;
    } else
      return false;
  }
}

class JobInfoPage extends StatelessWidget {
  const JobInfoPage({Key? key, required this.jobInfo,});
  final double TITLE_SIZE = 15;

  final jobInfo;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      child: Container(
        constraints: BoxConstraints.tightFor(height: 80), //卡片大小
        child: Flex(
          direction: Axis.horizontal,
          children: [
            Expanded(
              flex: 6,
              child: Image.network(
                "${MyService.parentUrl}/images/title.png",
                width: 80,
                color: Colors.blue,
              ),
            ),
            Expanded(
              flex: 18,
              child: Container(
                padding: EdgeInsets.only(bottom: 5, top: 5, right: 10),
                child: Flex(
                  direction: Axis.vertical,
                  children: [
                    Expanded(
                      child: Flex(
                        direction: Axis.horizontal,
                        children: [
                          Expanded(
                            flex: 9,
                            child: Text(
                              jobInfo["title"],
                              textAlign: TextAlign.left,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: TITLE_SIZE,
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 0,
                            child: Text(""),
                          )
                        ],
                      ),
                    ),
                    Expanded(
                      child: Flex(
                        direction: Axis.horizontal,
                        children: [
                          Expanded(
                            child: Text(
                              jobInfo["job_type"],
                              textAlign: TextAlign.left,
                            ),
                          ),
                          Expanded(
                            child: Text.rich(
                              textScaleFactor: 1.4,
                              TextSpan(
                                children: [
                                  TextSpan(text: "￥"),
                                  TextSpan(
                                    text: jobInfo["money"].toString(),
                                  )
                                ],
                                style: TextStyle(
                                  color: Colors.red,
                                  fontSize: TITLE_SIZE,
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
                              "${jobInfo["success_count"]}人已赚|剩余${jobInfo["total_count"] - jobInfo["success_count"]}",
                              textAlign: TextAlign.left,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              "支持设备:${jobInfo["system_type"]}",
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
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) {
              return JobDetailPage(jobInfo: jobInfo);
            },
          ),
        );
      },
    );
  }
}
