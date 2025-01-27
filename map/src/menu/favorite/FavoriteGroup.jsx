import { CircularProgress, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Typography } from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../../context/AppContext';
import FavoritesManager, { getSize } from '../../manager/FavoritesManager';
import styles from '../trackfavmenu.module.css';
import ActionsMenu from '../actions/ActionsMenu';
import { ReactComponent as FolderIcon } from '../../assets/icons/ic_action_folder.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/ic_overflow_menu_white.svg';
import { ReactComponent as MenuIconHover } from '../../assets/icons/ic_overflow_menu_with_background.svg';
import { ReactComponent as FolderHiddenIcon } from '../../assets/icons/ic_action_folder_hidden.svg';
import FavoriteGroupActions from '../actions/FavoriteGroupActions';
import MenuItemWithLines from '../components/MenuItemWithLines';
import { useTranslation } from 'react-i18next';
import { getLocalizedTimeUpdate } from '../settings/SettingsMenu';
import FileShareIcon from '../share/FileShareIcon.jsx';
import { getShare } from '../../manager/track/TracksManager';
import { SHARE_TYPE } from '../../manager/ShareManager';

export default function FavoriteGroup({ index, group, smartf = null }) {
    const ctx = useContext(AppContext);
    const { t } = useTranslation();

    const [openActions, setOpenActions] = useState(false);
    const [processDownload, setProcessDownload] = useState(false);
    const [hoverIconInfo, setHoverIconInfo] = useState(false);
    const anchorEl = useRef(null);
    const share = getShare(group.file, ctx);

    const sharedFile = smartf?.type === SHARE_TYPE;

    useEffect(() => {
        if (ctx.favorites.mapObjs[group.id]?.markers && group.name === ctx.selectedGpxFile.file?.name) {
            const updatedFile = {
                ...ctx.selectedGpxFile.file,
                markers: ctx.favorites.mapObjs[group.id].markers,
            };
            ctx.setSelectedGpxFile({
                ...ctx.selectedGpxFile,
                file: updatedFile,
            });
        }
    }, [ctx.favorites]);

    return (
        <>
            <MenuItem
                className={styles.group}
                key={'group' + group.id + index}
                id={'se-menu-fav-' + group.name}
                onClick={(e) => {
                    if (e.target !== 'path') {
                        if (sharedFile) {
                            ctx.setOpenGroups((prevState) => [...prevState, { group, type: smartf?.type }]);
                        } else {
                            ctx.setOpenGroups((prevState) => [...prevState, group]);
                        }
                        ctx.setZoomToFavGroup(group.id);
                    }
                }}
            >
                <ListItemIcon className={styles.icon}>
                    {group.hidden === 'true' ? (
                        <FolderHiddenIcon id={'se-fav-menu-icon-hidden-' + group.name} />
                    ) : (
                        <FolderIcon
                            style={{
                                fill:
                                    group.name &&
                                    FavoritesManager.getColorGroup({
                                        favoritesGroup: group,
                                        groupName: group.name,
                                    }),
                            }}
                        />
                    )}
                </ListItemIcon>
                <ListItemText>
                    <MenuItemWithLines name={group.name} maxLines={2} />
                    <Typography variant="body2" component="div" className={styles.groupInfo} noWrap>
                        {share && !sharedFile && <FileShareIcon />}
                        {`${getLocalizedTimeUpdate(group.clienttimems)}, ${getSize(group, t)}`}
                    </Typography>
                </ListItemText>
                <IconButton
                    className={styles.sortIcon}
                    id={`se-folder-actions-button-${group.name}`}
                    onMouseEnter={() => setHoverIconInfo(true)}
                    onMouseLeave={() => setHoverIconInfo(false)}
                    onClick={(e) => {
                        setOpenActions(true);
                        ctx.setOpenedPopper(anchorEl);
                        e.stopPropagation();
                    }}
                    ref={anchorEl}
                >
                    {processDownload ? (
                        <CircularProgress id={'se-progress'} size={24} />
                    ) : hoverIconInfo ? (
                        <MenuIconHover />
                    ) : (
                        <MenuIcon />
                    )}
                </IconButton>
            </MenuItem>
            <Divider className={styles.dividerItem} />
            <ActionsMenu
                open={openActions}
                setOpen={setOpenActions}
                anchorEl={anchorEl}
                actions={
                    <FavoriteGroupActions
                        group={group}
                        setOpenActions={setOpenActions}
                        setProcessDownload={setProcessDownload}
                        smartf={smartf}
                    />
                }
            />
        </>
    );
}
