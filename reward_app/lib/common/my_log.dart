class MyLog {
  static final inf = (str) {
    print("-------------------------------------------");
    print(str);
  };
  static final err = (e) {
    print("===========================================");
    if (e.message!=null) {
      print(e.message);
    } else if (e.error!=null){
      print(e.error);
    }
  };
}
