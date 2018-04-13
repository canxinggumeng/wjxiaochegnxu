import util from '../../../utils/commonRequest';

Page({
  data:{
    param:{
      page:1,
      page_size:10
    },
    uid:0,
    brandList:[],
    typeArray:[],//分类名称
    moneyChoose:'金额',
    typeChoose:'全部分类',
    sortChoose:'排序',
    moneyArray: [{'name':'全部','min':'','max': ''},
                 {'name':'10万以下','min':undefined,'max': 10}, 
                 {'name':'10-20万','min':10,'max': 20}, 
                 {'name':'20-50万','min':20,'max': 50}, 
                 {'name':'50-100万','min':50,'max': 100}, 
                 {'name':'100万以上','min':100,'max': undefined}
                ],//金额分类
    sortArray:[
                {'name':'人气最高','by':'hot'},
                {'name':'最新加入','by':'new'},
                {'name':'金额从低到高','by':'investment_asc'},
                {'name':'金额从高到低','by':'investment_desc'},
                {'name':'已参加过招商会','by':'joined'},
              ],//排序
    allType:[],
    ColoumIndex1:0,//第一列选项的 index
    ColoumIndex2:0,//第二列选项的 index
    multiindex:[0,0],//一定要设置此初始值，要不然会渲染错误，导致value=null，进而导致第一次bindcolumnchange 无效，大坑！！
    haveMore:true,
    bottomText:'上拉加载更多',
    nomessage:false
    // showBottomText:true
  },
  onLoad:function(options){
    let pid = 'param.categorys1_id';
    let uid = wx.getStorageSync('wjuserInfo').uid;
    this.setData({
      [pid]:options.id,
      uid:uid
    })
    this.getCategories(options.id);
    this.getBrandList(this.data.param);
    
  },
  onReady:function(){
       
  },
  // 请求品牌列表数据
  getBrandList: function (params) {
    util.showLoading('数据加载中...');
    let _this = this;
    util.requestPost("api/brand/lists", params, function (res) {
      
      if(res.data.message.length < params.page_size){
        _this.setData({
          bottomText:'数据加载完毕',
          haveMore:false
        })
      }else{
        _this.setData({
          bottomText:'上拉加载更多',
          haveMore:true
        })
      }
      if (_this.data.param.page == 1) {
        _this.setData({
          brandList: res.data.message,
          nomessage:res.data.message.length > 0 ? false : true
        });
        console.log(_this.data.brandList)
      } else {
        _this.setData({
          brandList: _this.data.brandList.concat(res.data.message),
        })
      }
      util.hideToast();
    });
  },
  //获取全部分类名称
  getCategories(id){
    let _this = this;
    util.requestPost("api/brand/categories",{},function(res){
      console.log('加载完毕')
      if(res.data.status){
        let firArr1 = [],Arr=[];
        let upName = '',currentIndex=0,currentChlid=[{name: "全部"}];
        for(let i=0;i<res.data.message.length; i++){
          if (res.data.message[i].id == id){
            upName = res.data.message[i].name;
            currentIndex = i;
            currentChlid = res.data.message[i].children;
           }
            // upName = res.data.message[i].id == id ? res.data.message[i].name : '全部分类'
            firArr1.push({'name':res.data.message[i].name})
        };
        Arr.push(firArr1);
        Arr.push(currentChlid);
        _this.setData({
          allType:res.data.message,
          typeChoose:upName,
          typeArray:Arr,
          multiindex:[currentIndex,0]
        });
      }
    })
  },
  
  //获取二级分类
  getSecCate(index){
    let  allType = this.data.allType; 
    let  secArr = allType[index].children;
    return secArr;
  },
  
  searchByWords(e){
    let value = e.detail.value;
    let words = 'param.keywords';
    let page = 'param.page';
    this.setData({
      [words]:value,
      [page]:1
    })
    this.getBrandList({'keywords':value,'page':this.data.param.page});
  },
  typeFirChange(e){
    let value= e.detail.value;
    let chooseData = value[1]===0 ? this.data.allType[value[0]] : this.data.allType[value[0]].children[value[1]];
    let pid,id;
    if(value[1] === 0){
      pid = 'param.categorys2_id' ;
      id = 'param.categorys1_id';
    }else{
      id = 'param.categorys2_id' ;
      pid = 'param.categorys1_id';
    }
    let page = 'param.page';
    this.setData({
      typeChoose:chooseData.name,
      [id]:chooseData.id,
      [pid]:chooseData.pid,
      [page]:1,
    })
    this.getBrandList(this.data.param);
  },
  typeSecChange(e){
    let column= e.detail.column;
    let index = e.detail.value;
    if(column == 0){
      let Arr =this.data.typeArray;
      Arr[1] = this.getSecCate(index);
      this.setData({
        typeArray:Arr,
        ColoumIndex1:index
      })
    }else{
      console.log('滚动的第二列');
    }
  },
  //分类筛选
  typeChange(e){
    
  },
  //金额筛选
  moneyChange(e){
    let index= e.detail.value;
    // if(this.data.moneyArray[index].name.indexOf('以下')>-1){

    // }
    let min = 'param.investment_min';
    let max = 'param.investment_max';
    let page = 'param.page';
    this.setData({
      moneyChoose:this.data.moneyArray[index].name,
      [min]:this.data.moneyArray[index].min,
      [max]:this.data.moneyArray[index].max,
      [page]:1
    });
    this.getBrandList(this.data.param);
  },
  //排序筛选
  sortChange(e){
    let index= e.detail.value;
    let orderby = 'param.orderby';
    let page = 'param.page';
    this.setData({
      sortChoose:this.data.sortArray[index].name,
      [orderby]:this.data.sortArray[index].by,
      [page]:1
    });
    this.getBrandList(this.data.param);
  },
  //下拉刷新
  onReachBottom(){
    if(this.data.haveMore){
      let page='param.page';
      let nextPage = ++ this.data.param.page;
      this.setData({
        [page]:nextPage
      })
      this.getBrandList(this.data.param);
    }
  },
  toBrandDetail(e){
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id='+id+'&uid='+this.data.uid
    })
  },
  //返回顶部
  goTop: function (e) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
  
})







