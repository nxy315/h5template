function boot(){
  this.result = '';//数据源
  this.card_id = '';//请帖ID
  this.type = '';
  this.guests = {};//宾客页
  this.guestState = true;
  this.allPage = [];//请帖单页
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.UI_WIDTH = 750;//UI稿尺寸
  this.UI_HEIGHT = 1220;//UI稿尺寸
  this.seating = 0;//当前请帖页
  this.autoState = false;//是否自动播放
  this.musicStatePause = "false";
  this.log = [];//editIcon参数
  this.videoNext = false;//视频存在
  this.videoHave = false;//视频存在
  this.editState = false;//编辑图标状态
  this.infiniteArr = [];//动态元素
  this.chatNo = 0;//聊天记录
  this.chatSeat = 0;//聊天定位
  this.giftSeat = 0;
  this.gift_m = 0;
  this.gift_t;
  this.giftProperty={};
  this.send_state=0;
  this.send_name='';
  this.send_price='';
  this.send_wish='祝你们爱情永驻，甜蜜幸福';
  this.gift_touchSeat = 0;
  this.otherState = {
    chat_state : false,
    chat_entry : false,
    chat_gift : false,
    chat_cash : false
  };
  // this.localhost = location.host.indexOf('api')>-1?"//www7.hunliji.com":'//'+location.host;
  this.localhost = "//www7.hunliji.com";
  this.API = {
    card_info : '/p/wedding/index.php/home/APIInvitationV3/card_h5',
    all_gifts :'/p/wedding/index.php/Home/APICardGift2/index',
    sendCash :'/p/wedding/index.php/Home/APICardCashGift/give',
    sendGift:'/p/wedding/index.php/Home/APICardGift2/give',
    reply :'/p/wedding/index.php/home/APIInvitationV3/reply',
    gifts_and_replies :'/p/wedding/index.php/Home/APICardGift2/gifts_and_replies',
    sdkData:'/v1/api/app/tracker/batch.json',
    template: '/p/wedding/index.php/Home/APIInvitationV3/previewTemplate'
  }
}

boot.prototype = function(){
  ajax_reply = function($obj,$fn){
    var $this = this;

    $.ajax({
      url:$this.localhost+$this.API.reply,
      type:'post',
      data:$obj,
      success:function(res){
        console.log(res)
        if(res.status.RetCode==0){
          //$this.outputMsg('已发送成功！')
          $this.winMsg({
            img:'//qnm.hunliji.com/o_1bjph0pq0u9aoib3fqo87169m7.png',
            disMsg:'发送成功',
            giftID:'giftBtnWin',
            giftCol:'送礼物',
            cashID:'cashBtnWin',
            cashCol:'送礼金'
          })
          $this.chatState = false
          $fn?$fn():null
        }
      }
    })

  }


  //礼品接口
  ajax_gifts = function(){
    var $this = this;
    $.ajax({
      url:$this.localhost+$this.API.all_gifts,
      type:'get',
      success:function(res){
        if(res.status.RetCode==0){
          $this.allGifts = res.data.list;
          res.data.list.forEach(function(v,i){
            if(v.is_select==1){
              $this.giftSeat = i;
            }
          })
          $this.selectGift()
        }
      }
    })
  }

  ajax_info = function(){

    var $this = this,_html = document.createElement('div'),
      _allPage = document.createElement('div'),
      _other = document.createElement('div');
    _html.setAttribute('id','wrap');
    _allPage.setAttribute('id','all-page');
    _other.setAttribute('id','other');
    _html.appendChild(_allPage);
    document.body.appendChild(_other);
    document.body.appendChild(_html);
    document.getElementById('all-page').style.height = $this.height+'px'
    if($this.getCookie('musicStatePause')){
      this.musicStatePause = $this.getCookie('musicStatePause')
    }

    this.card_id = this.getParams('card_id');
    this.type = this.getParams('type');
    $.ajax({
      url:$this.localhost+$this.API.template,
      type:'get',
      data:{id:$this.card_id},
      success:function(res){
        if(res.status.RetCode==0){
          $this.result = res.data;

          $this.init()

          if($this.getCookie('musicStatePause')){
            $this.musicStatePause = $this.getCookie('musicStatePause')
          }

          if(res.data.music.audio){
            if($this.type){
              $('body').on('touchstart',function(){
                if($this.musicStatePause=='false'){
                  document.getElementById('playMusic').play();
                }
              })
            }

            document.getElementById('playMusic').setAttribute('src',res.data.music.audio)
            if($this.musicStatePause=='false'){
              document.getElementById('playMusic').play();
            }
            wx.config({
              debug: false,
              appId: '',
              timestamp: 1,
              nonceStr: '',
              signature: '',
              jsApiList: []
            });

            wx.ready(function() {
              if($this.musicStatePause=='false'){
                document.getElementById('playMusic').play();
              }

            });

            var _div = document.createElement('div'),_img = document.createElement('img'),
              _on = $this.musicOpen&&$this.musicOpen!=""?$this.musicOpen:'//qnm.hunliji.com/o_1bi67lq091qtt1gfs60cpadqjj7.png',
              _off = $this.musicClose&&$this.musicClose!=""?$this.musicClose:'//qnm.hunliji.com/o_1bi67m2q63tilg81vh1q3v10g6c.png';
            _img.setAttribute('src',($this.musicStatePause!="true"?_on:_off));
            _div.setAttribute('id','musicBtn');
            _div.appendChild(_img);
            _div.style.width = 84/$this.UI_WIDTH*$this.width+'px';
            _div.style.top = 20/$this.UI_WIDTH*$this.width+'px';
            _div.style.right = 20/$this.UI_WIDTH*$this.width+'px';
            document.getElementById('other').appendChild(_div);

            var _myvideo = document.getElementById('playMusic');
            _myvideo.addEventListener("timeupdate", function(){
              if($this.musicStatePause=='false'){
                $('#musicBtn').addClass('rotate')
              }

            });


            $(document).on('touchstart','#musicBtn',function(){
              if($this.editState){
                if(navigator.userAgent.indexOf('Android') > -1){
                  window.messageHandlers.onEditMusic(JSON.stringify({path:'1'}));
                }else if(navigator.userAgent.indexOf('iPhone') > -1){
                  window.webkit.messageHandlers.onEditMusic.postMessage({path:'1'})
                }

                return false
              }

              var _this = $(this);
              if(_this.hasClass('rotate')){
                $this.musicStatePause = 'true';
                $this.writeCookie('musicStatePause','true',360)
                document.getElementById('playMusic').pause()
                _this.removeClass('rotate')
                $('#musicBtn img').attr('src',_off)
              }else{
                $this.musicStatePause = 'false';
                $this.writeCookie('musicStatePause','false',360)
                document.getElementById('playMusic').play()
                $('#musicBtn img').attr('src',_on)
              }
            })

          }


        }
      }
    })
  }

  closeCardState = function(){
    var _div = document.createElement('div');
    _div.setAttribute('id','closedCard');
    _div.innerHTML = '<img src="//qnm.hunliji.com/o_1bk5mnd8b1du4rsc2hd15331roj7.png" />';
    _div.style.marginTop = 264/this.UI_WIDTH*this.width+'px';
    document.body.appendChild(_div)
  }

  init = function(){
    var $this = this;
    if(this.result.background_path){
      $('body').css({
        'background':'url('+this.result.background_path+') 0 0 no-repeat',
        'background-size':'100% 100%'
      })
    }
    this.result.page.forEach(function(page,i){
      if(page.layout.layTemplate){
        $this.guests.no = i;
        $this.guests.html = page
        $this.buttonBg = page.layout.attendButton.boxColor;
        $this.textColor = page.layout.attendButton.textColor;
      }
    })

    $this.result.guest_template==0?$this.guestPageHide(true):null

    $this.musicOpen = $this.result.music.img||null;
    $this.musicClose = $this.result.music.close_img||null;
    $this.pageIcon = $this.result.page_icon||null;


    var _imgs = [],_ele = $this.result.page[0].layout.elements;
    for(var i=0;i<_ele.length;i++) {
      _imgs.push(_ele[i].img)
    }

    this.loading(_imgs,function(){
      $('.loadmore-loading').remove()
      $('#all-page').append($this.createPage($this.result.page))
      if(document.getElementById('vid')){
        document.getElementById('vid').muted = "muted";
      }
      $this.upDownIcon()
      if($('#vid').length>0){
        document.getElementById('vid').addEventListener('loadedmetadata',function(e){})
        document.getElementById('vid').addEventListener('timeupdate',function(e){
          $('#video').parent().removeClass('vhave');
        })
        document.getElementById('vid').addEventListener('play',function(e){})
      }

      $this.touchAction();

      if($this.videoHave){
        $('#video').parent().addClass('vhave');
      }
      $this.weddingRedPice()
      /*     created by an_ying 20170926   请帖预览不要箭头    */
      if(!!$this.getParams('hide')){
        $('#upImg').hide()
      }
    })

    /* this.loadAnimate(function(){

     $('#all-page').append($this.createPage($this.result.page))
     if(document.getElementById('vid')){
     document.getElementById('vid').muted = "muted";
     }
     $this.upDownIcon()
     if($('#vid').length>0){
     document.getElementById('vid').addEventListener('loadedmetadata',function(e){})
     document.getElementById('vid').addEventListener('timeupdate',function(e){
     $('#video').parent().removeClass('vhave');
     })
     document.getElementById('vid').addEventListener('play',function(e){})
     }

     $this.touchAction();

     if($this.videoHave){
     $('#video').parent().addClass('vhave');
     }

     setTimeout(function(){
     $this.add_infinite()
     if($this.getCookie('editState')){
     $this.editState = $this.getCookie('editState')=='true'?true:false
     $this.editIconState($this.editState)
     }
     },1600)


     $this.weddingRedPice()

     //$this.sdk()
     })*/

    this.allImg(this.result)
    // this.getGifts_replies()
    this.ajax_gifts()

    setTimeout(function(){
      console.log($this.getCurrentPage())
      /*$this.addPage({
       "id": "76685",
       "layout": {
       "background": "http://qnm.hunliji.com/Ful2rRkipQXa4swgE63LQx1ZvB3u",
       "elements": [
       {
       "id":"789851",
       "animate": "fadeInLeft",
       "img": "http://qnm.hunliji.com/FtQQ07Dg0DJUDUoBiNxhkOOQn-CX",
       "x": "602",
       "y": "95",
       "height": "461",
       "width": "87",
       "z_order": "3",
       "delay": "1500ms",
       "is_down":"0",
       "is_scale":"0"
       },
       {
       "id":"6921",
       "animate": "fadeInLeft",
       "img": "http://qnm.hunliji.com/FiNTLlTHnhOqXTouS7iZFnlQqHtz",
       "x": "531",
       "y": "46",
       "width": "74",
       "height": "476",
       "z_order": "3",
       "delay": "1000ms",
       "is_down":"0",
       "is_scale":"0",
       "duration": "500ms",
       "infinite":"wobble",
       "inf_delay":"300ms",
       "inf_duration":"500ms"
       },
       {
       "id":"2368",
       "type":"image",
       "animate": "fadeInRight",
       "img": "http://qnm.hunliji.com/FtciBSsFIayRkDkiEi5Yy2qqaazR",
       "delay": "100ms",
       "rotate": 0,
       "x": "0",
       "y": "0",
       "width": "750",
       "height": "1220",
       "mask": {
       "img": "http://qnm.hunliji.com/Fo2FvtsOoRaY5na5fFtVhZHOLva8",
       "width": "750",
       "height": "1220"
       },
       "z_order": "1",
       "is_down":"0",
       "is_scale":"0"
       }
       ]
       }
       })*/
      //$this.changeVideo('http://qnm.hunliji.com/o_1bi61n1j01ulk3ukj6qkp61pc67.mp4','544','960')
      //$this.editIconState(false)
      //$this.gotoPage(3)
      //$this.autoPlayPage()
      //$this.delPage(3)
      //$this.exchangePage(1,3)
      /*$this.editPageHoles([{
       page_id:"26155214",
       id:"1068",
       type:"image",
       img:"http://qnm.hunliji.com/FtcNASIW8yZ7pK8uWvyf3jjqvtdP"
       }])


       $this.otherAction({
       chat_state : false,
       chat_entry : true,
       chat_gift : true,
       chat_cash : true
       })*/
      //$this.musicPause(true)
      //$this.guestPageHide($this.guestState)
      //$this.changeMusic('http://qnm.hunliji.com/o_1bjr2a2a7go199omh61fs8di97.mp3')
      //$this.changeVideo('http://qnm.hunliji.com/o_1bk3qs3ar1isjip41g7db47tq51p.jpg','375','199',1)
      //$this.changeVideo('http://qnm.hunliji.com/o_1bk6r9dvri41a1u46s1ssn37d7.mp4','375','603',1)
      //$this.changeVideo('http://qnvideo.hunliji.com/Fuk03BSEqeywhIHPUWeYC2PscEB7','1920','1080')
//$this.changeVideo('http://qnm.hunliji.com/o_1bk6op88ds1mctv0d1nkp1qqa7.mp4','544','960')
    },3000)

    //setTimeout(function(){$this.gotoPage(1)},6000)

    $(document).on('touchstart','#musicBtn',function(){
      //$this.gotoPage(0)

      //$this.guestPageHide($this.guestState)

      //$this.delPage(1)
      // $this.changeVideo('http://qnm.hunliji.com/o_1bk5nrns5rbt19n3ut419td1g82h.mp4','960','544')

    })



    $(document).on('touchstart','#video',function(){
      document.getElementById('vid').muted = "muted";
      document.getElementById('vid').play()
      $('.videoMH').removeClass('nosee')
    })

    $(document).on('touchstart','.noVideo',function(){
      location.reload()
    })

    $(document).on('touchstart','.dwIcon',function(){
      if($this.type){return false}
      location.href=$this.mapUrl
    })

    $(document).on('touchstart','#sendBtnWin',function(){
      $('.winMsg').remove()
      $('.winBg').remove()
    })

    $(document).on('touchstart','.editIcon',function(){
      var obj = {},_this = $(this);
      obj.id = _this.attr('id');
      obj.page_id = _this.attr('page_id');
      obj.type = _this.attr('type');
      if(_this.attr('videoP')){
        obj.video_path = _this.attr('videoP');
        obj.video_width = _this.attr('videoW');
        obj.video_height = _this.attr('videoH');
      }

      if(_this.hasClass('card_info')){
        $this.editCard_app('a',{cardInfo:true})
      }else{
        $this.editCard_app('b',obj)
      }

    })


    $(document).on('touchstart','.sureBtn',function(){
      $('.ac_wish_txt').blur();
      $('.ac_name_txt').blur();
      console.log($('.ac_wish_txt').val(),$('.ac_name_txt').val())
      if($('.ac_wish_txt').val().replace(/[ ]/g, "")==''||$('.ac_wish_txt').val()=='请留下你的祝福...'){
        $this.outputMsg('请留下你的祝福...')
      }else{

        if($('.ac_name_txt').val().replace(/[ ]/g, "")==''||$('.ac_name_txt').val()=='请输入您的姓名...'){
          $this.outputMsg('请输入您的姓名...')
        }else{
          $this.send_name = $('.ac_name_txt').val();
          $this.ajax_reply({
            card_id:$this.card_id,
            name:$this.send_name,
            state:3,
            wish_language:$('.ac_wish_txt').val()
          },function(){
            $('.ac_wish_txt').val('请留下你的祝福...')
            $('#allCode').css({'bottom':'-100px'})
          })
        }

      }
    })

    $(document).on('focus','.ac_wish_txt',function(){
      if(!$this.chatState){
        $this.chatState = true;
        $(this).val('').focus();
        setTimeout(function(){document.body.scrollTop = document.body.scrollHeight;},300)
      }else{
        console.log($(this).val())
      }
    })

    $(document).on('blur','.ac_wish_txt',function(){
      if($(this).val().replace(/[ ]/g, "")==''){
        $this.chatState = false;
        $(this).val('请留下你的祝福...')
      }
    })

    $(document).on('touchstart','#chatEntry',function(){
      if($this.type){$this.outputMsg('请先发送请帖');return false;}
      if($(this).parent().parent().hasClass('noAction')){return false}
      if($this.send_name!=''){
        $('.ac_name_txt').val($this.send_name)
      }
      setTimeout(function(){
        $('#allCode').css({'bottom':0})
        $('#allCode_bg').css({'-webkit-transform':'translateY(0)'})
      },300)
    })

    $(document).on('touchstart','#allCode_bg',function(){
      $(this).css({'-webkit-transform':'translateY('+$this.height+'px)'})
      $('#allCode').css({'bottom':'-100px'})
    })

    $(document).on('focus','.ac_name_txt',function(){
      if($(this).val()=='请输入您的姓名...'){
        $(this).val('');
        setTimeout(function(){document.body.scrollTop = document.body.scrollHeight;},300)
      }
    })

    $(document).on('blur','.ac_name_txt',function(){
      if($(this).val().replace(/[ ]/g, "")==''){
        $(this).val('请输入您的姓名...')
      }
    })

    $(document).on('touchstart','#giftShow',function(){
      if($this.type){$this.outputMsg('请先发送请帖');return false;}
      if($(this).parent().hasClass('nobody')){return false}
      if($this.send_name!=''){
        $('#nameTxt').val($this.send_name)
      }
      $('#send_gift').css('-webkit-transform','translateY(0)')
      $('.bgc').css('-webkit-transform','translateY(0)')
    })

    $(document).on('touchstart','.closed',function(){
      $('#send_gift').css('-webkit-transform','translateY('+$this.height+'px)')
      $('.bgc').css('-webkit-transform','translateY('+$this.height+'px)')
    })

    $(document).on('touchstart','.closedRed',function(){
      $('#red_price').css('-webkit-transform','translateY('+$this.height+'px)')
      $('.bgp').css('-webkit-transform','translateY('+$this.height+'px)')
    })

    $(document).on('focus','#nameTxt,#nameTxt_red',function(){
      if($(this).val()=='请输入您的姓名'||$this.send_name==''){
        $(this).val('')
      }
    })

    $(document).on('blur','#nameTxt,#nameTxt_red',function(){
      if($(this).val().replace(/[ ]/g, "")==''){
        $(this).val('请输入您的姓名')
      }else{
        $this.send_name = $(this).val()
      }
    })

    $(document).on('touchstart','.g_layout',function(){
      var _index = $('.g_layout').index(this);
      $('.g_layout span').removeClass('ap');
      $(this).find('span').addClass('ap');
      $this.giftProperty.title = $('.g_layout').eq(_index).find('span').attr('title')
      $this.giftProperty.id = $('.g_layout').eq(_index).find('span').attr('cid')
      $this.giftProperty.price = $('.g_layout').eq(_index).find('span').attr('price')

    })

    $(document).on('touchstart','#sendGiftBtn',function(){
      if($('#nameTxt').val()!='请输入您的姓名' && $('#nameTxt').val().replace(/[ ]/g, "")!=''){
        $this.send_name = $('#nameTxt').val();
        $('#send_gift').css('-webkit-transform','translateY('+$this.height+'px)')
        $('.bgc').css('-webkit-transform','translateY('+$this.height+'px)')

      }else{
        $this.outputMsg('请填写姓名')
        return false
      }
      console.log($this.send_name,$this.giftProperty,$this.card_id)
      var current_time = new Date().getTime();
      $this.sendGift({
        payName:$this.send_name,
        paySouName:$this.user_name,
        payApi: $this.API.sendGift,
        payGift:$this.giftProperty.title,
        payParams: {
          current_time:current_time,
          card_gift2_id: $this.giftProperty.id,
          card_id: $this.card_id,
          giver_name: $this.send_name,
          user_id: $this.user_id,
          wishes:$this.send_wish
        },
        payMoney: $this.giftProperty.price,
        payCallBack: '/p/wedding/Public/wap/activity/20170217-B-pay-success.html'

      })

    })

    $(document).on('focus','.rpEntry_int',function(){
      if($(this).val()=='请输入礼金金额'||$this.send_price==''){
        $(this).val('').attr({'type':'number'})
      }
    })

    $(document).on('blur','.rpEntry_int',function(){
      if($(this).val().replace(/[ ]/g, "")==''){
        $(this).attr({'type':'text'}).val('请输入礼金金额')
      }else{
        $this.send_price = $(this).val()
      }
    })


    $(document).on('touchstart','#priceShow',function(){
      if($this.type){$this.outputMsg('请先发送请帖');return false;}
      if($(this).parent().hasClass('nobody')){return false}
      if($this.send_name!=''){
        $('#nameTxt_red').val($this.send_name)
      }
      $('#red_price').css('-webkit-transform','translateY(0)')
      $('.bgp').css('-webkit-transform','translateY(0)')
    })

    $(document).on('touchstart','#sendPriceBtn',function(){
      if($('#nameTxt_red').val()!='请输入您的姓名' && $('#nameTxt_red').val().replace(/[ ]/g, "")!=''){
        $this.send_name = $('#nameTxt_red').val();

        if($('.rpEntry_int').val().replace(/[ ]/g, "")==''||$('.rpEntry_int').val().replace(/[ ]/g, "")=='请输入礼金金额'){
          $this.outputMsg('请输入礼金金额')
        }else if(parseInt($('.rpEntry_int').val())<1){
          $this.outputMsg('礼金金额不能小于1元')
        }else{
          $this.send_price = $('.rpEntry_int').val()
          $('#red_price').css('-webkit-transform','translateY('+$this.height+'px)')
          $('.bgp').css('-webkit-transform','translateY('+$this.height+'px)')

          if($('.rhEntry_int').val().replace(/[ ]/g, "")==''){
            $('.rhEntry_int').val('祝你们爱情永驻，甜蜜幸福')
          }else{
            $this.send_wish = $('.rhEntry_int').val()
          }

          console.log($this.card_id,$this.send_name,$this.send_price,$this.send_wish)
          var _time = new Date().getTime();
          $this.sendCash({
            api:$this.API.sendCash,
            callback:'/p/wedding/Public/wap/activity/20170217-B-pay-success.html',
            data:{
              card_id:$this.card_id,
              current_time:_time,
              giver_name:$this.send_name,
              price:$this.send_price
            },
            SouName:$this.user_name

          })

        }

      }else{
        $this.outputMsg('请填写姓名')
      }
    })


    this.get_infinite()




  }

  otherAction = function(obj){
    this.otherState = obj
    for(var i in this.otherState){

      if(i=='chat_state'){
        if(this.otherState[i]){
          $('.chat_dis').removeClass('nosee')
          $('#giftModule').removeClass('nosee')
        }else{
          $('.chat_dis').addClass('nosee')
          $('#giftModule').addClass('nosee')
        }
      }
      else if(i=='chat_entry'){
        if(this.otherState[i]){
          $('.c_txt ').removeClass('noAction')
        }else{
          $('.c_txt ').addClass('noAction')
        }
      }
      else if(i=='chat_gift'){
        if(this.otherState[i]){
          $('#giftShow').parent().removeClass('nobody')
          //$('#giftShow').removeClass('noAction')
        }else{
          $('#giftShow').parent().addClass('nobody')
          //$('#giftShow').addClass('noAction')
        }
      }
      else if(i=='chat_cash'){
        if(this.otherState[i]){
          $('#priceShow').parent().removeClass('nobody')
          //$('#priceShow').removeClass('noAction')
        }else{
          $('#priceShow').parent().addClass('nobody')
          //$('#priceShow').addClass('noAction')
        }
      }

    }
  }

  guestPageHide = function($state){
    var $this = this;
    $this.guestState = $state;

    this.result.page.forEach(function(page,i){
      if(page.layout.layTemplate){
        $this.guests.no = i;
        $this.guests.html = page
      }
    })

    if($this.guestState){
      $this.guestState = false;
      $this.delPage($this.guests.no)
      $('#chat_msg').show()
      $('#chat_msg').css('opacity',1);
    }else{
      $this.addPage($this.guests.html,'guestPageHide')
      $('#chat_msg').hide()
      $('#chat_msg').css('opacity',0);
    }

    if($('#lastAbout').css('top')=='0px'){
      $('#lastAbout').css({'top':$this.height+'px'})
      $this.lastState = false;
      $this.lastDown = true
    }
    console.log('guestPageHide:'+$this.guestState)
  }

  get_infinite = function(){
    var $this = this;
    this.infiniteArr.length>0?this.infiniteArr=[]:null
    for(var i=0;i<this.result.page.length;i++){
      for(var r=0;r<this.result.page[i].layout.elements.length;r++){
        if(this.result.page[i].layout.elements[r].infinite){
          var obj={},_eles = this.result.page[i].layout.elements;
          //obj.page_id = this.result.page[i].id;
          this.result.page[i].id = 'box_ele_'+i;
          obj.page_id = 'box_ele_'+i;
          obj.id = _eles[r].id;
          obj.infinite = _eles[r].infinite;
          obj.inf_duration = _eles[r].inf_duration||'1000ms';
          obj.inf_delay = _eles[r].inf_delay||'0ms';
          obj.delay = _eles[r].delay||'0ms';
          obj.duration = _eles[r].duration||'1000ms';
          obj.animate = _eles[r].animate;
          this.infiniteArr.push(obj)
          //console.log(this.infiniteArr)
        }
      }
    }

  }

  weddingRedPice = function(){
    var _div = document.createElement('div'),$this = this,
      _bg = document.createElement('div');
    _bg.setAttribute('class','bgp');
    _div.setAttribute('id','red_price');
    _bg.style.WebkitTransform = 'translateY('+$this.height+'px)';
    _div.style.WebkitTransform = 'translateY('+$this.height+'px)';
    _div.style.top = 145/$this.UI_WIDTH*$this.width+'px';
    _div.style.width = 580/$this.UI_WIDTH*$this.width+'px';

    _div.innerHTML = '<i class="closedRed" style="width:'+(60/$this.UI_WIDTH*$this.width)+'px"><img src="//qnm.hunliji.com/o_1binaqfi87759ar1am8doc1d9mc.png"/></i><div></div><div class="redTit" style="padding-bottom:'+(32/$this.UI_WIDTH*$this.width)+'px"><img src="//qnm.hunliji.com/o_1binrs2htaaetive5b1cqm1f9r7.png"/><div class="entryName_red" style="width:'+(520/$this.UI_WIDTH*$this.width)+'px"><div><em>赠送人：</em><input id="nameTxt_red" class="ak" type="text" value="请输入您的姓名"/></div></div></div><div class="redPriceMain" style="padding-top:'+(22/$this.UI_WIDTH*$this.width)+'px;padding-bottom:'+(36/$this.UI_WIDTH*$this.width)+'px"><div class="rpEntry" style="width:'+(520/$this.UI_WIDTH*$this.width)+'px"><div><em>礼金金额：</em><input class="rpEntry_int ak" value="请输入礼金金额" type="text"/></div></div><div class="rhEntry" style="width:'+(520/$this.UI_WIDTH*$this.width)+'px"><div><em>祝福语：</em><input class="rhEntry_int ak" value="祝你们爱情永驻，甜蜜幸福" type="text"/></div></div><div class="gift_footer"><img src="//qnm.hunliji.com/o_1bindu5sh6g47hipum1obg2907.png"/><div id="sendPriceBtn" style="height:'+(68/$this.UI_WIDTH*$this.width)+'px;line-height:'+(68/$this.UI_WIDTH*$this.width)+'px">送礼金</div></div>';

    document.getElementById('other').appendChild(_div)
    document.getElementById('other').appendChild(_bg)

  }

  // getGifts_replies = function(){
  //   var $this = this;
  //   $.ajax({
  //         url:$this.localhost+$this.API.gifts_and_replies+'?card_id='+$this.card_id,
  //         type:'get',
  //         success:function(res){
  //           if(res.status.RetCode==0){
  //             $this.gifts = res.data.gifts;
  //             $this.replies = res.data.replies;
  //             $this.user_name = res.data.user_name;
  //             $this.user_id = res.data.user_id;
  //           }
  //         }
  //       })
  // }

  selectGift = function(){
    var _div = document.createElement('div'),_bg = document.createElement('div'),_html='',$this = this;
    _div.setAttribute('id','send_gift');
    _bg.setAttribute('class','bgc');
    document.getElementById('other').appendChild(_bg)
    _bg.style.WebkitTransform = 'translateY('+$this.height+'px)';
    _div.style.WebkitTransform = 'translateY('+$this.height+'px)';
    _div.style.top = 145/$this.UI_WIDTH*$this.width+'px';
    _div.style.width = 580/$this.UI_WIDTH*$this.width+'px';

    var r=0,_data = $this.allGifts,_code='',_pcode='',_w=0;
    console.log(_data)
    for(var i=0;i<_data.length;i++){
      if(_w<3&&_data[i].icon2){
        _code += '<div class="g_layout ">\
                              <span price="'+_data[i].price+'" title="'+_data[i].title+'" cid="'+_data[i].id+'"><img src="'+_data[i].icon2+'?imageView2/1/w/200/h/200"/></span>\
                          </div>';
        _w++;
        if(_w>2){
          _w=0;
          _pcode = '<div class="g_bd">'+_code+'</div>';
          _code='';
          _html+=_pcode;
        }
      }
    }

    /*for(var i=0;i<_data.length;i++){
     _html += '<div class="g_layout ">\
     <span price="'+_data[i].price+'" title="'+_data[i].title+'" cid="'+_data[i].id+'"><img src="'+_data[i].icon2+'?imageView2/1/w/200/h/200"/></span>\
     </div>';
     }*/

    setTimeout(function(){
      toHtml();
      touchGift();
      $this.gift_action()
    },300)

    function toHtml(){
      _div.innerHTML = '<i class="closed" style="width:'+(60/$this.UI_WIDTH*$this.width)+'px"><img src="//qnm.hunliji.com/o_1binaqfi87759ar1am8doc1d9mc.png"/></i><div class="giftTit" style="padding-bottom:'+(32/$this.UI_WIDTH*$this.width)+'px"><img src="//qnm.hunliji.com/o_1bindq4fe1lbeqlm913qam9vm.png"/><div class="entryName" style="width:'+(520/$this.UI_WIDTH*$this.width)+'px"><div><em>赠送人：</em><input id="nameTxt" class="ak" type="text" value="请输入您的姓名"/></div></div></div><div class="gift_main" style="padding-top:'+(22/$this.UI_WIDTH*$this.width)+'px;padding-bottom:'+(36/$this.UI_WIDTH*$this.width)+'px"><div id ="giftMore" class="gift_box" style="width:'+(520/$this.UI_WIDTH*$this.width)+'px">'+_html+'<div class="pageGift"></div></div><div class="gift_footer"><img src="//qnm.hunliji.com/o_1bindu5sh6g47hipum1obg2907.png"/><div id="sendGiftBtn" style="height:'+(68/$this.UI_WIDTH*$this.width)+'px;line-height:'+(68/$this.UI_WIDTH*$this.width)+'px">赠送礼物</div></div></div>'

      document.getElementById('other').appendChild(_div)
      $('.g_layout').css({'padding':10/$this.UI_WIDTH*$this.width})
      $('.g_layout').eq($this.giftSeat).find('span').addClass('ap')
      $this.giftProperty={
        id:$('.g_layout').eq($this.giftSeat).find('span').attr('cid'),
        title:$('.g_layout').eq($this.giftSeat).find('span').attr('title'),
        price:$('.g_layout').eq($this.giftSeat).find('span').attr('price')
      }
    }

    function touchGift(){
      for(var i=0;i<$('.g_bd').length;i++){
        if(i>1){
          $('.g_bd').eq(i).hide()
        }
      }
      var r=0,_i='';
      while(r<Math.ceil($('.g_bd').length/2)){
        _i+='<i></i>'
        r++
      }
      $('.pageGift').append(_i)
      $('.pageGift').find('i').eq(0).addClass('ko')
    }




  }

  gift_action = function(){
    var hammertime = new Hammer(document.getElementById("giftMore"));
    var $this = this;
    hammertime.on("swipe",function(e){
      console.log(e.deltaX,$this.gift_touchSeat)

      if(e.deltaX>0&&$this.gift_touchSeat>0){
        $this.gift_touchSeat--

      }else if(e.deltaX<0&&$this.gift_touchSeat<(Math.ceil($('.g_bd').length/2)-1)){
        $this.gift_touchSeat++

      }

      function tabGift($eq){
        $('.g_bd').hide()
        switch($eq){
          case 0:
            $('.g_bd').eq(0).show()
            $('.g_bd').eq(1).show()
            break;
          case 1:
            $('.g_bd').eq(2).show()
            $('.g_bd').eq(3).show()
            break;
          case 2:
            $('.g_bd').eq(4).show()
            $('.g_bd').eq(5).show()
            break;
          case 3:
            $('.g_bd').eq(6).show()
            $('.g_bd').eq(7).show()
            break;
          case 4:
            $('.g_bd').eq(8).show()
            $('.g_bd').eq(9).show()
            break;
        }
      }

      $('.pageGift i').removeClass('ko')
      $('.pageGift i').eq($this.gift_touchSeat).addClass('ko')

      tabGift($this.gift_touchSeat)
    })
  }

  chatMsg = function($state){
    var $this = this,gifts = $this.gifts,
      replies = $this.replies,
      _div = document.createElement('div'),
      _p20 = 20/this.UI_WIDTH*this.width,
      _pdis = 48/this.UI_WIDTH*this.width,
      _ptxt = 72/this.UI_WIDTH*this.width,
      _pinp = Number(_ptxt-16)/2 ;

    _div.setAttribute('id','chat_msg');
    _div.style.padding = _p20+'px';

    var _chats='',_chH = '';
    _chH = gifts.length>0?_pdis*2+6:_pdis*3+12;

    replies.forEach(function(v,i){
      _chats+= '<div class="c_g" style="border-radius:'+_pdis+'px;height:'+_pdis+'px;line-height:'+_pdis+'px"><p style="border-radius:'+_pdis+'px;height:'+_pdis+'px;line-height:'+_pdis+'px"><span>'+v.name+'：</span>'+v.wish_language+'</p></div>';
    })

    _div.innerHTML = '<div>\
                              <div class="chat_dis nosee" style="height:'+_chH+'px;overflow:hidden;"><div class="bd">'+_chats+'</div></div>\
                              <div class="chat_entry" style="height:'+_ptxt+'px;line-height:'+_ptxt+'px">\
                                <div class="c_txt noAction" style="line-height:'+_ptxt+'px;border-radius:'+_ptxt+'px"><div id="wishTxt"><span id="chatEntry" >请留下你的祝福...</span></div></div>\
                                <div class="c_icon">\
                                  <div class="nobody"><span id="giftShow"  style="width:'+_ptxt+'px"><img src="//qnm.hunliji.com/o_1bii7h2dc5tuu1i1op66o91lom7.png"/></span></div>\
                                  <div class="nobody"><span id="priceShow" style="width:'+_ptxt+'px"><img src="//qnm.hunliji.com/o_1bii7hcgn10m4bvj1qto1uai1tetc.png"/></span></div>\
                                </div>\
                              </div>\
                            </div>';

    var _p30 = 30/$this.UI_WIDTH*$this.width,
      _p140 = 140/$this.UI_WIDTH*$this.width,
      _p64 = 64/$this.UI_WIDTH*$this.width;

    var _code = '<div id="allCode_bg" style="-webkit-transform:translateY('+$this.height+'px);"></div><div id="allCode" style="padding:0 '+_p30+'px 0 '+_p30+'px; ">\
                                <div class="ac_wish"><i>祝福</i><input class="ac_wish_txt" style="padding:'+_p30+'px 0 '+_p30+'px 0;" type="text" value="请留下你的祝福..."/></div>\
                                <div class="ac_name">\
                                  <div class="ac_name_bd"><i>姓名</i><input class="ac_name_txt" style="padding:'+_p30+'px 0 '+_p30+'px 0;" type="text" value="请输入您的姓名..."/></div>\
                                  <div class="ac_name_btn"><span class="sureBtn" style="width:'+_p140+'px;height:'+_p64+'px;line-height:'+_p64+'px">确定</span></div>\
                                </div></div>';

    $('#allCode').length<=0?$('body').append(_code):null

    if($this.seating>0&&$this.seating<=$this.result.page.length-1&&!$('.layout').eq($this.seating).hasClass('guestPage')){

      if($('#giftModule').length<=0){setTimeout(codeGift,600)}
      if($('#chat_msg').length<=0&&!$this.type){
        document.getElementById('wrap').appendChild(_div)

        $this.t = setTimeout(chatAnimate,1000)

        setTimeout(function(){
          $this.otherAction({
            chat_state : $this.result.cardInfo.set_up.danmu==1?true:false,
            chat_entry : $this.result.cardInfo.set_up.wish==1?true:false,
            chat_gift : $this.result.cardInfo.set_up.gift==1?true:false,
            chat_cash : $this.result.cardInfo.set_up.gold==1?true:false
          })
        },1000)

      }else{

        $('#chat_msg').css('opacity',1);

      }

      if($this.chatTime == false){
        $this.chatTime = true
        $this.t = setTimeout(chatAnimate,1000)
      }
      $('#chat_msg').show()
    }else{
      $('#chat_msg').hide()
      $this.chatTime = false
      if($('#chat_msg').length>=1){
        clearTimeout($this.t);
        clearTimeout($this.tc)
        $('#chat_msg').css('opacity',0);
      }
      return false
    }

    function chatAnimate(){

      $('.bd').css({'-webkit-transform':'translateY(-'+Number(_pdis+6)*$this.chatNo+'px)'})
      $this.chatNo++;

      if($this.chatSeat<replies.length-2){
        $this.chatSeat++
      }else{
        $this.chatSeat=0
        $('.bd').append(_chats)
      }
      $this.tc = setTimeout(chatAnimate,2600);

    }

    function codeGift($state){
      if($this.gift_m!=0||$this.seating<=0||$this.seating>=$this.result.page.length-1){return false}
      var giftHav = gifts.length>0?true:false,
        code_gift = $('#giftModule').length<=0?true:false,
        obj = {};
      obj.gH = 80;
      obj.p8 = 8;
      obj.timeNum = 6;
      $('.chat_dis').css({'height':_pdis*2+6});

      if(giftHav&&code_gift||$state){
        var _html='',i = $this.giftSeat;
        if(i<gifts.length){
          appCode()
          i++;
          $this.giftSeat = i
        }else{
          i=0;
          $this.giftSeat = i
          if(gifts.length<=3){
            $('.chat_dis').css({'height':_pdis*3+12});
            startGift()
            function startGift(){
              if($this.gift_m<obj.timeNum){
                $this.gift_m++
                $this.gift_t = setTimeout(startGift,1000)
              }else{
                $this.gift_m = 0;
                clearTimeout($this.gift_t)
                codeGift(true)
              }
            }
            return false
          }else{
            appCode()
          }
        }

      }

      function appCode(){
        if(gifts[i].card_gift){
          _html=' \
                          <div class="animated gift_layout gy" style="padding:'+obj.p8/$this.UI_WIDTH*$this.width+'px;border-radius:'+obj.gH/$this.UI_WIDTH*$this.width+'px;padding-right:10px;">\
                              <div class="giftBd" style="height:'+obj.gH/$this.UI_WIDTH*$this.width+'px;">\
                                <div class="g_y"><span style="height:'+obj.gH/$this.UI_WIDTH*$this.width+'px;width:'+obj.gH/$this.UI_WIDTH*$this.width+'px;border-radius:'+obj.gH/$this.UI_WIDTH*$this.width+'px"><img src="'+gifts[i].card_gift.icon+'"/></span></div>\
                                <div class="g_y">\
                                  <h5>'+gifts[i].card_gift.title+'</h5>\
                                  <p>'+gifts[i].card_gift.desc+'</p>\
                                </div>\
                              </div>\
                          </div>';
        }else{
          _html=' \
                          <div class="animated gift_layout" style="padding:'+obj.p8/$this.UI_WIDTH*$this.width+'px;border-radius:'+obj.gH/$this.UI_WIDTH*$this.width+'px;padding-right:10px;">\
                              <div class="giftBd" style="height:'+obj.gH/$this.UI_WIDTH*$this.width+'px;">\
                                <div class="g_y"><span style="width:'+obj.gH/$this.UI_WIDTH*$this.width+'px"><img src="//qnm.hunliji.com/o_1bil5lgmqq2j1mgck6ntad18b7.png"/></span></div>\
                                <div class="g_y">\
                                  <h5>'+gifts[i].giver_name+'</h5>\
                                  <p>送了'+gifts[i].price+'黄金红包</p>\
                                </div>\
                              </div>\
                          </div>';
        }

        $('.chat_dis').before('<div id="giftModule" class="'+($this.otherState.chat_state?'':'nosee')+'" >'+_html+'</div>');
        $('.gift_layout').css({'-webkit-transform':'translateX(-'+Number($('.gift_layout').width()+20)+'px);'})

        $this.gt = setTimeout(function(){
          $('.gift_layout').css({'opacity':1,'-webkit-transform':'translateX(0px);'})
        },1000)

        $this.gta = setTimeout(function(){
          $('.gift_layout').css({'opacity':0,'-webkit-transform':'translateY(-10px);'})
          $this.gtb =setTimeout(function(){

            clearTimeout($this.gt)
            clearTimeout($this.gta)
            clearTimeout($this.gtb)
            $('#giftModule').remove();
            codeGift()

          },600)
        },3000)
      }


    }

  }

  winMsg = function(obj){
    var _win = document.createElement('div'),_btn='',$this = this,
      _winBg = document.createElement('div');
    _winBg.setAttribute('class','winBg')
    _win.setAttribute('class','winMsg');
    _win.style.width = 480/this.UI_WIDTH*this.width+'px';
    _win.style.top = 350/this.UI_WIDTH*this.width+'px';
    _win.style.paddingBottom = 45/this.UI_WIDTH*this.width+'px';
    var _imgTop = 65/this.UI_WIDTH*this.width+'px',
      _f34 = 34/this.UI_WIDTH*this.width+'px',
      _f32 = 32/this.UI_WIDTH*this.width+'px',
      _h72 = 72/this.UI_WIDTH*this.width+'px',
      _b45 = 45/this.UI_WIDTH*this.width+'px',
      _b20 = 20/this.UI_WIDTH*this.width+'px',
      _fsTop = 25/this.UI_WIDTH*this.width+'px';

    console.log(this.otherState)

    if($this.getCookie('cardPrice')||$this.getCookie('cardGift')){
      _btn = '<div id="iknow" class="winMsgBtn" style="margin-top:'+_b45+';font-size:'+_f32+';height:'+_h72+';line-height:'+_h72+'">知道啦</div>';
    }else{

      for(var i in $this.otherState){

        if(i=='chat_gift'){
          if(this.otherState[i]){
            _btn += '<div id="'+obj.giftID+'" class="winMsgBtn" style="margin-top:'+_b45+';font-size:'+_f32+';height:'+_h72+';line-height:'+_h72+'">'+obj.giftCol+'</div>';
          }else{

          }
        }
        else if(i=='chat_cash'){
          if(this.otherState[i]){
            _btn += '<div id="'+obj.cashID+'" class="winMsgBtn" style="margin-top:'+_b20+';font-size:'+_f32+';height:'+_h72+';line-height:'+_h72+'">'+obj.cashCol+'</div>';
          }else{

          }
        }

      }

      if(_btn==''||$this.fy){
        $this.fy = false
        _btn = '<div id="iknow" class="winMsgBtn" style="margin-top:'+_b45+';font-size:'+_f32+';height:'+_h72+';line-height:'+_h72+'">知道啦</div>';

      }

    }


    _win.innerHTML = '<i class="closedBtn"></i><img style="margin-top:'+_imgTop+'" src="'+obj.img+'"/><span style="margin-top:'+_fsTop+';font-size:'+_f34+'">'+obj.disMsg+'</span>'+_btn;
    document.body.appendChild(_win)
    document.body.appendChild(_winBg)

    $(document).on('touchstart','.closedBtn,#iknow,#giftBtnWin,#cashBtnWin',function(){
      $('.winMsg').remove();
      $('.winBg').remove();
    })

    $(document).on('touchstart','#giftBtnWin',function(){
      if($('#giftShow').parent().hasClass('nobody')){return false}
      if($this.send_name!=''){
        $('#nameTxt').val($this.send_name)
      }
      $('#send_gift').css('-webkit-transform','translateY(0)')
      $('.bgc').css('-webkit-transform','translateY(0)')
    })

    $(document).on('touchstart','#cashBtnWin',function(){
      if($('#priceShow').parent().hasClass('nobody')){return false}
      if($this.send_name!=''){
        $('#nameTxt_red').val($this.send_name)
      }
      $('#red_price').css('-webkit-transform','translateY(0)')
      $('.bgp').css('-webkit-transform','translateY(0)')
    })

  }

  outputMsg = function(str){
    if($('.msgWin').length>0){return false}
    var _div = document.createElement('div');
    _div.style.zIndex =11
    _div.style.top =(this.height-120)/2+'px'
    _div.setAttribute('class','msgWin');
    _div.innerHTML = '<p>'+str+'</p>';
    _div.style.top = 320/this.UI_WIDTH*this.width+'px';
    document.getElementById('other').appendChild(_div);
    setTimeout(function(){
      $('.msgWin').remove()
    },1500)
  }

  loadAnimate = function(func){
    var obj = {},n=1,rad = Math.PI * 2 / 100;
    obj.cx = 200;
    obj.cy = 200;
    obj.cr = 60;
    obj.speed = 1;

    var _divCanvas = document.createElement('div'),
      _canvas = document.createElement('canvas'),
      context = _canvas.getContext("2d");
    _divCanvas.setAttribute('id','canvasBox');
    _divCanvas.style.width = 100/this.UI_WIDTH*this.width+'px'
    _divCanvas.style.height = 100/this.UI_WIDTH*this.width+'px'

    _canvas.style.position = 'absolute';
    _canvas.style.margin = 'auto';
    _canvas.style.top = '0';
    _canvas.style.right = '0';
    _canvas.style.bottom = '0';
    _canvas.style.left = '0';
    //_canvas.style.background = '#fff';
    _canvas.style.zIndex = '9';
    _canvas.setAttribute('width',obj.cx);
    _canvas.setAttribute('height',obj.cy);
    _canvas.setAttribute('id','canvas');
    document.body.appendChild(_divCanvas)
    document.getElementById('canvasBox').appendChild(_canvas);


    function writeArc(n){
      context.save();
      context.strokeStyle = "#fca7a7";
      context.lineWidth = 16;
      context.beginPath();
      context.arc(obj.cx/2, obj.cy/2, obj.cr, -Math.PI/2,-Math.PI/2+ rad*n + .5, false);
      context.stroke();
      context.restore();
    }

    function DreamLoading(){
      context.clearRect(0,0,canvas.width,canvas.height)
      writeArc(n)
      if(n < 100){
        n= n+.2;
      }else {
        //n = 0;
        if(func){
          $('#canvas').remove()
          func();
          return false;
        }
      }
      setTimeout(DreamLoading,obj.speed);
    }
    DreamLoading();
  }

  allImg = function(result){console.log(result.page)
    var _imgs=['//qnm.hunliji.com/o_1bid6p3ojgs8uptnu919pd5os7.png','//qnm.hunliji.com/o_1bid6qlpm1vhpqiv7uf1dm111ojc.png'];
    for(var i=0;i<result.page.length;i++){
      for(var r=0;r<result.page[i].layout.elements.length;r++){
        var _img;
        if(result.page[i].layout.elements[r].img){
          _img = result.page[i].layout.elements[r].img;
          _imgs.push(_img+'?imageView2/2/q/80')
        }

      }
    }
    this.loading(_imgs,function(){
      console.log('ok')
    })
  }

  loading = function(arr,func){
    var _count=0;
    for(var i=0;i<arr.length;i++){
      if(!arr[i]){
        arr.splice(i, 1);
      }

      var _img = new Image();
      _img.onload = function(){
        _count++;
        if(_count>=arr.length){if(func){func()}}
      }
      _img.src = arr[i];
    }
  }


  rov_infinite = function(deltaY){
    this.timeAni? clearTimeout(this.timeAni):null;
    var $this = this,
      _infArr = $this.infiniteArr,
      _infArrW = _infArr.length,
      _seating = $this.seating;
    deltaY>0?_seating++:_seating--;

    for(var i=0;i<_infArrW;i++){
      if(_infArr[i].page_id==this.result.page[this.seating].id&&$('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).hasClass('infinite')){

        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).removeClass(_infArr[i].infinite)
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).removeClass('infinite')
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).css({'-webkit-animation-delay':_infArr[i].delay})
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).css({'-webkit-animation-duration':_infArr[i].duration})
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).addClass(_infArr[i].animate)
      }
      if(i>=_infArrW-1){
        $this.timeAni = setTimeout(function(){
          $this.add_infinite()
        },1600)
      }
    }



  }

  add_infinite = function(){
    var $this = this,_infArr = this.infiniteArr,_infArrW = _infArr.length;
    var _anis = $('.animated');console.log(_infArr)
    $this.timeAni? clearTimeout($this.timeAni):null;
    for(var i=0;i<_infArrW;i++){
      if(_infArrW[i].id=='ele_7'){console.log(_infArrW[i].delay,_infArrW[i].duration)}
      console.log($this.result.page[$this.seating].id , _infArr[i].page_id,_infArr[i].page_id)
      if($this.result.page[$this.seating].id == _infArr[i].page_id&&_infArr[i].page_id!=undefined){
        console.log($this.result.page[$this.seating].id,_infArr[i].page_id)
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).removeClass(_infArr[i].animate);
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).addClass(_infArr[i].infinite);
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).addClass('infinite');
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).css({'-webkit-animation-duration':_infArr[i].inf_duration})
        $('.ani_'+$this.result.page[$this.seating].id+'_'+_infArr[i].id).css({'-webkit-animation-delay':_infArr[i].inf_delay})
      }

    }

  }

  addStyle = function(obj,animateName){
    var _style = document.createElement('style'),
      _infinite="",
      _timing="linear"
    _aniCode = '';

    switch (obj.infinite){
      case 'animate_leftTop':
        _infinite = 'leftTop_rotate'
        _timing = "ease-in-out"
        break;
      case 'animate_leftBottom':
        _infinite = 'leftBottom_rotate'
        _timing = "ease-in-out"
        break;
      case 'animate_rightTop':
        _infinite = 'rightTop_rotate'
        _timing = "ease-in-out"
        break;
      case 'animate_rightBottom':
        _infinite = 'rightBottom_rotate'
        _timing = "ease-in-out"
        break;
      case 'rotate':
        _infinite = 'rotate'
        break;
      case 'bounce':
        _infinite = 'bounce'
        break;
      case 'flash':
        _infinite = 'flash'
        break;
      case 'pulse':
        _infinite = 'pulse'
        break;
      case 'rubberBand':
        _infinite = 'rubberBand'
        break;
      case 'shake':
        _infinite = 'shake'
        break;
      case 'headShake':
        _infinite = 'headShake'
        break;
      case 'swing':
        _infinite = 'swing'
        break;
      case 'tada':
        _infinite = 'tada'
        break;
      case 'wobble':
        _infinite = 'wobble'
        break;
      case 'jello':
        _infinite = 'jello'
        break;
      case 'bounceIn':
        _infinite = 'bounceIn'
        break;
      case 'bounceInDown':
        _infinite = 'bounceInDown'
        break;
      case 'bounceInLeft':
        _infinite = 'bounceInLeft'
        break;
      case 'bounceInRight':
        _infinite = 'bounceInRight'
        break;
      case 'bounceInUp':
        _infinite = 'bounceInUp'
        break;
      case 'bounceOut':
        _infinite = 'bounceOut'
        break;
      case 'bounceOutDown':
        _infinite = 'bounceOutDown'
        break;
      case 'bounceOutLeft':
        _infinite = 'bounceOutLeft'
        break;
      case 'bounceOutRight':
        _infinite = 'bounceOutRight'
        break;
      case 'bounceOutUp':
        _infinite = 'bounceOutUp'
        break;
      case 'fadeIn':
        _infinite = 'fadeIn'
        break;
      case 'fadeInDown':
        _infinite = 'fadeInDown'
        break;
      case 'fadeInDownBig':
        _infinite = 'fadeInDownBig'
        break;
      case 'fadeInLeft':
        _infinite = 'fadeInLeft'
        break;
      case 'fadeInLeftBig':
        _infinite = 'fadeInLeftBig'
        break;
      case 'fadeInRighting':
        _infinite = 'fadeInRight'
        break;
      case 'fadeInRightBig':
        _infinite = 'fadeInRightBig'
        break;
      case 'fadeInUp':
        _infinite = 'fadeInUp'
        break;
      case 'fadeInUpBig':
        _infinite = 'fadeInUpBig'
        break;
      case 'fadeOut':
        _infinite = 'fadeOut'
        break;
      case 'fadeOutDown':
        _infinite = 'fadeOutDown'
        break;
      case 'fadeOutDownBig':
        _infinite = 'fadeOutDownBig'
        break;
      case 'fadeOutLeft':
        _infinite = 'fadeOutLeft'
        break;
      case 'fadeOutLeftBig':
        _infinite = 'fadeOutLeftBig'
        break;
      case 'fadeOutRight':
        _infinite = 'fadeOutRight'
        break;
      case 'fadeOutRightBig':
        _infinite = 'fadeOutRightBig'
        break;
      case 'fadeOutUp':
        _infinite = 'fadeOutUp'
        break;
      case 'fadeOutUpBig':
        _infinite = 'fadeOutUpBig'
        break;
      case 'flipInX':
        _infinite = 'flipInX'
        break;
      case 'flipInY':
        _infinite = 'flipInY'
        break;
      case 'flipOutX':
        _infinite = 'flipOutX'
        break;
      case 'flipOutY':
        _infinite = 'flipOutY'
        break;
      case 'lightSpeedIn':
        _infinite = 'lightSpeedIn'
        break;
      case 'lightSpeedOut':
        _infinite = 'lightSpeedOut'
        break;
      case 'rotateIn':
        _infinite = 'rotateIn'
        break;
      case 'rotateInDownLeft':
        _infinite = 'rotateInDownLeft'
        break;
      case 'rotateInDownRight':
        _infinite = 'rotateInDownRight'
        break;
      case 'rotateInUpLeft':
        _infinite = 'rotateInUpLeft'
        break;
      case 'rotateInUpRight':
        _infinite = 'rotateInUpRight'
        break;
      case 'hinge':
        _infinite = 'hinge'
        break;
      case 'jackInTheBox':
        _infinite = 'jackInTheBox'
        break;
      case 'rollIn':
        _infinite = 'rollIn'
        break;
      case 'rollOut':
        _infinite = 'rollOut'
        break;
      case 'zoomIn':
        _infinite = 'zoomIn'
        break;
      case 'zoomInDown':
        _infinite = 'zoomInDown'
        break;
      case 'zoomInLeft':
        _infinite = 'zoomInLeft'
        break;
      case 'zoomInRight':
        _infinite = 'zoomInRight'
        break;
      case 'zoomInUp':
        _infinite = 'zoomInUp'
        break;
      case 'zoomOut':
        _infinite = 'zoomOut'
        break;
      case 'zoomOutDown':
        _infinite = 'zoomOutDown'
        break;
      case 'zoomOutLeft':
        _infinite = 'zoomOutLeft'
        break;
      case 'zoomOutRight':
        _infinite = 'zoomOutRight'
        break;
      case 'zoomOutUp':
        _infinite = 'zoomOutUp'
        break;
      case 'slideInDown':
        _infinite = 'slideInDown'
        break;
      case 'slideInLeft':
        _infinite = 'slideInLeft'
        break;
      case 'slideInRight':
        _infinite = 'slideInRight'
        break;
      case 'slideInUp':
        _infinite = 'slideInUp'
        break;
      case 'slideOutDown':
        _infinite = 'slideOutDown'
        break;
      case 'slideOutLeft':
        _infinite = 'slideOutLeft'
        break;
      case 'slideOutRight':
        _infinite = 'slideOutRight'
        break;
      case 'slideOutUp':
        _infinite = 'slideOutUp'
        break;

    }

    // if(animateName=='fadeInNormal'||animateName=='slideLeft'||animateName=='bounceInRight'||animateName=='stretchLeft'||animateName=='fadeIn'||animateName=='bounceInLeft'||animateName=='stretchRight'){
    //   obj.animationDuration = '1000ms'
    // }
    if(!obj.animationDuration||obj.animationDuration.indexOf('0')>-1||obj.animationDuration.indexOf('0ms')>-1||obj.animationDuration.indexOf('ms')>-1||obj.animationDuration.indexOf('')>-1){
      if(animateName.indexOf('fadeInNormal')>-1){
        obj.animationDuration[animateName.indexOf('fadeInNormal')] = '1000ms'
      }else if(animateName.indexOf('slideLeft')>-1){
        obj.animationDuration[animateName.indexOf('slideLeft')] = '1000ms'
      }else if(animateName.indexOf('bounceInRight')>-1){
        obj.animationDuration[animateName.indexOf('bounceInRight')] = '1000ms'
      }else if(animateName.indexOf('stretchLeft')>-1){
        obj.animationDuration[animateName.indexOf('stretchLeft')] = '1000ms'
      }else if(animateName.indexOf('fadeIn')>-1){
        obj.animationDuration[animateName.indexOf('fadeIn')] = '1000ms'
      }else if(animateName.indexOf('bounceInLeft')>-1){
        obj.animationDuration[animateName.indexOf('bounceInLeft')] = '1000ms'
      }else if(animateName.indexOf('stretchRight')>-1){
        obj.animationDuration[animateName.indexOf('stretchRight')] = '1000ms'
      }
    }

    // if(obj.animationDuration==0||obj.animationDuration=='0ms'){obj.animationDuration='1000ms'}
    if(obj.animationDuration.indexOf('0')>-1){
      obj.animationDuration[obj.animationDuration.indexOf('0')]='1000ms'
    }else if(obj.animationDuration.indexOf('0ms')>-1){
      obj.animationDuration[obj.animationDuration.indexOf('0ms')]='1000ms'
    }else if(obj.animationDuration.indexOf('ms')>-1){
      obj.animationDuration[obj.animationDuration.indexOf('ms')]='1000ms'
    }else if(obj.animationDuration.indexOf('')>-1){
      obj.animationDuration[obj.animationDuration.indexOf('')]='1000ms'
    }

    if(_infinite!=''){
      _infinite = ','+_infinite+' '+obj.inf_duration+' '+_timing+' '+obj.inf_delay+' forwards infinite'
    }

    // 组合动画处理
    var _animate = []
    if(Array.isArray(animateName)){
      for(var i=0;i<animateName.length;i++){
        if(obj.animationDelay[i]=='ms'){
          obj.animationDelay[i]='0ms'
        }else if(obj.animationDelay[i]&&obj.animationDelay[i].indexOf('ms')<='-1'){
          obj.animationDelay[i] = obj.animationDelay[i]+'ms'
        }
        console.log(obj.animationDuration)
        if(obj.animationDuration[i]=='ms'){
          obj.animationDuration[i]='0ms'
        }else if(obj.animationDuration[i]&&obj.animationDuration[i].indexOf('ms')<='-1'){
          obj.animationDuration[i] = obj.animationDuration[i]+'ms'
        }
        if(i==0){
          _animate.push(animateName[i] +' '+obj.animationDuration[i]+' ease-in-out '+obj.animationDelay[i]+' both 1'+_infinite)
        }else{
          _animate.push(animateName[i] +' '+obj.animationDuration[i]+' ease-in-out '+obj.animationDelay[i]+' forwards 1'+_infinite)
        }

      }
      _style.innerHTML = '.ani_'+obj.page_id+'_'+obj.id+' {-webkit-animation:'+_animate.join(',')+'; }'
    }else{
      //  _style.innerHTML = '.ani_'+obj.page_id+'_'+obj.id+' {-webkit-animation:'+animateName+' '+obj.animationDuration+' ease-in-out '+obj.animationDelay+' both 1'+_infinite+'; }'
    }
    // _style.innerHTML = '.ani_'+obj.page_id+'_'+obj.id+' {-webkit-animation:'+animateName+' '+obj.animationDuration+' ease-in-out '+obj.animationDelay+' both 1'+_infinite+'; }'


    document.getElementById('other').appendChild(_style);
  }

  createPage = function(arr){
    var $this = this,
      UI_WIDTH = $this.UI_WIDTH,
      UI_HEIGHT = $this.UI_HEIGHT,
      width = $this.width,
      height = $this.height;
    return this.allPage = arr.map(function(v,i){
      var _ele='';
      v.layout.layTemplate?$this.guestsPage(v,i):null
      v.layout.elements.forEach(function(a,b){
        a.video_path?$this.videoNext = i-1:null;
        var _y = Number(a.y/UI_WIDTH)*width,
          _maskAttr = '';

        if(a.is_scale==1){
          _y = Number(a.y/UI_HEIGHT)*height;
        }

        if(a.mask){
          _maskAttr = '-webkit-mask-image:url('+a.mask.img+');-webkit-mask-size:100% 100%;';
        }

        var obj={
          width:Number(a.width/UI_WIDTH)*width+'px',
          height:Number(a.height/UI_WIDTH)*width+'px',
          left:Number(a.x/UI_WIDTH)*width+'px',
          top:_y+'px',
          zIndex:a.z_order,
          animationDelay:a.delay||0,
          animationDuration:a.duration||0,
          type:a.type||null,
          isdown:a.is_down==0?false:true,
          id:a.id,
          page_id:'demo_'+i,
          text_type:a.text_type||null,
          infinite:a.infinite||null,
          mask:_maskAttr,
          inf_delay:a.inf_delay||0,
          inf_duration:a.inf_duration||0
        };

        // if(obj.animationDelay=='ms'){
        //   obj.animationDelay='0ms'
        // }else if(obj.animationDelay && obj.animationDelay.indexOf('ms')<='-1'){
        //   obj.animationDelay = obj.animationDelay+'ms'
        // }

        // if(obj.animationDuration=='ms'){
        //   obj.animationDuration='0ms'
        // }else if(obj.animationDuration && obj.animationDuration.indexOf('ms')<='-1'){
        //   obj.animationDuration = obj.animationDuration+'ms'
        // }
        // 判断是否是组合动画
        obj.animationDelay = obj.animationDelay
        obj.animationDuration = obj.animationDuration

        if(obj.inf_delay=='ms'){
          obj.inf_delay='0ms'
        }else if(obj.inf_delay!=''&&obj.inf_delay.indexOf('ms')<='-1'){
          obj.inf_delay = obj.inf_delay+'ms'
        }

        if(obj.inf_duration=='ms'){
          obj.inf_duration='0ms'
        }else if(obj.inf_duration!=''&&obj.inf_duration.indexOf('ms')<='-1'){
          obj.inf_duration = obj.inf_duration+'ms'
        }
        if(a.img=='http://qnm.hunliji.com/o_1bng0elfb4251up11lqk11r47ih4t.png'){console.log(obj)}
        var bottom = $this.UI_HEIGHT-a.y-a.height;
        bottom = Number(bottom/$this.UI_WIDTH)*width+'px';
        var isDown = obj.isdown?'bottom:'+bottom:'top:'+obj.top,
          style='position:fixed;width:'+obj.width+';height:'+obj.height+';left:'+obj.left+';'+isDown+';z-index:'+obj.zIndex;

        $this.positionIcon(obj,isDown,a,b,v.layout.elements.length)

        var bgImg='',rol='';
        if(a.height>=$this.UI_HEIGHT){
          if(Number(a.height/$this.UI_WIDTH)*width>height){
            height = Number(a.height/$this.UI_WIDTH)*width
          }
          rol = Math.round(a.width/a.height*$this.height)-$this.width;
          rol = rol/2;
          bgImg = '-webkit-transform:translateX(-'+rol+'px);width:auto;height:'+height+'px';
        }

        var animateName = {'pullDown':'fadeInDown','fadeInNormal':'fadeIn','stretchLeft':'bounceInLeft','stretchRight':'bounceInRight'}[a.animate] || a.animate;

        var infFun = '';
        if(obj.infinite){infFun="inf="+obj.infinite+""}

        if($this.type){
          if(a.original_path&&a.original_path!==''){
            $this.videoHave = true;
            _ele+= '<div class="videoMH nosee"></div><div id="video" class="animated '+animateName+' ani_'+obj.page_id+'_'+obj.id+'" videoW="'+a.video_width+'" videoP="'+a.video_path+'" videoH="'+a.video_height+'" style="margin-left:-'+(a.video_width/a.video_height*$this.height-$this.width)/2+'px;width:'+$this.width+'px;height:'+$this.height+'px;position:relative;">\
                <video id="vid" class="IIV"\
                x-webkit-airplay="true" \
                webkit-playsinline\
                playsinline\
                preload="true"\
                height="100%"\
                loop="true"\
                 x5-video-player-type="h5"\
                 x5-video-player-fullscreen="true"\
                 style="min-height:100%;min-width:100%"\
                 poster="'+a.original_path+'?vframe/jpg/offset/1|imageView2/1/w/'+a.video_width+'/h/'+a.video_height+'"\
                 src="'+a.original_path+'"></video>\
              </div>'
          }else{
            var _height='',_width='',_marginLeft='';

            if(a.height>=1220){
              _height = $this.height+'px';_width='auto';
              _marginLeft = (($this.UI_WIDTH/$this.UI_HEIGHT*$this.height)-$this.width)/2;
              if(_marginLeft<=0){
                _width='100%'
              }
            }

            if(obj.type=='map'){
              _height = "100%";
            }
            if(!a.img){a.img = ""}
            $this.addStyle(obj,animateName)

            _ele+= '<div '+infFun+' class="animated ani_'+obj.page_id+'_'+obj.id+'" style="'+style+'">\
                    '+(obj.type=='map'?'<img class="dwIcon" src="http://qnm.hunliji.com/o_1blaaggv063m34kok21s8k1irnc.png">':'')+'\
                    <img style="'+obj.mask+';width:'+_width+';height:'+_height+';margin-left:-'+_marginLeft+'px" class="pageImg '+(obj.type=='map'?'mapSeat':'')+'" type="'+obj.type+'" page_id="'+obj.page_id+'" id="'+obj.id+'" style="'+bgImg+'" src="'+a.img+'" />\
                </div>'

            /*if(i >= arr.length-1&&!$this.appends){
             $this.appends = true
             var bottom = $this.UI_HEIGHT-612-a.height;
             bottom = Number(bottom/$this.UI_WIDTH)*width+'px';
             var _y = Number(612/UI_WIDTH)*width, isDown = 'bottom:'+bottom;
             var style='width:78%;position:fixed;left:0px;right:0;margin:auto;top:'+Number(670/$this.UI_WIDTH)*width+'px'+';-webkit-animation-duration:500';

             _ele+= '<div '+infFun+' class="animated '+animateName+' ani_'+obj.page_id+'_'+obj.id+'" style="z-index:9;'+style+'">\
             <img  class="pageImg mapSeat" type="map"  src="" />\
             </div>'

             }*/
          }

        }else{

          if(a.video_path&&a.video_path!==''){
            $this.videoHave = true;
            _ele+= '<div class="videoMH nosee"></div><div id="video" class="animated '+animateName+' ani_'+obj.page_id+'_'+obj.id+'" videoW="'+a.video_width+'" videoP="'+a.video_path+'" videoH="'+a.video_height+'" style="margin-left:-'+(a.video_width/a.video_height*$this.height-$this.width)/2+'px;width:'+$this.width+'px;height:'+$this.height+'px;position:relative;">\
                <video id="vid" class="IIV"\
                x-webkit-airplay="true" \
                webkit-playsinline\
                playsinline\
                preload="true"\
                loop="true"\
                 x5-video-player-type="h5"\
                 x5-video-player-fullscreen="true"\
                 style="min-height:100%;min-width:100%"\
                 poster="'+a.video_path+'?vframe/jpg/offset/1|imageView2/1/w/'+a.video_width+'/h/'+a.video_height+'"\
                 src="'+a.video_path+'"></video>\
              </div>'
          }else{
            if(a.video_path==''&&a.video_path!=undefined){
              _ele+= '<div style="position:fixed;top:0;bottom:0;left:0;right:0;background:#f2f3f6;z-index:9">\
                        <img class="noVideo" style="position:fixed;top:0;bottom:0;left:0;right:0; width:35%;margin:auto;" src="//qnm.hunliji.com/o_1bk442tda19uemst1jia1db31d007.png" />\
                    </div>'
            }else{
              var _height='',_width='',_marginLeft='';

              if(a.height>=1220){
                _height = $this.height+'px';_width='auto';
                _marginLeft = (($this.UI_WIDTH/$this.UI_HEIGHT*$this.height)-$this.width)/2;
                if(_marginLeft<=0){
                  _width='100%'
                }
              }
              if(obj.type=='map'){
                _height = "100%";
              }
              if(!a.img){a.img = ""}
              $this.addStyle(obj,animateName)
              if(obj.id=='ele_7'){console.log(obj)}
              _ele+= '<div '+infFun+' class="animated ani_'+obj.page_id+'_'+obj.id+'" style="'+style+'">\
                    '+(obj.type=='map'?'<img class="dwIcon" src="http://qnm.hunliji.com/o_1blaaggv063m34kok21s8k1irnc.png">':'')+'\
                    <img style="'+obj.mask+';width:'+_width+';height:'+_height+';margin-left:-'+_marginLeft+'px" class="pageImg '+(obj.type=='map'?'mapSeat':'')+'" type="'+obj.type+'" page_id="'+obj.page_id+'" id="'+obj.id+'" style="'+bgImg+'" src="'+a.img+'" />\
                </div>'

              /*if(i >= arr.length-1&&!$this.appends){
               $this.appends = true
               var bottom = $this.UI_HEIGHT-612-a.height;
               bottom = Number(bottom/$this.UI_WIDTH)*width+'px';
               var _y = Number(612/UI_WIDTH)*width, isDown = 'bottom:'+bottom;
               var style='width:78%;position:fixed;left:0px;right:0;margin:auto;top:'+Number(670/$this.UI_WIDTH)*width+'px'+';-webkit-animation-duration:500';

               _ele+= '<div '+infFun+' class="animated '+animateName+' ani_'+obj.page_id+'_'+obj.id+'" style="z-index:9;'+style+'">\
               <img  class="pageImg mapSeat" type="map"  src="" />\
               </div>'

               }*/

            }

          }

        }




      })

      var _height = $this.height,_opacity=0;
      if(i<=$this.seating){
        _height = 0;
        _opacity = 1;
      }

      var _map='',_yy='';
      if(v.layout.layTemplate){
        _map="guestPage";
        //_yy='<div id="guest_rt"></div>';
      }

      if($this.type){
        return '<div class="ebg ele_background_'+i+'" style="position:fixed;top:0;left:0;z-index:0;-webkit-transition-duration:600ms;opacity:'+_opacity+';"><img style="width:'+$this.width+'px;height:'+$this.height+'px;" src="'+v.layout.background+'"/></div><div id="'+_map+'" page_id="'+v.id+'" style="height:'+$this.height+'px" class="layout '+($this.seating==i?" ":"hide ")+' '+_map+'">'+_yy+_ele+'</div>'
      }else{
        return '<div class="ebg ele_background_'+i+'" style="position:fixed;top:0;left:0;z-index:0;-webkit-transition-duration:600ms;-webkit-transform:translateY('+_height+'px);"><img style="width:'+$this.width+'px;height:'+$this.height+'px;" src="'+v.layout.background+'"/></div><div id="'+_map+'" page_id="'+v.id+'" style="height:'+$this.height+'px" class="layout '+($this.seating==i?" ":"hide ")+' '+_map+'">'+_yy+_ele+'</div>'
      }




    })
  }

  guestsPage = function(v,i){
    this.mapHave = true;
    this.mapNum = i;
    var $this = this,obj={};
    obj.w = 686;
    obj.h = 386;
    v.layout.elements.forEach(function(ele,n){
      if(ele.type=='map'){
        obj.w = ele.width;
        obj.h = ele.height;
      }
    })

    obj.b = 132;
    obj.x = 30.294138261208;
    obj.y = 120.11857924936;

    var _div = document.createElement('div');
    _div.setAttribute('id','map');
    _div.setAttribute('class','animated fadeIn');
    _div.style.bottom = obj.b/this.UI_WIDTH*this.width+'px';
    _div.style.width = obj.w/this.UI_WIDTH*this.width+'px';
    /*var _img = document.createElement('img');
     _img.setAttribute('src','//apis.map.qq.com/ws/staticmap/v2/?center='+obj.x+','+obj.y+'&zoom=18&size=686*386&maptype=roadmap&markers=size:large|color:0xFFCCFF|label:k|'+obj.x+','+obj.y+'&key=GMZBZ-ZCD3U-GY3VD-4PJK3-BRTK3-SQFWZ');
     _div.appendChild(_img);*/

    var _mapSrc = 'http://qnm.hunliji.com/o_1bkdrc3lf1jtje4l18a716qv1iukc.png';
    var _addr = '';
    $this.mapUrl = '//apis.map.qq.com/tools/poimarker?type=0&marker=coord:'+obj.x+','+obj.y+';coordtype:3;title:杭州婚礼纪;addr:'+_addr+'&key=GMZBZ-ZCD3U-GY3VD-4PJK3-BRTK3-SQFWZ&referer=hunliji'

    var _animateIcon = document.createElement('div');
    _animateIcon.setAttribute('id','updownIcon');
    _animateIcon.style.bottom = 160/this.UI_WIDTH*this.width+'px';
    _animateIcon.innerHTML = '<img src="'+$this.pageIcon+'"/>'

    var _guest_div = document.createElement('div');
    _guest_div.setAttribute('id','guest_action');
    // _guest_div.innerHTML = '<p id="guestBtn" style="height:'+100/$this.UI_WIDTH*$this.width+'px;line-height:'+100/$this.UI_WIDTH*$this.width+'px">宾客回复</p>';
    _guest_div.setAttribute('class','fadeIn')
    _guest_div.style.bottom = 48/$this.UI_WIDTH*$this.width+'px';
    _guest_div.innerHTML = '<p id="guestBtn" style="margin: 0 auto;width:'+500/$this.UI_WIDTH*$this.width+'px;height:'+88/$this.UI_WIDTH*$this.width+'px;line-height:'+88/$this.UI_WIDTH*$this.width+'px;border-radius: '+44/$this.UI_WIDTH*$this.width+'px;">宾客回复</p>';

    setTimeout(function(){
      $('.mapSeat').attr('src',_mapSrc)

      document.getElementById('guestPage').appendChild(_guest_div)
      //document.getElementById('guestPage').appendChild(_animateIcon)
      $this.guestAction()
      $('#guestBtn').css({'background':$this.buttonBg,'color':$this.textColor})
    },300)



  }

  guestAction = function(){
    var _div = document.createElement('div'),$this = this,_num=1,
      _bg = document.createElement('div'),
      _divMain = document.createElement('div');
    _divMain.style.display = 'none'
    _divMain.style.zIndex = '999'
    _divMain.style.position = 'relative'
    _divMain.style.height = this.height+'px';
    _bg.style.height = this.height+'px'
    _bg.setAttribute('id','guestBg')
    _div.setAttribute('id','gusetBox');

    var _p30 = 30/$this.UI_WIDTH*$this.width,
      _p140 = 140/$this.UI_WIDTH*$this.width,
      _p64 = 64/$this.UI_WIDTH*$this.width;

    var _code = '<div id="gusetCode" style="padding:0 '+_p30+'px 0 '+_p30+'px; ">\
                              <div class="ac_wish"><i>您的姓名</i><input id="gusetName" class="guset_name" style="width:70%;margin-left:'+_p30+'px;padding:'+_p30+'px 0 '+_p30+'px 0;" type="text" placeholder="请输入您的姓名..."/></div>\
                              <div class="guset_set" style="padding:'+_p30+'px 0 '+_p30+'px 0;">\
                                <div>是否赴宴</div><div class="guset_icon" style="-webkit-box-flex:18"><p state=0><span class="sk">赴宴</span></p><p state=1><span>待定</span></p><p state=2><span>有事</span></p></div></div></div>';

    _div.innerHTML = _code+"<div class='send_box'>\
              <div class='guest_num' style='height:"+Number(100/this.UI_WIDTH*this.width)+"px;line-height:"+Number(100/this.UI_WIDTH*this.width)+"px'><div class='numpre'>赴宴人数</div><div><p class='disNum_col' style='width:"+Number(192/this.UI_WIDTH*this.width)+"px;line-height:"+Number(64/this.UI_WIDTH*this.width)+"px;height:"+Number(64/this.UI_WIDTH*this.width)+"px'><i class='gnl addNum'>-</i><i class='disNum'>1</i><i class='gnr addNum ak'>+</i></p></div></div><div id='sendNum' style='line-height:"+Number(100/this.UI_WIDTH*this.width)+"px'>确定</div>\
            </div>";
    _divMain.appendChild(_div)
    _divMain.appendChild(_bg)
    document.getElementById('guestPage').appendChild(_divMain);

    $(document).on('touchstart','.guset_icon p',function(){
      var index = $('.guset_icon p').index(this);
      $this.send_state = $(this).attr('state');
      $('.guset_icon p span').removeClass('sk')
      $(this).find('span').addClass('sk')
      if(index==1||index==2){
        $('.guest_num div').css({'opacity':'0'})
        $('.guest_num .numpre').css({'opacity':'0'})
      }else{
        $('.guest_num div').css({'opacity':'1'})
        $('.guest_num .numpre').css({'opacity':'1'})
      }
      console.log(index,$(this).attr('state'))
    })

    $(document).on('touchstart','#guestBg',function(){
      var _this = $(this);
      $('#gusetBox').css({'bottom':'-200px'})
      _this.hide()
      setTimeout(function(){
        _divMain.style.display = 'none'
        $('#guestPage').find('.animated').show()
        $('#map').show()
        //$('#updownIcon img').css({'opacity':'1'})
      },600)
    })

    $(document).on('touchstart','#guestBtn',function(){

      if($this.type){$this.outputMsg('请先发送请帖');return false;}
      $('#updownIcon img').css({'opacity':'0'})
      if($this.send_name!=''){
        $('#gusetName').val($this.send_name)
      }
      _divMain.style.display = 'block'
      setTimeout(function(){$('#guestBg').show();$('#gusetBox').css({'bottom':0})})

      //$('#guestPage').find('.animated').hide()
      //$('#map').hide()

      //$('#guest_action').hide()
      $('.disNum_col').css({'left':$('.numpre').width()+'px'})

    })

    $(document).on('touchstart','#sendNum',function(){
      if($this.type){$this.outputMsg('请先发送请帖');return false;}
      if($('#gusetName').val()!=''){
        $this.send_name = $('#gusetName').val()
        $('#gusetBox').css({'bottom':'-200px'})
        $('#guestBg').hide()
        setTimeout(function(){
          _divMain.style.display = 'none'
          $('#guestPage').find('.animated').show()
          $('#map').show()
          //$('#guest_action').show()
          $this.fy = true
          $this.ajax_reply({
            card_id:$this.card_id,
            count:$this.send_state==1||$this.send_state==2?0:_num,
            name:$this.send_name,
            state:$this.send_state,
            //wish_language:$this.send_wish
          })
          // $('#updownIcon img').css({'opacity':'1'})
        },600)

      }else{
        $this.outputMsg('请填写您的姓名')
      }

    })

    $(document).on('touchstart','.gnl',function(){
      var _index = $('.addNum').index(this);
      if(_num>1){
        _num--;
        _num==1?$('.addNum').eq(0).removeClass('ak'):null;
      }
      $('.disNum').text(_num);
    })

    $(document).on('touchstart','.gnr',function(){
      var _index = $('.addNum').index(this);
      _num++;
      $('.addNum').eq(0).addClass('ak');
      $('.disNum').text(_num);
    })


    document.addEventListener("resize", function(){
      if($("#gusetName").is(":focus")){
        if($("#gusetName").val()!=''){
          document.getElementById('other').style.WebkitTransform = 'translateY(0px)'
        }else{
          document.getElementById('other').style.WebkitTransform = 'translateY(-360px)'
        }

      }

    })


  }

  musicStatePause = function(){
    return this.musicStatePause
  }

  changeMusic = function(_music){

    document.getElementById('playMusic').setAttribute('src',_music)
    if(this.musicStatePause=='false'){
      document.getElementById('playMusic').play();
    }


  }

  musicPause = function($state){
    var $this = this,_on = $this.musicOpen&&$this.musicOpen!=""?$this.musicOpen:'//qnm.hunliji.com/o_1bi67lq091qtt1gfs60cpadqjj7.png',
      _off = $this.musicClose&&$this.musicClose!=""?$this.musicClose:'//qnm.hunliji.com/o_1bi67m2q63tilg81vh1q3v10g6c.png';

    if($state){
      this.musicStatePause = true;
      this.writeCookie('musicStatePause','true',360)
      document.getElementById('playMusic').pause()
      $('#musicBtn').removeClass('rotate')
      $('#musicBtn img').attr('src',_off)

    }else{
      this.musicStatePause = false;
      this.writeCookie('musicStatePause','false',360)
      document.getElementById('playMusic').play()
      $('#musicBtn').addClass('rotate')
      $('#musicBtn img').attr('src',_on)

    }

  }

  changeVideo = function(_video,_vw,_vh){
    var $this = this;

    $('#vid').attr('src',_video)
    $('#vid').attr('poster',_video+'?vframe/jpg/offset/1|imageView2/1/w/'+_vw+'/h/'+_vh+'')

    if(_vw<_vh){
      $('#video').css({'margin-left':'-'+(_vw/_vh*$this.height-$this.width)/2})
      $('#video').css({'height':'auto'})
    }else{
      $('#video').css({'margin-left':'-'+(_vw-$this.width)/2+'px'})
    }
    if(document.getElementById('vid')){
      document.getElementById('vid').muted = "muted";
      document.getElementById('vid').play()
    }


  }

  exchangePage = function(a,b){
    var _a = this.result.page[a],
      _b = this.result.page[b];

    this.result.page[a] = _b;
    this.result.page[b] = _a;

    this.seatState = true;
    if(this.seating == a){
      this.seating = b;
      if(b==this.result.page.length-1){
        this.sortS = a;
      }

    }else if(this.seating == b){
      this.seating = a
      this.exPage = a+1
    }
  }

  editIconState = function($b){
    var $this = this,editIcon = $('.editIcon');
    $this.editState = $b
    $this.writeCookie('editState',$b,360)
    if($b){console.log(editIcon.length,$b)
      for(var i=0;i<editIcon.length;i++){
        if(editIcon.eq(i).attr('page_id')==$this.result.page[$this.seating].id){
          editIcon.eq(i).removeClass('hide');console.log(i)
        }
      }
    }else{
      editIcon.removeClass('hide')
      editIcon.addClass('hide')
    }

  }

  addPage = function(obj,$guest){
    var $this = this,_gstate=false;
    this.result.page.forEach(function(page,n){
      if(page.layout.layTemplate){
        _gstate = true;
        $this.result.page.splice(n,1)
      }
    })

    $this.result.page.push(obj)

    if(!this.guestState&&$guest){
      _gstate?$this.result.page.push($this.guests.html):null
      $this.guestState = true
      $this.seating = $this.result.page.length-1;
    }else if(this.guestState){
      $this.result.page.push($this.guests.html)
      $this.seating = $this.result.page.length-2;
    }else{
      $this.seating = $this.result.page.length-1;
    }

    //this.seatState = true

    $this.get_infinite()
    if(this.seatState){
      $this.seatState = false

    }else{

    }

    $('#all-page').empty().append($this.createPage($this.result.page))
    $this.lastAbout()
    setTimeout(function(){
      //$this.add_infinite()
      console.log($this.seating)
    },1600)

    if($this.editState){
      var editIcon =  $('.editIcon');
      editIcon.addClass('hide');
      for(var i=0;i<editIcon.length;i++){
        if(editIcon.eq(i).attr('page_id')==$this.result.page[$this.seating].id){
          editIcon.eq(i).removeClass('hide');
        }
      }
    }
  }

  editCard_app = function($state,obj){
    if($state=='a'){
      if(navigator.userAgent.indexOf('Android') > -1){
        window.messageHandlers.onEditBasicInfo(JSON.stringify(obj));
      }else if(navigator.userAgent.indexOf('iPhone') > -1){
        window.webkit.messageHandlers.onEditBasicInfo.postMessage(obj);
      }
    }else{
      if(navigator.userAgent.indexOf('Android') > -1){
        window.messageHandlers.onEditPageHole(JSON.stringify(obj));
      }else if(navigator.userAgent.indexOf('iPhone') > -1){
        window.webkit.messageHandlers.onEditPageHole.postMessage(obj);
      }
    }
  }

  editPageHoles = function($arr){
    var _ele = $('.pageImg'),
      _eles = _ele.length;

    for(var i=0;i<_eles;i++){
      $arr.forEach(function(a,b){
        var _el = _ele.eq(i);
        if(_el.attr('page_id')==a.page_id&&_el.attr('id')==a.id&&_el.attr('type')==a.type){
          _el.attr('src',a.img)
        }
      })
    }

    this.result.page.forEach(function(page,i){
      $arr.forEach(function(arr,s){
        if(page.id == arr.page_id){
          page.layout.elements.forEach(function(ele,n){

            if(ele.id&&ele.id == arr.id && ele.type == arr.type){
              ele.img = arr.img
            }

          })
        }
      })
    })

  }

  delPage = function(n){
    if(n<=0){return false}
    var page_id = this.result.page[n].id,$this = this;
    this.result.page.splice(n,1);
    if($this.seating==n){$this.gotoPage(n-1)}
    else if($this.seating>n){$this.seating--}
    setTimeout(function(){
      delFun()
    },600)
    function delFun(){
      for(var r=0;r<$('.ebg').length;r++){
        $('.ebg').eq(r).removeClass('ele_background_'+r);
      }

      var editIcon = $('.editIcon');
      for(var i=0;i<editIcon.length;i++){
        if(editIcon.eq(i).attr('page_id')==page_id){
          editIcon.eq(i).remove();
        }
      }

      setTimeout(function(){
        for(var i=0;i<$('.layout').length;i++){
          if($('.layout').eq(i).attr('page_id') == page_id){
            $('.layout').eq(i).remove();
            $('.ebg').eq(i).remove();
          }
        }
      },100)

      setTimeout(function(){
        for(var r=0;r<$('.ebg').length;r++){
          $('.ebg').eq(r).addClass('ele_background_'+r);
        }
        $this.lastAbout()
      },200)
    }

  }

  getCurrentPage = function(){
    return this.seating
  }

  gotoPage = function(n){
    var $this = this,_seating = $this.seating;
    if(n==_seating) return false;
    var s=0;
    while(s<=n){
      $('.ele_background_'+s).css({'-webkit-transform':'translateY(0)'});
      s++
    }
    /*     created by an_ying 20170926   请帖预览不要箭头    */
    if(!!$this.getParams('hide')){
      $('#upImg').hide()
    }

    $('#video').parent().removeClass('vhave');
    $('#video').on('touchstart',function(){
      if(navigator.userAgent.indexOf('Android') > -1){
        document.getElementById('vid').muted = "muted";
        document.getElementById('vid').play()
      }
    })

    if(n<_seating){

      $('.layout').eq(n).removeClass('hide').css({'-webkit-transform':'scale(1) translateY(0)'})
      $('.layout').eq(_seating).addClass('hide').css({'-webkit-transform':'translateY(0)'})

    }else{

      $('.layout').eq(n).removeClass('hide').css({'-webkit-transform':'translateY(0)'})
      $('.layout').eq(_seating).addClass('hide')

    }

    $this.seating = n;
    $this.seatState = false

    $('#all-page').css({'opacity':0})
    setTimeout(function(){
      $('#all-page').css({'opacity':1})
      $('#all-page').empty().append($this.createPage($this.result.page))
      $this.lastAbout()
    },600)



    if(!$this.editState){return false}

    var editIcon =  $('.editIcon');
    editIcon.addClass('hide');
    for(var i=0;i<editIcon.length;i++){
      if(editIcon.eq(i).attr('page_id')==$this.result.page[$this.seating].id){
        editIcon.eq(i).removeClass('hide');
      }
    }



  }

  autoPlayPage = function(){
    var $this = this,ts,
      n = $this.seating;
    if($this.autoState){
      clearTimeout(ts)
      return false
    }
    $('#video').parent().removeClass('vhave');
    if(n<$this.result.page.length-1){
      n++
      $this.gotoPage(n);
      ts = setTimeout(function(){
        $this.autoPlayPage();
        clearTimeout(ts)
      },7000)
    }else{
      n=0;
      $('.ebg').css({"-webkit-transform":'translateY('+$this.height+'px)'})

      $this.gotoPage(n);
      ts = setTimeout(function(){
        $this.autoPlayPage();
        clearTimeout(ts)
      },7000)
    }
  }

  positionIcon = function(obj,isDown,v,i,ws){
    var $this = this,width=$this.width,state = isDown;
    if(v.text_type){
      $this.log.push({
        text_type:v.text_type,
        x:v.x,
        y:v.y,
        w:v.width,
        h:v.height,
        id:v.id,
        page_id:obj.page_id
      })

      if(i==ws-1){
        var wf={};
        wf.x = this.log[0].x;
        wf.y = this.log[0].y;
        for(var r=0;r<this.log.length;r++){
          Number(wf.x)>Number(this.log[r].x)?wf.x=this.log[r].x:null
          Number(wf.y)<Number(this.log[r].y)?wf.y=this.log[r].y:null

          if(wf.x==this.log[r].x){
            wf.w = this.log[r].w;
            Number(wf.w) < Number(this.log[r].w)?wf.w = this.log[r].w:null
          }

          if(wf.y==this.log[r].y){
            wf.h = this.log[r].h;
            Number(wf.h) < Number(this.log[r].h)?wf.h = this.log[r].h:null
          }

        }

        if(obj.isdown){
          state = 'bottom:'+Number(($this.UI_HEIGHT-wf.y-wf.h/2)/$this.UI_WIDTH*width+20)+'px'
        }else{
          if(v.height>=$this.UI_HEIGHT){
            state = 'top:'+($this.height-20)/2+'px'
          }else{
            state = 'top:'+Number(Number(wf.y)/2 + wf.h/$this.UI_WIDTH*width/2-20)+'px'
          }
        }
        var _style={
          top:state,
          left:Number(wf.x/$this.UI_WIDTH)*width + Number(wf.w/$this.UI_WIDTH)*width/2-20+'px'
        }

        var _edit='<div class="editIcon edit_text card_info hide" page_id="'+obj.page_id+'" id="'+obj.id+'" type="'+obj.type+'" style="'+_style.top+';left:'+_style.left+'"><i></i><em></em><img src="//qnm.hunliji.com/o_1bhqvmcadnkk152v13f1nka14i47.png" /></div>';
        $('#other').append(_edit)

        return false
      }else{
        return false
      }

    }

    if(obj.type){
      if(obj.isdown){
        if(v.video_path){
          state = 'bottom:'+Number($this.height/2-(20+10))+'px'
        }else{
          state = 'bottom:'+Number(($this.UI_HEIGHT-v.y-v.height/2)/$this.UI_WIDTH*width-20)+'px'
        }

      }else{
        if(v.height>=$this.UI_HEIGHT){
          state = 'top:'+($this.height-20)/2+'px'
        }else{
          state = 'top:'+Number(Number(v.y)/2 + v.height/$this.UI_WIDTH*width/2-20)+'px'
        }
      }
      var _style={
        top:state,
        left:Number(v.x/$this.UI_WIDTH)*width + Number(v.width/$this.UI_WIDTH)*width/2-20+'px'
      }
      if(v.video_width){
        _style.left = Number($this.width/2-20)+'px';
        _style.top = "top:120px"
      }

      var _edit='<div  class="editIcon edit_img hide '+(obj.type=='map'?"card_info":"")+' '+(v.video_width?"videoIcon":"")+'" videoW="'+v.video_width+'" videoH="'+v.video_height+'" videoP="'+v.video_path+'" page_id="'+obj.page_id+'" id="'+obj.id+'" type="'+obj.type+'" style="'+_style.top+';left:'+_style.left+'"><i></i><em></em><img src="//qnm.hunliji.com/o_1bhqvmcadnkk152v13f1nka14i47.png" /></div>';

      $('#other').append(_edit)
    }

  }

  lastAbout = function(){
    if($('#lastAbout').length>0||this.type){return false}
    this.lastState = true;
    this.lastDown = true
    var obj={},_code='';
    obj.logo = '//qnm.hunliji.com/o_1bid6p3ojgs8uptnu919pd5os7.png';
    obj.logo_w = 180;
    obj.twoImg = '//qnm.hunliji.com/o_1bid6qlpm1vhpqiv7uf1dm111ojc.png';
    obj.towImg_w = 400;

    if(this.card_claim==1){
      _code = '<div id="lastAbout">\
            <div class="logo"><img src="'+obj.logo+'"/></div>\
            <h5>制作电子请帖，长按识别二维码</h5>\
            <div class="two2d"><img src="'+obj.twoImg+'"/></div>\
            <div class="moreIcon"><a href="/p/wedding/Public/wap/qingtierenling/#/main/'+this.card_id+'">\
            <img src="//qnm.hunliji.com/o_1bk641rrveupcfq1m9rtkidlj7.png"/>\
            </a><a style="opacity:0;-webkit-box-flex: 20;"><img src="http://qnm.hunliji.com/o_1bk6427sv1pnbdpd11pr13k613sqc.png"/>\
            </a><a href="/p/wedding/Public/wap/invitationCard/feedBack/#/index/'+this.card_id+'">\
            <img src="//qnm.hunliji.com/o_1bk6427sv1pnbdpd11pr13k613sqc.png"/>\
            </a></div></div>';
    }else{
      _code = '<div id="lastAbout">\
          <div class="logo"><img src="'+obj.logo+'"/></div>\
          <h5>制作请帖长按，长按识别码</h5>\
          <div class="two2d"><img src="'+obj.twoImg+'"/></div>\
          <p>投诉与建议</p>\
        </div>';
    }

    $('#other').append(_code);
    $('#lastAbout').css({'top':this.height+'px','padding-top':116/this.UI_WIDTH*this.width+'px','width':this.width+'px','height':this.height+'px'})
    $('.logo').css({'width':obj.logo_w/this.UI_WIDTH*this.width+'px'})
    $('.two2d').css({'width':obj.towImg_w/this.UI_WIDTH*this.width+'px'})
    $('.moreIcon').css({'marginTop':90/this.UI_WIDTH*this.width+'px','width':obj.towImg_w/this.UI_WIDTH*this.width+'px'})
    $('#lastAbout h5').css({'margin-top':60/this.UI_WIDTH*this.width+'px','margin-bottom':20/this.UI_WIDTH*this.width+'px','font-size':28/this.UI_WIDTH*this.width+'px'})
    $('#lastAbout h3').css({'margin-top':32/this.UI_WIDTH*this.width+'px','font-size':32/this.UI_WIDTH*this.width+'px'})
    $('#lastAbout p').css({'margin-top':162/this.UI_WIDTH*this.width+'px','font-size':28/this.UI_WIDTH*this.width+'px'})

    var hammertime = new Hammer(document.getElementById("lastAbout"));
    var $this = this;
    hammertime.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
    })
    hammertime.on("swipe",function(e){
      var deltaY = e.deltaY;
      if(deltaY>0){
        if($('#lastAbout').css('top')=='0px'&&$this.seating==$this.result.page.length-1&&!$this.lastDown){
          $this.lastDown = true
          $('#lastAbout').css({'top':$this.height+'px','opacity':0});
          return false
        }
      }
    })

  }

  upDownIcon = function(){
    var $this = this,_animateIcon = document.createElement('div');
    _animateIcon.setAttribute('id','upImg');
    _animateIcon.style.bottom = 80/this.UI_WIDTH*this.width+'px';
    _animateIcon.innerHTML = '<img src="//qnm.hunliji.com/o_1agpam0fsibn2814j110101jcr7.png"/>'
    document.body.appendChild(_animateIcon)
    if($this.pageIcon&&$this.pageIcon!=""&$this.pageIcon!==null){
      $('#upImg img').attr('src',$this.pageIcon)
    }
  }

  touchAction = function(){
    var hammertime = new Hammer(document.getElementById("wrap"));
    var $this = this;
    hammertime.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
    })
    hammertime.on("swipe",function(e){
      var deltaY = e.deltaY;
      /*if(deltaY>0){
       if($this.seating==0&&$this.type){$this.gotoPage($this.result.page.length-1)}
       }else{
       if($this.seating>=$this.result.page.length-1&&$this.type){$this.gotoPage(0)}
       }*/

      $this.autoState = true;
      if(deltaY<0){
        if($this.seating<=$this.result.page.length-2){
          $this.lastState?null:$this.lastAbout()
          //  setTimeout(function(){$this.rov_infinite(deltaY)},600)
        }else if(!$('.layout').eq($this.result.page.length-1).hasClass('hide') &&$this.seating==$this.result.page.length-1&&$('#lastAbout').css('top')==$this.height+'px'&&$this.lastDown){
          $this.lastDown = false
          $('#lastAbout').css({'top':0,'opacity':1})
        }
        $('#upImg img').css({'opacity':0})

      }else{
        if($('#lastAbout').css('top')=='0px'&&$this.seating==$this.result.page.length-1&&!$this.lastDown){
          $this.lastDown = true
          $('#lastAbout').css({'top':$this.height+'px','opacity':0});
          return false
        }
        // $this.seating>0?setTimeout(function(){$this.rov_infinite(deltaY)},600):null
        if($this.seating<=1){$('#upImg img').css({'opacity':1})}
      }


      if(deltaY>0&&$this.seating>0){

        if($this.seatState){
          var _seat = $this.seating;
          if($this.exPage){
            _seat = $this.exPage+1
          }else{
            if($this.sortS){
              _seat = Number($this.sortS+1)
            }
          }
          $this.seatState = false
          $('.layout').eq(_seat-1).css({'-webkit-transform':'translateY('+$this.height+'px)'})
          $('#all-page').css({'opacity':0})
          $('.ele_background_'+Number(_seat-1)).css({'-webkit-transform':'translateY('+$this.height+'px)'})
          setTimeout(function(){
            $('#all-page').css({'opacity':1})
            $('#all-page').empty().append($this.createPage($this.result.page))
            $this.lastAbout()
          },600)

        }

        if(navigator.userAgent.indexOf('Android') > -1){
          if($this.seating-2==$this.videoNext&&document.getElementById('vid')){
            setTimeout(function(){
              document.getElementById('vid').muted = "muted";
              document.getElementById('vid').play()
            },600)
          }
        }

        $this.seating--;

        if($this.type){
          $('.layout').eq($this.seating+1).css({'opacity':'0'})
          $('.ele_background_'+Number($this.seating+1)).css({'opacity':'0'})

          setTimeout(function(){
            $('.layout').eq($this.seating).removeClass('hide').css({'opacity':'1'})
            $('.layout').eq($this.seating+1).addClass('hide').css({'opacity':'1'})
          },600)
        }else{
          $('.layout').eq($this.seating+1).css({'-webkit-transform':'translateY('+$this.height+'px)'})
          $('.ele_background_'+Number($this.seating+1)).css({'-webkit-transform':'translateY('+$this.height+'px)'})

          setTimeout(function(){
            $('.layout').eq($this.seating).removeClass('hide').css({'-webkit-transform':'scale(1) translateY(0)'})
            $('.layout').eq($this.seating+1).addClass('hide').css({'-webkit-transform':'translateY(0)'})
          },600)
        }



      }else if(deltaY<0&&$this.seating<$this.result.page.length&&$this.seating!=$this.result.page.length-1){

        if($this.seatState){
          var _seat = $this.seating;
          if($this.exPage){
            _seat = $this.exPage+1
          }
          $this.seatState = false
          $('.layout').eq(_seat-1).css({'-webkit-transform':'translateY(-'+$this.height+'px)'})
          $('#all-page').css({'opacity':0})
          $('.ele_background_'+Number(_seat-1)).css({'-webkit-transform':'translateY(0px)'})
          setTimeout(function(){
            $('#all-page').css({'opacity':1})
            $('#all-page').empty().append($this.createPage($this.result.page))
            $this.lastAbout()
          },600)
        }

        if(navigator.userAgent.indexOf('Android') > -1){
          if($this.seating==$this.videoNext&&document.getElementById('vid')){
            setTimeout(function(){
              document.getElementById('vid').muted = "muted";
              document.getElementById('vid').play()
            },600)
          }
        }

        $this.seating++;

        if($this.type){
          $('.layout').eq($this.seating-1).css({'opacity':'0'});
          $('.ele_background_'+$this.seating).css({'opacity':'1'})
          setTimeout(function(){
            $('.layout').eq($this.seating).removeClass('hide')
            $('.layout').eq($this.seating-1).addClass('hide')
          },600)
        }else{
          $('.layout').eq($this.seating-1).css({'-webkit-transform':'scale(1) translateY(-'+$this.height*1.2+'px)'});
          $('.ele_background_'+$this.seating).css({'-webkit-transform':'translateY(0)'})
          setTimeout(function(){
            $('.layout').eq($this.seating).removeClass('hide').css({'-webkit-transform':'translateY(0)'})
            $('.layout').eq($this.seating-1).addClass('hide')
          },600)
        }

      }

      //setTimeout(function(){$this.chatMsg()},600)

      if($this.editState){
        var editIcon =  $('.editIcon');
        editIcon.addClass('hide');
        for(var i=0;i<editIcon.length;i++){
          if(editIcon.eq(i).attr('page_id')==$this.result.page[$this.seating].id){
            editIcon.eq(i).removeClass('hide');
          }
        }
      }



    });

  }

  getParams = function($obj){
    var _params = get_url_param();
    return _params[$obj];
    function get_url_param(){
      var urlParams;
      var match,
        pl = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function(s) {
          return decodeURIComponent(s.replace(pl, " "));
        },query;
      window.location.hash.substring()?
        query = (window.location.hash.substring().split('?'))[1]
        :
        query = window.location.search.substring(1);
      urlParams = {};
      while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
      return urlParams;
    }
  }

  sendCash = function(params){
    var data = encodeURIComponent(JSON.stringify(params.data));
    api = encodeURIComponent(params.api),
      callback = encodeURIComponent(params.callback),
      SouName = encodeURIComponent(params.SouName);
    location.href='/p/wedding/Home/Pay/cash_gift?Params='+data+'&SouName='+SouName+'&api='+api+'&callback='+callback;
  }

  sendGift = function(params){
    var paySouName = encodeURIComponent(params.paySouName),
      payName = encodeURIComponent(params.payName),
      payGift = encodeURIComponent(params.payGift),
      payApi = encodeURIComponent(params.payApi),
      payParams = encodeURIComponent(JSON.stringify(params.payParams)),
      payMoney = encodeURIComponent(params.payMoney),
      payCallBack = encodeURIComponent(params.payCallBack);

    location.href='/p/wedding/Home/Pay/card?paySouName='+paySouName+'&payName='+payName+'&payGift='+payGift+'&payApi='+payApi+'&payParams='+payParams+'&payMoney='+payMoney+'&payCallBack='+payCallBack
  }

  writeCookie = function(name, value, hours){
    var expire = "";
    if(hours != null){
      expire = new Date((new Date()).getTime() + hours * 3600000);
      expire = "; expires=" + expire.toGMTString();
    }
    document.cookie = name + "=" + escape(value) + expire + ";path=/";
  }

  getCookie = function(cookieName){
    var cookieValue = document.cookie;
    var cookieStartAt = cookieValue.indexOf(""+cookieName+"=");
    if(cookieStartAt==-1){
      cookieStartAt = cookieValue.indexOf(cookieName+"=");
    }
    if(cookieStartAt==-1){
      cookieValue = null;
    }else{
      cookieStartAt = cookieValue.indexOf("=",cookieStartAt)+1;
      cookieEndAt = cookieValue.indexOf(";",cookieStartAt);
      if(cookieEndAt==-1)
      {
        cookieEndAt = cookieValue.length;
      }
      cookieValue = unescape(cookieValue.substring(cookieStartAt,cookieEndAt));
    }
    return cookieValue;
  }

  sdkData = function(_data,_met){
    var $this = this,obj = '{"events":['+JSON.stringify(_data)+']}';
    $.ajax({
      url:$this.API.sdkData,
      type:'post',
      data:obj,
      success:function(result){
        console.log(result)
        if(_met){_met()}
      }
    })

  }

  rans = function(len) {
    if(localStorage.getItem('rans')){
      return localStorage.getItem('rans');
    }else{
      len = len || 32;
      var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
      var maxPos = $chars.length;
      var pwd = '';
      for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
      }
      localStorage.setItem('rans',pwd)
      return pwd;
    }

  }

  sdk = function(){
    var $this = this;
    $.ajax({
      url:'https://www.hunliji.com/sms/ip',
      type:'get',
      success:function(result){
        $this.ip = result;
      }
    })

    setTimeout(function(){
      $this.sdkData({
        action:'view',
        eventable_type:'CardV3',
        additional:{
          ip: $this.ip,
          card_id:$this.card_id,
          num:$this.rans(32)
        }
      })
    },3000)
  }


  return {
    otherAction:otherAction,//弹幕，祝福，送礼物，送礼金开关
    guestPageHide:guestPageHide,//宾客页是否隐藏
    ajax_reply:ajax_reply,
    ajax_info:ajax_info,
    ajax_gifts:ajax_gifts,
    closeCardState:closeCardState,//关闭请帖状态
    init:init,//初始化
    get_infinite:get_infinite,
    weddingRedPice:weddingRedPice,//赠送红包
    selectGift:selectGift,//赠送礼物
    // getGifts_replies:getGifts_replies,
    chatMsg:chatMsg,//祝福聊天模块
    gift_action:gift_action,
    winMsg:winMsg,
    outputMsg:outputMsg,
    loadAnimate:loadAnimate,
    allImg:allImg,
    loading:loading,
    add_infinite:add_infinite,
    rov_infinite:rov_infinite,
    addStyle:addStyle,
    createPage:createPage,//插入DOM
    guestsPage:guestsPage,//加载宾客页
    guestAction:guestAction,//宾客相关事件
    musicPause:musicPause,//关闭/开启音乐
    changeVideo:changeVideo,//更换视频
    changeMusic:changeMusic,//更换音乐
    musicStatePause:musicStatePause,
    exchangePage:exchangePage,//置换位置
    addPage:addPage,//追加单页
    editPageHoles:editPageHoles,//编辑请帖
    delPage:delPage,//删除请帖单页
    getCurrentPage:getCurrentPage,
    gotoPage:gotoPage,//激活已选单页
    autoPlayPage:autoPlayPage,//是否自动翻页
    positionIcon:positionIcon,//激活编辑图标
    lastAbout:lastAbout,
    upDownIcon:upDownIcon,
    touchAction:touchAction,//触发事件
    editCard_app:editCard_app,//编辑请帖APP触发事件
    editIconState:editIconState, //编辑图标状态,
    getParams:getParams,
    sendGift:sendGift,
    sendCash:sendCash,
    writeCookie:writeCookie,
    getCookie:getCookie,
    rans:rans,
    sdkData:sdkData,
    sdk:sdk,
  }

}()

var INVITATION_CARD = new boot()
INVITATION_CARD.ajax_info()