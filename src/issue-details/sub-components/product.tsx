import React from 'react';
import { useAppSelector } from '../../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
} from '../../reporting-config';
import { SortedFeatureGroupList } from './sorted-feature-group-list';
import { SortedFeatureList } from './sorted-feature-list';
import { ExpandableTreeNode } from './expandable-tree-node';
import { SearchHighlighter } from './search-hightlighter';
import { useExpansionWithSearch } from './use-expansion-with-search';

interface Props {
	id: string;
}

export function Product( { id }: Props ) {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureGroupIds, featureIds } = products[ id ];

	const { isExpanded, handleCollapseExpandToggle } = useExpansionWithSearch();

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const label = <SearchHighlighter>{ name }</SearchHighlighter>;

	const featureGroupIdsToDisplay = isExpanded
		? featureGroupIds
		: featureGroupIds.filter( ( featureGroupId ) =>
				searchResults.featureGroups.has( featureGroupId )
		  );

	const featureIdsToDisplay = isExpanded
		? featureIds
		: featureIds.filter( ( featureId ) => searchResults.features.has( featureId ) );

	return (
		<ExpandableTreeNode
			label={ label }
			isExpanded={ isExpanded }
			handleToggle={ handleCollapseExpandToggle }
		>
			<SortedFeatureGroupList featureGroupIds={ featureGroupIdsToDisplay } parentName={ name } />
			<SortedFeatureList featureIds={ featureIdsToDisplay } parentName={ name } />
		</ExpandableTreeNode>
	);
}