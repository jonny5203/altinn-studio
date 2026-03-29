import React from 'react';

import { waitFor } from '@testing-library/react';

import { getApplicationSettingsMock } from 'src/__mocks__/getApplicationSettingsMock';
import { KeepAliveProvider } from 'src/core/auth/KeepAliveProvider';
import { renderWithoutInstanceAndLayout } from 'src/test/renderWithProviders';

describe('KeepAliveProvider', () => {
  const resetWindowLocation = (
    location: Partial<Location> = {
      origin: 'https://ttd.apps.altinn.no',
      pathname: '/ttd/test',
      host: 'ttd.apps.altinn.no',
      href: 'https://ttd.apps.altinn.no/ttd/test',
    },
  ) => {
    const oldWindowLocation = window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // @ts-expect-error: can be removed when TS issue is fixed
    window.location = {
      ...oldWindowLocation,
      ...location,
    };
  };

  it('redirects to login when keepAlive fails', async () => {
    resetWindowLocation();

    window.altinnAppGlobalData.frontendSettings = getApplicationSettingsMock({
      appOidcProvider: 'idporten',
    });

    window.altinnAppGlobalData.platformFrontendSettings = {
      authenticationUrl: 'https://platform.altinn.no/authentication/api/v1/authentication',
      postalCodesUrl: 'https://altinncdn.no/postcodes/registry.json',
    };

    await renderWithoutInstanceAndLayout({
      renderer: () => (
        <KeepAliveProvider>
          <div>test</div>
        </KeepAliveProvider>
      ),
      queries: {
        fetchRefreshJwtToken: async () => {
          throw new Error('expired');
        },
      },
    });

    await waitFor(() => {
      expect(window.location.href).toBe(
        'https://platform.altinn.no/authentication/api/v1/authentication?goto=https%3A%2F%2Fttd.apps.altinn.no%2Fttd%2Ftest&iss=idporten',
      );
    });
  });
});
