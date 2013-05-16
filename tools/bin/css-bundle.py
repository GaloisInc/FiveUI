#!/usr/bin/env python

# WARNING: Use at your own risk!
#
# Software distributed under the License is distributed
# on an ''AS IS'' basis, WITHOUT WARRANTY OF ANY KIND, either
# express or implied. See the GPL for the specific language
# governing rights and limitations.
#
# This program is free software: you can redistribute it 
# and/or modify it under the terms of the PYTHON SOFTWARE 
# FOUNDATION LICENSE VERSION 2 licence. The full text of 
# the licence can be found at:-
# http://www.opensource.org/licenses/PythonSoftFoundation.php
#
# Copyright Sajal Kayan 

"""
Takes a raw css file and generates a new css with static assets bundled directly into it
usage : ./css-bundle.py <source css file url> <final destination>

"""

import sys
import urllib
import re
import base64

source_file = sys.argv[1]
destination_file = sys.argv[2]

print source_file, destination_file

oldcss = urllib.urlopen(source_file).read()
assets = re.findall("url\(([^\)]*)[\)]", oldcss)
assets = list(set(assets))

#assets = [asset.replace('"','').replace("'",'') for asset in assets]
assets = [[asset, base64.b64encode(urllib.urlopen(asset.replace('"','').replace("'",'')).read())] for asset in assets]
newcss = oldcss
for asset in assets:
    filetype = asset[0].split('.')[-1]
    datauri = 'data:image/' + filetype + ';base64,' + asset[1]
#    print datauri, '\n\n'
    newcss = newcss.replace(asset[0], datauri)

# filename = destination_file.split('/')[-1]
filename = destination_file
print "writing to : " + filename

f = open(filename, 'w')
f.write(newcss)
f.close()
