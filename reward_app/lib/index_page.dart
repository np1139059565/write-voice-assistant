import 'package:flutter/material.dart';
import 'package:reward_app/job_list_page.dart';

class IndexPage extends StatefulWidget {
  const IndexPage({super.key});

  @override
  State<IndexPage> createState() => _IndexPageState();
}

class _IndexPageState extends State<IndexPage> {
  int pageIndex = 0;

  Widget? scaffoldBody;


@override
void initState() {
    super.initState();
    showPage();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: scaffoldBody,
      bottomNavigationBar: BottomNavigationBar(
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "首页"),
          // BottomNavigationBarItem(icon: Icon(Icons.home), label: "大厅"),
          // BottomNavigationBarItem(icon: Icon(Icons.home), label: "邀请赚钱"),
          // BottomNavigationBarItem(icon: Icon(Icons.home), label: "发现"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "我的")
        ],
        currentIndex: pageIndex,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.black26,
        showUnselectedLabels: true,
        onTap: switchPage,
      ),
    );
  }

  void switchPage(int i) {
    setState(() {
      pageIndex = i;
      showPage();
    });
  }
  void showPage(){
       switch (pageIndex) {
        case 0:
          scaffoldBody=JobListPage();
          break;
      }
  }

}
