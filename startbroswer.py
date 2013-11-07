#!/usr/bin/env python
# coding:utf-8
# startbroswer.py
# Author: Wang Wei Qiang <wwqgtxx@gmail.com>

import os
import sys
import shutil
from common import FileUtil

def main():
	dir = FileUtil.cur_file_dir()
	os.chdir(dir)
	print 'Starting FirefoxPortable...'
	if FileUtil.has_file('FirefoxPortable/FirefoxPortable.exe'):
		os.system('start ./FirefoxPortable/FirefoxPortable.exe  -no-remote "http://www.secretchina.com/fq"')
		return
	else:
		print "Don't Have FirefoxPortable"
		#FileUtil.delete_dir("FirefoxPortable")
	print 'Starting GoogleChromePortable...'
	if  FileUtil.has_file('GoogleChromePortable/GoogleChromePortable.exe'):
		os.system('start ./GoogleChromePortable/GoogleChromePortable.exe   --ignore-certificate-errors  "http://www.secretchina.com/fq"')
		return
	else:
		print "Don't Have GoogleChromePortable"
	print "Don't Have Any Portable Broswer!"

if __name__ == '__main__':
	main()