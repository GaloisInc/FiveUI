
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

stage-dir  := $(build-dir)/stage
target-dir := $(stage-dir)/data/target

define stage-files-from
$(stage-dir)/$1/$2: | $(stage-dir)/$1
	$$(call cmd,mkdir)

$(stage-dir)/$1/$2/%: $(path)/$1/$2/% | $(stage-dir)/$1/$2
	$$(call cmd,cp)
endef

$(eval $(call stage-files-from,data/fiveui,images))
$(eval $(call stage-files-from,data/fiveui,chrome))
$(eval $(call stage-files-from,data/fiveui,injected))
$(eval $(call stage-files-from,data/lib,codemirror))
$(eval $(call stage-files-from,data/lib,jquery))
$(eval $(call stage-files-from,data/lib,jshash))



$(eval $(call stage-files-from,data/fiveui/firefox,test))
$(eval $(call stage-files-from,data/fiveui,firefox))

$(eval $(call stage-files-from,data,fiveui))
$(eval $(call stage-files-from,data,lib))


$(target-dir): | $(stage-dir)/data
	$(call cmd,mkdir)

$(stage-dir)/data: | $(stage-dir)
	$(call cmd,mkdir)

$(stage-dir): | $(build-dir)
	$(call cmd,mkdir)


stage-path = $(patsubst $(path)/%,$(stage-dir)/%,$1)
stage-all  = $(call stage-path,$(wildcard $(path)/$1/*))


# Javascript "Compilation" #####################################################
#
# In order to turn a number of different javascript modules into a single one,
# we just concatenate them all together.  This should be fine, as all of the
# modules we define just provide functions, or register callbacks.

quiet_cmd_compilejs = JSC        $(call drop-prefix,$@)
      cmd_compilejs = cat $^ > $@

# generic background script dependencies
background-deps :=                \
  $(addprefix $(fiveui-dir)/,     \
    set.js                        \
    background.js                 \
    url-pat.js                    \
    settings.js                   \
    messenger.js                  \
    state.js                      \
    rules.js)

# generic options page dependencies
options-deps := $(addprefix $(fiveui-dir)/,\
  settings.js \
  chan.js \
  messenger.js \
  options.js \
  update-manager.js \
  utils.js \
  entry.js \
  rules.js \
  url-pat.js )


# CSS Staging ##################################################################

css-bundle := $(topdir)/tools/bin/css-bundle.py

quiet_cmd_cssbundle = CSSC       $(call drop-prefix,$@)
      cmd_cssbundle = ( cd $(dir $(TARGET)) && \
                        $(css-bundle) $(notdir $(TARGET)) $@ $(redir) )

$(stage-dir)/data/target/bundled.css: TARGET := $(lib-dir)/jquery/css/ui-lightness/jquery-ui.css
$(stage-dir)/data/target/bundled.css:                                      \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/*.css)        \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/images/*.png) \
  | $(stage-dir)/data
	$(call cmd,cssbundle)

$(stage-dir)/data/target/injected.css: TARGET := $(fiveui-dir)/injected/injected.css
$(stage-dir)/data/target/injected.css:       \
    $(fiveui-dir)/injected/injected.css      \
    $(fiveui-dir)/images/errorCircle.png     \
    $(fiveui-dir)/images/warningTriangle.png \
    $(fiveui-dir)/images/right-arrow.png     \
    $(fiveui-dir)/images/down-arrow.png      \
  | $(stage-dir)/data/target
	$(call cmd,cssbundle)



# Both Extensions ##############################################################

jquery := $(addprefix $(path)/data/lib/jquery/,\
	jquery-1.8.3.js           \
	jquery-ui-1.9.2.custom.js)

$(stage-dir)/data/underscore.js: $(lib-dir)/underscore.js
	$(call cmd,cp)

$(stage-dir)/data/backbone.js: $(lib-dir)/backbone.js
	$(call cmd,cp)

all: $(stage-dir)/data/fiveui/options.html                         \
     $(stage-dir)/data/fiveui/options.css                          \
     $(stage-dir)/data/fiveui/entry.css                            \
     $(stage-dir)/data/fiveui/ffcheck.js                           \
     $(stage-dir)/data/target/injected.css                         \
     $(stage-dir)/data/target/bundled.css                          \
     $(call stage-all,data/fiveui/images)                          \
     $(call stage-all,data/lib/codemirror)                         \
     $(call stage-path,$(jquery))                                  \
     $(call stage-all,data/lib/jshash)                             \
     $(stage-dir)/data/fiveui/injected/prelude.js                  \
     $(stage-dir)/data/fiveui/injected/jquery-plugins.js           \
     $(stage-dir)/data/fiveui/injected/fiveui-injected-compute.js  \
     $(stage-dir)/data/fiveui/injected/fiveui-injected-ui.js       \
     $(stage-dir)/data/underscore.js                               \
     $(stage-dir)/data/backbone.js

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
$(build-dir)/fiveui.crx:                                        \
  $(target-dir)/chrome-background.js                            \
  $(target-dir)/chrome-options.js                               \
  $(stage-dir)/manifest.json                                    \
  $(stage-dir)/data/fiveui/chrome/background.html               \
  $(stage-dir)/data/fiveui/chrome/chrome-port.js                \
  $(stage-dir)/data/fiveui/chrome/chrome-injected-compute.js    \
  $(stage-dir)/data/fiveui/chrome/chrome-injected-ui.js
	$(call label,MAKECRX    $(call drop-prefix,$@)) ( cd $(build-dir)   \
	&& $(topdir)/tools/bin/makecrx stage                                \
	       $(topdir)/contexts/chrome/fiveui.pem fiveui                  \
	   $(redir) )


# install the extension manifest in the stage directory
$(stage-dir)/manifest.json: $(path)/manifest.json | $(stage-dir)
	$(call cmd,cp)

chrome-src := $(fiveui-dir)/chrome

# the chrome-specific background javascript
$(target-dir)/chrome-background.js: $(background-deps)           \
                                    $(chrome-src)/background.js  \
                                    $(chrome-src)/chrome-port.js \
                                  | $(target-dir)
	$(call cmd,compilejs)


# the chrome-specific options javascript
$(target-dir)/chrome-options.js: $(options-deps)                 \
                                 $(chrome-src)/ajax.js           \
                                 $(chrome-src)/chrome-options.js \
                               | $(target-dir)
	$(call cmd,compilejs)


# Firefox Compilation ##########################################################

firefox-dir := $(fiveui-dir)/firefox

addon-sdk := $(topdir)/tools/addon-sdk

all: $(topdir)/fiveui.xpi

clean::
	$(RM) $(topdir)/fiveui.xpi

$(topdir)/fiveui.xpi: $(build-dir)/fiveui.xpi
	$(call cmd,cp)


# wrapper for setting up the environment for the running the cfx command
cfx = ( cd $(addon-sdk) $(redir) && \
        . bin/activate  $(redir) && \
        cd $1           $(redir) && \
        cfx $2          $(redir) )

run-firefox: $(build-dir)/fiveui.xpi
	$(call cfx,$(stage-dir),run)

test-firefox: $(build-dir)/fiveui.xpi                    \
              $(stage-dir)/data/fiveui/firefox/test      \
              $(call stage-all,data/fiveui/firefox/test) \
            | $(topdir)/profiles/firefox
	$(call cfx,$(stage-dir),test -v -p $(topdir)/profiles/firefox)

# build the actual extension
$(build-dir)/fiveui.xpi:                                                       \
    $(stage-dir)/package.json                                                  \
    $(target-dir)/firefox-main.js                                              \
    $(target-dir)/firefox-options.js                                           \
    $(call stage-path,$(path)/data/fiveui/firefox/firefox-injected-compute.js) \
    $(call stage-path,$(path)/data/fiveui/firefox/firefox-injected-ui.js)      \
    $(call stage-path,$(path)/data/fiveui/firefox/icon-content.html)           \
    $(call stage-path,$(path)/data/fiveui/firefox/icon-script.js)              \
    $(call stage-path,$(path)/data/fiveui/firefox/options-icon.html)           \
    $(call stage-path,$(path)/data/fiveui/firefox/options-script.js)           \
    $(call stage-path,$(path)/data/fiveui/firefox/firefox-options.js)          \
  | $(topdir)/profiles/firefox
	$(call label,XPI        $(call drop-prefix,$@))\
	  $(call cfx,$(build-dir),xpi -p $(topdir)/profiles/firefox \
	                 --pkgdir=$(stage-dir) )

# stage the package description
$(stage-dir)/package.json: $(path)/package.json | $(stage-dir)
	$(call cmd,cp)

# build the main script
$(target-dir)/firefox-main.js:       \
    $(firefox-dir)/main.js           \
    $(firefox-dir)/storage.js        \
    $(firefox-dir)/tabIds.js         \
    $(firefox-dir)/ajax.js           \
    $(fiveui-dir)/settings.js        \
    $(fiveui-dir)/messenger.js       \
    $(fiveui-dir)/rules.js           \
    $(fiveui-dir)/background.js      \
    $(fiveui-dir)/utils.js           \
    $(fiveui-dir)/state.js           \
  | $(target-dir)
	$(call cmd,compilejs)


# the chrome-specific options javascript
$(target-dir)/firefox-options.js:        \
    $(lib-dir)/jquery/jquery-1.8.3.js    \
    $(lib-dir)/underscore.js             \
    $(lib-dir)/backbone.js               \
    $(options-deps)                      \
    $(firefox-dir)/firefox-options.js    \
  | $(target-dir)
	$(call cmd,compilejs)
