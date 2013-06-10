
ifneq "$(V)" "1"
Q     := @
quiet := quiet_
redir := >/dev/null
else
Q     :=
quiet :=
redir :=
endif

echo-cmd = $(if $($(quiet)cmd_$1),echo '  $($(quiet)cmd_$1)';)
cmd      = @$(echo-cmd) $(cmd_$1)

label    = $(if $(Q),$(Q)echo '  $1';)

find-cmd = $(shell which $1 2$(redir))

drop-prefix = $(patsubst $(topdir)/%,%,$1)


quiet_cmd_mkdir = MKDIR      $(call drop-prefix,$@)
      cmd_mkdir = mkdir -p $@

quiet_cmd_copydir = CPDIR      $(call drop-prefix,$@)
      cmd_copydir = cp -r $(DIR) $@

quiet_cmd_cp = CP         $(call drop-prefix,$@)
      cmd_cp = cp $< $@


ifeq "$(strict)" "1"
strict-error   = $(error $1)
strict-warning = $(warning $1)
endif


print-%:
	@echo "$* = $($*)"
