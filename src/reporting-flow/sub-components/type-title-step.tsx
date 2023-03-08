import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIssueTitle, selectIssueType } from '../../issue-details/issue-details-slice';
import { IssueType } from '../../issue-details/types';
import { TypeTitleForm } from '../../type-title-form/type-title-form';
import { selectActiveStep, setActiveStep } from '../active-step-slice';
import { StepContainer } from './step-container';
import styles from '../reporting-flow.module.css';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';

interface Props {
	stepNumber: number;
	goToNextStep: () => void;
}

export function TypeTitleStep( { stepNumber, goToNextStep }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const activeStep = useAppSelector( selectActiveStep );
	const issueTitle = useAppSelector( selectIssueTitle );
	const issueType = useAppSelector( selectIssueType );

	const onEdit = useCallback( () => {
		dispatch( setActiveStep( 'typeTitle' ) );
		dispatch( updateHistoryWithState() );
		monitoringClient.analytics.recordEvent( 'type_step_edit' );
	}, [ dispatch, monitoringClient.analytics ] );

	const isActive = activeStep === 'typeTitle';
	const isComplete = issueType !== 'unset' && ! isActive;

	let stepContentDisplay: ReactNode;
	if ( isActive ) {
		stepContentDisplay = <TypeTitleForm onContinue={ goToNextStep } />;
	} else if ( isComplete ) {
		stepContentDisplay = <CompletedStep title={ issueTitle } type={ issueType } />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Type and Title"
			stepNumber={ stepNumber }
			isComplete={ isComplete }
			showEditButton={ isComplete }
			onEdit={ onEdit }
		>
			{ stepContentDisplay }
		</StepContainer>
	);
}

interface CompletedStepProps {
	type: IssueType;
	title?: string;
}

function CompletedStep( { title, type }: CompletedStepProps ) {
	return (
		<div>
			<div className={ styles.completedContentWrapper }>
				<h4 className={ styles.completedContentHeader }>Type</h4>
				<p className={ styles.completedContentValue }>{ getDisplayTextForType( type ) }</p>
			</div>
			{ title && (
				<div className={ styles.completedContentWrapper }>
					<h4 className={ styles.completedContentHeader }>Title</h4>
					<p className={ styles.completedContentValue }>{ title }</p>
				</div>
			) }
		</div>
	);
}

function getDisplayTextForType( type: IssueType ) {
	switch ( type ) {
		case 'urgent':
			return "It's Urgent!";
		case 'bug':
			return 'Bug';
		case 'featureRequest':
			return 'Feature Request';
		default:
			return 'No type set';
	}
}