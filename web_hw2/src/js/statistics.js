// 1652667 Lipeng LIANG

window.data = data;
window.genreCategory = [];
window.total = 200; // 电影总数

// 设置两个极值颜色（类似于github上显示每天工作量的那种渐变）
window.colorMap = d3.interpolateRgb(
    d3.rgb('#fff0c3'),
    d3.rgb('#954c00')
);

// 页面加载完毕后执行该函数
window.onload = function () {
    statsInit();
    addGenres();
    plot();
};

// 数据初始化
let statsInit =function(){
    let result = statsGenre();
    window.genreCategory = sort(result);
};

// 统计电影类型
let statsGenre = function () {
    let result = {};
    for (let i = 0; i < window.data.length; i++) {
        let genres = window.data[i].genres;
        for (let j = 0; j < genres.length; j++) {
            if (!result.hasOwnProperty(genres[j])) {
                result[genres[j]] = 1;
            } else {
                result[genres[j]] += 1;
            }
        }
    }
    return result;
};

// 按照部数排序
let sort = function (result) {
    let r = [];

    // 自定义逆序的函数，使得字典逆序
    let dic = Object.keys(result).sort(function (a, b) {
        return result[b] - result[a]
    });

    // 字典->列表，由于d3的pie只处理列表
    for (k in dic) {
        r.push({
            "name": dic[k],
            "value": result[dic[k]]
        });
    }
    return r;
};

// 将电影类型的颜色说明加载在主页面中
let addGenres = function () {
    let genres = $("#genres");
    for (let i = 0; i < window.genreCategory.length; i++) {
        let name = window.genreCategory[i].name;
        let val = window.genreCategory[i].value;
        let genre_item = createGenreItem(name, val);
        genres.append(genre_item);

        // 设置该电影类型的颜色
        let color = colorMap(val / window.total);
        $("#" + name).css("background", color);
    }
};

// 创建每一个类型的DOM元素
let createGenreItem = function (name, val) {
    let genre_item = $("<div class=\"col-xs-3\"><p><span class=\"colorBox\" id='" + name + "'></span><span class=\"name\">" + name + " " + val + "部" +
        "</span></p></div>\n");
    return genre_item;
};

// 画圆饼图
function plot() {
    // 设置宽度、高度、半径
    let parElemWidth = document.querySelector("#chart")
        .parentElement.offsetWidth;

    parElemWidth = parElemWidth > 350 ? 350 : parElemWidth;

    let width = parElemWidth;

    let height = width;

    let radius = width / 2;

    // 设置鼠标移上去之后的效果
    let tooltip = d3.select(".myTooltip");

    // 定义饼图上的每一片
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    // 定义饼图
    let pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });

    // 设置圆饼图的样式
    let svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("filter", "url('#filter')")
        .append("g")
        .attr("class", "group")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    // 设置每一片的样式
    let g = svg.selectAll(".arc")
        .data(pie(window.genreCategory))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            // return colorScale(d.data.value)
            return colorMap(d.data.value / window.total)
        })
        .on("mouseover", function (d) {
            tooltip.html("<span class='tooltipContent'>" + d.data.name + " " + d.data.value + "部</span>");
            return tooltip.style("visibility", "visible").style("opacity", "1");
        })
        .on("mousemove", function () {
            return tooltip.style("top", (d3.event.pageY - 35) + "px").style("left", (d3.event.pageX) - 60 + "px");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden").style("opacity", "0");
        });
}


