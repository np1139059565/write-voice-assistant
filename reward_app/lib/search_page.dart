import 'package:flutter/material.dart';

class SearchPage extends StatefulWidget {
  const SearchPage(
      {super.key, required this.defSearchText, required this.hintText});

  final String defSearchText;
  final String hintText;

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: TextEditingController.fromValue(TextEditingValue(
              text: widget.defSearchText,
              selection: TextSelection.fromPosition(TextPosition(
                  affinity: TextAffinity.downstream,
                  offset: widget.defSearchText.length)))),
          autofocus: true,
          decoration: InputDecoration(
            prefixIcon: Icon(
              Icons.search,
              size: 25,
              color: Colors.black26,
            ),
            prefixIconConstraints: BoxConstraints(maxHeight: 25, minWidth: 40),
            // contentPadding必须设置isDense才生效
            isDense: true,
            // contentPadding:
            //     EdgeInsets.only(top: -7, bottom: 10),
            // fillColor必须设置filled才生效
            filled: true,
            fillColor: Colors.white,
            hintText: widget.hintText,
            hintStyle: TextStyle(color: Colors.black26),
          ),
          textInputAction: TextInputAction.search,
          cursorColor: Colors.blue,
          onSubmitted: (v) {
            Navigator.pop(context, v);
          },
        ),
      ),
      body: Center(child: Column()),
    );
  }
}
