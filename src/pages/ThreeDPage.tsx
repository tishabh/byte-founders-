/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 3D Tactical Rescue Command Page
 */

import React from 'react';
import { DisasterState } from '../types/disaster';
import { DisasterRescue3D } from '../components/DisasterRescue3D';

interface ThreeDPageProps {
  state: DisasterState;
  onNavigateToSos?: () => void;
  onNavigateToSimulator?: () => void;
}

export const ThreeDPage: React.FC<ThreeDPageProps> = ({
  state,
  onNavigateToSos,
  onNavigateToSimulator
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      <DisasterRescue3D
        state={state}
        onNavigateToSos={onNavigateToSos}
        onNavigateToSimulator={onNavigateToSimulator}
      />
    </div>
  );
};
