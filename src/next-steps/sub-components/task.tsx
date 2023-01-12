import React, { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { TaskLink } from '../../reporting-config/types';
import { ReactComponent as SlackIcon } from '../../common/svgs/slack.svg';
import { ReactComponent as GithubIcon } from '../../common/svgs/github.svg';
import { ReactComponent as P2Icon } from '../../common/svgs/p2.svg';
import { ReactComponent as LinkIcon } from '../../common/svgs/external-link.svg';
import { selectIssueDetails } from '../../issue-details/issue-details-slice';
import styles from '../next-steps.module.css';
import {
	addCompletedTask,
	removeCompletedTask,
	selectCompletedTasks,
} from '../completed-tasks-slice';
import {
	createGeneralHref,
	createNewGithubIssueHref,
	createP2Href,
	createSlackHref,
} from '../../common/lib';

interface Props {
	taskId: string;
}

export function Task( { taskId }: Props ) {
	const dispatch = useAppDispatch();
	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const { issueTitle } = useAppSelector( selectIssueDetails );
	const completedTaskIds = useAppSelector( selectCompletedTasks );

	const isChecked = completedTaskIds.includes( taskId );

	const handleCheckboxChange = () => {
		if ( isChecked ) {
			dispatch( removeCompletedTask( taskId ) );
		} else {
			dispatch( addCompletedTask( taskId ) );
		}
	};

	const { title, details, link } = tasks[ taskId ];

	if ( ! title && ! details && ! link ) {
		// We have nothing to display!
		// TODO: Maybe an FYI logging here in the future?
		return null;
	}

	let taskIsBroken = false;
	let titleDisplay: ReactNode;
	if ( link ) {
		try {
			const linkText = title || getDefaultTitleForLink( link );
			const href = createLinkHref( link, issueTitle );
			titleDisplay = (
				<a
					className={ styles.taskTitle }
					target="_blank"
					href={ href }
					rel="noreferrer"
					// When they open a link, let's trigger the checkbox change too
					onClick={ handleCheckboxChange }
				>
					{ getAppIconForLink( link ) }
					<span className={ styles.linkText }>{ linkText }</span>
					<LinkIcon aria-hidden={ true } className={ styles.linkIcon } />
				</a>
			);
		} catch ( error ) {
			// TODO: log the error with our monitoring client
			taskIsBroken = true;
			titleDisplay = (
				<span className={ styles.badTask }>
					This task has broken configuration. Please notify the Bugomattic administrators.
				</span>
			);
		}
	} else {
		const titleText = title ? title : 'Complete the details below';
		titleDisplay = <span className={ styles.taskTitle }>{ titleText }</span>;
	}

	let detailsDisplay: ReactNode = null;
	if ( ! taskIsBroken && details ) {
		detailsDisplay = <p className={ styles.taskDetails }>{ details }</p>;
	}

	return (
		<li>
			<label className={ styles.task }>
				<input
					className={ styles.taskCheckbox }
					onChange={ handleCheckboxChange }
					checked={ isChecked }
					type="checkbox"
				/>
				<div>
					{ titleDisplay }
					{ detailsDisplay }
				</div>
			</label>
		</li>
	);
}

function getDefaultTitleForLink( link: TaskLink ): string {
	switch ( link.type ) {
		case 'general':
			return link.href;
		case 'github':
			return 'Open an issue in GitHub';
		case 'slack':
			return `Notify the #${ link.channel } channel in Slack`;
		case 'p2':
			return `Post on the +${ link.subdomain } P2`;
	}
}

function getAppIconForLink( link: TaskLink ): ReactNode {
	switch ( link.type ) {
		case 'general':
			return null;
		case 'github':
			return (
				<GithubIcon data-testid="github-icon" aria-hidden={ true } className={ styles.appIcon } />
			);
		case 'slack':
			return (
				<SlackIcon data-testid="slack-icon" aria-hidden={ true } className={ styles.appIcon } />
			);
		case 'p2':
			return <P2Icon data-testid="p2-icon" aria-hidden={ true } className={ styles.appIcon } />;
	}
}

function createLinkHref( link: TaskLink, issueTitle?: string ): string {
	switch ( link.type ) {
		case 'general':
			return createGeneralHref( link );
		case 'github':
			return createNewGithubIssueHref( link, issueTitle );
		case 'slack':
			return createSlackHref( link );
		case 'p2':
			return createP2Href( link );
	}
}