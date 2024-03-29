import React, { ReactElement } from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { App } from '../app';
import { ApiClient, ReportingConfigApiResponse } from '../../api/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[app]', () => {
	function setup( component: ReactElement, apiClient: ApiClient ) {
		const monitoringClient = createMockMonitoringClient();
		renderWithProviders( component, {
			apiClient,
			monitoringClient,
		} );

		return { monitoringClient };
	}

	test( 'App shows loading indicator until all configuration is loaded, then the current landing page (duplicate searching)', async () => {
		const apiClient = createMockApiClient();
		// This function will get set to the resolve() function in the API client call.
		let resolveReportingConfigRequestPromise: (
			config: ReportingConfigApiResponse
		) => void = () => {
			throw new Error( 'loadReportingConfig was not called in mocked API Client' );
		};
		const reportingConfigRequestPromise = new Promise< ReportingConfigApiResponse >(
			( resolve ) => {
				resolveReportingConfigRequestPromise = resolve;
			}
		);
		apiClient.loadReportingConfig.mockReturnValue( reportingConfigRequestPromise );

		let resolveAvailableRepoFiltersRequestPromise: ( config: string[] ) => void = () => {
			throw new Error( 'loadAvailableRepoFilters was not called in mocked API Client' );
		};
		const availableRepoFiltersRequestPromise = new Promise< string[] >( ( resolve ) => {
			resolveAvailableRepoFiltersRequestPromise = resolve;
		} );
		apiClient.loadAvailableRepoFilters.mockReturnValue( availableRepoFiltersRequestPromise );

		setup( <App />, apiClient );

		// Loading indicator is present...
		expect(
			screen.getByRole( 'alert', { name: 'Loading required app data' } )
		).toBeInTheDocument();
		// ...Landing page is not.
		expect(
			screen.queryByRole( 'heading', { name: 'Search for duplicate issues' } )
		).not.toBeInTheDocument();

		resolveReportingConfigRequestPromise( {} );

		// We're still not ready! We've resolved one request, but more remain!

		resolveAvailableRepoFiltersRequestPromise( [] );

		// Now we should be ready!

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();
	} );

	test( 'Even if web requests fail, we still show the app', async () => {
		const apiClient = createMockApiClient();
		const apiErrorMessage = 'Request failed with status code 500';
		const apiError = new Error( apiErrorMessage );
		apiClient.loadReportingConfig.mockRejectedValue( apiError );
		apiClient.loadAvailableRepoFilters.mockRejectedValue( apiError );

		setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();
	} );

	test( 'On loading, records the "page_view" event', async () => {
		const apiClient = createMockApiClient();

		const { monitoringClient } = setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'page_view' );
	} );
} );
