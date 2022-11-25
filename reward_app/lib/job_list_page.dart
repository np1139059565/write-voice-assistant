import 'package:flutter/material.dart';
import 'package:reward_app/search_page.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:reward_app/common/my_service.dart';

class JobListPage extends StatefulWidget {
  const JobListPage({super.key});

  @override
  State<JobListPage> createState() => _JobListPageState();
}

class _JobListPageState extends State<JobListPage> {
  final String HINT_TEXT = "任务标题";
  static final jobListEnd = "###end###";
  static final jobListErr = "###err###";
  final jobList = <dynamic>[jobListEnd];

  SharedPreferences? prefs;

  String searchText = "";
  int pageSize = 10;
  int page = 1;
  int maxPage = 1;

  @override
  void initState() {
    // prefs = await SharedPreferences.getInstance();
    // prefs.setStringList("jobList",List());
    print("initState...");
  }

  @override
  Widget build(BuildContext context) {
    return Flex(
      direction: Axis.vertical,
      children: [
        Expanded(
            flex: 2,
            child: Container(
              padding:
                  EdgeInsets.only(top: 50, left: 10, bottom: 10, right: 10),
              color: Colors.blue,
              child: ElevatedButton.icon(
                  icon: Icon(Icons.search),
                  label: Text(
                      "${searchText == "" ? HINT_TEXT : searchText}                                                                                                                                                  "),
                  onPressed: () async {
                    var inputStr = await Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return SearchPage(
                        defText: searchText,
                        hintText: HINT_TEXT,
                      );
                    })));
                    print("search text:$inputStr");
                    if (inputStr != null) {
                      setState(() {
                        jobList.clear();
                        jobList.add(jobListEnd);
                        searchText = inputStr;
                        page = 1;
                        maxPage = 1;
                      });
                    }
                  },
                  style: ButtonStyle(
                    shape: MaterialStateProperty.all(StadiumBorder()),
                    backgroundColor: MaterialStateProperty.resolveWith<Color>(
                        (Set<MaterialState> states) {
                      return Colors.white;
                    }),
                    foregroundColor: MaterialStateProperty.resolveWith<Color>(
                        (Set<MaterialState> states) {
                      return Colors.black26;
                    }),
                  )),
            )),
        Expanded(
            flex: 13,
            child: ListView.builder(
                itemCount: jobList.length,
                itemBuilder: (BuildContext c, int i) {
                  //如果到了表尾
                  if (jobList[i] == jobListEnd) {
                    //不到最后一页,继续获取数据
                    if (nextPage()) {
                      //加载时显示loading
                      return Container(
                        padding: const EdgeInsets.all(16.0),
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
                  } else if (jobList[i] == jobListErr) {
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
                }))
      ],
    );
  }

  bool nextPage() {
    if (page <= maxPage) {
      MyService().getJobList((e, d) {
        if (e != null) {
          setState(() {
            jobList.clear();
            jobList.add(jobListErr);
          });
          return print("eeeeeeeeeee");
        }
        print(d);
        page += 1;
        dynamic jsond = json.decode(d);
        maxPage = jsond["maxPage"];
        dynamic newLine = jsond["data"];
        // .map((line) => {
        //       for (var o in jsond["heads"].asMap().entries)
        //         "${o.value}": "${line[o.key]}"
        //     })
        // .toList();
        setState(() {
          if (newLine.length > 0) {
            jobList.insertAll(jobList.length - 1, newLine);
          }
        });
      }, search: searchText, pageSize: pageSize, page: page);
      return true;
    } else
      return false;
  }
}

class JobInfoPage extends StatelessWidget {
  const JobInfoPage({Key? key, required this.jobInfo});

  final jobInfo;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints.tightFor(height: 80), //卡片大小
      child: Center(child: Text(jobInfo["title"])),
    );
  }
}
