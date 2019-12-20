import React, { memo, useState, useCallback, Fragment, useMemo } from "react";
import { Grid, List, ListItem, ListItemText } from "@material-ui/core";
import { isDev, handlePromise, sortByName, allOnTop, _getInsurances } from "../../utils";
import { filterSuggestions, classes } from "./utils";
import { Modal, ItemsList } from "../";
import "./style.css";

const _ModalInsurances = ({ insurances, addInsurance, onRemove, onClose, ...props }) => {
	const [value, setValue] = useState(""),
		[loading, setLoading] = useState(false),
		[suggestions, setSuggestions] = useState([]),
		handleData = useCallback(
			value =>
				handlePromise(_getInsurances(value), setLoading).then(a =>
					setSuggestions(allOnTop(sortByName(a)))
				),
			[setSuggestions]
		),
		handleChange = useCallback(
			({ target: { value } }) => {
				setValue(value);
				if (isDev || value.length > 2) {
					if (value) return handleData(value);
					else setSuggestions([]);
				}
			},
			[handleData]
		),
		filteredSuggestions = useMemo(_ => suggestions.filter(filterSuggestions(insurances)), [
			suggestions,
			insurances
		]),
		addAnInsurance = useCallback(
			({
				currentTarget: {
					dataset: { i }
				}
			}) => addInsurance(filteredSuggestions[i]),
			[filteredSuggestions, addInsurance]
		);
	const filteredSuggestionsLength = filteredSuggestions.length > 0;
	return (
		<Modal maxWidth="md" title="Add your accepted insurances" {...{ ...props, onClose, classes }}>
			<Grid container spacing={2}>
				<Grid xs={12} sm={12} item>
					<div className="input-wrapper">
						<input autoFocus className="form-input" onChange={handleChange} {...{ value }} />
						{loading && <i className="fas fa-circle-notch fa-spin" />}
					</div>
				</Grid>
				<Grid xs={12} sm={insurances.length ? 6 : 12} item>
					{filteredSuggestionsLength && (
						<Fragment>
							<div className="items-title">Suggestions</div>
							<List className="items-list scrollbar">
								{filteredSuggestions.map(({ ID, plan, name }, i) => (
									<ListItem key={ID}>
										<ListItemText primary={plan} secondary={name} />
										<i onClick={addAnInsurance} data-i={i} className="fas fa-plus pointer" />
									</ListItem>
								))}
							</List>
						</Fragment>
					)}
				</Grid>
				<ItemsList
					title="Selected insurances"
					sm={filteredSuggestionsLength ? 6 : 12}
					items={insurances}
					primary="plan"
					secondary="name"
					name="insurances"
					{...{ onRemove }}
				/>
			</Grid>
		</Modal>
	);
};

export const ModalInsurances = memo(_ModalInsurances);

/*
Filters:
- Suggestions: all on top: sort
- If all in insurances: 
remove every same plans from suggestions :filter, and from insurances: set
- If plan in insurances remove it from suggestions: filter

*/
