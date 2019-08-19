// 1652667 Lipeng LIANG
window.ratingStd = ["1星", "2星", "3星", "4星", "5星"];

// 页面加载完毕后，执行此函数
window.onload = function () {
    initPage();
};

// 初始化页面
let initPage = function () {
    let id = getParams("id");
    $.ajax({
        url: "detail_data?id=" + id,
        type: "get",
        cache: false,
        async: false,
        success: function (data) {
            if (data != null && data !== "") {
                filmInit(data);
            }
        }
    });

};

// 用正则表达式获取传过来的参数index作为索引
let getParams = function (key) {
    let reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};

// 初始化，展示详情页面
let filmInit = function (filmJson) {
    let film_container = $("#film-container");
    let film_media = createFilmMedia(filmJson.poster, filmJson.title, filmJson.rating.average);
    let film_body = createFilmBody(filmJson);
    film_container.append(film_media, film_body);

    // 展示评分的可视化
    createHistogram(filmJson.rating.stars.reverse());
};

// 创建电影的Media部分
let createFilmMedia = function (poster, title, avgGrade) {
    let film_media = $("<div class='card-media'></div>");

    let film_poster = $("<img class='card-media-img'/>\n");
    film_poster.attr("src", poster);
    film_poster.attr("alt", title);
    film_poster.attr("onerror", "this.src='./pic/img-not-found.png';this.onerror=null");

    let film_stars = $("<ul class='card-body-stars'></ul> ");

    let starNum = Math.floor(avgGrade / 2);
    for (let i = 0; i < starNum; i++) {
        let li_star = $("<li>\n" +
            "<svg fill=\"#D3BCA2\" height=\"20\" viewBox=\"0 0 18 18\" width=\"20\"\n" +
            "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
            "     <path d=\"M9 11.3l3.71 2.7-1.42-4.36 L15 7h-4.55 L9 2.5 7.55 7 H3l3.71 2.64 L5.29 14z\"/>\n" +
            "     <path d=\"M0 0h18v18H0z\" fill=\"none\"/>\n" +
            "</svg>\n" +
            "</li>");
        film_stars.append(li_star);
    }

    film_media.append(film_poster, film_stars);
    return film_media;
};

// 创建电影的Body部分
let createFilmBody = function (filmJson) {
    let title = filmJson.title;
    let summary = filmJson.summary;
    let genres = filmJson.genres;
    let site = filmJson.site;


    let film_body = $("<div class=\"card-body\">");
    let film_title = $("<h2 class=\"card-body-heading detail-heading\">" + title + "</h2>");
    let film_rating = $("<div id='card-body-rating'></div>");

    let film_detail = createFilmDetail(filmJson);

    let film_summary = $("<p class=\"card-body-summary summary-detail\">\n" + "简介：" + summary + "</p>");

    let info = site === "" ? "暂无播放源" : "现在播放";
    site = site === "" ? "" : "https://" + site;
    let film_moreInfo = "<a href='" + site + "' class=\"card-button card-button-cta detail-button\">" + info +
        "</a>";

    film_body.append(film_title, film_detail, film_rating, film_summary, film_moreInfo);

    for (let i = 0; i < genres.length; i++) {
        film_body.append("<a href=\"statistics.html\"><span class=\"card-media-tag card-media-tag-orange\">" + genres[i] + "</span></a>\n");
    }

    return film_body;
};

// 创建电影的Detail部分
let createFilmDetail = function (filmJson) {
    let aka = filmJson.aka;
    let avgGrade = filmJson.rating.average;
    let ratingNum = filmJson.rating.rating_people;
    let duration = filmJson.duration;
    let pubDate = filmJson.pubdate;
    let countries = filmJson.countries;
    let directors = filmJson.directors;
    let writers = filmJson.writers;
    let languages = filmJson.languages;
    let casts = filmJson.casts;

    let douban_site = filmJson.douban_site;
    let imdb = filmJson.imdb;

    let film_detail = $("<div class=\"card-body-detail\">");
    let film_aka = $("<p class=\"card-body-item\">别名：</p>");
    for (let i = 0; i < filmJson.aka.length; i++) {
        if (aka[i] === '' && aka.length === 1) film_aka.append("<span>无</span>");
        film_aka.append("<span>" + aka[i] + "</span>");
    }

    let film_rating_avg = $("<p class=\"card-body-item\">评分：<span>" + avgGrade + " (" + ratingNum + "人参与评分)</span></p>");


    let film_duration = $("<p class=\"card-body-item\">时长：<span>" + duration + "分钟</span></p>");

    let film_year = $("<p class=\"card-body-item\">上映日期：</p>");
    for (let i = 0; i < pubDate.length; i++) {
        film_year.append("<span>" + pubDate[i] + "</span>");
    }

    let film_lang = $("<p class=\"card-body-item\">语言：</p>");
    for (let i = 0; i < languages.length; i++) {
        film_lang.append("<span>" + languages[i] + "</span>");
    }

    let film_nation = $("<p class=\"card-body-item\">制片国家/地区：</p>");
    for (let i = 0; i < countries.length; i++) {
        film_nation.append("<span>" + countries[i] + "</span>");
    }

    let film_director = $("<p class=\"card-body-item\">导演：</p>");
    for (let i = 0; i < directors.length; i++) {
        film_director.append("<span>" + directors[i].name + "</span>");
    }

    let film_writer = $("<p class=\"card-body-item\">编剧：</p>");
    for (let i = 0; i < writers.length; i++) {
        film_writer.append("<span>" + writers[i].name + "</span>");
    }

    let film_casts = $("<p class=\"card-body-item\">演员：</p>");
    for (let i = 0; i < casts.length; i++) {
        film_casts.append("<span>" + casts[i].name + "</span>");
    }

    let film_douban = $("<p class=\"card-body-item\">豆瓣链接：</p>");
    film_douban.append("<a href='" + douban_site + "'>" + imdb + "</a>");

    film_detail.append(film_aka, film_director, film_writer, film_casts, film_nation, film_lang, film_year, film_duration, film_rating_avg, film_douban);
    return film_detail;
};

// 使用d3库，创建评分的可视化
let createHistogram = function (stars) {
    let width = 250;
    let height = 200;

    // 将每一星评分转为比例
    let dataset = stars.map(item => {
        return parseFloat(item) / 100
    });

    // 设置颜色的两个极值
    let colorMap = d3.interpolateRgb(
        d3.rgb('#fff'),
        d3.rgb('#fd972c')
    );

    //在 body 里添加一个 SVG 画布
    let svg = d3.select("#card-body-rating")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //画布周边的空白
    let padding = {left: 30, right: 30, top: 20, bottom: 30};

    // 设置x轴
    let xScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .rangeRound([0, width - padding.left - padding.right]);

    // 设置y轴
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset)])
        .range([height - padding.top - padding.bottom, 0]);

    // 柱状图两个柱之间的空白部分
    let rectPadding = 10;

    //添加柱状图的柱....
    svg.selectAll(".rec")
        .data(dataset)
        .enter()
        .append("rect")
        .style("fill", (d) => {
            return d == 0 ? '#eee' : colorMap(d);
        })
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function (d, i) {
            return xScale(i) + rectPadding / 2;
        })
        .attr("y", function (d) {
            return yScale(d);
        })
        .attr("width", xScale.bandwidth() - rectPadding)
        .attr("height", function (d) {
            return height - padding.top - padding.bottom - yScale(d);
        });

    // 添加[1星 2星 3星 4星 5星]
    svg.selectAll(".rating-std")
        .data(window.ratingStd)
        .enter()
        .append("text")
        .attr("class", "rating-std")
        .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")

        .attr("x", function (d, i) {
            return xScale(i) + rectPadding / 2
        })
        .attr("y", function (d) {
            return 0;
        })
        .attr("dx", function () {
            return rectPadding + 2;
        })
        .attr("dy", function (d) {
            return 20;
        })
        .text(function (d) {
            return d;
        });

    // 添加每个星所占比例的多少
    svg.selectAll(".rating-prop")
        .data(stars)
        .enter()
        .append("text")
        .attr("class", "rating-prop")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function (d, i) {
            return xScale(i) + rectPadding / 2;
        })
        .attr("y", function (d) {
            return yScale(parseFloat(d) / 100);
        })
        .attr("dx", function () {
            return 0;
        })
        .attr("dy", function (d) {
            return -5;
        })
        .text(function (d) {
            return d + "%";
        });

};
