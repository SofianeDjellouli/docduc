export const handleTime = time => parameters => new Date(time).toLocaleString("en-US", parameters);

export const getDays = start => {
	var days = [];
	let handleDate = a => ({
		slots: [],
		date: a,
		weekday: a.toLocaleDateString("en-US", { weekday: "short" }),
		monthdate: a.toLocaleDateString("en-US", { month: "short", day: "numeric" })
	});
	for (let i = 2; i >= 0; i--) {
		let date = new Date(start);
		date.setDate(start.getDate() - i);
		days.push(handleDate(date));
	}
	for (let i = 1; i <= 2; i++) {
		let date = new Date(start);
		date.setDate(start.getDate() + i);
		days.push(handleDate(date));
	}
	return days;
};

export const handleSlots = (date, slots) => {
	var array = getDays(date);
	for (let i = 0, j = 0; i < slots.length; ) {
		if (slots[i].startTimeDate === array[j].monthdate) {
			array[j].slots.push(slots[i]);
			i++;
		} else {
			j++;
			if (j > 4) break;
		}
	}
	return array;
};

export const twoDaysAhead = new Date(new Date().setDate(new Date().getDate() + 2));

export const handleDate = date => (!date || date < twoDaysAhead ? twoDaysAhead : date);
