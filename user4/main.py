from icrawler.builtin import BingImageCrawler, GoogleImageCrawler
import threading

keywords = [
	'tree road block',
	'cones on road',
	'Rockfall',
	'traffic accident on road',
	'chair on middle of the road',
	'lie on the road',
	'围栏封路']

filters = dict(
    type='photo')


def goo(keyword):
    google_crawler = GoogleImageCrawler(
        feeder_threads=1,
        parser_threads=1,
        downloader_threads=4,
        storage={'root_dir': keyword+' google'})
    google_crawler.crawl(keyword=keyword, offset=0,
                         filters=filters, max_num=200, file_idx_offset=0)


def bing(keyword):
    bing_crawler = BingImageCrawler(downloader_threads=4, storage={
                                    'root_dir': keyword+' bing'})
    bing_crawler.crawl(keyword=keyword, filters=filters, offset=0, max_num=200)


def goobing(keyword):
    threading.Thread(target=goo, args=(keyword,)).start()
    threading.Thread(target=bing, args=(keyword,)).start()


for k in keywords:
    threading.Thread(target=goobing, args=(k,)).start()

