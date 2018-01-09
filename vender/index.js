/**
 * Created by nxy on 2018/1/9.
 */
function sui() {
  this.result = ''; //数据源
  this.card_id = ''; //请帖ID
  this.allPage = []; //请帖单页
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.UI_WIDTH = 750;//UI稿尺寸
  this.UI_HEIGHT = 1220;//UI稿尺寸
  this.seating = 0;//当前请帖页
  this.localhost = "https://api.suiliji.com";
  this.API = {
    template: '/api/share/get-data-by-template-id'
  }
}

sui.prototype = function() {
  ajax_info = function() {
    var $this = this;

    this.card_id = this.getParams('card_id');

    $.ajax({
      url: $this.localhost+$this.API.template,
      type: 'post',
      dataType: 'json',
      data: {template_id: $this.card_id},
      success: function(res) {
        if(res.status === 'success') {
          $this.result = res.data;

          $this.init();
        }
      }
    })
  };

  //获取到数据后初始化页面
  init = function() {
    var $this = this
    var _imgs = [],_ele = $this.result.page[0].elements;
    for(var i=0;i<_ele.length;i++) {
      _imgs.push(_ele[i].img)
    }

    this.loading(_imgs, function() {
      $("#all-page").append($this.createPage($this.result.page));

      console.log($this.seating);
      $(".page").hide().eq($this.seating).show();
      $this.touchAction();
    })
  };

  //插入DOM元素
  createPage = function(arr) {
    var $this = this;
    return this.allPage = arr.map(function(v, i) {
      var ele = '';
      v.elements.forEach(function(a, b) {

        var obj = {
          width:Number(a.width)+'px',
          height:Number(a.height)+'px',
          left:Number(a.x/10)+'px',
          top:Number(a.y/10),
          zIndex:a.z_order,
          animationDelay:a.delay||0,
          animationDuration:a.duration||0,
          type:a.type||null,
          isdown:a.is_down==0?false:true,
          id:a.id,
          page_id:'demo_'+i,
          text_type:a.text_type||null,
          infinite:a.infinite||null,
          // mask:_maskAttr,
          inf_delay:a.inf_delay||0,
          inf_duration:a.inf_duration||0
        };
        var style = 'position:fixed;width:'+obj.width+';height:'+obj.height+';left:'+obj.left+';top:'+obj.top+';left:'+obj.left+';zIndex:'+obj.zIndex+';animationDelay:'+obj.animationDelay+';animationDuration:'+obj.animationDuration+'';

        ele+= '<div class="animated '+a.animate+'" style="'+style+'">' +
          '<img src="'+a.img+'">' +
          '</div>'
      })

      return '<div class="hide page ele_'+i+'">'+ele+'</div>'
    })
  };

  //缓存图片
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
  };

  touchAction = function() {
    var hammertime = new Hammer(document.getElementById("wrap"));
    var $this = this;
    hammertime.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
    })

    hammertime.on("swipe",function(e){
      var deltaY = e.deltaY;

      if(deltaY > 0) {
        if($this.seating>0) {
          $this.seating--;
          $(".page").hide().eq($this.seating).show();
        }
      } else {
        if($this.seating<1) {
          $this.seating++;
          $(".page").hide().eq($this.seating).show();
        }
      }
    })
  }

  //获取参数
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

  return {
    ajax_info: ajax_info,
    init: init,
    loading: loading,
    touchAction: touchAction,
    createPage: createPage,//插入DOM元素
    getParams: getParams
  }
}();



var INVITATION_CARD = new sui();
INVITATION_CARD.ajax_info();