import React, { ChangeEventHandler, ReactNode, FocusEventHandler } from 'react';
import styles from './limited-text-field.module.css';

interface Props {
	value: string;
	onChange: ChangeEventHandler< HTMLInputElement >;
	characterLimit: number;
	onBlur?: FocusEventHandler< HTMLInputElement >;
	onFocus?: FocusEventHandler< HTMLInputElement >;
	ariaDescribedBy?: string;
	id?: string;
}

export function LimitedTextField( {
	value,
	onChange,
	characterLimit,
	onBlur,
	onFocus,
	ariaDescribedBy,
	id,
}: Props ) {
	const charactersRemaining = characterLimit - value.length;
	const isOverLimit = charactersRemaining < 0;

	const inputClassName = isOverLimit ? styles.invalidInput : undefined;

	const baseLimitMessage = <>Maximum { characterLimit } characters</>;
	let limitMessage: ReactNode;
	if ( isOverLimit ) {
		limitMessage = (
			<>
				{ baseLimitMessage } &#40;
				<span className={ styles.limitWarning }>{ Math.abs( charactersRemaining ) } over</span>&#41;
			</>
		);
	} else if ( value !== '' ) {
		limitMessage = (
			<>
				{ baseLimitMessage } &#40;{ charactersRemaining } remaining&#41;
			</>
		);
	} else {
		limitMessage = baseLimitMessage;
	}

	return (
		<div>
			<input
				type="text"
				value={ value }
				onChange={ onChange }
				className={ inputClassName }
				aria-invalid={ isOverLimit }
				onFocus={ onFocus }
				onBlur={ onBlur }
				aria-describedby={ ariaDescribedBy }
				id={ id }
			/>
			<p className={ styles.limitMessage }>{ limitMessage }</p>
		</div>
	);
}
