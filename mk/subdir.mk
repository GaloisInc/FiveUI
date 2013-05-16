define subdir

old-path := $$(path)
path     := $$(old-path)/$1
include $1/build.mk
path     := $$(old-path)

endef
