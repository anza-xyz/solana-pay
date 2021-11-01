import 'dart:async';
import 'dart:convert' as convert;

import 'package:convert/convert.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:slope_solana_client/slope_solana_client.dart';
import 'package:uni_links/uni_links.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'E-commerce App'),
      builder: EasyLoading.init(
    builder: _customChild),
    );
  }
}

Widget _customChild(BuildContext context, Widget? child) {

  Brightness brightness = Brightness.light;
  SystemUiOverlayStyle systemUiOverlayStyle = SystemUiOverlayStyle.light.copyWith(
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: brightness,
  );

  EasyLoading.instance
    ..loadingStyle = EasyLoadingStyle.custom
    ..indicatorColor = Colors.blue
    ..textColor = Colors.white
    ..backgroundColor = Colors.white
    ..radius = 8
    ..contentPadding =
    const EdgeInsets.only(top: 16, bottom: 16, left: 16, right: 16)
    ..textStyle = EasyLoading.instance.textStyle?.copyWith(fontSize: 12)
    ..progressColor = Colors.white;


  /// 状态栏
  return AnnotatedRegion<SystemUiOverlayStyle>(
    value: systemUiOverlayStyle,
    child: GestureDetector(
      child: child,
      behavior: HitTestBehavior.opaque,
      onTap: () => _hideKeyboard(context),
    ),
  );
}


void _hideKeyboard(BuildContext context) {
  FocusScopeNode currentFocus = FocusScope.of(context);
  if (!currentFocus.hasPrimaryFocus && currentFocus.focusedChild != null) {
    FocusManager.instance.primaryFocus!.unfocus();
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> with WidgetsBindingObserver {
  StreamSubscription? _sub;

  // 地址
  TextEditingController _adrsCtrl = TextEditingController(
      text: 'DYZFDHyCs5XxjyJ6KYAk3o7q1dhhiuZYaj3Ye4aTtR4r');

  // 金额
  TextEditingController _amountCtrl = TextEditingController(text: '0.001');

  // 标题
  TextEditingController _titleCtrl = TextEditingController(text: 'testing notes');

  // 描述信息
  TextEditingController _msgCtrl = TextEditingController(text: 'testing mark');

  // 代币mint地址
  TextEditingController _mintCtrl = TextEditingController(
      text: 'DYZFDHyCs5XxjyJ6KYAk3o7q1dhhiuZYaj3Ye4aTtR4r');
  String _strWalletSchemeUrl = 'slopewallet://wallet.slope/pay/sgin?returnSchemes=';
  String _strMySchemeUrl = 'slopedapp://slope.dapp/pay?slopePayReturn';
  // String _strSendScheme =
  //     'slopewallet://wallet.slope/pay/sgin?returnSchemes=736c6f7065646170703a2f2f736c6f70652e646170702f7061793f736c6f706550617952657475726e&slopePayParams=7b2261646472657373223a22386741614c4e67426b4d486e72697633384879524146686f3371475542634863374e6778544762574d675738222c22616d6f756e74223a302e30312c226c6162656c223a22e6b58be8af95e59cb0e59d80222c226d656d6f223a2231363335353734363737353138222c226d657373616765223a22e6b58be8af95e5a4b8e992b1e58c85e694afe4bb98222c226d696e74223a22536f3131313131313131313131313131313131313131313131313131313131313131313131313131313132227d';
  String _strRecvSign = '';
  String _strSendScheme = '';

  // Text(model.mint),
  void _sendScheme() {
    if (_adrsCtrl.text.isEmpty || _amountCtrl.text.isEmpty) return;
    Map<String, dynamic> params = Map();
    params['address'] = _adrsCtrl.text;
    params['amount'] = _amountCtrl.text;
    if (_mintCtrl.text.isNotEmpty)  params['mint'] = _mintCtrl.text;
    if (_titleCtrl.text.isNotEmpty) params['label'] = _titleCtrl.text;
    if (_msgCtrl.text.isNotEmpty) params['message'] = _msgCtrl.text;
    // String strParams = params.toString();
    String strEnParams = convert.jsonEncode(params);
    String strCovertParams = _covertString(strInput:strEnParams);
    String strMyEncodeScheme = _covertString(strInput:_strMySchemeUrl);
    String strDecodeParam = Uri.encodeComponent(strCovertParams);
    _strSendScheme = _strWalletSchemeUrl + strMyEncodeScheme + '&slopePayParams=' + strDecodeParam;
    _launchURL(context, _strSendScheme);
  }

  String _covertString({required String strInput}) {
    var utf8 = convert.utf8.encode(strInput);
    var decode = hex.encode(utf8);
    return decode.toString();
  }

  _launchURL(BuildContext context, String url) async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      print('Could not launch $url');
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance!.removeObserver(this);
    _sub?.cancel();
    super.dispose();
  }

  @override
  initState() {
    WidgetsBinding.instance!.addObserver(this);
    super.initState();
    initLink();
  }

  initLink() async {
    String initialLink = (await getInitialLink())!;
    if (initialLink.isEmpty) print('init url_link');
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _handleIncomingLinks();
    }
  }

  void _handleIncomingLinks() async {
    if (!kIsWeb) {
      try {
        _sub ??= uriLinkStream.listen((Uri? uri) {
          if (!mounted) return;
          print('got uri: $uri');
          setState(() {
            _strRecvSign = uri?.queryParameters['slopePayReturn'] ?? '';
            // 推链
            sendTransaction(_strRecvSign).then((value) {
              print('_MyHomePageState._handleIncomingLinks1111111111');
            });

            Future.delayed(Duration(seconds: 3), () {
              showToast('pay success!');
            });
          });
        }, onError: (Object err) {
          if (!mounted) return;
          print('got err: $err');
          setState(() {
            if (err is FormatException) {
            } else {}
          });
        });
      } catch (e) {}
    }
  }

  void showToast(
      String? msg, {
        Duration? duration = const Duration(seconds: 2, milliseconds: 500),
        bool? dismissOnTap = true,
      }) {
    if (null == msg) return;
    configEasyLoading(true);
    EasyLoading.showToast(
      msg,
      duration: duration,
      dismissOnTap: dismissOnTap,
    );
  }

  void configEasyLoading([bool isToast = false]) {
    EasyLoading.instance
      ..loadingStyle = EasyLoadingStyle.custom
      ..backgroundColor = Colors.transparent
      ..contentPadding = EdgeInsets.zero
      ..radius = 8
      ..fontSize = 0
      ..textStyle = const TextStyle(height: 0, fontSize: 0)
      ..textPadding = EdgeInsets.zero
      ..displayDuration = const Duration(seconds: 2, milliseconds: 500);
      // ..indicatorWidget = LoadStatusWidget(
      //   borderRadius: BorderRadius.circular(EasyLoading.instance.radius),
      // );

    if (isToast) {
      EasyLoading.instance
        ..textStyle = const TextStyle(
          height: 22 / 14,
          fontSize: 14,
          color: Colors.white,
        )
        ..contentPadding = const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
    }
  }

  /// 推链
  Future<TxSignature> sendTransaction(dynamic signedTx) async {
    String strSign = Uri.decodeComponent(signedTx);
    TxSignature retSign =
        await MySolanaClient('https://api.mainnet-beta.solana.com')
            .sendTransactionWithBase64(strSign);
    return retSign;
  }

  Widget madeTextFiled(
      {required TextEditingController controller, String hintText = ''}) {
    return Padding(
      padding: EdgeInsets.only(left: 16, right: 16),
      child: TextField(
          controller: controller,
          keyboardType: TextInputType.text,
          decoration: InputDecoration(
            border: UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.red, width: 1)),
            enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.grey, width: 1)),
            hintText: hintText,
          )),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            madeTextFiled(controller: _adrsCtrl, hintText: 'wallet address'),
            madeTextFiled(controller: _amountCtrl, hintText: 'Token address (not required for sol)'),
            madeTextFiled(controller: _titleCtrl, hintText: 'say something...'),
            madeTextFiled(controller: _msgCtrl, hintText: 'mark message'),
            SizedBox(
              height: 20,
            ),
            Visibility(
              visible: true,
              child: Padding(
                padding: EdgeInsets.only(left: 16, right: 16),
                child: Text(
                  'Send parameter：$_strSendScheme',
                ),
              ),
            ),
            SizedBox(
              height: 10,
            ),
            Padding(
                padding: EdgeInsets.only(left: 16, right: 16),
                child: Text('Recived parameter：$_strRecvSign')),
            SizedBox(
              height: 50,
            ),
            FloatingActionButton(
              onPressed: _sendScheme,
              tooltip: 'Send scheme',
              child: Icon(Icons.sports_kabaddi),
            ), //
          ],
        ),
      ),
    );
  }
}
