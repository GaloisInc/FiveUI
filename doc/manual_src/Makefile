
LIBDIR=.
#LIBDIR=../../../FiveUI-github
HEADER=$(LIBDIR)/galois-github-header.txt
BEFORE_BODY=$(LIBDIR)/galois-github-before-body.txt
AFTER_BODY=$(LIBDIR)/galois-github-after-body.txt
CSS="/galois-github.css"
HTML5=-t html5

DOCS := $(patsubst %.md,%.html,$(wildcard *.md))

all: $(DOCS)

clean:
	$(RM) $(DOCS)

%.html: %.md
	pandoc $< -o $@ -s --highlight-style=kate -H $(HEADER) -B $(BEFORE_BODY) -A $(AFTER_BODY) -c $(CSS) $(HTML5)

