#!/usr/bin/env bash
#
# This script builds a collection of FiveUI rulesets (contained in various .json files)
# into a combined rule sets file: combinedRules.json.
#

FILES=`ls *.json | grep -v combinedRules`
OUTFILE="combinedRules.json"
TMPFILE=`mktemp -t $0`
HEADER="combinedHeader" # file containing header
FOOTER="combinedFooter" # file containing footer

function cutstart {
  echo `cat $1 | grep -n '//---' | awk -F ':' {'print $1'} | head -1`
}
function cutend {
  echo `cat $1 | grep -n '//---' | awk -F ':' {'print $1'} | tail -1`
}

cat $HEADER > $OUTFILE
for file in $FILES; do
  CUTSTART=`cutstart $file`
  CUTEND=`cutend $file`
  echo "combining: $file"
  cat $file | head -$(($CUTEND-1)) | tail +$CUTSTART \
      | sed 's/\/\/,/,/' >> $OUTFILE
done
LEN=`wc -l $OUTFILE | awk '{print $1}'`
cat $OUTFILE | head -$((LEN-1)) > $TMPFILE
echo "}" >> $TMPFILE
mv $TMPFILE $OUTFILE
cat $FOOTER >> $OUTFILE
