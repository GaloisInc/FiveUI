

# Macros #######################################################################

define profile
$(topdir)/profiles/$1: $(topdir)/profiles/$1/.token ;

$(topdir)/profiles/$1/.token: $(path)/$1.tar
	$$(call label,PROFILE    $1)\
	  tar -C $(path) $(if $(Q),,-v) -xf $$< \
	  && touch $$@

clean::
	$(RM) -r $(path)/$1
endef


# Profile Management ###########################################################

$(eval $(call profile,chrome))
$(eval $(call profile,firefox))
