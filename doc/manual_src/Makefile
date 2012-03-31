
DOCS := $(patsubst %.md,%.html,$(wildcard *.md))

all: $(DOCS)

clean:
	$(RM) $(DOCS)

%.html: %.md
	pandoc $< -o $@ -s --highlight-style=kate
