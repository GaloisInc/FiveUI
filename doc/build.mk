
.PHONY: doc
doc:

jsdoc-dir  := $(build-dir)/jsdoc
manual-dir := $(build-dir)/manual
manual-src := $(path)/manual_src


# HTML Generation ##############################################################

# Use pandoc to generate HTML
quiet_cmd_pandoc = PANDOC     $(call drop-prefix,$@)
      cmd_pandoc = $(pandoc-cmd) $< -o $@ -s --highlight-style=kate \
                   --template=$(manual-src)/template.html

manual-deps := $(patsubst $(manual-src)/%.md,$(manual-dir)/%.html,\
               $(wildcard $(manual-src)/*.md))

$(manual-deps): $(manual-dir)/%.html: $(manual-src)/%.md | $(manual-dir)
	$(call cmd,pandoc)


# HTML Manual ##################################################################

ifneq "$(pandoc-cmd)" ""
doc: web-manual
else
$(call strict-warning,pandoc not found, not building the manual)
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

$(jsdoc-dir)/index.html:                     \
    src/js/fiveui/injected/prelude.js        \
    src/js/fiveui/injected/jquery-plugins.js \
  | $(build-dir)
	$(call label,JSDOC)$(topdir)/tools/bin/jsdoc $^ $(redir)



# Web Manual Publishing ########################################################

generate: generate-docs

.PHONY: generate-docs
generate-docs: $(gh-pages-dir)/manual

# this is a bit conservative, as it will copy the documentation through each
# time the rule gets invoked.  Some sort of a tag file to track actual changes
# would be sufficient to not perform extra work.
$(gh-pages-dir)/manual: DIR := $(manual-dir)
$(gh-pages-dir)/manual: web-manual | pull-gh-pages
	$(call cmd,copydir)

generate-docs: $(gh-pages-dir)/jsdoc
	$(call commit,manual jsdoc,"update documentation")

$(gh-pages-dir)/jsdoc: DIR := $(jsdoc-dir)
$(gh-pages-dir)/jsdoc: $(jsdoc-dir)/index.html | pull-gh-pages
	$(call cmd,copydir)
