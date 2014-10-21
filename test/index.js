var Readable = require('readable-stream').Readable
var inherits = require('inherits')
var ListStream = require('list-stream')
var test = require('tape')
var through = require('through2')
var us = require('../')

test('Testing utxo unserializing stream', function (t) {
  t.plan(1)

  var fs = new FixtureStream()

  fs.pipe(us())
    .pipe(ListStream.obj(function (err, data) {
      if (err)
        throw err
      t.equal(data.length, 293)
    }))

})

function FixtureStream () {
  if (!(this instanceof FixtureStream))
    return new FixtureStream()
  Readable.call(this, { objectMode: true })
}

inherits(FixtureStream, Readable)

var i = 0
var tx = [
  // this one is non-standard, doesn't work for now because needs a script parser.
  //{ key: new Buffer('6322300a976c1f0f6bd6172ded8cb76c23f6e57d3b19e9ff1f403990e70acf1956', 'hex'),
    //value: new Buffer('01123001816e1fa7011414da39a3ee5e6b4b0d3255bfef95601890afd8070987600b630150685184560c6301ee675168837c1fa6011414f71c27109c692c1b56bbdceb5b9d2865b3708dbc878310', 'hex')
  //},
  { key: new Buffer('6300170475112200e8b1544545949ad14fd81d475fdc12813582262096f6f7914d', 'hex'),
    value: new Buffer('0106b9c1ddd25b002fdb00687f9d3d34b254b2d48b6ef8751afcf46ce8e0e2dd1d003820cf89fd3f6c27d0dc39620aa3f620c58df03681d110', 'hex')
  },
  { key: new Buffer('6300000136ea56f3b0ee8fbb13059cbd4521ba38074fd9832a86f4335cd7d2267c', 'hex'),
    value: new Buffer('010332003bf58224ccd41bd4c94bf0d4a711fc4e1187887c80b021', 'hex')
  },
  { key: new Buffer('630000104fbfb34ef6c699cf1ec1f0f8e8da9c6bb71d81ca1c2e449529c86b815c', 'hex'),
    value: new Buffer('018126ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff808027000b4d2d0c2252ede24fd76f0d242903d5758697b8808027002b84244b8288829e961362ce86244d50328caa2180802700cf0e6d5d31f284585bd3fb0fd1c290f092e7e25580802700cca4d7bbfe7bccf67f6f8edc90bc3adbaef8ca69808027004b268897c7ce19a4bc8dbfe095c9b44bfb743dba80802700e8836583a078fc6fa42f36a81c9dfd4ed7957e0280802700e9a663a45612c6ea2c8dd518c86630f6bebd5b5b8080270047434dc93acdddd10f7949abd2ba07cc9523f3668080270049f393dac0be97a1cd80b513f514e2c34b36cd7b808027000b119d0f000ed0dad429e2866a7eb71a7785537680802700c71be8a18620fe0c8b22bffc6d60c917428ab5f180802700b961a8c9ecb51a6fe150d154c7230e2b4b432663808027008df10d3bbc24c72ecc90537174d3e6fcd6ff264180802700ce6bc90ac58b1ce2b8e51aee8fdd8ea760cc2132808027009d28650df096f2b109537274a698135e602ab36680802700c98cb0d1df1ff1058c771b8d188f00426ae3c5d7808027007f4b5a506cf453fb6a5668d2dad6e2e1e91c41828080270084cb99ad38f78bae0068f9ba7847db357568d76a808027001d50f5fe886bfbd33492c2acd684b906fa82051b80802700f4566e4fbd0b1e856550c7093265794a5e13b6fb80802700a80efd58eb6b49431c77ddf0820b4361bc42bc6780802700bed829e83f60cf68101f975b6201d106e102b77e8080270022b217d3522a1bed412b5c61fe44af47e839f6a78080270032a88ce3479048457e3755a64987201e7a0ec31680802700f45f3692b6d363109251bdcbff0fe8c041faaedf8080270021daa639132c42f51b2e0187153b3ff4f1bcde1280802700a8e5e8fbee54d5ff6dfe6589b7890245ca943ecb80802700cce262f3332bb9ea593cb41e4bc02c606e69a75380802700e1b6a1b1d120bc6ab10b03b158f2601ff75ad887808027001f47764761dd59e09127d7c91a61e5d140ccf40b808027004e7f25b8cbf91d41b42bcd16cc84a79865717b2e80802700779d30d01892e3ab3d948ac30e2f5f61f4bb3ef1808027000d99fbf09b353ed9fb29f935f029caa5d5b2dea2808027001c91dec978f9b2b5f99658ba4f60c33796c13e9b808027002c6c2cfac313885cae926ff6e4e1b06feca2ed7980802700b7d6974a92bf7a829efc1726da161480e2ae865680802700061872f36105253f0fb6f034e7cfb97d1accf0498080270046ed8d6f9b36651c975b8c0d5ac139fec154c5d080802700e6e14ce90db0ba3510c07427be65895a090914ab80802700550573ae588f550f97e1f96a44bd34d9e878d8ff80802700bfd9f87023c90660427516888a1fa7bf6861d25f8080270047ff7dc7b1051739cacc92840b5ba180daf4f3828080270021cd4ef353d190583063053b11991831b0aa22d6808027007cf22013ca984a19829e90948845e00b4451833180802700597e6d2399b9b86425b830d02840496fc56ec555808027004489fa423369f3c2dcc3e63c3d63fff2843f291880802700868b0c0f77b6087ab0a2485193a669a83d23a0cf80802700b9ca8a53841b9261cb1fdfdb50830ee1d62f0d3380802700159de7f38f9ed79dce4fdc97d6340e2e53b990e38080270083220ab9d042ff3fc37c01941dc9521a91d3c62e80802700a1c3226fe268f45de52420de4202354bda4cfb908080270092445e658752d2235c2ade365fe6531529abe47780802700b7816b9b1a98eb357cb227448b4c62a627a8b7bf8080270074ba4a4e62a5f7a9a6ad483fbcbf182a1828446180802700d7ba09e392f6d88df1a2c8188460d1cb97055c398080270042beff501f46ddb34135f06d581d782e89ebe12e80802700c1b04d3e54367070ca915f7706ba88b6873ae9f980802700bfdeffe835b58a00bd789181250ef0f011cdc8ec80802700c65e090bc2d162bf30d273990c278d77144fa28580802700e36144be8e0512ac3a13b0be68d24469fe489b3e80802700124867a83093ea5416f5350ac8cc72e3cc079b2780802700402fbb009a35e0a11f28b9bd522788250cf11aca8080270093e637b27070b58dbe64b60895d33b9dd019b9f9808027007f341eaa8bcbf7e831b7f4a829d9de25a5491d3380802700d258c281189df3156bc17a69950df9055c12f8d680802700751a95f9aa03dd9894a58e7ed748f7632fb583c2808027006e0a323cd9bd3084d3d839fafd8ef523f9a25d7980802700cbfd7ecb57661298e9be63eb1df29b47c457b3748080270014d5af2a21588c1bbd79afbe711a838b320ee058808027001ddeb2e13a9885db03a87a4a56288337f58d4b418080270040d083bafc5fd57cdddfd5e3a0f65191229729f580802700c60b10e2bec917f43e8774a76fb05a35bd78aac8808027000f344ddef3b14367836b5dba70c3941829b3ff188080270091a900f713efa2d03d4c1a43bf14d3f4d6cbf57780802700f907953927b148676d11f20233f51098163391eb808027009c5bfc65d6315c5ec3b2f876efa03b673a4a076580802700de23bb5d5eeaaa7409db27bbdad764063c9dc98b808027003732ade6f75b7542ce03f051bc41fbecd781e0dd80802700b5410729bac8504fca8bac4b2283864c1afba278808027002e457801ab1436f10b083216aa86e56c4e6d89338080270001e1406cd90d2af3e73a78584eeb19b4215b6f5c8080270030636a6e7f5d5f36d72f6dd7d6ac82b39a92c1ba808027008d100112c939482f274536d62f800ebbb07aaabb808027007ce9609d0db5f416337b40172c8db9e03ea7a9bb8080270062bd9916bde6b1681a547acb70a85558cda6d4108080270049569084240c16c37737394cc7149c3601f453a380802700429b495933b90b52532e440ac1816d750a9ca4db80802700595f0e75b89d588737bee9409893368c074001c78080270072463a06250eb88397bf421a28e330d545916af780802700785fac521df93d8adc2095456648b1690e2f82a680802700c4a4f93a158afd0158f3b208bc6a79a1af6c0b988080270062c32ac402621fef2613ed32ce2115ca555d72c780802700710a16d1a0aa77418dc8a2a3a638ab642920942580802700db20d05717f7ed50268ef0e52e3ece732ea678a4808027000bec12369a79206a7d8be016fc6ea729e74784008080270052e8e9a29fb1abdbcd5e2798088f221d6e6f51f9808027009e90168b80ce73ce04eb37f1204f4d4e05859b84808027009265fe56bd74f76555883d39c6df7b9730f8081c80802700e5a11351ed242fd6af4c59fd21b4f57c590697bf80802700d899c3868b8579bb22193e4b21f7d8811ffb9f6c80802700185ff43537899d1ecc9c37acb3af0d2640dcfd5f8080270094c76f84a518fc9d8557ab07e7e7e58cf057aa8b80802700b66325fba582a8a480c34aaf99686b1637cf7b138080270043282e25bb116d6c31571871e5dd22a1933970008080270079b69f1f4d5cfcd7fbf35092992b0ba9825e260080802700aebf272d951f07986bd0ce821173a42de6ac7d2b808027001fd110f8eb4e251cdddc3bd17cc4f33e9f789d668080270060ae696e5f1a819ef99f327b192501883ce82d9080802700ba08a655f71a1818a44cc3b8d67123a2735712de808027003022bcd838c849b1cffde2e17b53474065e753e480802700239416d91f759fe954d4c9a4040b8bdc84ad45ac80802700210335400ce66788c70d1ee55b1c2ccc534a7f2280802700dcc7d1193a1946cd0ad087d84a9461849d8e145c8080270048552a2b52b031ad0b781ffee6ab32379c096f178080270015e69c32f7830bc816561de191a12a71c16fe9fc808027003904a8b1bb71d4b9150e6d8f8a3819f25e5b7d128080270092e20d9670a3fa99a71cd91f785e80631c4125d8808027001674bf2deb7c6be636d9ba2efae2bfe7fc2537a580802700ce52542c5c48c9e38dc770e9c90315b8a6f8f20880802700b3b2dafb137bdc3fad4841394d11a7fb8a0576f980802700a41937610979743d8bb02a22f21dfc59d4d1d27d80802700c259c43cf9be2680dbca536e988b3c998b263626808027000c3deacf7e29af219771a338b1d54b41ae9cb6218080270053e407e04e5b785ad3f632bddce3f729cfe8364780802700653a9b0d399f602c344d0cb8d7252272d5a3e36e80802700b1608419c6a74589952ef9c53b02e1111aaf93cf808027009e66ad8170d1654ef3ad5c73c536a5e315a366e78080270073e1a396bb14dbc6d212f69631da2fbf47c00b0c80802700d020027730f2f4c860190fd043403e0126abd20f80802700d591d704f25cd94475adb31c738bdbf37d23ef7d8080270055abf76d627b2ed749e1fac4934f8427d9d74fdc80802700fc98473092702c361a86bf83bb9fb9c8d36a863c80802700678aa62dfe1e0790a70ea0cfda363292c870d80f808027007c98686899c320051210547f9bfa14d710677e9680802700523206b1efedfef51a118f80b92fef9099a9d4ed80802700819cf15a5f16b8b573b6d3d26289e59e71bd254680802700d20c58458ddd7242581e070bb1212e1b4fcfeeaa80802700fbc923139b52a011616dee8f521ff91ee718659a80802700f3e7ea727f451b81d5fdc63eac8b273b520007f680802700a4b4432e703ecf9cad1c86a5a2edd18b290872f980802700029e3b06b5109b3b11270f431b93b524fb00c98a80802700184d16eb93f48b7275be81ed79cbcb0a28a0fc1780802700584bcaedb885300fad25b65cddbef2aa96fdf1e5808027004826f20861eec92d978110c99688b5b4db617c08808027001cd63f7ed66c873da36e31b947da52d7ed2ef8ce80802700161923d51d4ec26174034a0cb6cecea8ff283f7680802700175eb24faf74608f4c6a04e4fb252216cd0921aa8080270038ffc5999b63c6a8f1e8e2cc0e9d53d03dc814d580802700f384261b2b9d83a3506cf450bc10688b751df99b808027006470ff6995148f987b7ce99e95f678071f4cc174808027000fe194feec496adb883f7daa8e88ae883e54b7c0808027005f014ac9ed15a3700a79390ef00bf298a0e179b6808027004f7a707ca696a9bf0f89ccaf8e9248d8fa35eb1680802700cdcc66c6e1ad07e771eb62f18dd29c516c13c9cb80802700bd11de8abb7eab9e5620b8dcd6b0ce7b546c7eb380802700ee70a842d9d301fdc61b380ea752b72824c0faec8080270091bd00e9b97f3ba98a54406eb36b73ffa684016b8080270034fa274e46db6c52ea7d3799e8cc5c9adfcd2efc8080270011c21e7c3919b642d39efc2d470048f51ffc350d80802700e396f018b70cfc6457424a73d07f2bfc09ca65da80802700bed1116c8251639ca88750ac09e34325c01c396480802700912730a241c159118aae7da30c430bd7ab43415680802700dec27bd29943c198d11243eabfcb8dac8e5e57c480802700c620a455e83d620aa59662d40a4691446f5f5ea8808027005b703d9d282757368ea8b7c953cc5c9592853ead80802700a2f754c3ecceeeaa1e38b9a8d97535ce91efb5e780802700ed5b2afce81c962791e2fde0e6f7e9121422bb4e808027009f1caa6257ad486025f51b620184465d9797d98f80802700979703f1115f4afce51cbf4b8c6e8700fffa3fcb808027003102e3c4e619362c4ed4531b7b4e09c63dd007d680802700e00a5ea8e28929033a4819bff3d30a611f5bd5978080270081417e1c94331f1b232a9db3d552584c918080af80802700178b9c50c89cdb13eb8268862352e9f6b9100394808027000525ef54ce45b2bb10c6a0278a511b2aceeb46a680802700e61d69e662d3bb5c8180fa92e18999bea134b6d68080270000f73d3cc083db6d058e35b241726726210c286e808027002b318736a9e30272ce4036613ecf54bb309b33978080270022663f40ceaefb3bc46b9afe6535fb9162d689bb80802700a83d68a37dfb9e160b0894ee433435a29a67c94980802700042e203ddb53464863f4cd4388d6cf8925ef80de80802700f014e895770036ab72635e529c319ca562861b9c80802700de93d8f7f04a46028453430138905302de94e5c080802700bdd71ee9793cf0c1a8ba1934354d87ccd0309f928080270049b8ecd056a61ca5d6c2154e91e831ac08baffd0808027008e0ea1a523c2a2c36510e5a86d7e95a678b72a778080270062691aaea0c3327f6792b73ed567c0450a772d6d8080270065fb1b91351c76120f62b5d00406ffeb5bb1e8bf8080270034d12eb6412279434b22ad47a04d5aedf49c231380802700a2fbd1e26e700fec6668c277b38cf829efc622528080270051144e9d9ea701502d2ad3ea7421d8a47c607bec80802700fae5ddb4bde0f680c2d5b86e58187ec5f7de8c8b80802700fb49528478975d1eb29bcefa868f3fb6c1837d6880802700917c20597dc3eaedd9926197341d26ac2e292fda80802700528118104d2dc571613093c72c54eb4f5ca1c61b808027000bf9f89edd1cefdf56016f380d8cd1d56f1baa3180802700831de9b654b4282d1b5d7a63ef2831e355e1fc2e80802700db0dda39249f33b26238f6db5014f39d7fd50c4b808027002df494c0af04b0bb35fc78cedc0fd7cd736075d080802700cda3261da45976becb4ee46322898c61436b208580802700115ede43ad507fcc3b8435ccc1a8925499a029c8808027006c389cec9880475cf2aaa254f30656a705b19cd48080270094fdb60a8291b905c7e16250454d38215de0a7e980802700a381e7f47eca56d7e204804a1acf989832a4734980802700a06f843d4c1a066b51698b41db7b0243c9d5573e808027009d58842f7305530ecfdf34036f074221498b4ec280802700c85d5cfbbc4cd62999f30c8f0998d14c6c57e80c80802700dfd4dc8ac340cdbe651f10e04de1093a6384d27680802700df5ef57f320c91248d9ca6c1f6b02029ccca253680802700bb7fc778543bf63fe88728cc526d0bb62050c0b080802700bc3a9cf997958ca84ea21914a1d5b509d2e6a22280802700bb97db8311d14ef5e2651ce8efff24018bb833e0808027005920449dbcc6dd48a00e76b0b0ba509ce1c8a1918080270091a4ba0162084a4f6db8ad703eb310d2d61f8f1780802700ccba2762cb2a30b129df2ee280990b08ae7ffc3180802700a5519663dd37c61514df79b84d18f416162c9d5380802700f57557c54903c5c92e43b2d535f57f80431a1e7d80802700ec2ed4ef2e752a8c0c9979e9e038c11bdaaac3e180802700cfbbcd619bafd57a47e38f218c53a85aa3b9fb0d808027007f3497689cf1e37f017152caada1b6268c2fd32980802700894b42ff47a5925e3ced8901c04614caa65ec4dd808027004c7820d407c33a3189cfdaf859794e99131f55a9808027003d220eaac9412b8baef359ba588c67f018bae0e180802700a034ad4b74a9909f032950d02f30275b883936bb808027005618c41625b5780cc02c60298c00b6276f3096db808027005c151c8d608e22cec2d337f0fc548d6dca306b5f8080270094d3e7b80cb6f4d2f5d7edb8023b25dbc79ae07480802700ac61e9073e31eedc9f544ebf8a85584e6a2040ce80802700127b6a38d9024974630255239967319478de6701808027004990ed66438cc53b47b3ae517a3385b5c95564cc80802700df95f7a5d1e5a44a6dc85919a4fbe5d89e46b79a80802700901fdb8215ab5d90d2dcaa84187afd3cfda03e4b808027007df29b9af7405a276470dac826e7443ed8b0d6658080270043bce08b6019b048412468213514fe9b8e67c6e68080270033624f7e41b7b2b3f01ca643998a6657c1b784a080802700d397c54937b542131a860317f40400a37994233880802700e72ae31da0c375fc1bfffb38ec9de5adce6d1fd680802700f7575ce1f27a782aea3745515eaec8557c7bf899808027006769ae48624033d6319e0cc65c141c9f05612edf80802700ec9de41129d3c4fdf8d17c712e837226a95cf984808027001101fef1ccb2479cf49266a473b4dce3b5d7a9f380802700c55b44fb4e1eb909e3a7d635ef9ce3f8d7ef723d808027002e52ba5396801d7a6aaef71457e79b65e514fa7f808027002a368334ce2b71416057d4396b0cc6605a336fc180802700110c1d291b4544a43167e6eb5029b00f8602bfc280802700f751cd75835844cf1ae1fa1b0f24c93374ce8f6480802700ab26c9b750ad805e51f50ba3f43ab6bdddb6147580802700e8726227308a5be503b809dad8b13573660c3a5e808027008e61d718b4848311072081b2dfed2c094aec1a8980802700b445ca7ed89ff0a2d42f696a7120c11cab62dd598080270043484ea5b36210efce9114bb379cee21a2788bc2808027007b94cdcafafc8a098dfb4ee937704a6677e57980808027007cf1b412c6b950400a70386ba4dbecd3aed526198080270046a81e354efbf90145814e98bc64c66e127dff9c808027008737ba1ab041d76299420aae1254be2cd2a97ab180802700f66de586039d2f8a1edcf444638ab751933ad80480802700b6d837398aa05a459544519ff199727135f092cf80802700abb6bc1df987f0b907b4ce03124a314f2171e94080802700e6b0239fa25c7f1e4a1494bac1add5c65164286980802700c494300d0901f300f2c43314721b6ba60216af5b8080270033a062d58565800bf9f5e51292bbff9ece66532a808027007f1eae8055ec3fcfe550f7bd8ef1520a4b52caae80802700fb23263e023d3e2248e3d425fbdd80365bb1ae718080270077b0273a5d309d9f62599a2974ee2ae9e06eaf018080270091b309ba80a76688be493f369482f26092f18010808027003d933f2f241c64d4746f8ce45216559f55f9c16b80802700f9113ee02000dd340fde44979b3f85c6d8c443db808027003924572b651b30d8c1ccc40ee117fcc18a4afe5280802700b2fe564c35b0ba9c4ce226ea936576ad772f038380802700b2e3e543f9c1d31c271acadf0e0150359ee1965980802700f4ede68b5f58563eec834b420917e107474a833580802700a8c70bb314c9efc7ef2090e2274e571547ef12d780802700347bf8b5cca6fe151c67886842efa7bd62c67820808027009a2a6477d646c5a144bfec4b631c0cb50fd957fc8080270000e5aefc92e50592a77c065bb7a84358eb09cfd58080270075fae1655cdf3e5d980f042b7bf9c2c84995720480802700dbc19756b4751ce89cced4f34e226fdda4ef8a88808027001274be26488f233e7f4d1237e482d19e85a3b4038080270021966cd3fe4480c4a120801f320ff1ce1ddc7c00808027006af5cdb140f556c2f2ee8fc460f6bfcca5d7317e80802700068bcb9a8df4812ab9541676760186e78005033380802700c979d224c8c011fdbdba75fe4fc39584314ba56e808027005064453e54a04b8776b33ba17302a85fc8cf5c6a80802700c8016d8fe583b13a8297f3757d7ef5f4a5fe4c6280802700353127836b8ac41e41889ef029f3fcbe2e9adef6808027008a2cf78b68155f6c2db28dadc4b1034e94cb844a808027002c510bb5bd24c640930060324ebc2150d1fe84c6808027001546db6fdd4680137d18491c4779afd6d5d7756a808027005633235ac059a13843c1b8e2d80b6d942fde312c80802700540497143157b3be849cc1c831c0ad7c9871c1078080270071060611562db7cd89028d9eabc9d3d482b25be68bc830', 'hex')
  }
]

FixtureStream.prototype._read = function () {
  this.push(tx[i++])
}
