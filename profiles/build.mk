
# Macros #######################################################################

define profile
unpack: profile-$1

.PHONY: profile-$1
profile-$1: | $(path)/$1

$(path)/$1: $(path)/$1.tar
	tar -C $(path) -xvf $$<

clean::
	$(RM) -r $(path)/$1
endef


# Profile Management ###########################################################

$(eval $(call profile,chrome))
$(eval $(call profile,firefox))
