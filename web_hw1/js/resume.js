$(function(){
    //每个固定的时间移动图片
    var timer = setInterval(picLoop,1400);
    var index = 0;
    function picLoop(){
        index++;
        if (index==3) {index=0;}
        $("figure").animate({"left":-496*index},300);
        $(".index li").eq(index).css("background-color","#40424a")
            .siblings().css("background-color","rgba(100,100,100,0.3)");
    }

    //定时器的控制
    $(".pic").hover(function(){
        clearInterval(timer);

    },function(){
        timer = setInterval(picLoop,1400);

    })

    $(".index li").mouseover(function(){
        $(this).css("background-color","#40424a")
            .siblings().css("background-color","rgba(100,100,100,0.3)");
        index = $(this).index();
        $(".figure").animate({"left":-496*index},300);

    })

})