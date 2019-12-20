import React, { memo } from "react";
import { Grid, List, ListItem, ListItemText } from "@material-ui/core";
import "./style.css";

const _ItemsList = ({ title, items, name, onRemove, primary = "name", secondary, ...props }) => {
	if (items && items.length)
		return (
			<Grid item xs={12} {...props}>
				{title && <div className="items-title">{title}</div>}
				<List className="items-list scrollbar">
					{items.map((e, i) => {
						const main = e[primary] || e;
						return (
							<ListItem key={main + i}>
								<ListItemText primary={main} secondary={e[secondary]} />
								<i
									className="fas fa-minus pointer"
									data-name={name}
									data-i={i}
									onClick={onRemove}
								/>
							</ListItem>
						);
					})}
				</List>
			</Grid>
		);
};

export const ItemsList = memo(_ItemsList);
