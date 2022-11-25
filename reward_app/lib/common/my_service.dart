import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';

class MyService {
  final Dio dio=Dio();
  // final HttpClient hc = HttpClient();
  final _SCHEME = "http";
  final _HOST = "120.78.86.64";
  final _PORT = 8888;
  Map<String, String> paths = {
    "jobList": "/job/list",
    "userList": "/user/list"
  };

  void _get(String path, Map<String,String> data, Function callback) async {
    dynamic err;
    String? respBody;
    try {
      // Uri uri = Uri(scheme: _SCHEME, host: _HOST, port: _PORT, path: path,queryParameters: data);
      // HttpClientRequest req = await hc.getUrl(uri);
      // req.headers.add("user-agent", "test");
      // HttpClientResponse resp = await req.close();
      // respBody = await resp.transform(utf8.decoder).join();
      final resp=await dio.get(path="$_SCHEME://$_HOST:$_PORT/$path",queryParameters: data);
      respBody=resp.data;
    } catch (e) {
      err = e;
    } finally {
      // hc.close();
    }
    callback(err, respBody);
  }

  void _post(String path, Map<String,String> data, callback) async {
    dynamic err;
    String? respBody;
    try {
      final resp=await dio.post(path="$_SCHEME://$_HOST:$_PORT/$path",data: data);
      respBody=resp.data;
    } catch (e) {
      err = e;
    }
    callback(err, respBody);
  }


  void getJobList(callback,{int page=1,int pageSize=1,String search=""}) {
    return _get(paths['jobList'].toString(), {"page": page.toString(),"page_size":pageSize.toString(),"search":search}, callback);
  }
}
