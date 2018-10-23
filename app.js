// app.js
App({
  d: {
    hostUrl: 'http://127.0.0.1:8080/UnionPayApi',
    hostImg: 'http://127.0.0.1:8080/',
    hostVideo: 'http://127.0.0.1:8080/',
    userId: 1,
    appId:"",
    appKey:"",
    ceshiUrl:'http://127.0.0.1:8080/UnionPayApi',
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
  // login
    this.getUserInfo();
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) {
          var code = res.code;
          //get wx user simple info
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo);
              //get user sessionKey
              //get sessionKey
              that.getUserSessionKey(code);
            }
          });
        }
      });
    }
  },

  getUserSessionKey:function(code){
    //用户的订单状态
    var that = this;
    wx.request({
      url: that.d.ceshiUrl + '/Api/Login/getsessionkey',
      method:'post',
      data: {
        code: code
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var data = res.data;
        if(data.state==0){
          wx.showToast({
            title: data.message,
            duration: 2000
          });
          return false;
        }
        var jsons = JSON.parse(data.result); 
        var result = JSON.parse(jsons.result);  
        //Console.log(result);
        that.globalData.userInfo['sessionId'] = result.session_key;
        that.globalData.userInfo['openid'] = result.openid;
        
        that.onLoginUser(); 
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！err:getsessionkeys',
          duration: 2000
        });
      },
    });
  },
  onLoginUser:function(){
    var that = this;
    var user = that.globalData.userInfo;
    console.log(user);
    wx.request({
      url: that.d.ceshiUrl + '/Api/Login/authlogin',
      method:'post',
      data: {
        SessionId: user.sessionId,
        gender:user.gender,
        NickName: user.nickName,
        HeadUrl: user.avatarUrl,
        openid:user.openid
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        //--init data        
        
        var status = res.data.state;
        if(status!=1){
          wx.showToast({
            title: res.data.message,
            duration: 3000
          });
          return false;
        }
        var data = JSON.parse(res.data.result);
        that.globalData.userInfo['id'] = data.arr.ID;
        that.globalData.userInfo['NickName'] = data.arr.NickName;
        that.globalData.userInfo['HeadUrl'] = data.arr.HeadUrl;
        var userId = data.arr.ID;
        if (!userId){
          wx.showToast({
            title: '登录失败！',
            duration: 3000
          });
          return false;
        }
        that.d.userId = userId;
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！err:authlogin',
          duration: 2000
        });
      },
    });
  },
  getOrBindTelPhone:function(returnUrl){
    var user = this.globalData.userInfo;
    if(!user.tel){
      wx.navigateTo({
        url: 'pages/binding/binding'
      });
    }
  },

 globalData:{
    userInfo:null
  },

  onPullDownRefresh: function (){
    wx.stopPullDownRefresh();
  }

});





