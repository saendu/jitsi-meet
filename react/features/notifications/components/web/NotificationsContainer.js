// @flow

import { FlagGroup } from '@atlaskit/flag';
import React from 'react';

import { connect } from '../../../base/redux';
import {
    getLocalParticipant,
    getParticipants,
    participantUpdated
} from '../../../base/participants';
import { playSound } from '../../../base/sounds';

import AbstractNotificationsContainer, {
    _abstractMapStateToProps,
    type Props as AbstractProps
} from '../AbstractNotificationsContainer';

import Notification from './Notification';

type Props = AbstractProps & {

    /**
     * Whther we are a SIP gateway or not.
     */
     _iAmSipGateway: boolean,
     localParticipantID: string,
    localParticipant: string
};

/**
 * Implements a React {@link Component} which displays notifications and handles
 * automatic dismissmal after a notification is shown for a defined timeout
 * period.
 *
 * @extends {Component}
 */
class NotificationsContainer extends AbstractNotificationsContainer<Props> {

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (this.props._iAmSipGateway) {
            return null;
        }

        return (
            <FlagGroup onDismissed = { this._onDismissed }>
                { this._renderFlags() }
            </FlagGroup>
        );
    }

    _onDismissed: number => void;

    /**
     * Renders notifications to display as ReactElements. An empty array will
     * be returned if notifications are disabled.
     *
     * @private
     * @returns {ReactElement[]}
     */
    _renderFlags() {
        const { _notifications } = this.props;

        return _notifications.map(notification => {
            const { props, uid, newlyAdded } = notification;
            const soundId = notification.props.soundId
            // if newly added play sound
            if(newlyAdded && soundId) {
                this.props.dispatch(playSound(soundId));
                notification.newlyAdded = false; 
            }
            

            // The id attribute is necessary as {@code FlagGroup} looks for
            // either id or key to set a key on notifications, but accessing
            // props.key will cause React to print an error.
            return (
                <Notification
                    { ...props }
                    id = { uid }
                    key = { uid }
                    uid = { uid }
                    localParticipantID = { this.props._localParticipantID }
                    localParticipant = { this.props._localParticipant }
                    dispatch = { this.props.dispatch }
                />

            );
        });
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for this component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { iAmSipGateway } = state['features/base/config'];
    const localParticipant = getLocalParticipant(state);

    return {
        ..._abstractMapStateToProps(state),
        _iAmSipGateway: Boolean(iAmSipGateway),
        _localParticipant: localParticipant,
        _localParticipantID: localParticipant.id
    };
}


export default connect(_mapStateToProps)(NotificationsContainer);
