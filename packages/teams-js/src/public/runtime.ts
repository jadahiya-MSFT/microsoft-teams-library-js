/* eslint-disable @typescript-eslint/ban-types */

import { GlobalVars } from '../internal/globalVars';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';
export interface IRuntime {
  readonly apiVersion: number;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appInstallDialog?: {};
    readonly appEntity?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {
      readonly conversation?: {};
    };
    readonly dialog?: {
      readonly bot?: {};
      readonly update?: {};
    };
    readonly files?: {};
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly media?: {};
    readonly meeting?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly monetization?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly tabs?: {};
      readonly config?: {};
      readonly backStack?: {};
      readonly fullTrust?: {};
    };
    readonly people?: {};
    readonly remoteCamera?: {};
    readonly sharing?: {};
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly teamsCore?: {};
    readonly video?: {};
  };
}

export let runtime: IRuntime = {
  apiVersion: 1,
  supports: {
    appInstallDialog: undefined,
    calendar: undefined,
    call: undefined,
    chat: {
      conversation: undefined,
    },
    dialog: {
      bot: undefined,
      update: undefined,
    },
    location: undefined,
    logs: undefined,
    mail: undefined,
    media: undefined,
    meeting: undefined,
    meetingRoom: undefined,
    menus: undefined,
    monetization: undefined,
    notifications: undefined,
    pages: {
      appButton: undefined,
      tabs: undefined,
      config: undefined,
      backStack: undefined,
      fullTrust: undefined,
    },
    people: undefined,
    remoteCamera: undefined,
    sharing: undefined,
    teams: {
      fullTrust: {
        joinedTeams: undefined,
      },
    },
    teamsCore: undefined,
    video: undefined,
  },
};

export const teamsRuntimeConfig: IRuntime = {
  apiVersion: 1,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    call: {},
    chat: {
      conversation: {},
    },
    dialog: {
      bot: {},
      update: {},
    },
    files: {},
    logs: {},
    media: {},
    meeting: {},
    meetingRoom: {},
    menus: {},
    monetization: {},
    notifications: {},
    pages: {
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    remoteCamera: {},
    sharing: {},
    teams: {
      fullTrust: {},
    },
    teamsCore: {},
    video: {},
  },
};

interface ICapabilityReqs {
  readonly capability: object;
  readonly hostClientTypes: Array<string>;
}

const v1HostClientTypes = [
  HostClientType.desktop,
  HostClientType.web,
  HostClientType.android,
  HostClientType.ios,
  HostClientType.rigel,
  HostClientType.surfaceHub,
  HostClientType.teamsRoomsWindows,
  HostClientType.teamsRoomsAndroid,
  HostClientType.teamsPhones,
  HostClientType.teamsDisplays,
];

export const versionConstants: Record<string, Array<ICapabilityReqs>> = {
  '1.9.0': [
    {
      capability: { location: {} },
      hostClientTypes: v1HostClientTypes,
    },
  ],
  '2.0.0': [
    {
      capability: { people: {} },
      hostClientTypes: v1HostClientTypes,
    },
  ],
  '2.0.1': [
    {
      capability: { teams: { fullTrust: { joinedTeams: {} } } },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
      ],
    },
  ],
};

/**
 * @internal
 *
 * Generates and returns a runtime configuration for host clients which are not on the latest host SDK version
 * and do not provide their own runtime config. Their supported capabilities are based on the highest
 * client SDK version that they can support.
 *
 * @param highestSupportedVersion - The highest client SDK version that the host client can support.
 * @returns runtime which describes the APIs supported by the legacy host client.
 */
export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): IRuntime {
  let newSupports = { ...teamsRuntimeConfig.supports };

  Object.keys(versionConstants).forEach(versionNumber => {
    if (compareSDKVersions(highestSupportedVersion, versionNumber) >= 0) {
      versionConstants[versionNumber].forEach(capabilityReqs => {
        if (capabilityReqs.hostClientTypes.includes(GlobalVars.hostClientType)) {
          newSupports = {
            ...newSupports,
            ...capabilityReqs.capability,
          };
        }
      });
    }
  });

  const backCompatRuntimeConfig: IRuntime = {
    apiVersion: 1,
    isLegacyTeams: true,
    supports: newSupports,
  };
  return backCompatRuntimeConfig;
}

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}