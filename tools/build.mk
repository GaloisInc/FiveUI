
# just in case the Config.mk isn't up to date
addon-sdk-version ?= 1.14

tools-dir      := $(path)
addon-sdk-dir  := $(tools-dir)/addon-sdk-$(addon-sdk-version)
addon-sdk-file := $(addon-sdk-dir).tar.gz
addon-sdk-url  := https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/addon-sdk-$(addon-sdk-version).tar.gz

cfx-cmd        := $(addon-sdk-dir)/bin/cfx


quiet_cmd_wget = WGET       $(call drop-prefix,$@)
      cmd_wget = wget $(if $(Q),--quiet) -O $@ $(URL)

$(addon-sdk-file): URL := $(addon-sdk-url)
$(addon-sdk-file):
	$(call cmd,wget)


quiet_cmd_untar = TAR        $(call drop-prefix,$@)
      cmd_untar = tar $(if $(Q),,-v) -zxf $(ARCHIVE) -C $(TARGET)


addon-sdk-unpacked = $(addon-sdk-dir)/bin/activate

$(addon-sdk-unpacked): ARCHIVE := $(addon-sdk-file)
$(addon-sdk-unpacked): TARGET  := $(tools-dir)
$(addon-sdk-unpacked): $(addon-sdk-file)
	$(call cmd,untar)

.PHONY: addon-sdk
addon-sdk: $(cfx-cmd)

distclean::
	$(RM)    $(addon-sdk-file)
	$(RM) -r $(addon-sdk-dir)


# wrapper for setting up the environment for running the cfx command
cfx = ( cd $(addon-sdk-dir) $(redir) && \
        . bin/activate      $(redir) && \
        cd $1               $(redir) && \
        cfx $2              $(redir) )
