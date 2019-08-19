// 1652667 Lipeng LIANG
window.data = data;
window.numPerPage = 8; // 一页显示的电影数量
window.index = null;

// 页面加载后，执行此函数
window.onload = function () {
    initPage();
};

// 初始化页面
let initPage = function () {
    filmInit(null);
    pagingInit(null);
    searchInit();
};

// 默认加载第一页电影
let filmInit = function (indexList) {
    let currentPage = 1;
    loadFilm(currentPage, window.numPerPage, indexList);
};

// 加载电影 参数：当前页面，每页显示的电影数目，是否通过indexList去取电影（null：否；其它：按照该indexList取）
let loadFilm = function (currentPage, num, indexList) {
    let film_container = $("#film-container");
    film_container.empty();

    let start = (currentPage - 1) * window.numPerPage;
    let lenMax = indexList === null ? window.data.length : indexList.length;
    num = num + start > lenMax ? lenMax - start : num;

    for (let i = 0; i < num; i++) {
        let index = indexList === null ? i + start : indexList[i + start].ref;
        let film_item = createFilmItem(window.data[index], index);
        film_container.append(film_item);
    }
};

// 创建一条电影
let createFilmItem = function (filmJson, index) {
    let film_item = $("<div class='card film-item'></div>");
    let film_media = createFilmMedia(filmJson.poster, filmJson.title, filmJson.rating.average);
    let film_body = createFilmBody(index, filmJson.title, filmJson.pubdate, filmJson.directors, filmJson.casts, filmJson.summary, filmJson.genres);
    film_item.append(film_media, film_body);
    return film_item;
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

// 创建电影的body部分
let createFilmBody = function (index, title, pubDate, directors, casts, summary, genres) {
    let film_body = $("<div class=\"card-body\">");
    let film_title = $("<h2 class=\"card-body-heading\">" + title + "</h2>");

    let film_year = $("<p class=\"card-body-item\"><span>年份：</span></p>");
    for (let i = 0; i < pubDate.length; i++) {
        film_year.append("<span>" + pubDate[i] + "</span>");
    }

    let film_director = $("<p class=\"card-body-item\"><span>导演：</span></p>");
    for (let i = 0; i < directors.length; i++) {
        film_director.append("<span>" + directors[i].name + "</span>");
    }

    let film_casts = $("<p class=\"card-body-item\"><span>演员：</span></p>");
    for (let i = 0; i < casts.length; i++) {
        film_casts.append("<span>" + casts[i].name + "</span>");
    }

    let film_summary = $("<p class=\"card-body-summary\">\n" + summary + "</p>");
    let href = "details.html?index=" + index;
    let film_moreInfo = "<a href='" + href + "' class=\"card-button card-button-cta\">\n" +
        "                    More info\n" +
        "                    <span class=\"card-button-icon\">\n" +
        "                        <svg fill=\"#9C948A\" height=\"16\" viewBox=\"0 0 24 24\" width=\"16\"\n" +
        "                             xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "                            <path d=\"M0 0h24v24H0z\" fill=\"none\"/>\n" +
        "                            <path d=\"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z\"/>\n" +
        "                        </svg>\n" +
        "                    </span>\n" +
        "                </a>";

    film_body.append(film_title, film_year, film_director, film_casts, film_summary, film_moreInfo);

    for (let i = 0; i < genres.length; i++) {
        film_body.append("<span class=\"card-media-tag card-media-tag-orange\">" + genres[i] + "</span>\n");
    }

    return film_body;
};

// 分页初始化
let pagingInit = function (indexList) {
    let currentPage = 1;
    let totalItem = indexList === null ? window.data.length : indexList.length;
    let totalPage = Math.floor(totalItem / numPerPage) + (totalItem % numPerPage === 0 ? 0 : 1);
    loadPaging(currentPage, totalPage, totalItem, indexList);
};

// 设置分页
let loadPaging = function (currentPage, totalPage, totalItem, indexList) {
    $("#page").paging({
        currentNum: currentPage, // 当前页面
        totalNum: totalPage, // 总页码
        totalList: totalItem, // 记录总数量
        callback: function (currentPage) { //回调函数
            console.log("currentPage: " + currentPage);
            loadFilm(currentPage, window.numPerPage, indexList); // 更新页面
        }
    });
};

// 搜索初始化；使用lunr.js进行快速检索
let searchInit = function () {
    // 建立索引
    indexInit();

    // 绑定搜索事件，点击可搜索
    $("#search").on('click', function () {
        searchText();
    });

    // 绑定搜索事件，按回车可搜索
    $('#search-text').bind("enterKey", function () {
        searchText();
    });
    $('#search-text').keyup(function (e) {
        if (e.keyCode === 13) {
            $(this).trigger("enterKey");
        }
    });


};

// 索引初始化
let indexInit = function () {
    // 构建搜索域
    window.index = lunr(function () {
        this.field("people", {boost: 9})
        this.field("genres", {boost: 9})
        this.field("pubdate", {boost: 7})
        this.field("countries", {boost: 9})
        this.field("title", {boost: 10})
        this.field("summary", {boost: 8})
        this.field("languages", {boost: 10})
        this.field("year", {boost: 9})
        this.field("aka", {boost: 10})
        this.ref('index')
    });

    // 创建主键index，以通用loadFilm函数
    for (let i = 0; i < window.data.length; i++) {
        let lunrJson = jsonForLunr(window.data[i]);
        lunrJson["index"] = i;
        window.index.add(lunrJson);
    }
};

//  构建需要检索的部分为json
let jsonForLunr = function (json) {

    let p1 = json.directors.map(item => {
        return item.name
    }).join(" ");
    let p2 = json.casts.map(item => {
        return item.name
    }).join(" ");
    let p3 = json.writers.map(item => {
        return item.name
    }).join(" ");
    let people = [p1, p2, p3].join(" ");

    return {
        "title": json.title,
        "summary": json.summary,
        "people": people,
        "genres": json.genres.join(" "),
        "language": json.languages.join(" "),
        "pubdate": json.pubdate.join(" "),
        "countries": json.countries.join(" "),
        "aka": json.aka.join(" "),
        "year": json.year
    }
};


// 检索
let searchText = function () {
    let text = $("#search-text").val();
    if (text === "") return "";

    let result = window.index.search(text, {
        bool: "OR"
    });

    displayResult(result);
};

// 展示结果
let displayResult = function (result) {
    console.log(result);
    filmInit(result);
    pagingInit(result);
};

