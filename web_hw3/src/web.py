# 1652667 Lipeng LIANG
import os
import shutil
import json
import pymongo
from flask import Flask, render_template, request, jsonify
from whoosh.fields import Schema, TEXT, ID, KEYWORD
from whoosh.index import create_in, open_dir
from whoosh.qparser import MultifieldParser
# jieba已经内置了和whoosh的集成功能
from jieba.analyse import ChineseAnalyzer

# 构建分词
analyzer = ChineseAnalyzer()

# 在url, title, tags, note, article中进行搜索,
# 然后根据搜索到的_id再去数据库中获取数据.
schema = Schema(
    nid=ID(unique=True, stored=True),
    title=TEXT(phrase=False),
    tags=KEYWORD(lowercase=True, commas=True, scorable=True),
    people=KEYWORD(lowercase=True, commas=True, scorable=True),
)


# 创建文件内索引
def init_search():
    if os.path.exists("indexdir"):
        shutil.rmtree('indexdir')
    os.mkdir("indexdir")
    create_in("indexdir", schema)
    return open_dir("indexdir")


# 初始化检索
ix = init_search()

# 初始化Mongo数据库连接
client = pymongo.MongoClient(host='localhost', port=27017)

# 初始化FlaskApp
app = Flask(__name__, template_folder='', static_folder='', static_url_path='')


@app.route('/')
def hello_world():
    return render_template("index.html")


@app.route('/films')
def films():
    start = int(request.args.get('start', 0))
    limit = int(request.args.get('limit', 8))
    r = files_collection().find().skip(start * limit).limit(limit)
    return jsonify(list(r))


@app.route('/films_counts')
def get_films_counts():
    counts = files_collection().find().count()
    return jsonify({"counts": counts})


# 检索：接受参数：检索词->keyword,开始页码->start,每页最大数目->limit
@app.route('/search')
def search():
    keyword = request.args.get('keyword', '')
    startPage = int(request.args.get('start', 1))
    limit = int(request.args.get('limit', 8))
    if keyword == "":
        return jsonify({})

    with ix.searcher() as searcher:
        query = MultifieldParser(["title", "tags", "people"], ix.schema).parse(keyword)
        result = list(searcher.search(query))
        counts = len(result)

        # 未检索到相关电影
        if counts == 0:
            return jsonify(None)

        # 防止起始索引、结束索引的越界
        start_index = (startPage - 1) * limit if (startPage - 1) * limit < counts else counts - 1
        end_index = startPage * limit if startPage * limit < counts else counts

        # 获取要显示的当前页面所有电影的索引值
        results = result[start_index:end_index]

        # result_list: 要显示的当前页面所有电影的json
        result_list = []
        for r in results:
            result_list.append(files_collection().find_one({'_id': r['nid']}))

        data = {
            "result_list": result_list,
            "counts": counts
        }
        return jsonify(data)


# 依据id获取电影详细信息
@app.route('/detail_data')
def detail_data():
    id_ = request.args.get('id', '')
    if id_ == "":
        return jsonify({})

    result = files_collection().find_one({'_id': id_})
    return jsonify(result)


def files_collection():
    db = client.database
    return db.files


# 将film.json存入mongodb，并构建索引
def load_data():
    db = client.database
    # clear data
    db.files.drop()
    collection = db.files

    f = open(u"films.json", encoding="utf-8")
    writer = ix.writer()
    for line in f:
        line = line.strip()
        obj = json.loads(line)
        collection.insert(obj)

        pick = lambda x: x["name"]
        peoples = list(map(pick, obj["directors"])) + list(map(pick, obj["casts"]))

        writer.update_document(
            nid=str(obj['_id']),
            title=obj['title'],
            tags=",".join(obj['genres']),
            people=",".join(peoples),
        )
    writer.commit()


if __name__ == '__main__':
    load_data()
    app.debug = True
    app.run("0.0.0.0")
