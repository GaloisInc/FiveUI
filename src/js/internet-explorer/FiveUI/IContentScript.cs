using System;
using System.Runtime.InteropServices;

/*
 * The IContentScript interface and ContentScript object are intended to
 * reproduce portions of the Jetpack API used to create Firefox addons.
 * In particular it implements ports.
 *
 * see https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/using_port
 */
namespace FiveUI
{
    [ComVisible(true),
     Guid("77B1A0B7-D016-4F10-B261-67A41B9B4EB9"),
     InterfaceType(ComInterfaceType.InterfaceIsDual)]
    public interface IContentScript
    {
        [DispId(1)]
        IPort port { get; }
    }
}

