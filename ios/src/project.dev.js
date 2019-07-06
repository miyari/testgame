window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ExPopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4f966ynHixFzLAiGHhZAbTA", "ExPopup");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.maskNode = null;
        _this.contentNode = null;
        _this.btnClose = null;
        _this.destroyOnClose = false;
        _this._oriOpacity = null;
        return _this;
      }
      NewClass.prototype.onLoad = function() {
        var _this = this;
        null == this.maskNode && (this.maskNode = this.node.getChildByName("Mask"));
        null == this.contentNode && (this.contentNode = this.node.getChildByName("Content"));
        null == this.btnClose && (this.btnClose = this.node.getChildByName("BtnClose"));
        this._oriOpacity = this.maskNode.opacity;
        this.btnClose && this.btnClose.on(cc.Node.EventType.TOUCH_END, function() {
          _this.hide();
        });
      };
      NewClass.prototype.start = function() {};
      NewClass.prototype.onEnable = function() {
        this.show();
      };
      NewClass.prototype.show = function() {
        this.maskNode.opacity = 0;
        this.contentNode.scale = .2;
        var maskAction = cc.fadeTo(.5, this._oriOpacity);
        var contentAction = cc.scaleTo(.2, 1);
        contentAction.easing(cc.easeBackOut());
        this.maskNode.runAction(maskAction);
        this.contentNode.runAction(contentAction);
      };
      NewClass.prototype.hide = function() {
        var _this = this;
        this.maskNode.opacity = 0;
        var contentAction = cc.scaleTo(.2, 0);
        contentAction.easing(cc.easeBackIn());
        this.contentNode.runAction(contentAction);
        this.scheduleOnce(function() {
          _this.destroyOnClose ? _this.node.destroy() : _this.node.active = false;
        }, .2);
      };
      __decorate([ property(cc.Node) ], NewClass.prototype, "maskNode", void 0);
      __decorate([ property(cc.Node) ], NewClass.prototype, "contentNode", void 0);
      __decorate([ property(cc.Node) ], NewClass.prototype, "btnClose", void 0);
      __decorate([ property(cc.Boolean) ], NewClass.prototype, "destroyOnClose", void 0);
      __decorate([ property ], NewClass.prototype, "_oriOpacity", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  HotUpdate: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ced76JqSqRBYbJcM6B076sR", "HotUpdate");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var HotUpdate = function(_super) {
      __extends(HotUpdate, _super);
      function HotUpdate() {
        var _this_1 = null !== _super && _super.apply(this, arguments) || this;
        _this_1.manifestUrl = null;
        _this_1._updating = false;
        _this_1._canRetry = false;
        _this_1._storagePath = "";
        _this_1._updateListener = null;
        _this_1._am = null;
        _this_1._failCount = 0;
        _this_1.wrapper = null;
        _this_1.countLabel = null;
        _this_1.progressBar = null;
        _this_1.versionCompareHandle = null;
        _this_1.remoteVersion = "";
        _this_1._localVersion = "";
        return _this_1;
      }
      HotUpdate.prototype.onLoad = function() {};
      HotUpdate.prototype.start = function() {
        try {
          if (!cc.sys.isNative) {
            cc.log("Hot update is only available in Native build ,now is not ");
            return;
          }
          this._localVersion = "105";
          this.updateResource();
          this.handleManifestFile("http://127.0.0.1:3000/hotupdate/ios/");
          this.checkUpdate();
        } catch (e) {
          cc.log(e);
        }
      };
      HotUpdate.prototype.updateResource = function() {
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "update" + this._localVersion;
        cc.log("[updateResource] Storage path for remote asset : " + this._storagePath);
        var _this = this;
        this.versionCompareHandle = function(versionA, versionB) {
          SETTINGS.hotUpdateVersion = versionA;
          SETTINGS.save();
          _this.remoteVersion = versionB;
          cc.log("JS Custom Version Compare: version A is " + versionA + ", version B is " + versionB);
          var vA = versionA.split(".");
          var vB = versionB.split(".");
          for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) continue;
            return a - b;
          }
          return vB.length > vA.length ? -1 : 0;
        };
        this._am = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle);
        this._am.setVerifyCallback(function(path, asset) {
          var compressed = asset.compressed;
          var expectedMD5 = asset.md5;
          var relativePath = asset.path;
          var size = asset.size;
          if (compressed) {
            cc.log("Verification passed : " + relativePath);
            return true;
          }
          cc.log("Verification passed : " + relativePath + " (" + expectedMD5 + ")");
          return true;
        });
        cc.log("[HotUpdate] is ready, please check or directly update.");
        if (cc.sys.os === cc.sys.OS_ANDROID) {
          this._am.setMaxConcurrentTask(2);
          cc.log("Max concurrent tasks count have been limited to 2");
        }
      };
      HotUpdate.prototype.handleManifestFile = function(newUrl) {
        cc.log("[HOTUPDATE] newUrl: " + newUrl);
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          var manifestString = jsb.fileUtils.getStringFromFile(this._storagePath + "/project.manifest");
          0 === manifestString.length && (manifestString = jsb.fileUtils.getStringFromFile(this.manifestUrl.nativeUrl));
          var obj = JSON.parse(manifestString);
          obj.packageUrl = newUrl;
          obj.remoteManifestUrl = newUrl + "project.manifest";
          obj.remoteVersionUrl = newUrl + "version.manifest";
          var afterString = JSON.stringify(obj);
          cc.log("remoteVersionUrl: ", obj.remoteVersionUrl);
          var manifest = new jsb.Manifest(afterString, this._storagePath);
          this._am.loadLocalManifest(manifest, this._storagePath);
        }
      };
      HotUpdate.prototype.checkCb = function(event) {
        cc.log("Code: " + event.getEventCode());
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          cc.log("No local manifest file found, hot update skipped.");
          this.wrapper.active = false;
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log("Fail to download manifest file, hot update skipped.");
          this.wrapper.active = false;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          cc.log("Already up to date with the latest remote version.");
          this.wrapper.active = false;
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          cc.log("New version found, please try to update.");
          this.progressBar.fillRange = 0;
          break;

         default:
          return;
        }
        this._am.setEventCallback(null);
        this._updating = false;
        if (event.getEventCode() === jsb.EventAssetsManager.NEW_VERSION_FOUND) {
          this.wrapper.active = true;
          this.hotUpdate();
        }
      };
      HotUpdate.prototype.updateCb = function(event) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          cc.log("No local manifest file found, hot update skipped.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          var totalFiles = event.getTotalFiles();
          var downloadedFiles = event.getDownloadedFiles();
          if (totalFiles >= 0 && downloadedFiles > 0) {
            var progress = downloadedFiles / totalFiles;
            this.countLabel.string = (100 * progress).toFixed(2) + "% (" + downloadedFiles + "/" + totalFiles + ")";
            this.progressBar.fillRange = progress;
          } else this.countLabel.string = "0%";
          var msg = event.getMessage();
          msg && cc.log("Updated file: " + msg);
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log("[ERROR_PARSE_MANIFEST] Fail to download manifest file, hot update skipped.");
          failed = true;
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          cc.log("Already up to date with the latest remote version.");
          failed = true;
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          cc.log("Update finished. " + event.getMessage());
          this.countLabel.string = "100% \u66f4\u65b0\u5b8c\u6210\uff0c\u904a\u6232\u91cd\u65b0\u555f\u52d5\u4e2d...";
          needRestart = true;
          SETTINGS.hotUpdateVersion = this.remoteVersion;
          SETTINGS.save();
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          cc.log("Update failed. " + event.getMessage());
          this._updating = false;
          this._canRetry = true;
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          cc.log(event.getMessage());
        }
        if (failed) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          this._updating = false;
          this.retry();
        }
        if (needRestart) {
          this._am.setEventCallback(null);
          this._updateListener = null;
          var searchPaths = jsb.fileUtils.getSearchPaths();
          var newPaths = this._am.getLocalManifest().getSearchPaths();
          cc.log("[newPaths] " + JSON.stringify(newPaths));
          Array.prototype.unshift.apply(searchPaths, newPaths);
          cc.log("[searchPaths] " + JSON.stringify(searchPaths));
          cc.sys.localStorage.setItem("HotUpdateSearchPaths" + this._localVersion, JSON.stringify(searchPaths));
          jsb.fileUtils.setSearchPaths(searchPaths);
          cc.audioEngine.stopAll();
          cc.log("[hotupdate][done] restart game");
          if (sdkbox.IAP) {
            cc.log(" clean sdkbox iap");
            sdkbox.IAP.setListener({});
          }
          this.scheduleOnce(function() {
            cc.game.restart();
          }, 3);
        }
      };
      HotUpdate.prototype.retry = function() {
        if (!this._updating && this._canRetry) {
          this._canRetry = false;
          cc.log("Retry failed Assets...");
          this._am.downloadFailedAssets();
        }
      };
      HotUpdate.prototype.checkUpdate = function() {
        cc.log("[hotupdate] checkUpdate");
        if (this._updating) {
          cc.log("Checking or updating ...");
          return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
          cc.log("[hotupdate] loadLocalManifest");
          var url = this.manifestUrl.nativeUrl;
          cc.loader.md5Pipe && (url = cc.loader.md5Pipe.transformURL(url));
          this._am.loadLocalManifest(url);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
          cc.log("Failed to load local manifest ...");
          return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
      };
      HotUpdate.prototype.hotUpdate = function() {
        cc.log("[hotUpdate] bootup");
        if (null === this._am || this._updating) this.countLabel.string = "[hotUpdate] error"; else {
          cc.log("[hotUpdate] begin");
          this._am.setEventCallback(this.updateCb.bind(this));
          if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            var url = this.manifestUrl.nativeUrl;
            cc.loader.md5Pipe && (url = cc.loader.md5Pipe.transformURL(url));
            this._am.loadLocalManifest(url);
          }
          this._failCount = 0;
          this._am.update();
          this._updating = true;
        }
      };
      HotUpdate.prototype.onDestroy = function() {
        if (this._updateListener) {
          this._am.setEventCallback(null);
          this._updateListener = null;
        }
      };
      __decorate([ property({
        type: cc.Asset
      }) ], HotUpdate.prototype, "manifestUrl", void 0);
      __decorate([ property ], HotUpdate.prototype, "_updating", void 0);
      __decorate([ property ], HotUpdate.prototype, "_canRetry", void 0);
      __decorate([ property ], HotUpdate.prototype, "_storagePath", void 0);
      __decorate([ property ], HotUpdate.prototype, "_updateListener", void 0);
      __decorate([ property ], HotUpdate.prototype, "_am", void 0);
      __decorate([ property ], HotUpdate.prototype, "_failCount", void 0);
      __decorate([ property(cc.Node) ], HotUpdate.prototype, "wrapper", void 0);
      __decorate([ property(cc.Label) ], HotUpdate.prototype, "countLabel", void 0);
      __decorate([ property(cc.Sprite) ], HotUpdate.prototype, "progressBar", void 0);
      __decorate([ property ], HotUpdate.prototype, "versionCompareHandle", void 0);
      __decorate([ property ], HotUpdate.prototype, "remoteVersion", void 0);
      __decorate([ property ], HotUpdate.prototype, "_localVersion", void 0);
      HotUpdate = __decorate([ ccclass ], HotUpdate);
      return HotUpdate;
    }(cc.Component);
    exports.default = HotUpdate;
    cc._RF.pop();
  }, {} ],
  IAP: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "273d1RLHsROVaoa8xIGY95y", "IAP");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this_1 = null !== _super && _super.apply(this, arguments) || this;
        _this_1.iapInfo = null;
        return _this_1;
      }
      NewClass.prototype.onLoad = function() {
        this.init();
      };
      NewClass.prototype.init = function() {
        var _this_1 = this;
        cc.log("[IAP] init");
        if (cc.sys.isNative) {
          var _this = this;
          sdkbox.IAP.setDebug(true);
          sdkbox.IAP.setListener({
            onInitialized: function(success) {
              cc.log("[onInitialized]", JSON.stringify(success));
            },
            onSuccess: function(p) {
              var _this = _this_1;
              cc.log("[onSuccess]", JSON.stringify(p));
            },
            onFailure: function(p, msg) {
              cc.log("[onFailure]");
              cc.log(JSON.stringify(p), msg);
              cc.log("\u8cfc\u8cb7\u5931\u6557");
            },
            onCanceled: function(p) {
              cc.log("[onCanceled]", JSON.stringify(p));
              cc.log("\u8cfc\u8cb7\u5931\u6557");
            },
            onRestored: function(p) {
              cc.log("[onRestored]", JSON.stringify(p));
            },
            onProductRequestSuccess: function(products) {
              _this_1.iapInfo.string = JSON.stringify(products);
              cc.log("[onProductRequestSuccess]", JSON.stringify(products));
            },
            onProductRequestFailure: function(msg) {
              cc.log("\u8cfc\u8cb7\u5931\u6557 " + JSON.stringify(msg));
              cc.log("[onProductRequestFailure]", JSON.stringify(msg));
            }
          });
          cc.log("[sdkbox] init");
          sdkbox.IAP && sdkbox.IAP.init();
        }
      };
      NewClass.prototype.purchase = function(event, rawData) {
        cc.log("[IAP] purchaseing ", rawData);
        sdkbox.IAP.purchase(rawData);
      };
      __decorate([ property(cc.Label) ], NewClass.prototype, "iapInfo", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  NativeController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3f0bflTECNHg4YEnyhUAEsi", "NativeController");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var NativeController = function() {
      function NativeController() {}
      NativeController.prototype.nativeClipBoard = function(str) {
        cc.sys.isNative && jsb.copyTextToClipboard(str);
      };
      NativeController.prototype.nativeGetDeviceId = function() {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
          var ret = jsb.reflection.callStaticMethod("NativeController", "getIdfa");
          cc.log(ret);
          return ret;
        }
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
          var deviceid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceId", "()Ljava/lang/String;");
          cc.log(deviceid);
          return deviceid;
        }
        return "";
      };
      NativeController.prototype.nativeGetAppId = function() {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
          var ret = jsb.reflection.callStaticMethod("NativeController", "getAppId");
          cc.log(ret);
          return ret;
        }
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
          var ret = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAppid", "()Ljava/lang/String;");
          cc.log(ret);
          return ret;
        }
        return "";
      };
      NativeController.prototype.keepScreenOn = function() {
        cc.sys.isNative && jsb.Device.setKeepScreenOn(true);
      };
      NativeController.prototype.saveToPhotoAlbum = function(imgPath) {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
          var ret = jsb.reflection.callStaticMethod("NativeController", "saveToPhotoAlbum:", imgPath);
          cc.log("[Native] saveToPhotoAlbum");
          return ret;
        }
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
          jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "saveToPhotoAlbum", "(Ljava/lang/String;)V", imgPath);
          cc.log("[Native] saveToPhotoAlbum");
        }
      };
      NativeController.prototype.selectPhotoFromAlbum = function() {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
          var ret = jsb.reflection.callStaticMethod("NativeController", "openPhoto");
          cc.log("[Native] selectPhotoFromAlbum");
          return ret;
        }
      };
      NativeController.prototype.cropPicturesCallback = function(purpose, url) {
        cc.log("[cropPicturesCallback] purpose: " + purpose + " url: " + url);
      };
      NativeController.instance = new NativeController();
      return NativeController;
    }();
    exports.default = NativeController;
    cc._RF.pop();
  }, {} ],
  Scrape: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8f562+nYxFI95JhYmP79WfG", "Scrape");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        mask: {
          default: null,
          type: cc.Mask,
          tooltip: "\u9700\u8981\u522e\u5f00\u7684"
        },
        scrapteRadiusX: {
          default: 25,
          type: cc.Float,
          tooltip: "\u7ed8\u5236\u70b9\u56fe\u5f62\u7684x\u8f74\u534a\u5f84"
        },
        scrapteRadiusY: {
          default: 35,
          type: cc.Float,
          tooltip: "\u7ed8\u5236\u70b9\u56fe\u5f62\u7684Y\u8f74\u534a\u5f84"
        },
        scrapteArea: {
          default: .5,
          type: cc.Float,
          tooltip: "\u9700\u8981\u522e\u5f00\u7684\u56fe\u5c42\u9762\u79ef\u7684\u591a\u5c11"
        },
        scrapeEvents: {
          default: [],
          type: [ cc.Component.EventHandler ],
          tooltip: "\u64e6\u9664\u5b8c\u6210\u540e\u6240\u89e6\u53d1\u7684\u4e8b\u4ef6"
        }
      },
      onLoad: function onLoad() {
        this.activeMaskNode();
      },
      activeMaskNode: function activeMaskNode() {
        this.getinitNum();
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
      },
      endScrape: function endScrape() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
      },
      _onTouchBegin: function _onTouchBegin(event) {
        cc.log("touchBegin");
        this.comFun(event);
      },
      _onTouchMoved: function _onTouchMoved(event) {
        this.comFun(event);
      },
      _onTouchEnd: function _onTouchEnd(event) {
        cc.log("touchEnd");
        this.checkScrape();
        this.comFun(event);
      },
      _onTouchCancel: function _onTouchCancel(event) {
        cc.log("TouchCancel");
        this.checkScrape();
      },
      onDestroy: function onDestroy() {
        this.endScrape();
      },
      comFun: function comFun(event) {
        var point = this.getPos(event);
        this.checkPixelPiont(point);
        this._addCircle(point);
      },
      _addCircle: function _addCircle(point) {
        var graphics = this.mask._graphics;
        var color = cc.color(0, 0, 0, 255);
        graphics.ellipse(point.x, point.y, 2 * this.scrapteRadiusX, 2 * this.scrapteRadiusY);
        graphics.lineWidth = 2;
        graphics.fillColor = color;
        graphics.fill();
      },
      checkScrape: function checkScrape() {
        cc.log("\u76ee\u6807\u6570\u662f\uff1a" + this.achieveNum);
        cc.log("\u73b0\u5728\u5df2\u7ecf\u522e\u5f00" + this.pixelNum);
        if (this.achieveNum < this.pixelNum) {
          cc.log("\u5df2\u7ecf\u522e\u5b8c\u56fe\u5c42");
          this.achieveScrape();
        }
      },
      getPos: function getPos(e) {
        var point = e.touch.getLocation();
        point = this.node.convertToNodeSpaceAR(point);
        return point;
      },
      getinitNum: function getinitNum() {
        this.pixelNum = 0;
        this.achieveNum = this.scrapteArea * this.initPixel();
      },
      initPixel: function initPixel() {
        this.scrapeNode = this.mask.node.children[0];
        var x = this.scrapeNode.width, y = this.scrapeNode.height;
        this.node.width = x;
        this.node.height = y;
        this.widthWide = x / 2 + 20;
        this.heightWide = x / 2 + 20;
        var zx = x / 2, zy = y / 2, dx = -zx, dy = -zy, dy1 = dy;
        var pixelPiont = [];
        var rx = 2 * this.scrapteRadiusX;
        var ry = 2 * this.scrapteRadiusY;
        for (;dx <= zx; dx += rx) for (dy = dy1; dy <= zy; dy += ry) {
          var p = [ dx, dy ];
          p.isTouch = true;
          pixelPiont.push(p);
        }
        this.pixelPiont = pixelPiont;
        return pixelPiont.length;
      },
      checkPixelPiont: function checkPixelPiont(point) {
        var pixelPiont = this.pixelPiont;
        var x, y;
        for (var i in pixelPiont) {
          x = Math.abs(point.x - pixelPiont[i][0]);
          y = Math.abs(point.y - pixelPiont[i][1]);
          if (x <= this.scrapteRadiusX && y <= this.scrapteRadiusY && pixelPiont[i].isTouch) {
            pixelPiont[i].isTouch = false;
            this.pixelNum++;
            return;
          }
        }
      },
      achieveScrape: function achieveScrape() {
        var _this = this;
        this.endScrape();
        this.mask.node.runAction(cc.fadeOut(.5));
        this.scheduleOnce(function() {
          cc.Component.EventHandler.emitEvents(_this.scrapeEvents, new cc.Event.EventCustom("scrapeEvents"));
        }.bind(this), .6);
      }
    });
    cc._RF.pop();
  }, {} ],
  Scratch: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9a2b3NxjIhMvIrYV3OhkztP", "Scratch");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.mask = null;
        _this.scrapteRadiusX = 30;
        _this.scrapteRadiusY = 30;
        _this.scrapteArea = .5;
        _this.pixelNum = 0;
        _this.achieveNum = 0;
        _this.pixelPiont = null;
        _this.scrapeEvents = [];
        return _this;
      }
      NewClass.prototype.onLoad = function() {
        this.init();
        window.SCRATCH = this;
      };
      NewClass.prototype.onDestroy = function() {
        this.endScrape();
      };
      NewClass.prototype.init = function() {
        this.getinitNum();
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
      };
      NewClass.prototype.endScrape = function() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchBegin, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoved, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
      };
      NewClass.prototype.getinitNum = function() {
        this.pixelNum = 0;
        this.achieveNum = this.scrapteArea * this.initPixel();
      };
      NewClass.prototype.initPixel = function() {
        var maskNode = this.mask.node.children[0];
        var x = maskNode.width, y = maskNode.height;
        var zx = x / 2, zy = y / 2, dx = -zx, dy = -zy, dy1 = dy;
        var pixelPiont = [];
        var rx = 2 * this.scrapteRadiusX;
        var ry = 2 * this.scrapteRadiusY;
        for (;dx <= zx; dx += rx) for (dy = dy1; dy <= zy; dy += ry) {
          var p = [ dx, dy ];
          p.isTouch = true;
          pixelPiont.push(p);
        }
        this.pixelPiont = pixelPiont;
        return pixelPiont.length;
      };
      NewClass.prototype._onTouchBegin = function(event) {
        this.comFun(event);
      };
      NewClass.prototype._onTouchMoved = function(event) {
        this.comFun(event);
      };
      NewClass.prototype._onTouchEnd = function(event) {
        this.checkScrape();
        this.comFun(event);
      };
      NewClass.prototype._onTouchCancel = function(event) {
        cc.log("TouchCancel");
        this.checkScrape();
      };
      NewClass.prototype.comFun = function(event) {
        var point = event.touch.getLocation();
        point = this.mask.node.convertToNodeSpaceAR(point);
        this.checkPixelPiont(point);
        this._addCircle(point);
      };
      NewClass.prototype.checkScrape = function() {
        cc.log("\u5df2\u7ecf\u522e\u5f00: " + this.pixelNum + "/" + this.achieveNum);
        if (this.achieveNum < this.pixelNum) {
          cc.log("[\u5df2\u7ecf\u522e\u5b8c\u56fe\u5c42]");
          this.achieveScrape();
        }
      };
      NewClass.prototype.checkPixelPiont = function(point) {
        var pixelPiont = this.pixelPiont;
        var x, y;
        for (var i in pixelPiont) {
          x = Math.abs(point.x - pixelPiont[i][0]);
          y = Math.abs(point.y - pixelPiont[i][1]);
          if (x <= 2 * this.scrapteRadiusX && y <= 2 * this.scrapteRadiusY && pixelPiont[i].isTouch) {
            pixelPiont[i].isTouch = false;
            this.pixelNum++;
            return;
          }
        }
      };
      NewClass.prototype.achieveScrape = function() {
        var _this = this;
        this.endScrape();
        this.mask.node.runAction(cc.fadeOut(.5));
        this.scheduleOnce(function() {
          cc.Component.EventHandler.emitEvents(_this.scrapeEvents, new cc.Event.EventCustom("scrapeEvents"));
        }.bind(this), .6);
      };
      NewClass.prototype._addCircle = function(point) {
        var graphics = this.mask._graphics;
        var color = cc.color(0, 0, 0, 255);
        graphics.ellipse(point.x, point.y, 2 * this.scrapteRadiusX, 2 * this.scrapteRadiusY);
        graphics.lineWidth = 2;
        graphics.fillColor = color;
        graphics.fill();
      };
      __decorate([ property({
        type: cc.Mask,
        tooltip: "\u9700\u8981\u522e\u5f00\u7684mask"
      }) ], NewClass.prototype, "mask", void 0);
      __decorate([ property({
        tooltip: "\u7ed8\u5236\u70b9\u56fe\u5f62\u7684x\u8f74\u534a\u5f84"
      }) ], NewClass.prototype, "scrapteRadiusX", void 0);
      __decorate([ property({
        tooltip: "\u7ed8\u5236\u70b9\u56fe\u5f62\u7684y\u8f74\u534a\u5f84"
      }) ], NewClass.prototype, "scrapteRadiusY", void 0);
      __decorate([ property({
        tooltip: "\u9700\u8981\u522e\u5f00\u7684\u56fe\u5c42\u9762\u79ef\u7684\u767e\u5206\u6bd4"
      }) ], NewClass.prototype, "scrapteArea", void 0);
      __decorate([ property ], NewClass.prototype, "pixelNum", void 0);
      __decorate([ property ], NewClass.prototype, "achieveNum", void 0);
      __decorate([ property ], NewClass.prototype, "pixelPiont", void 0);
      __decorate([ property({
        type: [ cc.Component.EventHandler ],
        tooltip: "\u64e6\u9664\u5b8c\u6210\u540e\u6240\u89e6\u53d1\u7684\u4e8b\u4ef6"
      }) ], NewClass.prototype, "scrapeEvents", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {} ],
  Test: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a8bb2BabvZEv6mWgUD7VqjI", "Test");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var NativeController_1 = require("./NativeController");
    var NewClass = function(_super) {
      __extends(NewClass, _super);
      function NewClass() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.testSprite = null;
        return _this;
      }
      NewClass.prototype.onClick = function(event) {
        cc.log(NativeController_1.default.instance.selectPhotoFromAlbum());
      };
      NewClass.prototype.onClick2 = function(event) {
        var _this = this;
        cc.loader.load("http://d.lanrentuku.com/down/png/1904/international_food/fried_rice.png", function(err, texture) {
          _this.testSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
      };
      __decorate([ property(cc.Sprite) ], NewClass.prototype, "testSprite", void 0);
      NewClass = __decorate([ ccclass ], NewClass);
      return NewClass;
    }(cc.Component);
    exports.default = NewClass;
    cc._RF.pop();
  }, {
    "./NativeController": "NativeController"
  } ]
}, {}, [ "IAP", "NativeController", "Scrape", "Scratch", "Test", "HotUpdate", "ExPopup" ]);
//# sourceMappingURL=project.dev.js.map