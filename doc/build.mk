
.PHONY: doc
doc:

jsdoc-dir  := $(build-dir)/jsdoc
manual-dir := $(build-dir)/manual
manual-src := $(path)/manual_src

pandoc     := $(shell which pandoc 2>/dev/null)


# HTML Generation ##############################################################

# Use pandoc to generate HTML
quiet_cmd_pandoc = PANDOC     $(call drop-prefix,$@)
      cmd_pandoc = $(pandoc) $< -o $@ -s --highlight-style=kate \
                   --template=$(manual-src)/template.html

manual-deps := $(patsubst $(manual-src)/%.md,$(manual-dir)/%.html,\
               $(wildcard $(manual-src)/*.md))

$(manual-deps): $(manual-dir)/%.html: $(manual-src)/%.md | $(manual-dir)
	$(call cmd,pandoc)


# HTML Manual ##################################################################

ifneq "$(pandoc)" ""
doc: web-manual
else
$(warning pandoc not found, not building the manual)
endif

.PHONY: web-manual
web-manual: $(manual-deps) | $(manual-dir)/css-images $(manual-dir)/figures


# Stage Directories ############################################################

$(manual-dir): | $(build-dir)
	$(call cmd,mkdir)

define stage-doc-dir
$(manual-dir)/$(notdir $1): DIR := $1
$(manual-dir)/$(notdir $1): $(wildcard $1/*) | $(manual-dir)
	$$(call cmd,copydir)

web-manual: $(manual-dir)/$(notdir $1)
endef

$(eval $(call stage-doc-dir,$(manual-src)/css-images))
$(eval $(call stage-doc-dir,$(manual-src)/figures))
$(eval $(call stage-doc-dir,$(path)/css))
$(eval $(call stage-doc-dir,$(path)/images))



# JsDoc Documentation ##########################################################

doc: $(jsdoc-dir)/index.html

$(jsdoc-dir)/index.html:                                      \
    $(topdir)/contexts/data/fiveui/injected/prelude.js        \
    $(topdir)/contexts/data/fiveui/injected/jquery-plugins.js \
  | $(build-dir)
	$(call label,JSDOC)$(topdir)/tools/bin/jsdoc $^ $(redir)
