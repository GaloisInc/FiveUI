
LIBDIR=../..
#LIBDIR=../../../FiveUI-github
HEADER=galois-github-header.txt
BEFORE_BODY=galois-github-before-body.txt
AFTER_BODY=galois-github-after-body.txt
#CSS=$(LIBDIR)/galois-github.css
HTML5=-t html5

DOCS := $(patsubst %.md,%.html,$(wildcard *.md))

all: $(DOCS)

clean:
	$(RM) $(DOCS)

%.html: %.md
		pandoc $< -o $@ -s --highlight-style=kate --template=template.html #$(HTML5)
#	pandoc $< -o $@ -s --highlight-style=kate -H $(HEADER) -B $(BEFORE_BODY) -A $(AFTER_BODY) -c $(CSS) $(HTML5)

