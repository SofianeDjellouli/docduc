import { isAll } from "../../utils";

export const filterSuggestions = insurances => e => {
	for (let i = 0; i < insurances.length; i++)
		if (
			insurances[i].ID.toString() === e.ID ||
			(e.name === insurances[i].name && isAll(insurances[i]))
		)
			return false;
	return true;
};

export const classes = { paperScrollPaper: "insurances-modal" };
