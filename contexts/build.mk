
# Source Info ##################################################################

# source and resources
data-dir := $(path)/data

# fiveui source directory
fiveui-dir := $(data-dir)/fiveui

lib-dir := $(data-dir)/lib

# packaged extension directory
bin-dir  := $(data-dir)/target


# Extension Staging ############################################################
#
# The purpose of this step is to setup all the compiled scripts necessary for
# both plugins in a common tree.  From this state, we can pick and choose what
# goes into each extension.

stage-dir := $(build-dir)/stage

$(stage-dir): | $(build-dir)
	$(call cmd,mkdir)

$(target-dir): | $(stage-dir)
	$(call cmd,mkdir)

$(stage-dir)/data: | $(stage-dir)
	$(call cmd,mkdir)

$(stage-dir)/data/lib: | $(stage-dir)/data
	$(call cmd,mkdir)

$(stage-dir)/data/fiveui: | $(stage-dir)/data
	$(call cmd,mkdir)

$(stage-dir)/data/fiveui/images: | $(stage-dir)/data/fiveui
	$(call cmd,mkdir)

target-dir := $(stage-dir)/data/target

$(target-dir): | $(stage-dir)/data
	$(call cmd,mkdir)

$(stage-dir)/data/fiveui/images/%: $(fiveui-dir)/images/% \
	                         | $(stage-dir)/data/fiveui/images
	$(call cmd,cp)


# Javascript "Compilation" #####################################################

quiet_cmd_compilejs = JSC        $@
      cmd_compilejs = cat $^ > $@

# generic background script dependencies
background-deps :=                \
  $(underscore)                   \
  $(addprefix $(fiveui-dir)/,     \
    background.js                 \
    settings.js                   \
    messenger.js                  \
    rules.js)

# generic options page dependencies
options-deps := \
  $(underscore) \
  $(addprefix $(fiveui-dir)/, \
    options.js)


# Chrome Extension #############################################################
#
# Use the staged artifacts to build the chrome extension in contexts/fiveui.crx

chrome-dir := $(path)/chrome

all: $(build-dir)/fiveui.crx


# Create the chrome extension
$(build-dir)/fiveui.crx: $(target-dir)/chrome-background.js                 \
                         $(target-dir)/chrome-options.js                    \
                         $(stage-dir)/manifest.json                         \
                         $(stage-dir)/data/fiveui/images/fiveui-icon-16.png \
                       | $(stage-dir)/data/fiveui/images
	$(call label,MAKECRX    $@) (cd $(build-dir)    \
	&& $(topdir)/tools/bin/makecrx stage            \
	       $(topdir)/contexts/chrome/fiveui.pem     \
	       fiveui                                   \
	   $(redir) )


# install the extension manifest in the stage directory
$(stage-dir)/manifest.json: $(path)/manifest.json | $(stage-dir)
	$(call cmd,cp)

chrome-src := $(fiveui-dir)/chrome

# the chrome-specific background javascript
$(target-dir)/chrome-background.js: $(background-deps)          \
                                    $(chrome-src)/background.js \
                                  | $(target-dir)
	$(call cmd,compilejs)


# the chrome-specific options javascript
$(target-dir)/chrome-options.js: $(options-deps)          \
                                 $(chrome-src)/chrome-options.js \
                               | $(target-dir)
	$(call cmd,compilejs)
