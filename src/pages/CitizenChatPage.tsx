/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Citizen Emergency Chat Page
 * Designed for ordinary citizens to seek assistance, locate open shelters, and request rescue.
 */

import React from 'react';
import { DisasterState, GeoLocation } from '../types/disaster';
import { CitizenEmergencyChat } from '../components/CitizenEmergencyChat';

interface CitizenChatPageProps {
  state: DisasterState;
  onIngestSOS: (text: string, location: GeoLocation) => void;
  onNavigateToMap?: () => void;
}

export const CitizenChatPage: React.FC<CitizenChatPageProps> = ({
  state,
  onIngestSOS,
  onNavigateToMap
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <CitizenEmergencyChat
        state={state}
        onIngestSOS={onIngestSOS}
        onNavigateToMap={onNavigateToMap}
      />
    </div>
  );
};
