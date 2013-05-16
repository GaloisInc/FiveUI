
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
#
# In order to turn a number of different javascript modules into a single one,
# we just concatenate them all together.  This should be fine, as all of the
# modules we define just provide functions, or register callbacks.

quiet_cmd_compilejs = JSC        $(call drop-prefix,$@)
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


# CSS Staging ##################################################################

css-bundle := $(topdir)/tools/bin/css-bundle.py

quiet_cmd_cssbundle = CSSC       $(call drop-prefix,$@)
      cmd_cssbundle = ( cd $(dir $(TARGET)) && \
                        $(css-bundle) $(notdir $(TARGET)) $@ $(redir) )

$(stage-dir)/data/bundled.css: TARGET := $(lib-dir)/jquery/css/ui-lightness/jquery-ui.css
$(stage-dir)/data/bundled.css:                                      \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/*.css)        \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/images/*.png) \
  | $(stage-dir)/data
	$(call cmd,cssbundle)


# Chrome Extension #############################################################
#
# Use the staged artifacts to build the chrome extension in contexts/fiveui.crx

chrome-dir := $(path)/chrome

all: $(topdir)/fiveui.crx

clean::
	$(RM) $(topdir)/fiveui.crx

$(topdir)/fiveui.crx: $(build-dir)/fiveui.crx
	$(call cmd,cp)

# Create the chrome extension
$(build-dir)/fiveui.crx: $(target-dir)/chrome-background.js                 \
                         $(target-dir)/chrome-options.js                    \
                         $(stage-dir)/manifest.json                         \
                         $(stage-dir)/data/fiveui/images/fiveui-icon-16.png \
                         $(stage-dir)/data/bundled.css                      \
                       | $(stage-dir)/data/fiveui/images
	$(call label,MAKECRX    $(call drop-prefix,$@)) ( cd $(build-dir)   \
	&& $(topdir)/tools/bin/makecrx stage                                \
	       $(topdir)/contexts/chrome/fiveui.pem fiveui                  \
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


# Firefox Compilation ##########################################################

addon-sdk := $(topdir)/tools/addon-sdk

all: $(topdir)/fiveui.xpi

clean::
	$(RM) $(topdir)/fiveui.xpi

$(topdir)/fiveui.xpi: $(build-dir)/fiveui.xpi
	$(call cmd,cp)


# wrapper for setting up the environment for the running the cfx command
cfx = ( cd $(addon-sdk) $(redir) && \
        . bin/activate  $(redir) && \
        cd $(build-dir) $(redir) && \
        cfx $1 $(redir) )

# build the actual extension
$(build-dir)/fiveui.xpi:          \
    $(stage-dir)/package.json     \
    $(target-dir)/firefox-main.js \
  | $(topdir)/profiles/firefox
	$(call label,XPI        $(call drop-prefix,$@))\
	  $(call cfx,xpi -p $(topdir)/profiles/firefox \
	                 --pkgdir=$(stage-dir) )

# stage the package description
$(stage-dir)/package.json: $(path)/package.json | $(stage-dir)
	$(call cmd,cp)

# build the main script
$(target-dir)/firefox-main.js: \
    $(fiveui-dir)/settings.js        \
    $(fiveui-dir)/messenger.js       \
    $(fiveui-dir)/rules.js           \
    $(fiveui-dir)/background.js      \
    $(fiveui-dir)/utils.js           \
  | $(target-dir)
	$(call cmd,compilejs)
