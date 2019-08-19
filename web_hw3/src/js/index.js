// 1652667 Lipeng LIANG
window.numPerPage = 8; // 一页显示的电影数量

// 页面加载后，执行此函数
window.onload = function () {
    initPage();
};

// 初始化页面
let initPage = function () {
    filmInit(null);
    $.ajax({
        url: "films_counts",
        type: "get",
        cache: false,
        async: false,
        success: function (data) {
            if (data != null && data !== "") {
                let counts = data["counts"];
                pagingInit(counts, null);
            }
        }
    });
    searchInit();
};

// 默认加载第一页电影
let filmInit = function (text) {
    let currentPage = 1;
    loadFilm(currentPage, window.numPerPage, text);
};

// 加载电影 参数：当前页面，每页显示的电影数目，是否通过indexList去取电影（null：否；其它：按照该indexList取）
let loadFilm = function (currentPage, num, text) {
    let film_container = $("#film-container");
    film_container.empty();

    let start = currentPage - 1;
    let limit = num;

    if (text === null) {
        $.ajax({
            url: "films?start=" + start + "&limit=" + limit,
            type: "get",
            cache: false,
            async: false,
            success: function (data) {
                if (data != null && data !== "") {
                    for (let i = 0; i < data.length; i++) {
                        // let index = indexList === null ? i + start : indexList[i + start].ref;
                        let film_item = createFilmItem(data[i], data[i]["_id"]);
                        film_container.append(film_item);
                    }
                }
            }
        });
    } else {
        $.ajax({
            url: "search?keyword=" + text + "&start=" + currentPage + "&limit=" + limit,
            type: "get",
            cache: false,
            async: false,
            success: function (data) {
                if (data != null && data !== "") {
                    data = data["result_list"];
                    for (let i = 0; i < data.length; i++) {
                        // let index = indexList === null ? i + start : indexList[i + start].ref;
                        let film_item = createFilmItem(data[i], data[i]["_id"]);
                        film_container.append(film_item);
                    }
                }
            }
        });
    }

};

// 创建一条电影
let createFilmItem = function (filmJson, id) {
    let film_item = $("<div class='card film-item'></div>");
    let film_media = createFilmMedia(filmJson.poster, filmJson.title, filmJson.rating.average);
    let film_body = createFilmBody(id, filmJson.title, filmJson.pubdate, filmJson.directors, filmJson.casts, filmJson.summary, filmJson.genres);
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
let createFilmBody = function (id, title, pubDate, directors, casts, summary, genres) {
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
    // let href = "details.html?index=" + index;
    let href = "details.html?id=" + id;
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
        film_body.append("<a href=\"statistics.html\"><span class=\"card-media-tag card-media-tag-orange\">" + genres[i] + "</span></a>\n");
    }

    return film_body;
};

// 分页初始化
let pagingInit = function (counts, text) {
    let currentPage = 1;
    let totalItem = counts;
    let totalPage = Math.floor(totalItem / numPerPage) + (totalItem % numPerPage === 0 ? 0 : 1);
    loadPaging(currentPage, totalPage, totalItem, text);
};

// 设置分页
let loadPaging = function (currentPage, totalPage, totalItem, text) {
    $("#page").paging({
        currentNum: currentPage, // 当前页面
        totalNum: totalPage, // 总页码
        totalList: totalItem, // 记录总数量
        callback: function (currentPage) { //回调函数
            console.log("currentPage: " + currentPage);
            loadFilm(currentPage, window.numPerPage, text); // 更新页面
        }
    });
};

// 搜索初始化；使用mongodb进行快速检索
let searchInit = function () {

    // 绑定搜索事件，点击可搜索
    $("#search").on('click', function () {
        searchText(startPage = 1, limit = window.numPerPage);
    });

    // 绑定搜索事件，按回车可搜索
    $('#search-text').bind("enterKey", function () {
        searchText(startPage = 1, limit = window.numPerPage);
    });
    $('#search-text').keyup(function (e) {
        if (e.keyCode === 13) {
            $(this).trigger("enterKey");
        }
    });


};


// 检索
let searchText = function (startPage, limit) {
    let text = $("#search-text").val();
    if (text === "") return "";

    $.ajax({
        url: "search?keyword=" + text + "&start=" + startPage + "&limit=" + limit,
        type: "get",
        cache: false,
        async: false,
        success: function (data) {
            if (data != null && data !== "") {

                displayResult(data["counts"], text);

            } else {
                let film_container = $("#film-container");
                film_container.empty();
                let none_film = $("<p> 未查找到相关电影</p>");
                film_container.append(none_film)

                pagingInit(0, text)
            }
        }
    });

};


// 展示结果
let displayResult = function (counts, text) {
    console.log(counts, text);
    filmInit(text);
    pagingInit(counts, text);
};

