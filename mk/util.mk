
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


quiet_cmd_mkdir = MKDIR      $@
      cmd_mkdir = mkdir -p $@

quiet_cmd_copydir = CPDIR      $@
      cmd_copydir = cp -r $(DIR) $@

quiet_cmd_cp = CP         $@
      cmd_cp = cp $< $@
