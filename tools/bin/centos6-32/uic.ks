install
reboot
text
url --url=http://monk.galois.com/centos/6/os/i386/
lang en_US.UTF-8
keyboard us
network --device eth0 --bootproto dhcp
rootpw  --iscrypted O2gCsA1aW90jA
firewall --disabled
authconfig --enableshadow
selinux --permissive
timezone --utc America/Los_Angeles
services --enabled ntpd

# disk work
bootloader --location=mbr --append="crashkernel=auto console=tty0 console=ttyS2,115200n8"
clearpart --all --initlabel

part /boot    --fstype=ext3  --size=300     --ondisk=sda --asprimary
part swap     --fstype=swap  --size=2048    --ondisk=sda --asprimary
part /        --fstype=ext3  --size=1       --ondisk=sda --asprimary --grow

repo --name="CentOS"          --baseurl=http://monk.galois.com/centos/6/os/i386/         --cost=100
# repo --name="fedora-firefox4" --baseurl=http://bootstrap.galois.com/uic/build/centos6-32 --cost=90
repo --name="google-chrome"   --baseurl=http://bootstrap.galois.com/uic/build/centos6-32 --cost=90

%packages
@ Base
@ Console internet tools
@ Development Tools
google-chrome-stable
@ Networking Tools
@ Server Platform
@ Server Policy
@ System administration tools
logwatch
ntp
ntpdate
sendmail
sendmail-cf
strace
sudo
zsh
dstat
git
wget
java-1.6.0-openjdk
java-1.6.0-openjdk-devel
# Needed for SSH X11 forwarding
xorg-x11-xauth
# To resolve broken font rendering issues
dejavu-lgc-sans-fonts
%end

%post --erroronfail
# Import the local CentOS repository settings
cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.dist
curl http://monk.galois.com/galois/ks/CentOS-6-Base.repo \
  -s -o /etc/yum.repos.d/CentOS-Base.repo

# Install EIC management scripts
cd /root

# This is an EIC-managed VM with a Hudson account
git clone http://eic-conf.galois.com/eic-conf.git
(cd eic-conf &&
 bash run.sh eic-managed update-eic-conf hudson-account)

# Install SSH public keys into the hudson, eicuser, and eicadmin accounts
(cd eic-conf &&
 bash inst-key.sh hudson cygnus &&
 bash inst-key.sh hudson creswick &&
 bash inst-key.sh hudson jstanley &&
 bash inst-key.sh hudson trevor &&
 bash inst-key.sh hudson trevor2 &&
 bash inst-key.sh eicuser creswick &&
 bash inst-key.sh eicuser jstanley &&
 bash inst-key.sh eicuser trevor2 &&
 bash inst-key.sh eicuser trevor &&
 bash inst-key.sh eicadmin creswick &&
 bash inst-key.sh eicadmin jstanley &&
 bash inst-key.sh eicadmin trevor2 &&
 bash inst-key.sh eicadmin trevor
)

#
# eof
#
