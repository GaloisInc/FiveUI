
# Generic FiveUI Build Staging #################################################

fiveui-dir   := $(path)
lib-dir      := $(topdir)/src/js/lib
fiveui-files := $(shell find $(fiveui-dir))


# $1 - target directory
# $2 - $(topdir)/src/js/fiveui relative directory
define fiveui-files

# scripts in the target
$1/$2: | $1
	$$(call cmd,mkdir)

$1/$2/%: $(fiveui-dir)/$2/% | $1/$2
	$$(call cmd,cp)

endef


# Because firefox has strange requirements on the layout of the extension
# directory, we just use that as the layout for all extensions.
#
# $1 - sub-directory off of $(build-dir) to stage into
# $2 - top-level target to augment with dependencies
define stage-fiveui

# Common Files #################################################################

$1/data/injected/injected.css: $(build-dir)/injected.css | $1/data/injected
	$$(call cmd,cp)

$(call fiveui-files,$1/data,injected)
$2: $1/data/injected/compute.js        \
    $1/data/injected/ui.js             \
    $1/data/injected/injected.css      \
    $1/data/injected/prelude.js        \
    $1/data/injected/jquery-plugins.js


$(call fiveui-files,$1/data,js)
$2: $(patsubst $(fiveui-dir)/%,$1/data/%,$(wildcard $(fiveui-dir)/js/*))


$(call fiveui-files,$1/data,css)
$2: $1/data/css/options.css \
    $1/data/css/ui.css


$(call fiveui-files,$1/data,images)
$2: $(patsubst $(fiveui-dir)/%,$1/data/%,$(wildcard $(fiveui-dir)/images/*))


# Libraries ####################################################################

# jquery
$1/data/jquery: | $1/data
	$$(call cmd,mkdir)

$1/data/jquery/bundled.css: $(build-dir)/bundled.css | $1/data/jquery
	$$(call cmd,cp)

$1/data/jquery/%: $(lib-dir)/jquery/% | $1/data/jquery
	$$(call cmd,cp)

$2: $1/data/jquery/jquery-1.8.3.js           \
    $1/data/jquery/jquery-ui-1.9.2.custom.js \
    $1/data/jquery/bundled.css


# font awesome
$1/data/font-awesome/css: | $1/data/font-awesome
	$$(call cmd,mkdir)

$1/data/font-awesome/css/%: $(lib-dir)/font-awesome/css/% \
                          | $1/data/font-awesome/css
	$$(call cmd,cp)

$1/data/font-awesome/font: | $1/data/font-awesome
	$$(call cmd,mkdir)

$1/data/font-awesome/font/%: $(lib-dir)/font-awesome/font/% \
                           | $1/data/font-awesome/font
	$$(call cmd,cp)

$1/data/font-awesome: | $1/data
	$$(call cmd,mkdir)

$2: $1/data/font-awesome/css/font-awesome.css          \
    $1/data/font-awesome/font/fontawesome-webfont.eot  \
    $1/data/font-awesome/font/fontawesome-webfont.svg  \
    $1/data/font-awesome/font/fontawesome-webfont.woff \
    $1/data/font-awesome/font/fontawesome-webfont.ttf


# simple libraries
$1/data/%: $(lib-dir)/% | $1/data
	$$(call cmd,cp)

$2: $1/data/underscore.js \
    $1/data/backbone.js   \
    $1/data/md5.js



# Other Files ##################################################################

# top-level fiveui stuff
$1/data/%: $(fiveui-dir)/% | $1/data
	$$(call cmd,cp)

$2: $1/data/options.html


$1/data: | $1
	$$(call cmd,mkdir)



# files provided by the platform
$2: $1/data/js/platform-ajax.js          \
    $1/data/js/platform-options.js       \
    $1/data/injected/platform-compute.js \
    $1/data/injected/platform-ui.js


endef


# Generic Bundled jQuery CSS ###################################################

css-bundle := $(topdir)/tools/bin/css-bundle.py

quiet_cmd_cssbundle = CSSC       $(call drop-prefix,$@)
      cmd_cssbundle = ( cd $(dir $(TARGET)) && \
                        $(css-bundle) $(notdir $(TARGET)) $@ $(redir) )

$(build-dir)/bundled.css: TARGET := $(lib-dir)/jquery/css/ui-lightness/jquery-ui.css
$(build-dir)/bundled.css:                                       \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/*.css)        \
    $(wildcard $(lib-dir)/jquery/css/ui-lightness/images/*.png) \
  | $(build-dir)
	$(call cmd,cssbundle)

$(build-dir)/injected.css: TARGET := $(fiveui-dir)/injected/injected.css
$(build-dir)/injected.css:                   \
    $(fiveui-dir)/injected/injected.css      \
    $(fiveui-dir)/images/errorCircle.png     \
    $(fiveui-dir)/images/warningTriangle.png \
    $(fiveui-dir)/images/right-arrow.png     \
    $(fiveui-dir)/images/down-arrow.png      \
  | $(build-dir)
	$(call cmd,cssbundle)
