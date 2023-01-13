import React, { FC, PointerEventHandler, ReactNode, useCallback } from 'react';
import css from './MerchantInfoDialog.module.css';
// import { Cross2Icon } from '@radix-ui/react-icons';
// import * as Dialog from '@radix-ui/react-dialog';
// import * as Popover from '@radix-ui/react-popover';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import classNames from 'classnames';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { FormattedMessage, useIntl } from "react-intl";
import { CURRENCY_LIST } from "../../utils/constants";
import { MAX_VALUE } from "../../utils/env";

// const ListItem = React.forwardRef(({ className, children, title, ...props }, forwardedRef) => (
//     <li>
//         <NavigationMenu.Link asChild>
//             <a className={classNames('ListItemLink', className)} {...props} ref={forwardedRef}>
//                 <div className={css.ListItemHeading">{title}</div>
//                 <p className={css.ListItemText">{children}</p>
//             </a>
//         </NavigationMenu.Link>
//     </li>
// ));

export interface MerchantInfoDialogProps {
    children?: ReactNode;
}

export const MerchantInfoDialog: FC<MerchantInfoDialogProps> = ({ children }) => {
    const useTranslate = (id: string) => useIntl().formatMessage({ id: id });
    // const onInteractOutside = useCallback((event: CustomEvent) => { event.stopImmediatePropagation(); }, []);

    return (
        <NavigationMenu.Root className={css.NavigationMenuRoot}>
            <NavigationMenu.List className={css.NavigationMenuList}>
                <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={css.NavigationMenuTrigger}>
                        <FormattedMessage id="registeredMerchant" />
                        <CaretDownIcon className={css.CaretDown} aria-hidden />
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content className={css.NavigationMenuContent}>
                        {/* autoSave="true" disableOutsidePointerEvents={true} onInteractOutside={onInteractOutside}> */}
                        <div className={classNames(css.List, css.one)}>
                            <p className={css.Text}>
                                <FormattedMessage id="merchantInfo" />
                            </p>
                            <fieldset className={css.Fieldset}>
                                <label className={css.Label} htmlFor="id">
                                    <FormattedMessage id="id" />
                                </label>
                                <select className={css.Input} id="currency">
                                    {[2, 3, 4, 5].map(currency => <option key={currency}>{currency}</option>)}
                                </select>
                            </fieldset>
                        </div>
                    </NavigationMenu.Content >
                </NavigationMenu.Item >

                <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={css.NavigationMenuTrigger}>
                        <FormattedMessage id="unregisteredMerchant" />
                        <CaretDownIcon className={css.CaretDown} aria-hidden />
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content className={css.NavigationMenuContent}>
                        <div className={classNames(css.List, css.two)}>
                            <p className={css.Text}>
                                <FormattedMessage id="merchantInfo" />
                            </p>
                            <fieldset className={css.Fieldset}>
                                <label className={css.Label} htmlFor="company">
                                    <FormattedMessage id="company" />
                                </label>
                                <input className={css.Input} id="company" placeholder={useTranslate("myShopName")} />
                            </fieldset>
                            <fieldset className={css.Fieldset}>
                                <label className={css.Label} htmlFor="address">
                                    <FormattedMessage id="address" />
                                </label>
                                <input className={css.Input} id="address" placeholder={useTranslate("myShopWalletAddress")} />
                            </fieldset>
                            <fieldset className={css.Fieldset}>
                                <label className={css.Label} htmlFor="currency">
                                    <FormattedMessage id="currency" />
                                </label>
                                <select className={css.Input} id="currency">
                                    {Object.keys(CURRENCY_LIST).map(currency => <option key={currency}>{currency}</option>)}
                                </select>
                            </fieldset>
                            <fieldset className={css.Fieldset}>
                                <label className={css.Label} htmlFor="maxValue">
                                    <FormattedMessage id="maxValue" />
                                </label>
                                <input className={css.Input} id="maxValue" placeholder={useTranslate("maximumReceivableValue")} defaultValue={MAX_VALUE} />
                            </fieldset>
                        </div>
                    </NavigationMenu.Content >
                </NavigationMenu.Item >

                <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={css.NavigationMenuTrigger} disabled>
                        <FormattedMessage id="register" />
                        {/* <CaretDownIcon className={css.CaretDown} aria-hidden /> */}
                    </NavigationMenu.Trigger>
                </NavigationMenu.Item >

                <NavigationMenu.Indicator className={css.NavigationMenuIndicator}>
                    <div className={css.Arrow} />
                </NavigationMenu.Indicator >
            </NavigationMenu.List >

            <div className={css.ViewportPosition}>
                <NavigationMenu.Viewport className={css.NavigationMenuViewport} />
            </div>
        </NavigationMenu.Root >
    );
};

//     <Popover.Root>
//         <Popover.Trigger asChild>
//             <button className={css.IconButton" aria-label="Update dimensions">
//                 Test
//             </button>
//         </Popover.Trigger>
//         <Popover.Portal>
//             <Popover.Content className={css.PopoverContent" sideOffset={5}>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     <p className={css.Text" style={{ marginBottom: 10 }}>
//                         Dimensions
//                     </p>
//                     <fieldset className={css.Fieldset}>
//                         <label className={css.Label" htmlFor="width">
//                             Width
//                         </label>
//                         <input className={css.Input" id="width" defaultValue="100%" />
//                     </fieldset>
//                     <fieldset className={css.Fieldset}>
//                         <label className={css.Label" htmlFor="maxWidth">
//                             Max. width
//                         </label>
//                         <input className={css.Input" id="maxWidth" defaultValue="300px" />
//                     </fieldset>
//                     <fieldset className={css.Fieldset}>
//                         <label className={css.Label" htmlFor="height">
//                             Height
//                         </label>
//                         <input className={css.Input" id="height" defaultValue="25px" />
//                     </fieldset>
//                     <fieldset className={css.Fieldset}>
//                         <label className={css.Label" htmlFor="maxHeight">
//                             Max. height
//                         </label>
//                         <input className={css.Input" id="maxHeight" defaultValue="none" />
//                     </fieldset>
//                 </div>
//                 <Popover.Close className={css.PopoverClose" aria-label="Close">
//                     <Cross2Icon />
//                 </Popover.Close>
//                 <Popover.Arrow className={css.PopoverArrow" />
//             </Popover.Content>
//         </Popover.Portal>
//     </Popover.Root>
// );

// <Dialog.Root>
//     <Dialog.Trigger asChild>
//         <button className={css.Button}>
//             {children}
//         </button>
//     </Dialog.Trigger>
//     <Dialog.Portal>
//         <Dialog.Overlay className={css.DialogOverlay} />
//         <Dialog.Content className={css.DialogContent}>
//             <Dialog.Title className={css.DialogTitle}>Edit profile</Dialog.Title>
//             <Dialog.Description className={css.DialogDescription}>
//                 Make changes to your profile here. Click save when you're done.
//             </Dialog.Description>
//             <fieldset className={css.Fieldset}>
//                 <label className={css.Label} htmlFor="name">
//                     Name
//                 </label>
//                 <input className={css.Input} id="name" defaultValue="Pedro Duarte" />
//             </fieldset>
//             <fieldset className={css.Fieldset}>
//                 <label className={css.Label} htmlFor="username">
//                     Username
//                 </label>
//                 <input className={css.Input} id="username" defaultValue="@peduarte" />
//             </fieldset >
//             <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
//                 <Dialog.Close asChild>
//                     <button className={css.Button}>Save changes</button>
//                 </Dialog.Close>
//             </div >
//             {/* <Dialog.Close asChild>
//             <button className={css.IconButton" aria-label="Close">
//                 <Cross2Icon />
//             </button>
//         </Dialog.Close> */}
//         </Dialog.Content >
//     </Dialog.Portal >
// </Dialog.Root >
//     );
// };
